import React from 'react';
import { GraduationCap, ArrowRight, Play, BookOpen, Award, Users, CheckCircle2 } from 'lucide-react';

export function DarkHomePage() {
  return (
    <div className="min-h-screen bg-[#1A222D] text-slate-100 font-sans antialiased">
      
      {/* 1. EXACT DARK NAVBAR */}
      <nav className="w-full bg-[#1A222D] border-b border-slate-800/80 px-12 py-2 flex items-center justify-between">
        
        {/* Left Section: Gold Badge & Logo */}
        <div className="flex items-center gap-2.5">
          {/* Muted Gold Circle Icon Container */}
          <div className="bg-[#C5A86B]/20 text-[#C5A86B] p-2 rounded-[14px] border border-[#C5A86B]/30 flex items-center justify-center shadow-sm">
            <GraduationCap className="h-4 w-4 stroke-[1.5]" />
          </div>
          
          {/* Brand Text */}
          <div className="flex flex-col justify-center">
            <span className="text-base font-bold text-white tracking-tight leading-none mb-0.5">
              PrelimsPro
            </span>
            <span className="text-[8px] font-bold text-[#C5A86B] tracking-widest uppercase leading-none">
              UPSC · PSC
            </span>
          </div>
        </div>

        {/* Middle Section: Links */}
        <div className="hidden md:flex items-center gap-6 ml-24">
          <a href="#home" className="text-slate-300 hover:text-white font-medium text-[13px] transition-colors">
            Home
          </a>
          <a href="#pricing" className="text-slate-400 hover:text-white font-medium text-[13px] transition-colors">
            Pricing
          </a>
          <a href="#dashboard" className="text-slate-400 hover:text-white font-medium text-[13px] transition-colors">
            Dashboard
          </a>
          <a href="#admin" className="text-slate-400 hover:text-white font-medium text-[13px] transition-colors">
            Admin
          </a>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-5 ml-auto">
          <a href="#login" className="text-slate-300 hover:text-white font-medium text-[13px] transition-colors">
            Log in
          </a>
          
          {/* Outlined Dark Start Button */}
          <button className="bg-transparent hover:bg-[#C5A86B]/10 text-white border border-[#C5A86B]/60 font-semibold px-4 py-1.5 rounded-[10px] text-[12px] shadow-sm transition-all duration-150">
            START TEST
          </button>
        </div>
      </nav>

      {/* 2. DARK HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side Column */}
        <div className="flex flex-col space-y-6 max-w-xl">
          {/* Accent Gold Banner */}
          <div className="inline-flex items-center gap-2 bg-[#C5A86B]/10 border border-[#C5A86B]/20 text-[#C5A86B] px-3 py-1 rounded-full text-[12px] font-medium tracking-wide w-fit">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#C5A86B]"></span>
            New Mock Tests Live for 2026
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Ace Your Exams With <span className="text-[#C5A86B]">Dark Mode Pro</span> Efficiency.
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-[14px] leading-relaxed">
            Master the competitive prelims syllabus through realistic dark-mode interface simulators, targeted test sets, and responsive analytical feedback screens.
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <button className="bg-[#C5A86B] hover:bg-[#b0945b] text-[#1A222D] font-bold px-5 py-2.5 rounded-[10px] text-[13px] shadow-md transition-all duration-150 flex items-center gap-2 group">
              Start Free Mock 
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button className="bg-[#222C3A] hover:bg-[#2b3749] text-slate-200 border border-slate-700/60 font-semibold px-5 py-2.5 rounded-[10px] text-[13px] transition-all duration-150 flex items-center gap-2">
              <Play className="h-3.5 w-3.5 fill-current text-slate-400" />
              Watch Demo
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-[13px]">
              <CheckCircle2 className="h-4 w-4 text-[#C5A86B]" />
              10,000+ Questions
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[13px]">
              <CheckCircle2 className="h-4 w-4 text-[#C5A86B]" />
              Real-Time Rankings
            </div>
          </div>
        </div>

        {/* Right Side Column: Styled UI Interactive Element */}
        <div className="relative w-full aspect-[4/3] bg-[#222C3A] border border-slate-800 rounded-[20px] p-6 shadow-xl flex flex-col justify-between overflow-hidden group">
          {/* Subtle glow layer */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A86B]/5 rounded-full blur-2xl pointer-events-none"></div>
          
          {/* Mock Widget Bar */}
          <div className="bg-[#1A222D]/80 backdrop-blur border border-slate-800 rounded-[12px] p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-[#C5A86B]/20 border border-[#C5A86B]/40 flex items-center justify-center font-bold text-[#C5A86B] text-[11px]">
                AI
              </div>
              <div>
                <p className="text-white text-[12px] font-medium leading-none">Performance Tracker</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Calculating accuracy thresholds...</p>
              </div>
            </div>
            <span className="text-[#C5A86B] font-bold text-xs bg-[#C5A86B]/10 border border-[#C5A86B]/20 px-2 py-0.5 rounded">94.2%</span>
          </div>

          {/* Graphical Bars */}
          <div className="flex items-end justify-between h-24 px-4 gap-2">
            <div className="w-full bg-slate-800/80 rounded-t h-[40%] transition-all group-hover:h-[50%]"></div>
            <div className="w-full bg-[#C5A86B]/80 rounded-t h-[75%]"></div>
            <div className="w-full bg-slate-800/80 rounded-t h-[50%] transition-all group-hover:h-[60%]"></div>
            <div className="w-full bg-slate-700/60 rounded-t h-[90%]"></div>
            <div className="w-full bg-slate-800/80 rounded-t h-[30%] transition-all group-hover:h-[40%]"></div>
          </div>

          {/* Bottom Alert Floating Element */}
          <div className="bg-[#1A222D] border border-slate-800 rounded-[12px] p-3.5 shadow-lg flex items-center gap-3">
            <div className="p-1.5 bg-[#C5A86B]/10 rounded-lg text-[#C5A86B]">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <p className="text-white text-[12px] font-bold leading-none">Daily Test Streak Active</p>
              <p className="text-slate-500 text-[11px] mt-1">Join 4,200+ candidates competing right now</p>
            </div>
          </div>
        </div>

      </section>

      {/* 3. CORE HIGHLIGHT CARDS CONTAINER */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 border-t border-slate-800/60">
        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="bg-[#222C3A] border border-slate-800/80 p-5 rounded-[14px]">
            <div className="h-8 w-8 rounded-[8px] bg-[#1A222D] border border-slate-800 flex items-center justify-center text-[#C5A86B] mb-3">
              <BookOpen className="h-4 w-4" />
            </div>
            <h4 className="text-[14px] font-bold text-white mb-1.5">Micro-Topic Metrics</h4>
            <p className="text-slate-400 text-[12px] leading-relaxed">
              Isolate critical topic errors, track accurate structural trends, and adjust velocity filters dynamically.
            </p>
          </div>

          <div className="bg-[#222C3A] border border-slate-800/80 p-5 rounded-[14px]">
            <div className="h-8 w-8 rounded-[8px] bg-[#1A222D] border border-slate-800 flex items-center justify-center text-[#C5A86B] mb-3">
              <Award className="h-4 w-4" />
            </div>
            <h4 className="text-[14px] font-bold text-white mb-1.5">Detailed Explanations</h4>
            <p className="text-slate-400 text-[12px] leading-relaxed">
              Every query item features complete reference point cross-matching and reverse-engineered explanations.
            </p>
          </div>

          <div className="bg-[#222C3A] border border-slate-800/80 p-5 rounded-[14px]">
            <div className="h-8 w-8 rounded-[8px] bg-[#1A222D] border border-slate-800 flex items-center justify-center text-[#C5A86B] mb-3">
              <Users className="h-4 w-4" />
            </div>
            <h4 className="text-[14px] font-bold text-white mb-1.5">Peer Benchmarks</h4>
            <p className="text-slate-400 text-[12px] leading-relaxed">
              Compare answer velocities accurately against active community profiles to secure real-world speed optimization.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}

export default DarkHomePage;