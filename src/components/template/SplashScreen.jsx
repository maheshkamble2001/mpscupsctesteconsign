import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../assets/logo.png";

export function SplashScreen() {
  const [statusIndex, setStatusIndex] = useState(0);

  // 🎯 टेस्ट जनरेशन स्पेसिफिक लाइव लॉग्स
  const generatingStatuses = [
    "Connecting to MPSC/UPSC Blueprint Engine...",
    "Randomizing Question Banks & Core Syllabus...",
    "Generating Multiple Choice Questions (MCQs)...",
    "Assembling Answer Keys & Negative Marking Rules...",
    "Validating Question Difficulties & Shuffling Sets...",
    "Compiling Final Test Paper Template..."
  ];

  useEffect(() => {
    // हर 3.5 सेकंड में अगला जनरेशन टास्क टाइप होगा
    const interval = setInterval(() => {
      setStatusIndex((prevIndex) => (prevIndex + 1) % generatingStatuses.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // 6 डॉट्स वेव एनीमेशन वेरिएंट्स
  const dotVariants = {
    animate: (i) => ({
      y: [0, -6, 0],
      transition: { repeat: Infinity, duration: 0.8, delay: i * 0.12, ease: "easeInOut" }
    })
  };

  // 🖋️ लाइव जनरेशन टाइपिंग एनीमेशन सेटिंग्स
  const sentenceVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.025 } // टाइपिंग स्पीड (0.025s प्रति अक्षर)
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, display: "none" },
    visible: { opacity: 1, display: "inline-block" }
  };

  return (
    <div className="fixed inset-0 grid place-content-center bg-white dark:bg-slate-950 z-[9999]">
      <div className="flex flex-col items-center justify-center max-w-md w-full px-6 text-center select-none">
        
        {/* Brand Core Identity Section */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center mb-6">
          <img src={Logo} alt="MPSC UPSC Logo" className="h-16 w-16 object-contain mb-3" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600">MPSC / UPSC</span>
          <h1 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase mt-0.5">
            Test Series <span className="text-[#3567AE]">Admin</span>
          </h1>
        </motion.div>

        {/* ⚙️ Live Dynamic Test Generation Console */}
        <div className="h-10 mb-4 flex items-center justify-center content-center w-full px-2">
          <AnimatePresence mode="wait">
            <motion.p 
              key={statusIndex}
              variants={sentenceVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              className="text-[11px] font-bold text-slate-600 dark:text-slate-400 font-mono tracking-wide flex items-center justify-center flex-wrap"
            >
              {/* पूरे सेंटेंस को एक-एक लेटर में तोड़कर टाइप करना */}
              {generatingStatuses[statusIndex].split("").map((char, index) => (
                <motion.span key={index} variants={letterVariants}>
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
              
              {/* 🟦 ब्लिंकिंग कर्सर जो रॉयल ब्लू थीम पर सेट है */}
              <motion.span 
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
                className="inline-block w-1.5 h-3.5 bg-[#3567AE] ml-1 self-center shrink-0"
              />
            </motion.p>
          </AnimatePresence>
        </div>

        {/* 6 Symmetric Wave Dots (Alternate Colors) */}
        <div className="flex items-center gap-1.5 h-3 justify-center">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <motion.div
              key={index}
              custom={index}
              variants={dotVariants}
              animate="animate"
              className={`h-2 w-2 rounded-full ${index % 2 === 0 ? 'bg-[#3567AE]' : 'bg-red-500'}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}