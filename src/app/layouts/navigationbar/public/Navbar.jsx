import React from 'react';
import { GraduationCap } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-slate-100 px-12 py-2 flex items-center justify-around">
      
      {/* Left Section: Logo and Brand */}
      <div className="flex items-center gap-2.5">
        {/* Shrunk Dark Blue Icon Container */}
        <div className="bg-[#0B1A30] text-white p-2 rounded-[14px] flex items-center justify-center shadow-sm">
          <GraduationCap className="h-4 w-4 stroke-[1.5]" />
        </div>
        
        {/* Brand Text */}
        <div className="flex flex-col justify-center">
          <span className="text-base font-bold text-[#0B1A30] tracking-tight leading-none mb-0.5">
            PrelimsPro
          </span>
          <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase leading-none">
            UPSC · PSC
          </span>
        </div>
      </div>

      {/* Middle Section: Links matching Lovable's flex alignment */}
      <div className="hidden md:flex items-center gap-6 ml-24">
        <a href="#home" className="text-slate-500 hover:text-slate-900 font-medium text-[13px] transition-colors">
          Home
        </a>
        <a href="#pricing" className="text-slate-500 hover:text-slate-900 font-medium text-[13px] transition-colors">
          Pricing
        </a>
        <a href="#dashboard" className="text-slate-500 hover:text-slate-900 font-medium text-[13px] transition-colors">
          Dashboard
        </a>
        <a href="#admin" className="text-slate-500 hover:text-slate-900 font-medium text-[13px] transition-colors">
          Admin
        </a>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-5 ">
        <a href="#login" className="text-slate-700 hover:text-slate-900 font-medium text-[13px] transition-colors">
          Log in
        </a>
        
        {/* Bright Golden-Orange Button configured for custom size */}
        <button className="bg-[#FF9F1C] hover:bg-[#f09210] text-black font-semibold px-3.5 py-1.5 rounded-[10px] text-[12px] shadow-sm transition-all duration-150">
          Start Mock
        </button>
      </div>

    </nav>
  );
}

export default Navbar;