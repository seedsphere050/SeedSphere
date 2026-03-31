// src/pages/DigitalTwin.jsx
// CHANGE: added useNavigate for Care Reminder button
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PlantViewer3D from '../../components/PlantViewer3D';

const API = 'http://127.0.0.1:8000/api';

// ── All 45 plants ─────────────────────────────────────────────────────────────
const PLANT_TYPES = [
  { value:'neem',             label:'Neem',             emoji:'🌿', category:'Tree' },
  { value:'apple',            label:'Apple',            emoji:'🍎', category:'Tree' },
  { value:'corn',             label:'Corn',             emoji:'🌽', category:'Crop' },
  { value:'orange',           label:'Orange',           emoji:'🍊', category:'Tree' },
  { value:'peach',            label:'Peach',            emoji:'🍑', category:'Tree' },
  { value:'pepper',           label:'Pepper',           emoji:'🌶️',  category:'Vegetable' },
  { value:'potato',           label:'Potato',           emoji:'🥔', category:'Vegetable' },
  { value:'strawberry',       label:'Strawberry',       emoji:'🍓', category:'Fruit' },
  { value:'tomato',           label:'Tomato',           emoji:'🍅', category:'Vegetable' },
  { value:'snake_plant',      label:'Snake Plant',      emoji:'🌿', category:'Indoor' },
  { value:'tulsi',            label:'Tulsi',            emoji:'🌿', category:'Herb' },
  { value:'aloe_vera',        label:'Aloe Vera',        emoji:'🌵', category:'Succulent' },
  { value:'christmas_tree',   label:'Christmas Tree',   emoji:'🎄', category:'Tree' },
  { value:'hibiscus',         label:'Hibiscus',         emoji:'🌺', category:'Flower' },
  { value:'bougainvillea',    label:'Bougainvillea',    emoji:'🌸', category:'Flower' },
  { value:'lavender',         label:'Lavender',         emoji:'💜', category:'Herb' },
  { value:'peony',            label:'Peony',            emoji:'🌸', category:'Flower' },
  { value:'hydrangea',        label:'Hydrangea',        emoji:'💐', category:'Flower' },
  { value:'onion',            label:'Onion',            emoji:'🧅', category:'Vegetable' },
  { value:'garlic',           label:'Garlic',           emoji:'🧄', category:'Vegetable' },
  { value:'pineapple',        label:'Pineapple',        emoji:'🍍', category:'Fruit' },
  { value:'oats',             label:'Oats',             emoji:'🌾', category:'Crop' },
  { value:'pot_marigold',     label:'Pot Marigold',     emoji:'🌼', category:'Flower' },
  { value:'papaya',           label:'Papaya',           emoji:'🥭', category:'Fruit' },
  { value:'blue_cornflower',  label:'Blue Cornflower',  emoji:'💙', category:'Flower' },
  { value:'lemon',            label:'Lemon',            emoji:'🍋', category:'Tree' },
  { value:'coffee_tree',      label:'Coffee Tree',      emoji:'☕', category:'Tree' },
  { value:'wild_carrot',      label:'Wild Carrot',      emoji:'🥕', category:'Vegetable' },
  { value:'snowdrop',         label:'Snowdrop',         emoji:'🌼', category:'Flower' },
  { value:'soyabean',         label:'Soyabean',         emoji:'🌱', category:'Crop' },
  { value:'english_ivy',      label:'English Ivy',      emoji:'🌿', category:'Indoor' },
  { value:'hops',             label:'Hops',             emoji:'🌿', category:'Herb' },
  { value:'lotus',            label:'Lotus',            emoji:'🪷', category:'Flower' },
  { value:'yarrow',           label:'Yarrow',           emoji:'🌼', category:'Herb' },
  { value:'feverfew',         label:'Feverfew',         emoji:'🌼', category:'Herb' },
  { value:'oleander',         label:'Oleander',         emoji:'🌸', category:'Shrub' },
  { value:'oregano',          label:'Oregano',          emoji:'🌿', category:'Herb' },
  { value:'avocado',          label:'Avocado',          emoji:'🥑', category:'Tree' },
  { value:'beetroot',         label:'Beetroot',         emoji:'🫚', category:'Vegetable' },
  { value:'vervain',          label:'Vervain',          emoji:'🌸', category:'Herb' },
  { value:'money_plant',      label:'Money Plant',      emoji:'🍀', category:'Indoor' },
  { value:'banyan',           label:'Banyan',           emoji:'🌳', category:'Tree' },
  { value:'purple_coneflower',label:'Purple Coneflower',emoji:'💜', category:'Flower' },
  { value:'basil',            label:'Basil',            emoji:'🌿', category:'Herb' },
  { value:'rose',             label:'Rose',             emoji:'🌹', category:'Flower' },
];

// Soil type: user-friendly → backend value
const SOIL_OPTIONS = [
  { value:'loamy', label:'🌍 Garden / outdoor ground soil' },
  { value:'loamy', label:'🪴 Regular potting mix',   key:'regular_pot' },
  { value:'sandy', label:'🏖 Dry / sandy / crumbles easily', key:'dry_sandy' },
  { value:'sandy', label:'🌿 Coco peat / light mix', key:'coco_peat' },
  { value:'clay',  label:'🧱 Heavy / sticky / holds water',  key:'heavy_clay' },
];
// flatten to unique UI keys
const SOIL_UI = [
  { uiKey:'garden_ground', backendVal:'loamy', label:'🌍 Garden / outdoor ground' },
  { uiKey:'regular_pot',   backendVal:'loamy', label:'🪴 Regular potting mix'     },
  { uiKey:'dry_sandy',     backendVal:'sandy', label:'🏖 Dry / sandy / crumbles'  },
  { uiKey:'coco_peat',     backendVal:'sandy', label:'🌿 Coco peat / light mix'   },
  { uiKey:'heavy_clay',    backendVal:'clay',  label:'🧱 Heavy / sticky / waterlogged' },
];

const ENV_FIELDS = {
  environment_type:   [['outdoor','🌳 Outdoor'],['indoor','🏠 Indoor']],
  location_type:      [['ground','🌍 Ground'],['terrace','🏗 Terrace'],['balcony','🏢 Balcony']],
  watering_frequency: [['daily','💧 Daily'],['alternate','💦 Alt. Days'],['weekly','🫧 Weekly']],
  pot_size:           [['small','🪴 Small'],['medium','🪴 Medium'],['large','🌳 Large']],
};

// ── IST time display ──────────────────────────────────────────────────────────
const toIST = (isoString) => {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return null; }
};

const timeSinceIST = (isoString) => {
  if (!isoString) return 'Never';
  try {
    const now  = new Date();
    const then = new Date(isoString);
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch { return 'Unknown'; }
};

const stageIcons = { seed:'🌰', small_plant:'🌿', medium_plant:'🪴', fully_grown:'🌳' };

// ─────────────────────────────────────────────────────────────────────────────
// PLANT PICKER — searchable dropdown
// ─────────────────────────────────────────────────────────────────────────────
function PlantPicker({ value, onChange }) {
  const [search, setSearch] = useState('');
  const selected = PLANT_TYPES.find(p => p.value === value);

  useEffect(() => {
    if (selected && !search) setSearch('');
  }, [value]);

  const filtered = search.length > 0
    ? PLANT_TYPES.filter(p =>
        p.label.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()))
    : PLANT_TYPES;

  return (
    <div>
      <div className="relative">
        <input
          className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-2xl focus:border-green-500 outline-none"
          placeholder="🔍 Search plant... e.g. Tulsi, Rose, Tomato"
          value={search}
          onChange={e => { setSearch(e.target.value); if (!e.target.value) onChange(''); }}
        />
        {selected && !search && (
          <div className="absolute inset-0 flex items-center px-5 pointer-events-none">
            <span className="text-2xl mr-2">{selected.emoji}</span>
            <span className="text-2xl font-bold text-gray-800">{selected.label}</span>
            <span className="ml-2 text-xl text-gray-400">({selected.category})</span>
          </div>
        )}
      </div>
      {(search.length > 0 || !value) && (
        <div className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {filtered.length === 0 && (
            <div className="px-5 py-4 text-xl text-gray-400">No plants found for "{search}"</div>
          )}
          {filtered.map(p => (
            <button key={p.value}
              type="button"
              onClick={() => { onChange(p.value); setSearch(''); }}
              className={`w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-green-50 transition-colors
                ${value === p.value ? 'bg-green-50 border-l-4 border-green-500' : 'bg-white'}`}>
              <span className="text-2xl w-8">{p.emoji}</span>
              <div className="flex-1">
                <div className="font-bold text-xl text-gray-800">{p.label}</div>
                <div className="text-lg text-gray-400">{p.category}</div>
              </div>
              {value === p.value && <span className="text-green-600 text-xl">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD PLANT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AddPlantModal({ onClose, onAdded }) {
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [soilUiKey, setSoilUiKey] = useState('garden_ground');
  const [form, setForm]     = useState({
    plant_name: '', plant_type: '', notes: '',
    environment: {
      environment_type: 'outdoor', location_type: 'ground',
      sunlight: 'full_sun', watering_frequency: 'daily',
      soil_type: 'loamy', pot_size: 'medium',
    },
  });

  const setEnv = (k, v) => setForm(f => ({ ...f, environment: { ...f.environment, [k]: v } }));

  const steps = ['🌱 Plant', '🌍 Location', '💧 Care', '✅ Confirm'];

  const handleSubmit = async () => {
    setLoading(true); setError('');
    // Map UI soil key → backend soil_type
    const soilBackend = SOIL_UI.find(s => s.uiKey === soilUiKey)?.backendVal || 'loamy';
    const payload = {
      ...form,
      environment: { ...form.environment, soil_type: soilBackend },
    };
    console.log(payload);
    try {
      console.log("In try");
      const res = await axios.post(`${API}/twin/`, payload);
      console.log("after req");
      onAdded(res.data);
      console.log("hii");
      console.log(res,res.data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed. Is the backend running?');
    } finally { setLoading(false); }
  };

  const selectedSoil = SOIL_UI.find(s => s.uiKey === soilUiKey);

  return (
    <motion.div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        initial={{ scale:0.9, y:30 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9, y:30 }}>

        {/* Steps */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className={`flex-1 py-2 px-3 rounded-2xl text-center text-2xl font-bold transition-all
              ${i===step ? 'bg-green-600 text-white' : i<step ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {s}
            </div>
          ))}
        </div>

        {/* Step 0 — Plant identity */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-black">Name Your Plant</h2>
            <input
              className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-3xl focus:border-green-500 outline-none"
              placeholder="e.g. My Balcony Tulsi"
              value={form.plant_name}
              onChange={e => setForm(f => ({ ...f, plant_name: e.target.value }))}
            />
            <div>
              <p className="text-2xl font-bold text-gray-500 mb-3">Select Plant Type</p>
              <PlantPicker value={form.plant_type} onChange={v => setForm(f => ({ ...f, plant_type: v }))} />
            </div>
          </div>
        )}

        {/* Step 1 — Environment */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-black">Where does it live?</h2>
            {['environment_type', 'location_type'].map(key => (
              <div key={key}>
                <p className="text-2xl font-bold text-gray-500 mb-3 capitalize">{key.replace(/_/g,' ')}</p>
                <div className="flex gap-3 flex-wrap">
                  {ENV_FIELDS[key].map(([val, lbl]) => (
                    <button key={val} type="button" onClick={() => setEnv(key, val)}
                      className={`px-5 py-3 rounded-2xl border-2 text-2xl font-bold transition-all
                        ${form.environment[key]===val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300'}`}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <p className="text-2xl font-bold text-gray-500 mb-2">Sunlight available</p>
              <div className="flex gap-3 flex-wrap">
                {[['full_sun','☀️ Full Sun'],['partial_shade','⛅ Partial Shade'],['low_light','🌑 Low Light']].map(([val,lbl]) => (
                  <button key={val} type="button" onClick={() => setEnv('sunlight', val)}
                    className={`px-5 py-3 rounded-2xl border-2 text-2xl font-bold transition-all
                      ${form.environment.sunlight===val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Care */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-black">Care Conditions</h2>

            {/* Watering */}
            <div>
              <p className="text-2xl font-bold text-gray-500 mb-3">Watering frequency</p>
              <div className="flex gap-3 flex-wrap">
                {ENV_FIELDS.watering_frequency.map(([val,lbl]) => (
                  <button key={val} type="button" onClick={() => setEnv('watering_frequency', val)}
                    className={`px-5 py-3 rounded-2xl border-2 text-2xl font-bold transition-all
                      ${form.environment.watering_frequency===val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Soil — user-friendly */}
            <div>
              <p className="text-2xl font-bold text-gray-500 mb-1">What does your soil feel like?</p>
              <p className="text-xl text-gray-400 mb-3">Pick the closest match — no need to know the exact type.</p>
              <div className="space-y-2">
                {SOIL_UI.map(s => (
                  <button key={s.uiKey} type="button"
                    onClick={() => setSoilUiKey(s.uiKey)}
                    className={`w-full text-left px-5 py-3 rounded-2xl border-2 text-2xl font-bold transition-all
                      ${soilUiKey===s.uiKey ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pot size */}
            <div>
              <p className="text-2xl font-bold text-gray-500 mb-3">Pot size</p>
              <div className="flex gap-3 flex-wrap">
                {ENV_FIELDS.pot_size.map(([val,lbl]) => (
                  <button key={val} type="button" onClick={() => setEnv('pot_size', val)}
                    className={`px-5 py-3 rounded-2xl border-2 text-2xl font-bold transition-all
                      ${form.environment.pot_size===val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-2xl focus:border-green-500 outline-none resize-none"
              rows={3} placeholder="Notes (optional)"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-4xl font-black">Ready to plant?</h2>
            <div className="bg-gray-50 rounded-2xl p-6 space-y-3 text-2xl">
              {[
                ['Plant', form.plant_name || '(unnamed)'],
                ['Type', PLANT_TYPES.find(p=>p.value===form.plant_type)?.label || '—'],
                ['Location', `${form.environment.environment_type} / ${form.environment.location_type}`],
                ['Sunlight', form.environment.sunlight.replace(/_/g,' ')],
                ['Watering', form.environment.watering_frequency],
                ['Soil', selectedSoil?.label || '—'],
                ['Pot', form.environment.pot_size],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500 font-bold">{k}</span>
                  <span className="font-black capitalize">{v}</span>
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-2xl font-bold">{error}</p>}
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between mt-8">
          <button type="button" onClick={step===0 ? onClose : () => setStep(s=>s-1)}
            className="px-8 py-4 border-2 border-gray-200 rounded-2xl text-2xl font-bold hover:border-gray-400 transition-all">
            {step===0 ? 'Cancel' : '← Back'}
          </button>
          {step < 3 ? (
            <button type="button"
              disabled={step===0 && (!form.plant_name || !form.plant_type)}
              onClick={() => setStep(s=>s+1)}
              className="px-8 py-4 bg-green-600 text-white rounded-2xl text-2xl font-bold hover:bg-green-700 disabled:opacity-40 transition-all">
              Next →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="px-8 py-4 bg-green-600 text-white rounded-2xl text-2xl font-bold hover:bg-green-700 disabled:opacity-40 transition-all">
              {loading ? '🌱 Planting...' : '🌱 Create Twin'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WEATHER WIDGET
// CHANGE: Fixed — backend returns mock data (28°C / 60% humidity) when
// OPENWEATHER_API_KEY is not set. Previously the catch block was
// overwriting the valid mock response with '--'. Now we always use the
// backend response; only show '--' if the network call itself fails.
// ─────────────────────────────────────────────────────────────────────────────
function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // CHANGE: always fetch immediately with default coords as fallback
    if (!navigator.geolocation) {
      fetchWeather(28.6139, 77.2090);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      ()  => fetchWeather(28.6139, 77.2090),    // location denied → use Delhi coords
      { timeout: 5000 },
    );
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await axios.get(`${API}/weather/?lat=${lat}&lon=${lon}`, { timeout: 8000 });
      // CHANGE: backend always returns valid data (real or mock) — use it directly
      setWeather(res.data);
    } catch {
      // CHANGE: only reach here if backend itself is unreachable (server down)
      setWeather({ temp: 28, humidity: 60, description: 'Backend Offline', city: 'Default', mock: true });
    } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-16 bg-gray-200 rounded" />
    </div>
  );

  const weatherEmoji = {
    'clear sky':'☀️','few clouds':'🌤','scattered clouds':'⛅','broken clouds':'☁️',
    'shower rain':'🌦','rain':'🌧','thunderstorm':'⛈','snow':'❄️','mist':'🌫',
  };
  const emoji = Object.entries(weatherEmoji).find(([k]) =>
    weather.description?.toLowerCase().includes(k))?.[1] || '🌡️';

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <p className="text-gray-700 font-bold uppercase text-3xl tracking-widest">Live Weather</p>
        {weather.mock && <span className="text-xs text-orange-400 font-bold bg-orange-50 px-2 py-1 rounded-lg">DEMO</span>}
      </div>
      <div className="flex items-center gap-4 mb-6">
        <span className="text-7xl">{emoji}</span>
        <div>
          <p className="text-6xl font-black italic">{weather.temp}°C</p>
          <p className="text-2xl text-gray-400 mt-1">{weather.description}</p>
          {weather.city && <p className="text-2xl text-gray-400">📍 {weather.city}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-5xl font-black italic text-blue-600">{weather.humidity}%</p>
          <p className="text-2xl text-blue-400 font-bold uppercase mt-1">Humidity</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-5xl font-black italic text-green-600">{weather.temp}°</p>
          <p className="text-2xl text-green-400 font-bold uppercase mt-1">Temp</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARE REMINDER LINK BUTTON
// CHANGE: NEW — button inside the Digital Twin Care tab to navigate to
// the Care Reminder page, so users can set fertilization reminders.
// ─────────────────────────────────────────────────────────────────────────────
function CareReminderLink({ plantName }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/care-reminder')}
      className="w-full mt-2 py-5 border-2 border-[#24592B] text-[#24592B] rounded-2xl font-black text-2xl hover:bg-green-50 transition-all flex items-center justify-center gap-3"
    >
      🌿 Set Fertilization Reminder
      <span className="text-xl font-medium text-gray-400">(Care Reminders page)</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARE ACTIONS PANEL — with IST timestamps
// ─────────────────────────────────────────────────────────────────────────────
function CarePanel({ plant, onRefresh }) {
  const [waterLoading, setWaterLoading] = useState(false);
  const [fertLoading,  setFertLoading]  = useState(false);
  const [toast,  setToast]  = useState('');
  const [logs,   setLogs]   = useState([]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { fetchLogs(); }, [plant.plant_id]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API}/twin/${plant.plant_id}/care-logs/`);
      setLogs(res.data.logs || []);
    } catch {}
  };

  const handleWater = async () => {
    setWaterLoading(true);
    try {
      await axios.post(`${API}/twin/${plant.plant_id}/water/`);
      showToast('💧 Watered! Great job.');
      onRefresh(); fetchLogs();
    } catch { showToast('❌ Failed to log watering.'); }
    finally { setWaterLoading(false); }
  };

  const handleFertilize = async () => {
    setFertLoading(true);
    try {
      await axios.post(`${API}/twin/${plant.plant_id}/fertilize/`);
      showToast('🌿 Fertilizer logged!');
      onRefresh(); fetchLogs();
    } catch { showToast('❌ Failed to log fertilizing.'); }
    finally { setFertLoading(false); }
  };

  const lastWateredIST   = toIST(plant.last_watered);
  const lastFertilizedIST = toIST(plant.last_fertilized);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
      <p className="text-gray-700 font-bold uppercase text-3xl tracking-widest">Care Actions</p>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 text-2xl font-bold text-green-700">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status row — IST times */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-5xl mb-1">💧</p>
          {lastWateredIST ? (
            <>
              <p className="text-xl font-black text-blue-600">{lastWateredIST}</p>
              <p className="text-lg text-blue-400 mt-0.5">({timeSinceIST(plant.last_watered)})</p>
            </>
          ) : (
            <p className="text-2xl font-black text-blue-400">Never</p>
          )}
          <p className="text-xl text-blue-400 font-bold uppercase mt-1">Last Watered</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-5xl mb-1">🌿</p>
          {lastFertilizedIST ? (
            <>
              <p className="text-xl font-black text-green-600">{lastFertilizedIST}</p>
              <p className="text-lg text-green-400 mt-0.5">({timeSinceIST(plant.last_fertilized)})</p>
            </>
          ) : (
            <p className="text-2xl font-black text-green-400">Never</p>
          )}
          <p className="text-xl text-green-400 font-bold uppercase mt-1">Last Fertilized</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={handleWater} disabled={waterLoading}
          className="py-6 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-3xl transition-all disabled:opacity-50 shadow-md hover:shadow-blue-200 hover:scale-[1.02]">
          {waterLoading ? '...' : '💧 Water Now'}
        </button>
        <button onClick={handleFertilize} disabled={fertLoading}
          className="py-6 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-3xl transition-all disabled:opacity-50 shadow-md hover:shadow-green-200 hover:scale-[1.02]">
          {fertLoading ? '...' : '🌿 Fertilize'}
        </button>
      </div>

      {/* Activity log with IST times */}
      {logs.length > 0 && (
        <div>
          <p className="text-2xl font-bold text-gray-400 uppercase tracking-widest mb-3">Activity Log</p>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {logs.slice(0, 8).map((log, i) => (
              <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold capitalize text-gray-700">
                    {log.action === 'watered' ? '💧' : '🌿'} {log.action}
                  </span>
                  <span className="text-lg text-gray-400">{timeSinceIST(log.logged_at)}</span>
                </div>
                {toIST(log.logged_at) && (
                  <p className="text-lg text-gray-400 mt-0.5">{toIST(log.logged_at)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHANGE: Care Reminder button — links to /care-reminder page */}
      <CareReminderLink plantName={plant.plant_name} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANT CARD
// ─────────────────────────────────────────────────────────────────────────────
function PlantCard({ plant, onClick, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${plant.plant_name}"?`)) return;
    setDeleting(true);
    try { await axios.delete(`${API}/twin/${plant.plant_id}/`); onDelete(plant.plant_id); }
    catch { setDeleting(false); }
  };
  return (
    <motion.div layout initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:0.9 }} onClick={onClick}
      className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 cursor-pointer transition-all group relative">
      <button onClick={handleDelete} disabled={deleting}
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 text-gray-300 transition-all opacity-0 group-hover:opacity-100 text-xl font-black">
        {deleting ? '...' : '×'}
      </button>
      <div className="flex items-start gap-4 mb-5">
        <span className="text-6xl">{stageIcons[plant.current_stage] || '🌱'}</span>
        <div>
          <h3 className="text-3xl font-black text-gray-900">{plant.plant_name}</h3>
          <p className="text-xl text-gray-400 capitalize">{plant.plant_type?.replace(/_/g,' ')}</p>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-xl font-bold mb-1">
          <span className="text-gray-500">Health</span>
          <span style={{ color: plant.health_color }}>{Math.round(plant.health_score)}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" initial={{ width:0 }}
            animate={{ width:`${plant.health_score}%` }} transition={{ duration:0.8, ease:'easeOut' }}
            style={{ backgroundColor: plant.health_color }} />
        </div>
      </div>
      <div className="flex justify-between text-xl text-gray-400">
        <span>Day {Math.round(plant.real_days || 0)}</span>
        <span>{plant.growth_percentage}% grown</span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function DigitalTwin() {
  const [plants, setPlants]          = useState([]);
  const [loading, setLoading]        = useState(true);
  const [selectedPlant, setSelected] = useState(null);
  const [showAddModal, setShowAdd]   = useState(false);
  const [activeTab, setActiveTab]    = useState('overview');
  const [sidebarOpen, setSidebar]    = useState(false);
  // CHANGE: useNavigate for Care Reminder button in header
  const navigate = useNavigate();

  const fetchPlants = useCallback(async () => {
    try { const res = await axios.get(`${API}/twin/`); setPlants(res.data.plants || []); }
    catch {} finally { setLoading(false); }
  }, []);

  const fetchPlant = useCallback(async (id) => {
    try { const res = await axios.get(`${API}/twin/${id}/`); setSelected(res.data); console.log("selectded plant is:",selectedPlant)}
    catch {}
  }, []);

  useEffect(() => { fetchPlants(); }, [fetchPlants]);

  useEffect(() => {
    if (!selectedPlant) return;
    const t = setInterval(() => fetchPlant(selectedPlant.plant_id), 30000);
    console.log("selected plant ia:",selectedPlant);
    return () => clearInterval(t);
  }, [selectedPlant?.plant_id]);

  const handleSelectPlant = (plant) => { fetchPlant(plant.plant_id); setSidebar(true); };
  const handleDeletePlant = (plantId) => {
    setPlants(p => p.filter(x => x.plant_id !== plantId));
    if (selectedPlant?.plant_id === plantId) { setSelected(null); setSidebar(false); }
  };
  const handlePlantAdded = (newPlant) => {
    setPlants(p => [newPlant, ...p]); setSelected(newPlant); setSidebar(true);
  };

  const timesFont = { fontFamily:'"Times New Roman", Times, serif' };
  // console.log(selectedPlant.condition_score);
  return (
    <div className="w-full min-h-screen bg-[#f8fafc]">
      {/* HEADER */}
      <div className="px-10 xl:px-20 pt-20 pb-12">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-green-600 font-bold uppercase tracking-[0.2em] text-2xl block mb-3">Live Monitoring</span>
            <h1 className="text-6xl md:text-9xl font-black italic text-gray-900" style={timesFont}>Digital Twin</h1>
            <p className="text-gray-400 text-3xl font-medium mt-6">
              {plants.length} plant{plants.length !== 1 ? 's' : ''} being monitored
            </p>
          </div>
          {/* CHANGE: added Care Reminder shortcut button next to Add Plant */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/care-reminder')}
              className="flex items-center gap-3 border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-6 rounded-3xl font-black text-2xl transition-all"
            >
              🌿 Care Reminders
            </button>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-10 py-6 rounded-3xl font-black text-3xl shadow-lg hover:scale-[1.02] transition-all">
              <span className="text-4xl">+</span> Add Plant
            </button>
          </div>
        </div>
      </div>

      {/* PLANT GRID */}
      <div className="px-10 xl:px-20 pb-20">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <div className="text-6xl animate-spin mb-4">🌱</div>
              <p className="text-gray-400 text-2xl tracking-widest">Loading garden...</p>
            </div>
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-8xl mb-6">🌱</div>
            <h2 className="text-5xl font-black text-gray-800 mb-4">Your Garden is Empty</h2>
            <p className="text-3xl text-gray-400 mb-10">Create your first digital plant twin to get started.</p>
            <button onClick={() => setShowAdd(true)}
              className="px-12 py-6 bg-green-600 text-white rounded-3xl font-black text-3xl hover:bg-green-700 transition-all shadow-lg">
              🌱 Plant Your First Seed
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {plants.map(p => (
                <PlantCard key={p.plant_id} plant={p}
                  onClick={() => handleSelectPlant(p)}
                  onDelete={handleDeletePlant} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* CHANGE: SIDEBAR DETAIL — changed from right-side panel to centred modal
          so results appear in the middle of the screen like Recommendation/Encyclopedia */}
      <AnimatePresence>
        {sidebarOpen && selectedPlant && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
              onClick={() => setSidebar(false)} />
            <motion.div
              initial={{ opacity:0, scale:0.96, y:30 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.96, y:30 }}
              transition={{ type:'spring', damping:30, stiffness:300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-[#f8fafc] z-[101] shadow-2xl overflow-y-auto rounded-[2.5rem] max-h-[90vh]">

              {/* Sidebar header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-10 py-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-4xl font-black text-gray-900">{selectedPlant.plant_name}</h2>
                  <p className="text-xl text-gray-400 capitalize mt-1">
                    {selectedPlant.plant_type?.replace(/_/g,' ')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xl text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    LIVE
                  </div>
                  <button onClick={() => setSidebar(false)}
                    className="text-4xl text-gray-400 hover:text-black transition-colors">✕</button>
                </div>
              </div>

              {/* Sidebar body */}
              <div className="p-10 space-y-8">

                {/* Stage pills */}
                <div className="flex gap-3 flex-wrap">
                  {['seed','small_plant','medium_plant','fully_grown'].map((s, i) => {
                    const labels = ['Seed','Small','Medium','Full'];
                    const icons  = ['🌰','🌿','🪴','🌳'];
                    const stages = ['seed','small_plant','medium_plant','fully_grown'];
                    const isActive = selectedPlant.current_stage === s;
                    const isPast   = stages.indexOf(s) < stages.indexOf(selectedPlant.current_stage);
                    return (
                      <div key={s} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-2xl font-bold border transition-all
                        ${isActive ? 'bg-green-600 text-white border-green-600'
                        : isPast   ? 'bg-green-50 text-green-600 border-green-200'
                        :            'bg-gray-50 text-gray-300 border-gray-200'}`}>
                        {icons[i]} {labels[i]}
                        {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                      </div>
                    );
                  })}
                </div>

                {/* 3D Viewer */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-500 uppercase tracking-widest">3D Digital Twin</span>
                    <span className="text-xl text-gray-300">Drag to rotate · Scroll to zoom</span>
                  </div>
                  <div className="h-80 relative">
                    <PlantViewer3D
                      plantType={selectedPlant.plant_type}
                      stage={selectedPlant.current_stage}
                      healthScore={selectedPlant.health_score}
                    />
                  </div>
                  <div className="px-8 py-4 border-t border-gray-100 flex justify-between text-xl text-gray-400">
                    <span>Stage: <strong className="text-green-600">{selectedPlant.stage_label}</strong></span>
                    <span>Growth: <strong className="text-green-600">{selectedPlant.growth_percentage}%</strong></span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-white rounded-2xl p-2 border border-gray-100">
                  {[
                    { key:'overview', label:'📊 Overview' },
                    { key:'care',     label:'💧 Care' },
                    { key:'weather',  label:'🌤 Weather' },
                  ].map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className={`flex-1 py-4 rounded-xl text-2xl font-bold transition-all
                        ${activeTab===t.key ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-8">
                        <div className="relative w-28 h-28 shrink-0">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                            <motion.circle cx="50" cy="50" r="40" fill="none"
                              stroke={selectedPlant.health_color} strokeWidth="8" strokeLinecap="round"
                              initial={{ strokeDasharray:'0 251.2' }}
                              animate={{ strokeDasharray:`${(selectedPlant.health_score/100)*251.2} 251.2` }}
                              transition={{ duration:1, ease:'easeOut' }} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-black" style={{ color: selectedPlant.health_color }}>
                              {Math.round(selectedPlant.health_score)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-4xl font-black">{selectedPlant.health_label}</p>
                          <p className="text-2xl text-gray-400 mt-1">{selectedPlant.stage_label}</p>
                          <p className="text-xl text-gray-300 mt-1">
                            {selectedPlant.days_to_next_stage > 0
                              ? `~${selectedPlant.days_to_next_stage} days to next stage`
                              : '🎉 Maximum growth!'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <div className="flex justify-between text-xl font-bold text-gray-500 mb-2">
                          <span>Growth Progress</span><span>{selectedPlant.growth_percentage}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full" initial={{ width:0 }}
                            animate={{ width:`${selectedPlant.growth_percentage}%` }}
                            transition={{ duration:1, ease:'easeOut' }}
                            style={{ background:`linear-gradient(to right, #4ADE80, ${selectedPlant.health_color})` }} />
                        </div>
                      </div>
                    </div>

                    {/* Condition scores */}
                   {/* Condition scores - UPDATED TO MATCH YOUR JSON DATA */}
<div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
  <p className="text-gray-400 font-bold uppercase text-2xl tracking-[0.15em] mb-8">Conditions</p>
  <div className="space-y-8">
    {selectedPlant?.conditions && Object.entries(selectedPlant.conditions).map(([key, data]) => {
      // Logic for bar colors using data.score
      const score = data.score || 0;
      let barColor = '#EF4444'; // Red
      if (score > 0.7) barColor = '#4ADE80'; // Green
      else if (score > 0.4) barColor = '#FACC15'; // Yellow/Amber

      return (
        <div key={key} className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-2xl font-black text-gray-800 capitalize">
              {key}
            </span>
            <span className="text-xl font-bold text-gray-400">
              {data.label || 'Optimal'}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ backgroundColor: barColor }}
            />
          </div>
        </div>
      );
    })}
  </div>
</div>
                      
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        ['📅','Real Days',    `${Math.round(selectedPlant.real_days||0)}d`],
                        ['⚡','Eff. Days',    `${Math.round(selectedPlant.effective_days||0)}d`],
                        ['🚀','Growth Speed', `${selectedPlant.growth_multiplier?.toFixed(2)}×`],
                        ['🌡️','Vitality',    `${Math.round(selectedPlant.health_score)}%`],
                      ].map(([icon,label,value]) => (
                        <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 text-center shadow-sm">
                          <div className="text-4xl mb-2">{icon}</div>
                          <div className="text-3xl font-black text-green-600">{value}</div>
                          <div className="text-xl text-gray-400 mt-1">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    {selectedPlant.recommendations?.length > 0 && (
                      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <p className="text-2xl font-bold text-gray-400 uppercase tracking-widest mb-4">Recommendations</p>
                        <ul className="space-y-3">
                          {selectedPlant.recommendations.map((r, i) => (
                            <li key={i} className="bg-gray-50 rounded-2xl px-5 py-3 text-2xl font-medium text-gray-700">{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'care'    && <CarePanel plant={selectedPlant} onRefresh={() => fetchPlant(selectedPlant.plant_id)} />}
                {activeTab === 'weather' && <WeatherWidget />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && <AddPlantModal onClose={() => setShowAdd(false)} onAdded={handlePlantAdded} />}
      </AnimatePresence>
    </div>
  );
}
