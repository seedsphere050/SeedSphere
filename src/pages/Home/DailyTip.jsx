// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";

// const tips = Array.from({ length: 100 }, (_, i) => ({
//   id: i + 1,
//   text: `Tip ${i + 1}: Keep soil moist but not waterlogged.`,
//   video: "/videos/tip.mp4"
// }));

// export default function DailyTip() {
//   const [tip, setTip] = useState(null);

//   useEffect(() => {
//     const todayIndex = new Date().getDate() % tips.length;
//     setTip(tips[todayIndex]);
//   }, []);

//   if (!tip) return null;

//   return (
//     <section className="relative w-full h-[900px] bg-black overflow-hidden flex items-center">

//       {/* Background Video */}
//       <div className="absolute inset-0 z-0 opacity-50">
//         <video autoPlay muted loop playsInline className="w-full h-full object-cover">
//           <source src={tip.video} type="video/mp4" />
//         </video>
//         <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
//       </div>

//       {/* Content */}
//       <div className="relative z-10 w-full px-12 xl:px-24">
//         <motion.div
//           initial={{ x: -100, opacity: 0 }}
//           whileInView={{ x: 0, opacity: 1 }}
//           transition={{ duration: 1, ease: "easeOut" }}
//           viewport={{ once: true }}
//           className="w-full max-w-[none] italic text-white"
//         >
//           <span className="text-3xl md:text-4xl text-green-400 font-bold uppercase tracking-[0.2em] text-base mb-6 block">
//             Daily Eco Tip
//           </span>

//           <h2 className="text-7xl md:text-9xl font-black italic text-white leading-tight mb-8">
//             {tip.text.split(':')[0]}
//           </h2>

//           <p className="text-4xl md:text-6xl text-gray-300 font-medium leading-relaxed border-l-8 border-green-500 pl-15">
//             {tip.text.split(':')[1]}
//           </p>
//         </motion.div>
//       </div>

//       {/* Decorative leaf */}
//       <motion.div
//         animate={{ rotate: 360 }}
//         transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//         className="absolute right-[-5%] bottom-[-10%] opacity-10 pointer-events-none"
//       >
//         <svg viewBox="0 0 24 24" fill="none" className="w-[32rem] h-[32rem] text-white" stroke="currentColor" strokeWidth="0.5">
//           <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8.5C18.5 17.5 15.5 20 11 20Z" />
//         </svg>
//       </motion.div>
//     </section>
//   );
// }
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function DailyTip() {
  const [tip, setTip] = useState(null);

  useEffect(() => {
    async function fetchTip() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/tips/random/");
        const data = await res.json();
        if (data.error) {
          console.error(data.error);
          return;
        }

        setTip({
          id: data.tip_no,
          title: data.title,
          description: data.description,
          video: data.video,
        });
      } catch (err) {
        console.error("Failed to fetch tip:", err);
      }
    }

    fetchTip();

    // Refresh tip every 10 seconds (optional)
    const interval = setInterval(fetchTip, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!tip) return null;

  return (
    <section className="relative w-full h-[900px] bg-black overflow-hidden flex items-center">

      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover filter brightness-75"
        >
          <source src={tip.video} type="video/mp4" />
          {/* Fallback text */}
          Your browser does not support the video tag.
        </video>
        {/* Subtle dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-12 xl:px-24">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="w-full max-w-[none] italic text-white"
        >
          <span className="text-3xl md:text-4xl text-green-400 font-bold uppercase tracking-[0.2em] text-base mb-6 block">
            Daily Eco Tip
          </span>

          <h2 className="text-7xl md:text-9xl font-black italic text-white leading-tight mb-8">
            {tip.title}
          </h2>

          <p className="text-4xl md:text-6xl text-gray-300 font-medium leading-relaxed border-l-8 border-green-500 pl-15">
            {tip.description}
          </p>
        </motion.div>
      </div>

      {/* Decorative rotating leaf */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute right-[-5%] bottom-[-10%] opacity-10 pointer-events-none"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-[32rem] h-[32rem] text-white"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8.5C18.5 17.5 15.5 20 11 20Z" />
        </svg>
      </motion.div>
    </section>
  );
}
