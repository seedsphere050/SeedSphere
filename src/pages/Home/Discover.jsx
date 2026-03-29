import { motion } from "framer-motion";

const cards = [
  { img: "/images/medicinal.jpg", label: "Medicinal", desc: "Healing plants from nature" },
  { img: "/images/kitchen.jpg", label: "Kitchen Herbs", desc: "Fresh flavors for your kitchen" },
  { img: "/images/flowering.png", label: "Flowering", desc: "Beautiful blooms year-round" },
  { img: "/images/airpurifying.jpg", label: "Purifying", desc: "Clean air, healthy home" },
];

export default function Discover() {
  return (
    <section className="py-32 bg-white w-full overflow-hidden">
      <div className="w-full px-12 xl:px-10">
        <div className="text-center mb-16">
          <span className="text-xl md:text-3xl text-green-600 font-bold uppercase tracking-[0.3em] text-base block mb-4">Explore the Collection</span>
          <h2 className="text-8xl md:text-9xl font-black italic leading-tight">Discover Nature</h2>
          <p className="mt-6 text-4xl text-gray-500 font-medium max-w-9xl mx-auto">Browse our curated library across medicinal, culinary, flowering, and air-purifying plants.</p>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map(({ img, label, desc }) => (
            <motion.div key={label} whileHover={{ y: -14, scale: 1.02 }} transition={{ type: "spring", stiffness: 260 }} className="relative w-full h-[60rem] xl:h-[60rem] rounded-3xl shadow-2xl overflow-hidden cursor-pointer group">
              <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={label} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-10">
                <div className="text-white font-black text-6xl drop-shadow-lg mb-2 leading-tight">{label}</div>
                <div className="text-green-300 text-3xl font-semibold">{desc}</div>
                
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}