import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const staticPlants = [
  {
    id: 1,
    name: "Aloe Vera",
    category: "Medicinal",
    img: "https://images.unsplash.com/photo-1598880940371-c756e026efe9?auto=format&fit=crop&q=80&w=600",
    description: "Aloe Vera is known for its healing properties and skin benefits.",
    family: "Asphodelaceae",
    origin: "Arabian Peninsula",
    care: "Indirect sunlight, low watering frequency."
  },
  {
    id: 2,
    name: "Basil",
    category: "Kitchen Herbs",
    img: "https://images.unsplash.com/photo-1628186178346-65103445d435?auto=format&fit=crop&q=80&w=600",
    description: "Basil is a fragrant herb used in cooking worldwide.",
    family: "Lamiaceae",
    origin: "India",
    care: "Full sunlight, regular watering."
  }
];

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function DraggableScroll({ children, className }) {
  const ref = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);

  // const onMouseDown = (e) => {
  //   isDragging.current = true;
  //   startY.current = e.clientY;
  //   scrollTop.current = ref.current.scrollTop;
  //   ref.current.style.cursor = "grabbing";
  //   ref.current.style.userSelect = "none";
  // };
  const onMouseDown = (e) => {
  if (e.target.tagName === "BUTTON") return; // don't start drag when clicking a button
  isDragging.current = true;
  startY.current = e.clientY;
  scrollTop.current = ref.current.scrollTop;
  ref.current.style.cursor = "grabbing";
  ref.current.style.userSelect = "none";
};

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const delta = e.clientY - startY.current;
    ref.current.scrollTop = scrollTop.current - delta;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (ref.current) {
      ref.current.style.cursor = "grab";
      ref.current.style.userSelect = "";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{ cursor: "grab", overflowY: "auto", scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );
}

function FilterGroup({ title, children, defaultOpen = true, titleClassName = "text-sm" }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-5 group"
      >
        <span className={`${titleClassName} font-black uppercase tracking-[0.2em] text-gray-500`}>
          {title}
        </span>
        <span className="text-gray-400 group-hover:text-gray-600 transition text-2xl font-bold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && children}
    </div>
  );
}

export default function Encyclopedia() {
  const [plants, setPlants] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLetters, setSelectedLetters] = useState([]); // Array for multiple clicks
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);

  useEffect(() => {
  const fetchPlants = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/plants/"); // Backend URL
      if (!res.ok) throw new Error("Database error");
      const data = await res.json();
      setPlants(data);
    } catch (err) {
      console.error("Error fetching plants:", err);
      setPlants(staticPlants); // fallback
    }
  };
  fetchPlants();
}, []);

  const allCategories = [...new Set(plants.map(p => p.category).filter(Boolean))];
  const hasActiveFilters = selectedLetters.length > 0 || selectedCategories.length > 0 || search;

  const clearAllFilters = () => {
    setSelectedLetters([]);
    setSelectedCategories([]);
    setSearch("");
  };

  const toggleLetter = (letter) => {
    setSelectedLetters(prev => 
      prev.includes(letter) ? prev.filter(l => l !== letter) : [...prev, letter]
    );
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };
  console.log("Selected Letters:", selectedLetters);
  plants.forEach(p => console.log("Plant name first letter:", p.name.trim().charAt(0).toUpperCase()));
  // const filtered = plants.filter((plant) => {
  //   const matchesSearch = plant.name.toLowerCase().includes(search.toLowerCase());
  //   const matchesLetter = selectedLetters.length > 0
  // ? selectedLetters.some(l => plant.name.trim().charAt(0).toUpperCase() === l)
  // : true;
  //   const matchesCategory = selectedCategories.length > 0
  //     ? selectedCategories.includes(plant.category)
  //     : true;
  //   return matchesSearch && matchesLetter && matchesCategory;
  // });
  const filtered = plants.filter((plant) => {
    const name = plant.name ? plant.name.trim() : "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesLetter = selectedLetters.length > 0
      ? selectedLetters.some(l => name.charAt(0).toUpperCase() === l)
      : true;
    const matchesCategory = selectedCategories.length > 0
      ? selectedCategories.includes(plant.category)
      : true;
    return matchesSearch && matchesLetter && matchesCategory;
  });
  return (
    // UPDATED: Changed px-10 to px-4 to push content to the very edges
    <div className="w-full px-4 xl:px-8 py-20 bg-gray-50/30">

      {/* Hero Section */}
      <div className="relative mb-14 rounded-[3rem] overflow-hidden bg-green-950 px-16 py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1600"
            alt="Plants"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green-950/80 via-green-950/40 to-green-950/80" />
        </div>
        <div className="relative z-10 flex flex-col items-center max-w-4xl w-full">
          <span className="text-white font-bold uppercase tracking-[0.3em] text-3xl mb-4 block">Browse All Plants</span>
          <h1 className="text-7xl md:text-[200px] font-black italic leading-tight text-white mb-6">Plant Encyclopedia</h1>
          <p className="text-white/80 text-5xl mt-8 mb-10 max-w-6xl font-medium leading-relaxed">Explore thousands of plants — their care guides and origins all in one place.</p>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-7 w-full max-w-4xl focus-within:border-green-400 transition-all shadow-2xl">
            <svg className="w-13 h-13 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              type="text"
              placeholder="Search plants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none text-5xl font-medium w-full bg-transparent text-white placeholder-white/50"
            />
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-12 items-start">

        {/* ── LEFT SIDEBAR ── */}
        <div
          className="shrink-0 rounded-[2.5rem] border border-gray-100 bg-white shadow-xl overflow-hidden flex flex-col"
          // UPDATED: Width to 28% for a wider look on large screens
          style={{ width: "20%", height: "calc(100vh - 8rem)", position: "sticky", top: "4rem" }}
        >
          <div className="flex items-center justify-between px-8 pt-10 pb-6 border-b border-gray-100 shrink-0">
            <h3 className="text-5xl font-black uppercase tracking-[0.1em] text-gray-800">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="text-4xl font-bold text-red-400 hover:text-red-600 transition">✕ Clear</button>
            )}
          </div>

          <DraggableScroll className="flex-1 px-8 py-8 ">
            <FilterGroup title="Alphabet" titleClassName="text-5xl text-gray-600 tracking-[0.1em]">
              <div className="grid grid-cols-4 gap-3 mb-1">
                {letters.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => toggleLetter(letter)} // FIXED: Using toggleLetter logic
                    className={`aspect-square rounded-2xl text-4xl font-black transition-all duration-150 flex items-center justify-center
                      ${selectedLetters.includes(letter)
                        ? "bg-green-600 text-white shadow-lg scale-110"
                        : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700"
                      }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </FilterGroup>

            {allCategories.length > 0 && (
              <FilterGroup title="Category" titleClassName="text-5xl mt-5 text-gray-600 tracking-[0.1em]">
                <div className="flex flex-col gap-6">
                  {allCategories.map((cat) => (
                    <label key={cat} className="flex items-center gap-5 cursor-pointer group">
                      <div
                        onClick={() => toggleCategory(cat)}
                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all shrink-0mt-3
                          ${selectedCategories.includes(cat) ? "bg-green-600 border-green-600" : "border-gray-300 group-hover:border-green-400"}`}
                      >
                        {selectedCategories.includes(cat) && (
                          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        )}
                      </div>
                      <span className={`text-5xl font-black transition ${selectedCategories.includes(cat) ? "text-black" : "text-gray-500"}`}>{cat}</span>
                    </label>
                  ))}
                </div>
              </FilterGroup>
            )}

            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-4xl text-gray-400 font-medium italic">
                <span className="font-black text-gray-800 not-italic">{filtered.length}</span> plant{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </DraggableScroll>
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="flex-1 min-w-0">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtered.map((plant) => (
              <motion.div
                key={plant.id}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => setSelectedPlant(plant)}
                className="min-w-[1200px] bg-white rounded-[4rem] shadow-xl overflow-hidden cursor-pointer snap-start border border-gray-50 flex-shrink-0"
              >
                <div className="h-[700px] overflow-hidden">
                  <img src={plant.img} alt={plant.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                </div>
                <div className="p-12">
                  <span className="text-green-600 font-bold uppercase tracking-widest text-3xl mb-4 block">{plant.category}</span>
                  <h2 className="text-8xl font-black italic mb-4">{plant.name}</h2>
                  <p className="text-gray-500 text-5xl leading-relaxed">{plant.description}</p>
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-32">
                <div className="text-8xl mb-6">🌿</div>
                <p className="text-4xl font-black text-gray-300">No plants found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Section */}
      <AnimatePresence>
        {selectedPlant && (
          <div className="fixed inset-0 backdrop-blur-xl bg-black/60 flex justify-center items-center z-50 p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white rounded-[3rem] w-full max-w-[80%] h-[85vh] shadow-2xl relative overflow-hidden flex flex-col md:flex-row"
            >
              <button
                onClick={() => setSelectedPlant(null)}
                className="absolute top-6 right-6 z-50 bg-white w-24 h-24 flex items-center justify-center rounded-full text-gray-800 hover:text-black shadow-xl text-4xl font-bold"
              >✕</button>
              <div className="w-full md:w-1/2 h-full shrink-0">
                <img src={selectedPlant.img} alt={selectedPlant.name} className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-1/2 p-14 overflow-y-auto flex flex-col">
                <span className="text-green-600 font-bold uppercase tracking-widest text-2xl mb-4">{selectedPlant.category}</span>
                <h2 className="text-8xl font-black italic mb-10 text-gray-900">{selectedPlant.name}</h2>
                <div className="grid grid-cols-2 gap-8 border-b pb-10 mb-10">
                  <div>
                    <p className="text-black-400 text-4xl uppercase font-black tracking-widest mb-2">Family</p>
                    <p className="font-bold text-5xl text-gray-800">{selectedPlant.family}</p>
                  </div>
                  <div>
                    <p className="text-black-400 text-4xl uppercase font-black tracking-widest mb-2">Origin</p>
                    <p className="font-bold text-5xl text-gray-800">{selectedPlant.origin}</p>
                  </div>
                </div>
                <div className="mb-10">
                  <h3 className="text-4xl font-black uppercase tracking-widest text-black-400 mb-4">Care Guide</h3>
                  <p className="text-gray-700 text-5xl leading-relaxed">{selectedPlant.care}</p>
                </div>
                <div>
                  <h3 className="text-4xl font-black uppercase tracking-widest text-black-400 mb-4">Description</h3>
                  <p className="text-gray-600 text-5xl leading-relaxed">{selectedPlant.description}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}