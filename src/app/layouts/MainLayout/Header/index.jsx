import { Fragment, useEffect, useState } from "react";
import clsx from "clsx";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import {
  LogOut,
  Settings,
  ChevronDown,
  Search as SearchIcon,
  Command,
  Sparkles
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
        "app-header sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between px-6 transition-all duration-300",
        "border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/80"
      )}
    >
      {/* --- LEFT: Brand Identity & Greeting --- */}
      <div className="flex items-center gap-4">
        <SidebarToggleBtn />

        {smAndUp && (
          <div className="flex items-center gap-4">
            {/* Elegant Vertical Divider Hairline */}
            <div className="h-5 w-px bg-slate-200/80 dark:bg-slate-800" />
            
            <div className="flex flex-col leading-normal">
              <div className="flex items-center gap-1.5">
                <Sparkles size={11} className="text-primary/70 dark:text-primary/90" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {timeGreeting}
                </span>
              </div>
              <h1 className="text-[13px] font-bold tracking-tight text-slate-800 dark:text-slate-100">
                Welcome, <span className="text-slate-900 dark:text-white font-extrabold">{firstName}</span>
              </h1>
            </div>
          </div>
        )}
      </div>

      {/* --- CENTER: Minimalist Search Workspace --- */}
      {mdAndUp && (
        <div className="mx-4 flex-1 max-w-[280px]">
          <Search
            renderButton={(open) => (
              <button
                onClick={open}
                className="group flex w-full items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1.5 transition-all hover:bg-slate-50 hover:border-slate-200/80 dark:border-slate-800/40 dark:bg-slate-950/20 dark:hover:bg-slate-950/40"
              >
                <SearchIcon size={13} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-400">Search Workspace...</span>
                <div className="ml-auto flex items-center gap-0.5 rounded-md border border-slate-200/60 bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-900 transition-colors">
                  <Command size={9} />
                  <span>K</span>
                </div>
              </button>
            )}
          />
        </div>
      )}

      {/* --- RIGHT: Sharp Popover Admin Hub --- */}
      <div className="flex items-center gap-2">
        <Popover className="relative">
          <PopoverButton className="group flex items-center gap-2.5 rounded-xl p-1.5 transition-all outline-none hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
            
            {/* Elegant Frameless Letter Avatar matching PrimePanel logic */}
            <div className="flex size-8.5 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold tracking-tight text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 shadow-xs transition-all group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:text-primary">
              {initials}
            </div>
            
            {/* Admin Info text labels */}
            <div className="hidden flex-col items-start lg:flex text-left leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight transition-colors group-hover:text-slate-900 dark:group-hover:text-white">
                  {name}
                </span>
                <ChevronDown size={11} className="text-slate-400 transition-transform duration-200 group-hover:translate-y-0.5" />
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                {role}
              </span>
            </div>
          </PopoverButton>

          {/* Smooth Transition for Popover panel dropdown */}
          <Transition
            as={Fragment}
            enter="transition duration-200 ease-out"
            enterFrom="opacity-0 translate-y-1.5 scale-98"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition duration-100 ease-in"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-1.5 scale-98"
          >
            <PopoverPanel className="absolute right-0 mt-2 w-52 origin-top-right overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-[0_12px_30px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900">
              
              {/* Context user info container */}
              <div className="px-3 py-2 mb-1 bg-slate-50/60 dark:bg-slate-950/40 rounded-lg">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Active Session</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{name}</p>
              </div>
              
              {/* Settings Action Link */}
              <Link
                to="/settings/general"
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs+ font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              >
                <Settings size={14} className="text-slate-400" />
                <span>Settings</span>
              </Link>
              
              {/* Sign Out Button */}
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs+ font-medium text-rose-600 transition-colors hover:bg-rose-50/50 dark:hover:bg-rose-500/10"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </PopoverPanel>
          </Transition>
        </Popover>
      </div>
    </header>
  );
}