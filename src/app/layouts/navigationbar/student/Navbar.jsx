import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router';
import Cookies from "js-cookie"

export function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-around">

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
        <Link href="#home" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">
          Home
        </Link>
        <Link href="#pricing" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">
          Pricing
        </Link>
        <Link href="#dashboard" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">
          Dashboard
        </Link>
        <Link href="#admin" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">
          Admin
        </Link>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-6">
        <Link to={"/login"} onClick={() => {
          Cookies.remove("access_token");
          Cookies.remove("name");
          Cookies.remove("email");
          Cookies.remove("userid");
          Cookies.remove("role");
          Cookies.remove("roleid");
          Cookies.remove("rolename");
        }} className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">
          Log in
        </Link>

        {/* Pill-shaped Golden-Orange Button (Matching format) */}
        <Link className="bg-[#FF9F1C] hover:bg-[#F09210] text-black font-semibold px-5 py-2 rounded-full text-sm shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px]">
          Start Mock
        </Link>
      </div>

    </nav>
  );
}

export default Navbar;