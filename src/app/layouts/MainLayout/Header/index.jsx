import { Fragment, useEffect, useState } from "react";
import clsx from "clsx";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  Settings,
  ChevronDown,
  Search as SearchIcon,
  Command,
  Bell
} from "lucide-react";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";

import { SidebarToggleBtn } from "components/shared/SidebarToggleBtn";
import { useAuthContext } from "app/contexts/auth/context";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { Search } from "components/template/Search";

export function Header() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const { mdAndUp, smAndUp } = useBreakpointsContext();

  const [name, setName] = useState(Cookies.get("name") || "Admin");
  const [role, setRole] = useState(Cookies.get("rolename") || "Management");

  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const firstName = name.split(" ")[0];

  useEffect(() => {
    const interval = setInterval(() => {
      const cName = Cookies.get("name") || "Admin";
      const cRole = Cookies.get("rolename") || "Management";

      if (cName !== name) setName(cName);
      if (cRole !== role) setRole(cRole);
    }, 2000);
    return () => clearInterval(interval);
  }, [name, role]);

  // Initials generator
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className={clsx(
        "app-header sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between px-6 transition-all duration-300",
        "border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0A0E17]/80"
      )}
    >
      {/* --- LEFT: Brand Identity & Greeting --- */}
      <div className="flex items-center gap-5">
        <SidebarToggleBtn />

        {smAndUp && (
          <div className="flex items-center gap-5">
            {/* Elegant Vertical Divider Hairline */}
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
                {timeGreeting}
              </span>
              <h1 className="text-[15px] font-medium tracking-tight text-slate-600 dark:text-slate-300">
                Welcome back, <span className="text-slate-900 dark:text-white font-bold">{firstName}</span>
              </h1>
            </div>
          </div>
        )}
      </div>

      {/* --- CENTER: Minimalist Search Workspace --- */}
      {mdAndUp && (
        <div className="mx-4 flex-1 max-w-[400px]">
          <Search
            renderButton={(open) => (
              <button
                onClick={open}
                className="group flex w-full items-center gap-3 rounded-full border border-slate-200/60 bg-slate-50/80 px-4 py-2.5 transition-all hover:bg-slate-100 hover:border-slate-300 dark:border-slate-700/60 dark:bg-slate-800/50 dark:hover:bg-slate-800"
              >
                <SearchIcon size={16} className="text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
                <span className="text-[13px] font-medium text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-400">Search everywhere...</span>
                <div className="ml-auto flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-900 transition-colors">
                  <Command size={10} />
                  <span>K</span>
                </div>
              </button>
            )}
          />
        </div>
      )}

      {/* --- RIGHT: Sharp Popover Admin Hub --- */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/60 bg-slate-50 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-[#F5A524] ring-2 ring-white dark:ring-slate-900"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        <Popover className="relative">
          <PopoverButton className="group flex items-center gap-3 rounded-full p-1 pr-3 transition-all outline-none hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            
            {/* Elegant Frameless Letter Avatar matching PrimePanel logic */}
            <div className="flex size-9 items-center justify-center rounded-full bg-[#F5A524] text-[13px] font-bold tracking-tight text-[#0A0E17] shadow-sm transition-transform duration-300 group-hover:scale-105">
              {initials}
            </div>
            
            {/* Admin Info text labels */}
            <div className="hidden flex-col items-start lg:flex text-left leading-tight">
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 tracking-tight transition-colors group-hover:text-slate-900 dark:group-hover:text-white">
                {name}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                {role}
              </span>
            </div>
            
            <ChevronDown size={14} className="ml-1 text-slate-400 transition-transform duration-200 group-hover:translate-y-0.5 hidden lg:block" />
          </PopoverButton>

          {/* Smooth Transition for Popover panel dropdown */}
          <Transition
            as={Fragment}
            enter="transition duration-200 ease-out"
            enterFrom="opacity-0 translate-y-2 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition duration-100 ease-in"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-2 scale-95"
          >
            <PopoverPanel className="absolute right-0 mt-3 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-[#0A0E17]">
              
              {/* Context user info container */}
              <div className="px-4 py-3 mb-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Active Session</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{name}</p>
              </div>
              
              <div className="space-y-0.5 px-0.5 pt-1">
                {/* Settings Action Link */}
                <Link
                  to="/settings/general"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200"
                >
                  <Settings size={16} className="text-slate-400" />
                  <span>Account Settings</span>
                </Link>
                
                {/* Sign Out Button */}
                <button
                  onClick={()=>{logout()
                    navigate("/login")
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </PopoverPanel>
          </Transition>
        </Popover>
      </div>
    </header>
  );
}