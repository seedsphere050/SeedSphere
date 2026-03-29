import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ActionCycler from './ActionCycler'; // Keep your existing cycler

export default function SeedSphereHero() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-[70vh] flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Side: Solid Sage Background */}
      <div className="flex-1 bg-[#84af8c] flex items-center justify-end pr-0 md:pr-[5vw] z-10">
        
        {/* Floating Hero Card */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white p-12 md:p-50 w-full md:w-[45vw] rounded-r-lg md:rounded-[0px] shadow-2xl md:-mr-[10vw] z-20"
        >
          {/* <span className="text-black font-Playfair Display italic tracking-[0.3em] font-bold text-6xl mb-4 block">
            The Botanical Network
          </span> */}
          
          <h1 className="text-[200px] md:text-[250px] font-signature font-black italic leading-tight text-[#000000] mb-5">
            Ready to <br />
            <span className="text-[#24592B]">
              <ActionCycler />
            </span>
          </h1>

          <p className="text-gray-900 text-lg md:text-5xl mb-17 max-w-4md leading-relaxed">
            Empowering your home garden with AI-driven insights and real-time botanical tracking.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-25 py-14 bg-[#24592B] text-white font-bold italic rounded-full text-5xl tracking-widest hover:bg-[#24592B] transition-colors uppercase shadow-lg"
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>

      {/* Right Side: Large Background Image */}
      <div 
        className="flex-[1.2] bg-cover bg-center h-full"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1500&q=80')` 
        }}
      >
        {/* Optional Overlay for better blending */}
        <div className="w-full h-full bg-black/5 md:bg-transparent"></div>
      </div>

    </section>
  );
}