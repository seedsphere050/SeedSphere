import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const actions = [
  "Water your Fern?",
  "Check the Soil?",
  "Monitor Growth?",
  "Identify Pests?",
  "Nurture Nature?",
];

export default function ActionCycler() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % actions.length);
    }, 3000); // Changes every 3 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-block relative h-[1.2em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={actions[index]}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="block whitespace-nowrap"
        >
          {actions[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}