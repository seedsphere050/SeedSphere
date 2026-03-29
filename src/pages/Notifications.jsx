// CHANGE: NEW FILE — src/pages/Notifications.jsx
// Notification centre — shows all plant care alerts from the backend.
// Connects to GET /api/care/notifications/
// Marks read on click, supports mark-all-read.

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = 'http://127.0.0.1:8000/api/care/notifications/';

// ── IST time helper ───────────────────────────────────────────────────────────
const toIST = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return iso; }
};

const timeSince = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ── Category styles ───────────────────────────────────────────────────────────
const CATEGORY_STYLES = {
  urgent:        { bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500',    label: 'URGENT' },
  upcoming:      { bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-400',  label: 'UPCOMING' },
  informational: { bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-500',  label: 'INFO' },
};

const TYPE_ICONS = {
  watering:  '💧',
  fertilize: '🌿',
  stress:    '⚠️',
  general:   '🔔',
};

// ── Single notification card ──────────────────────────────────────────────────
function NotifCard({ notif, onMarkRead }) {
  const style = CATEGORY_STYLES[notif.category] || CATEGORY_STYLES.informational;
  const icon  = TYPE_ICONS[notif.notif_type] || '🔔';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => !notif.is_read && onMarkRead(notif.id)}
      className={`rounded-3xl border-2 p-6 transition-all cursor-pointer
        ${style.bg} ${style.border}
        ${notif.is_read ? 'opacity-60' : 'hover:shadow-md hover:scale-[1.005]'}`}
    >
      <div className="flex items-start gap-4">
        {/* Unread dot */}
        <div className="mt-2 shrink-0">
          {notif.is_read
            ? <div className="w-3 h-3 rounded-full bg-gray-200" />
            : <div className={`w-3 h-3 rounded-full ${style.dot} animate-pulse`} />
          }
        </div>

        {/* Icon */}
        <span className="text-5xl shrink-0">{icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className={`text-lg font-black tracking-widest uppercase px-3 py-0.5 rounded-full
              ${notif.category === 'urgent' ? 'bg-red-100 text-red-700'
              : notif.category === 'upcoming' ? 'bg-amber-100 text-amber-700'
              : 'bg-green-100 text-green-700'}`}>
              {style.label}
            </span>
            {notif.plant_name && (
              <span className="text-xl text-gray-500 font-medium">{notif.plant_name}</span>
            )}
            {notif.sms_sent && (
              <span className="text-lg bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                📲 SMS sent
              </span>
            )}
          </div>
          <p className="text-3xl font-black text-gray-900 mb-1">{notif.title}</p>
          <p className="text-2xl text-gray-600">{notif.message}</p>
          <div className="mt-2 flex items-center gap-3 text-xl text-gray-400">
            <span>{toIST(notif.created_at)}</span>
            <span>·</span>
            <span>{timeSince(notif.created_at)}</span>
            {!notif.is_read && (
              <span className="text-green-600 font-bold ml-auto">Tap to mark read →</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('all');  // all | unread | urgent
  const [toast, setToast]                 = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // CHANGE: clearer error with migration hint
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/care/notifications/?limit=100`);
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (e) {
      const hint = e?.response
        ? '❌ Backend error — run: python manage.py migrate, then runserver'
        : '❌ Backend not reachable — run: python manage.py runserver';
      showToast(hint);
    } finally {
      setLoading(false);
    }
  }, []);

  // CHANGE: trigger a Digital Twin check to generate fresh notifications
  const triggerCheck = useCallback(async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/care/run-check/`);
      await fetchNotifications();
      showToast('✅ Refreshed from Digital Twin plants.');
    } catch {
      showToast('❌ Could not run check. Is the backend running?');
      setLoading(false);
    }
  }, [fetchNotifications]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      await axios.post(`${API}/care/notifications/${id}/read/`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await axios.post(`${API}/care/notifications/read-all/`);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast('✅ All notifications marked as read.');
    } catch {
      showToast('❌ Failed to mark all as read.');
    }
  };

  // Filter logic
  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'urgent') return n.category === 'urgent';
    return true;
  });

  const urgentCount   = notifications.filter(n => n.category === 'urgent').length;
  const upcomingCount = notifications.filter(n => n.category === 'upcoming').length;

  const timesFont = { fontFamily: '"Times New Roman", Times, serif' };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] px-10 xl:px-20 py-20">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:-30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="fixed top-8 right-8 z-[100] bg-gray-900 text-white px-8 py-5 rounded-2xl text-2xl font-semibold shadow-2xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-green-600 font-bold uppercase tracking-[0.2em] text-2xl block mb-3">
            Plant Care
          </span>
          <h1 className="text-6xl md:text-9xl font-black italic text-gray-900" style={timesFont}>
            Notifications
          </h1>
          <p className="text-gray-400 text-3xl font-medium mt-4">
            {unreadCount > 0
              ? `${unreadCount} unread alert${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up 🌿'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-2xl font-black text-2xl hover:bg-green-700 transition-all shadow-md hover:scale-[1.02]">
            ✅ Mark All Read
          </button>
        )}
        {/* CHANGE: button to pull fresh notifications from MongoDB Digital Twin */}
        <button onClick={triggerCheck} disabled={loading}
          className="flex items-center gap-2 px-8 py-4 border-2 border-green-600 text-green-600 rounded-2xl font-black text-2xl hover:bg-green-50 transition-all">
          🔄 {loading ? 'Checking…' : 'Refresh from Digital Twin'}
        </button>
      </div>

      {/* Stats row */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: '🔔', label: 'Total',    value: notifications.length,  color: 'text-gray-700' },
            { icon: '🔴', label: 'Urgent',   value: urgentCount,           color: 'text-red-500'  },
            { icon: '🟡', label: 'Upcoming', value: upcomingCount,         color: 'text-amber-500'},
            { icon: '📭', label: 'Unread',   value: unreadCount,           color: 'text-green-600'},
          ].map(s => (
            <div key={s.label} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="text-5xl mb-2">{s.icon}</div>
              <div className={`text-6xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-2xl text-gray-400 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {notifications.length > 0 && (
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { key: 'all',    label: `All (${notifications.length})` },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'urgent', label: `🚨 Urgent (${urgentCount})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-6 py-3 rounded-2xl text-2xl font-bold transition-all border-2
                ${filter === key
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="text-6xl animate-spin mb-4">🔔</div>
            <p className="text-gray-400 text-2xl">Loading notifications...</p>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-32">
          <div className="text-8xl mb-6">🌿</div>
          <h2 className="text-5xl font-black text-gray-800 mb-4">No notifications yet</h2>
          <p className="text-3xl text-gray-400 mb-6">
            Click <strong>"Refresh from Digital Twin"</strong> above to check your plants and generate alerts.
          </p>
          {/* CHANGE: setup guide for first-time users */}
          <div className="inline-block text-left bg-gray-50 border border-gray-200 rounded-2xl p-6 text-2xl text-gray-600 mb-6">
            <p className="font-bold mb-2">First time setup:</p>
            <code className="block bg-gray-100 px-4 py-2 rounded-xl mb-2">cd backend</code>
            <code className="block bg-gray-100 px-4 py-2 rounded-xl mb-2">python manage.py migrate</code>
            <code className="block bg-gray-100 px-4 py-2 rounded-xl">python manage.py runserver</code>
          </div>
          <br/>
          <button onClick={triggerCheck} disabled={loading}
            className="px-10 py-5 bg-green-600 text-white rounded-2xl font-black text-3xl hover:bg-green-700 transition-all shadow-lg">
            🔄 Check Now
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-3xl">No notifications match this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map(n => (
              <NotifCard key={n.id} notif={n} onMarkRead={markRead} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
