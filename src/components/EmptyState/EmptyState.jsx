import React from "react";
import { motion } from "framer-motion";
import { PlusIcon, SparklesIcon } from "@heroicons/react/24/outline";

const PremiumEmptyState = ({ 
  icon: Icon = SparklesIcon,
  iconColor = "#FE4543",
  title = "Start Your First AI Lecture", 
  desc = "Ready to transform your content? Add a specialist to begin generating high-quality AI lectures instantly.",
  buttonText = "Create New",
  onAdd = null,
  showButton = true
}) => {
  
  const srRed = "#FE4543";
  const srBlue = "#3368AF";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-10 px-6 rounded-[3rem] bg-gradient-to-b from-white/50 to-transparent text-center"
    >
      {/* --- ICON DESIGN (Bina Border Wala) --- */}
      <div className="relative ">
        {/* Animated Glow behind the icon */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 blur-[50px] rounded-full"
          style={{ backgroundColor: `${srBlue}20` }}
        />
        
        <div className="relative z-10 h-28 w-28  flex items-center justify-center ">
          <Icon className="w-16 h-16" style={{ color: iconColor }} />
        </div>
      </div>

      {/* --- TEXT SECTION --- */}
      <div className="max-w-md">
        <motion.h3 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold tracking-tight mb-2" 
          style={{ color: srBlue }}
        >
          {title}
        </motion.h3>
        
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-400 font-medium leading-relaxed mb-10 px-4"
        >
          {desc}
        </motion.p>
      </div>

      {/* --- ACTION BUTTON --- */}
      {showButton && onAdd && (
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          style={{ background: `linear-gradient(135deg, ${srBlue}, ${srRed})` }}
        >
          <PlusIcon className="h-4 w-4" />
          {buttonText}
        </motion.button>
      )}
    </motion.div>
  );
};

export default PremiumEmptyState;