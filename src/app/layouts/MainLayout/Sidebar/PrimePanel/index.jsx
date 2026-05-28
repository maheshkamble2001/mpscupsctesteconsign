// src/components/layout/sidebar/PrimePanel.jsx
import PropTypes from "prop-types";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import clsx from "clsx";

// Local Imports
import { Button } from "components/ui";
import { Menu } from "./Menu";
import { useAuthContext } from "app/contexts/auth/context";
import Logo2 from 'assets/logo.png';

export function PrimePanel({ pathname, close, nav }) {
  const { t } = useTranslation();
  const { role } = useAuthContext();

  // Filter and flatten navigation array structures cleanly
  const flatNav = nav
    .filter((n) => role.includes(n.role))
    .flatMap((n) =>
      n.childs
        ? [n, ...n.childs.filter((c) => role.includes(c.role))]
        : [n]
    );

  return (
    <div className="prime-panel flex h-full w-64 flex-col border-r border-slate-100 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900">
      
      {/* 🏷️ Clean Editorial Header Unit */}
      <div className="flex h-20 items-center px-5 mt-2">
        <Link 
          className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-slate-50/60 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800/60 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800 group" 
          to="/dashboards/home"
        >
          {/* Frameless Floating Logo View */}
          <div className="flex size-9 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <img src={Logo2} alt="SR Logo" className="h-full w-full object-contain" />
          </div>
          
          {/* Elegant Corporate Typography */}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
              MPSC UPSC TEST
            </span>
          </div>
        </Link>
      </div>

      {/* 🧭 Structural Navigation Body Grid */}
      <div className="flex h-full grow flex-col pt-4">
        
        {/* Understated List Marker Line */}
        <div className="px-5 pb-2 flex items-center gap-2">
          {/* <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Navigation Modules
          </span> */}
          <div className="h-[1px] grow bg-slate-100/80 dark:bg-slate-800/50" />
        </div>

        {/* Dynamic Nav Elements Scroll viewport */}
        <div className="grow px-2.5 overflow-y-auto hide-scrollbar">
          <Menu
            nav={flatNav}
            pathname={pathname}
          />
        </div>

      

        {/* 📱 Mobile Overlaid Responsive Close Button */}
        <div className="absolute top-5 right-4 xl:hidden z-10">
          <Button
            onClick={close}
            isIcon
            variant="flat"
            className={clsx(
              "size-8 rounded-lg bg-white text-slate-400 shadow-xs hover:text-primary transition-all duration-200",
              "border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700"
            )}
          >
            <ChevronLeftIcon className="size-5 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}

PrimePanel.propTypes = {
  close: PropTypes.func,
  pathname: PropTypes.string,
  nav: PropTypes.array,
};