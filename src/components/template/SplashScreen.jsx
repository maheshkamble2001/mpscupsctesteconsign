import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AcademicCapIcon } from "@heroicons/react/24/solid";

export function SplashScreen() {
  const [statusIndex, setStatusIndex] = useState(0);

  // 🎯 Test generation specific live logs (Restored Original Text)
  const generatingStatuses = [
    "Connecting to MPSC/UPSC Blueprint Engine...",
    "Randomizing Question Banks & Core Syllabus...",
    "Generating Multiple Choice Questions (MCQs)...",
    "Assembling Answer Keys & Negative Marking Rules...",
    "Validating Question Difficulties & Shuffling Sets...",
    "Compiling Final Test Paper Template..."
  ];

  useEffect(() => {
    // Switch generation tasks every 3.5 seconds
    const interval = setInterval(() => {
      setStatusIndex((prevIndex) => (prevIndex + 1) % generatingStatuses.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // 6 Dots wave animation variants
  const dotVariants = {
    animate: (i) => ({
      y: [0, -6, 0],
      transition: { repeat: Infinity, duration: 0.8, delay: i * 0.12, ease: "easeInOut" }
    })
  };

  // 🖋️ Live generation typing animation settings
  const sentenceVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.025 } // Typing speed
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, display: "none" },
    visible: { opacity: 1, display: "inline-block" }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#0A0E17] z-[9999] overflow-hidden">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(245,165,36,0.05)_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      <div className="flex flex-col items-center justify-center max-w-md w-full px-6 text-center select-none relative z-10 -mt-10">
        
        {/* Brand Core Identity Section */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center mb-8">
          
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5A524] shadow-lg mb-4">
            <AcademicCapIcon className="h-9 w-9 text-[#0A0E17]" />
          </div>
          
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#F5A524] mb-1">
            MPSC / UPSC
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase mt-0.5">
            Mock Test <span className="text-slate-400 font-bold">Admin</span>
          </h1>
        </motion.div>

        {/* ⚙️ Live Dynamic Test Generation Console */}
        <div className="h-10 mb-6 flex items-center justify-center content-center w-full px-2">
          <AnimatePresence mode="wait">
            <motion.p 
              key={statusIndex}
              variants={sentenceVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              className="text-[11px] font-bold text-slate-400 font-mono tracking-wide flex items-center justify-center flex-wrap"
            >
              {/* Type out sentence letter by letter */}
              {generatingStatuses[statusIndex].split("").map((char, index) => (
                <motion.span key={index} variants={letterVariants}>
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
              
              {/* 🟦 Blinking Cursor on Orange Theme */}
              <motion.span 
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
                className="inline-block w-1.5 h-3.5 bg-[#F5A524] ml-1.5 self-center shrink-0"
              />
            </motion.p>
          </AnimatePresence>
        </div>

        {/* 6 Symmetric Wave Dots (Orange) */}
        <div className="flex items-center gap-2 h-3 justify-center">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <motion.div
              key={index}
              custom={index}
              variants={dotVariants}
              animate="animate"
              className="h-2 w-2 rounded-full bg-[#F5A524] opacity-80"
            />
          ))}
        </div>

      </div>
    </div>
  );
}