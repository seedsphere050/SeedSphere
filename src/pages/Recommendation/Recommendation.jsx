import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Fallback data for testing/offline use
const staticPlants = [
  { id: 1, name: "Aloe Vera", category: "Medicinal", img: "https://images.unsplash.com/photo-1598880940371-c756e026efe9?auto=format&fit=crop&q=80&w=600", description: "Aloe Vera thrives in warm, dry climates.", family: "Asphodelaceae", origin: "Arabian Peninsula", care: "Indirect sunlight, low watering frequency." },
  { id: 2, name: "Basil", category: "Kitchen Herbs", img: "https://images.unsplash.com/photo-1628186178346-65103445d435?auto=format&fit=crop&q=80&w=600", description: "Basil grows best in warm, sunny areas.", family: "Lamiaceae", origin: "India", care: "Full sunlight, regular watering." },
  { id: 3, name: "Snake Plant", category: "Air Purifying", img: "https://images.unsplash.com/photo-1593482815045-2139815e8f88?auto=format&fit=crop&q=80&w=600", description: "Excellent at filtering indoor air.", family: "Asparagaceae", origin: "West Africa", care: "Very low maintenance." }
];

export default function Recommendation() {
  const [plants, setPlants] = useState(staticPlants); // Initialized with static plants
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const scrollRef = useRef(null);

  // --- LOCATION & BACKEND FETCHING ---
  useEffect(() => {
  const getRecommendations = async () => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `http://127.0.0.1:8000/api/recommend/plants/?lat=${latitude}&lon=${longitude}`
          );

          if (response.ok) {
            const data = await response.json();

            const backendPlants = data.recommended_plants || [];

            const formattedPlants = backendPlants.map((p, index) => ({
              id: p.id || index,
              name: p.name,
              scientific_name: p.scientific_name,
              category: "Recommended",
              img: "https://images.unsplash.com/photo-1463320898484-cdee8141c787?auto=format&fit=crop&q=80&w=600",
              description: "Best suited based on your environment.",
              family: "N/A",
              origin: "N/A",
              care: "Standard care required."
            }));

            setPlants(formattedPlants.length > 0 ? formattedPlants : staticPlants);
          }
        } catch (error) {
          console.error("Backend error:", error);
          setPlants(staticPlants);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
      }
    );
  };

  getRecommendations();
}, []);

  const categories = ["All", ...new Set(plants.map((p) => p.category))];
  const filteredPlants = activeCategory === "All" ? plants : plants.filter((p) => p.category === activeCategory);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === "left" ? -600 : 600, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      
      {/* HERO SECTION - REPLICATING THE REFERENCE DESIGN */}
      <section className="relative w-full h-[70vh] flex flex-col md:flex-row overflow-hidden bg-[#f4f7f4]">
        {/* Left Side (The Greenish Background) */}
        <div className="w-full md:w-1/2 bg-[#84af8c] flex items-center justify-center relative p-5">
          
          {/* THE OVERLAPPING CARD */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white p-12 md:p-65 w-full md:w-[45vw] rounded-r-lg md:rounded-[0px] shadow-2xl md:-mr-[10vw] z-20"
          >
            <span className="text-green-600 font-bold uppercase tracking-[0.3em] text-4xl block mb-6">
              Curated for You
            </span>
            <h1 className="text-7xl md:text-[220px] font-black italic mb-8 text-black leading-[1.1]">
              Find Your Perfect<br />Plant Match
            </h1>
            <p className="text-5xl text-gray-500 leading-relaxed">
              Whether you have a sunny windowsill or a dark corner, we have the science to find the plant that thrives with you.
            </p>
          </motion.div>
        </div>

        {/* Right Side (The Image) */}
        <div 
          className="w-full md:w-1/2 h-full bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1463320898484-cdee8141c787?auto=format&fit=crop&q=80&w=1500')` }}
        />
      </section>

      {/* FILTER & RESULTS AREA */}
      <div className="px-10 xl:px-24 py-24">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-9xl font-black italic text-black">Your Matches</h2>
            <p className="text-[50px] text-gray-700 mt-2">Based on your current environment</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-6 mb-20 overflow-x-auto no-scrollbar py-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-12 py-8 rounded-full font-bold text-4xl transition-all border-2 whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-green-600 text-white border-green-600 shadow-xl"
                  : "bg-white text-black-400 border-gray-800 hover:border-green-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Horizontal Scroll Slider */}
        <div className="relative group">
          <button onClick={() => scroll("left")} className="absolute -left-10 top-1/2 -translate-y-1/2 z-20 w-36 h-36 bg-white shadow-2xl rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition-all text-6xl border border-gray-100 opacity-0 group-hover:opacity-100"><span className="text-6xl font-black mb-4">&lt;</span></button>
          <button onClick={() => scroll("right")} className="absolute -right-10 top-1/2 -translate-y-1/2 z-20 w-36 h-36 bg-white shadow-2xl rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition-all text-6xl border border-gray-100 opacity-0 group-hover:opacity-100"><span className="text-6xl font-black mb-4">&gt;</span></button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-12 pb-16 snap-x scroll-smooth no-scrollbar"
          >
            {filteredPlants.map((plant) => (
              <motion.div
                key={plant.id}
                whileHover={{ y: -20 }}
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
          </div>
        </div>
      </div>

      {/* MODAL */}
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
                className="absolute top-6 right-6 z-50 bg-white w-24 h-24 flex items-center justify-center rounded-full text-gray-600 hover:text-black shadow-xl text-4xl font-bold"
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