import React from 'react';
import { GraduationCap } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between">
      
      {/* Left Section: Logo and Brand */}
      <div className="flex items-center gap-3 cursor-pointer">
        {/* Dark Blue Icon Container */}
        <div className="bg-[#0B1A30] text-white p-2.5 rounded-xl flex items-center justify-center shadow-sm">
          <GraduationCap className="h-5 w-5 stroke-[1.5]" />
        </div>
        
        {/* Brand Text */}
        <div className="flex flex-col justify-center">
          <span className="text-lg font-bold text-[#0B1A30] tracking-tight leading-none mb-1">
            PrelimsPro
          </span>
          <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase leading-none">
            UPSC · PSC
          </span>
        </div>
      </div>

      {/* Middle Section: Links centered evenly */}
      <div className="hidden md:flex items-center gap-8">
        <a href="#home" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">
          Home
        </a>
        <a href="#pricing" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">
          Pricing
        </a>
        <a href="#dashboard" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">
          Dashboard
        </a>
        <a href="#admin" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">
          Admin
        </a>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-6">
        <a href="#login" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">
          Log in
        </a>
        
        {/* Pill-shaped Golden-Orange Button (Matching format) */}
        <button className="bg-[#FF9F1C] hover:bg-[#F09210] text-black font-semibold px-5 py-2 rounded-full text-sm shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px]">
          Start Mock
        </button>
      </div>

    </nav>
  );
}

export default Navbar;