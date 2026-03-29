// CareReminders.jsx
// CHANGE: Completely rewritten for V3.
// 1. Fetches watering & fertilizing status FROM Digital Twin (MongoDB via /api/care/sync-from-dt/)
// 2. Shows alerts based on actual last_watered / last_fertilized from Digital Twin
// 3. No separate "add plant" — all Digital Twin plants are shown automatically
// 4. SMS phone number persisted to backend (/api/care/settings/) — survives refresh
// 5. WeatherWidget removed, NotificationBell removed (navbar bell used)
// 6. "Watered Today" removed — Digital Twin owns watering

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const API = 'http://127.0.0.1:8000/api/care/';
// ── Plant type emoji map ───────────────────────────────────────────────────────
const PLANT_EMOJI = {
  basil:'🌿', rose:'🌹', snake_plant:'🪴', tomato:'🍅', peace_lily:'🌸',
  money_plant:'💚', aloe_vera:'🌵', mint:'🌱', cactus:'🌵', tulsi:'🌿',
  neem:'🌿', lavender:'💜', hibiscus:'🌺', bougainvillea:'🌸', lemon:'🍋',
  mango:'🥭', papaya:'🥭', apple:'🍎', orange:'🍊', corn:'🌽',
  default:'🪴',
};
function emoji(type) { return PLANT_EMOJI[(type||'').toLowerCase()] || PLANT_EMOJI.default; }

// ── Status colour helpers ─────────────────────────────────────────────────────
const WATER_STYLES = {
  overdue:   { card:'border-red-300 bg-red-50',    badge:'bg-red-500',    label:'OVERDUE',    icon:'⚠️' },
  never:     { card:'border-red-300 bg-red-50',    badge:'bg-red-600',    label:'NEVER DONE', icon:'🚫' },
  due_today: { card:'border-amber-300 bg-amber-50',badge:'bg-amber-500',  label:'DUE TODAY',  icon:'💧' },
  ok:        { card:'border-gray-100 bg-white',    badge:'bg-green-500',  label:'ON TRACK',   icon:'✅' },
};
const FERT_STYLES = {
  overdue:  { badge:'bg-red-500',   label:'FERTILIZE OVERDUE', icon:'⚠️' },
  never:    { badge:'bg-orange-500',label:'NEVER FERTILIZED',  icon:'🌱' },
  due_soon: { badge:'bg-amber-400', label:'FERTILIZE SOON',    icon:'🌿' },
  ok:       { badge:'bg-green-500', label:'FERTILIZED OK',     icon:'✅' },
};

// ── IST time helper ───────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return 'Never';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return iso; }
}

// ── Single Plant Card ─────────────────────────────────────────────────────────
// CHANGE: Shows watering status read from Digital Twin, fertilize status,
//         and a button to go back to Digital Twin to water.
function PlantCard({ plant, onNavigateToDT }) {
  const ws = WATER_STYLES[plant.water_status] || WATER_STYLES.ok;
  const fs = FERT_STYLES[plant.fert_status]   || FERT_STYLES.ok;
  const em = emoji(plant.plant_type);

  return (
    <motion.div layout initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, scale:0.95 }}
      className={`rounded-[2.5rem] p-8 border-2 transition-all ${ws.card} relative overflow-hidden`}>

      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-[2.5rem] ${
        plant.water_status === 'overdue' || plant.water_status === 'never' ? 'bg-red-400' :
        plant.water_status === 'due_today' ? 'bg-amber-400' : 'bg-green-400'
      }`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-4xl">
            {em}
          </div>
          <div>
            <h3 className="text-4xl font-black italic text-gray-900">{plant.plant_name}</h3>
            <span className="text-xl text-gray-400 capitalize">{plant.plant_type?.replace(/_/g,' ')}</span>
          </div>
        </div>
      </div>

      {/* Watering status — from Digital Twin */}
      <div className="bg-white/80 rounded-2xl p-4 mb-4 backdrop-blur">
        <div className="flex items-center justify-between mb-2">
          <p className="text-2xl font-bold text-gray-600">💧 Watering</p>
          <span className={`text-lg font-black text-white px-3 py-1 rounded-full ${ws.badge}`}>
            {ws.icon} {ws.label}
          </span>
        </div>
        <p className="text-xl text-gray-500">Last watered: <strong>{fmtDate(plant.last_watered)}</strong></p>
        {plant.days_since_water !== null && (
          <p className="text-xl text-gray-400">{plant.days_since_water} day(s) ago · every {plant.watering_freq_days} day(s)</p>
        )}
        {/* CHANGE: water overdue message */}
        {(plant.water_overdue_by ?? 0) > 0 && (             
          <p className="text-xl text-red-600 font-bold mt-1">⚠️ {plant.water_overdue_by} day(s) overdue!</p>
        )}
        {/* CHANGE: button to go back to Digital Twin to water */}
        {(plant.water_status === 'overdue' || plant.water_status === 'due_today' || plant.water_status === 'never') && (
          <button
            onClick={() => onNavigateToDT()}
            className="mt-3 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black text-2xl transition-all"
          >
            💧 Go to Digital Twin to Water
          </button>
        )}
      </div>

      {/* Fertilizing status — from Digital Twin */}
      <div className="bg-white/80 rounded-2xl p-4 backdrop-blur">
        <div className="flex items-center justify-between mb-2">
          <p className="text-2xl font-bold text-gray-600">🌿 Fertilizing</p>
          <span className={`text-lg font-black text-white px-3 py-1 rounded-full ${fs.badge}`}>
            {fs.icon} {fs.label}
          </span>
        </div>
        <p className="text-xl text-gray-500">Last fertilized: <strong>{fmtDate(plant.last_fertilized)}</strong></p>
        {plant.days_since_fert !== null && (
          <p className="text-xl text-gray-400">{plant.days_since_fert} day(s) ago · every {plant.fert_every_days} day(s)</p>
        )}
        {/* CHANGE: button to go back to Digital Twin to fertilize */}
        {(plant.fert_status === 'overdue' || plant.fert_status === 'due_soon' || plant.fert_status === 'never') && (
          <button
            onClick={() => onNavigateToDT()}
            className="mt-3 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-2xl transition-all"
          >
            🌿 Go to Digital Twin to Fertilize
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── SMS Settings Modal ────────────────────────────────────────────────────────
// CHANGE: saves phone number to backend (/api/care/settings/) — persists on refresh
function SMSModal({ onClose, currentPhone, onSaved }) {
  const [phone, setPhone]     = useState(currentPhone || '');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      // CHANGE: save to Django backend so it survives page refresh
      await axios.patch(`${API}settings/`, {
        sms_enabled:  true,
        phone_number: phone,
      });
      onSaved(phone);
      onClose();
    } catch {
      setError('Could not save to backend. Check if backend is running.');
    } finally {
      setSaving(false);
    }
  };

 const handleDisable = async () => {
  setSaving(true);
  try {
    await axios.patch(`${API}settings/`, { sms_enabled: false });
    onSaved('');
    onClose();
  } catch {
    setError('Could not update settings.');
  } finally {
    setSaving(false);
  }
};

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}>
      <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} exit={{ scale:0.9 }}
        className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-6xl font-black italic mb-3">SMS Alerts</h2>
        {/* CHANGE: clarify that number is saved to backend */}
        <p className="text-gray-400 text-2xl mb-4">
          Your phone number is saved to the server and used for critical watering and fertilizing alerts.
          It will not reset on page refresh.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-2xl text-amber-800">
          📲 SMS fires when a plant is <strong>3+ days overdue</strong> for watering or <strong>7+ days overdue</strong> for fertilizing.
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xl text-red-700">{error}</div>
        )}
        <label className="text-2xl font-bold text-gray-500 mb-2 block">Phone Number (with country code)</label>
        <input value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="+91 9876543210"
          className="w-full p-5 border-2 border-gray-200 rounded-2xl text-3xl focus:border-green-600 outline-none mb-6" />
        <div className="flex gap-4">
          <button onClick={handleSave} disabled={saving || !phone.trim()}
            className="flex-1 py-5 bg-[#24592B] disabled:bg-gray-200 text-white rounded-2xl font-black text-3xl">
            {saving ? 'Saving…' : 'Save & Enable'}
          </button>
          {currentPhone && (
            <button onClick={handleDisable} disabled={saving}
              className="flex-1 py-5 bg-red-50 text-red-600 border-2 border-red-200 rounded-2xl font-black text-3xl">
              Disable SMS
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ plants }) {
  const total        = plants.length;
  const waterOverdue = plants.filter(p => p.water_status === 'overdue' || p.water_status === 'never').length;
  const fertOverdue  = plants.filter(p => p.fert_status === 'overdue').length;
  const allOk        = plants.filter(p => p.water_status === 'ok' && p.fert_status === 'ok').length;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label:'Total Plants',     value:total,        icon:'🌿', color:'text-green-600' },
        { label:'Water Overdue',    value:waterOverdue, icon:'💧', color:'text-red-500'   },
        { label:'Fertilize Overdue',value:fertOverdue,  icon:'🌿', color:'text-amber-500' },
        { label:'All Good',         value:allOk,        icon:'✅', color:'text-emerald-500'},
      ].map(s => (
        <div key={s.label} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
          <div className="text-5xl mb-2">{s.icon}</div>
          <div className={`text-6xl font-black ${s.color}`}>{s.value}</div>
          <div className="text-2xl text-gray-400 font-medium mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CareReminders() {
  const navigate = useNavigate();

  const [plants, setPlants]       = useState([]);   // from /api/care/sync-from-dt/
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showSMS, setShowSMS]     = useState(false);
  const [smsPhone, setSmsPhone]   = useState('');   // CHANGE: loaded from backend
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [filter, setFilter]       = useState('all');
  const [toast, setToast]         = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // CHANGE: Load SMS settings from backend on mount — persists across refresh
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await axios.get(`${API}settings/`);
        setSmsPhone(res.data.phone_number || '');
        setSmsEnabled(res.data.sms_enabled || false);
      } catch {
        // Backend not running — SMS settings unavailable
      }
    };
    loadSettings();
  }, []);

  // CHANGE: Fetch watering & fertilizing status FROM Digital Twin via sync endpoint
  const fetchStatus = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API}sync-from-dt/`);
      setPlants(res.data.plants || []);

      // CHANGE: expose urgent count for navbar bell via localStorage
      const urgentCount = res.data.urgent_count || 0;
      try { localStorage.setItem('seedsphere_care_alert_count', JSON.stringify(urgentCount)); } catch {}
    } catch (e) {
      const msg = e?.response?.status === 503
        ? '❌ Could not connect to Digital Twin database. Is the backend and MongoDB running?'
        : '❌ Could not load care status. Is the backend running?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleSMSSaved = (phone) => {
    setSmsPhone(phone);
    setSmsEnabled(!!phone);
    showToast(phone ? `📲 SMS alerts enabled for ${phone}` : 'SMS alerts disabled.');
  };

  // CHANGE: filter by watering or fertilizing urgency
  const filtered = plants.filter(p => {
    if (filter === 'water_urgent') return p.water_status === 'overdue' || p.water_status === 'never' || p.water_status === 'due_today';
    if (filter === 'fert_urgent')  return p.fert_status === 'overdue'  || p.fert_status === 'never'  || p.fert_status === 'due_soon';
    if (filter === 'all_ok')       return p.water_status === 'ok' && p.fert_status === 'ok';
    return true;
  });

  return (
    <div className="w-full px-10 xl:px-20 py-20 min-h-screen bg-[#f8fafc]">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:-30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-30 }}
            className="fixed top-8 right-8 z-[100] bg-gray-900 text-white px-8 py-5 rounded-2xl text-3xl font-semibold shadow-2xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SMS Modal */}
      <AnimatePresence>
        {showSMS && (
          <SMSModal onClose={() => setShowSMS(false)} currentPhone={smsPhone} onSaved={handleSMSSaved} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-[#24592B] font-bold uppercase tracking-[0.2em] text-2xl block mb-3">
            Smart Automation
          </span>
          <h1 className="text-6xl md:text-9xl font-black italic text-gray-900">Care Reminders</h1>
          {/* CHANGE: updated subtitle explaining data source */}
          <p className="text-gray-500 text-4xl font-medium mt-4 max-w-3xl">
            Live watering & fertilizing status from your Digital Twin.
          </p>
        </div>

        {/* CHANGE: removed NotificationBell (navbar bell used instead) */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Refresh button */}
          <button onClick={fetchStatus} disabled={loading}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 text-2xl font-bold hover:border-gray-300 transition-all bg-white">
            🔄 {loading ? 'Loading…' : 'Refresh'}
          </button>
          {/* SMS button — CHANGE: shows saved phone from backend */}
          <button onClick={() => setShowSMS(true)}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl border-2 text-2xl font-bold transition-all ${
              smsEnabled && smsPhone
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            📲 {smsEnabled && smsPhone ? `SMS: ${smsPhone.slice(0, 6)}…` : 'Enable SMS'}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center">
          <div className="text-5xl mb-3">⚠️</div>
          <p className="text-3xl font-bold text-red-700 mb-2">{error}</p>
          <p className="text-2xl text-red-500 mb-4">
            Make sure the backend is running: <code className="bg-red-100 px-2 py-1 rounded">python manage.py runserver</code>
          </p>
          <button onClick={fetchStatus}
            className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-2xl hover:bg-red-700 transition">
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="text-6xl animate-spin mb-4">🌱</div>
            <p className="text-gray-400 text-2xl">Loading care status from Digital Twin…</p>
          </div>
        </div>
      )}

      {/* Stats */}
      {!loading && plants.length > 0 && <StatsBar plants={plants} />}

      {/* CHANGE: no WeatherWidget */}

      {/* Filter tabs */}
      {!loading && plants.length > 0 && (
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { key:'all',          label:'All Plants' },
            { key:'water_urgent', label:'💧 Water Alerts' },
            { key:'fert_urgent',  label:'🌿 Fertilize Alerts' },
            { key:'all_ok',       label:'✅ All Good' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-6 py-3 rounded-2xl text-2xl font-bold transition-all border-2 ${
                filter === key
                  ? 'bg-[#24592B] text-white border-[#24592B]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Empty state — no DT plants */}
      {!loading && !error && plants.length === 0 && (
        <div className="text-center py-32">
          <div className="text-[100px] mb-6">🌱</div>
          <h3 className="text-7xl font-black italic text-gray-300 mb-4">No plants yet</h3>
          <p className="text-gray-400 text-4xl mb-6">
            Create a plant in Digital Twin first, then come back here to see care reminders.
          </p>
          <button onClick={() => navigate('/digital-twin')}
            className="px-12 py-6 bg-[#24592B] text-white rounded-2xl font-black text-4xl hover:bg-[#1d4621] transition-all shadow-lg">
            🌱 Go to Digital Twin
          </button>
        </div>
      )}

      {/* Plant Grid */}
      {!loading && filtered.length > 0 && (
        <AnimatePresence>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtered.map(plant => (
              <PlantCard key={plant.plant_id} plant={plant}
                onNavigateToDT={() => navigate('/digital-twin')} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {!loading && filtered.length === 0 && plants.length > 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-4xl">No plants match this filter. 🎉</p>
        </div>
      )}

      {/* Footer */}
      {!loading && plants.length > 0 && (
        <div className="mt-16 text-center space-y-2">
          <p className="text-gray-300 text-2xl">
            💧 Watering & 🌿 Fertilizing status read live from Digital Twin · 📲 SMS for critical alerts
          </p>
          <p className="text-gray-300 text-xl">
            To water or fertilize: go to <button onClick={() => navigate('/digital-twin')}
              className="text-green-500 underline font-bold">Digital Twin</button> → click a plant → Care tab
          </p>
        </div>
      )}
    </div>
  );
}
