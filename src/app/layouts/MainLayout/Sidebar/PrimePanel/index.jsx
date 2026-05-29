// src/components/layout/sidebar/PrimePanel.jsx
import PropTypes from "prop-types";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { AcademicCapIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import clsx from "clsx";

// Local Imports
import { Button } from "components/ui";
import { Menu } from "./Menu";
import { useAuthContext } from "app/contexts/auth/context";

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
    <div className="prime-panel flex h-full w-64 flex-col border-r border-[#1E293B]/50 bg-[#0A0E17] text-slate-300">
      
      {/* 🏷️ Clean Editorial Header Unit */}
      <div className="flex h-20 items-center px-5 mt-2">
        <Link 
          className="flex items-center gap-3 w-full p-2.5 rounded-xl transition-all duration-300 hover:bg-[#1E293B]/50 group" 
          to="/dashboards/home"
        >
          {/* Frameless Floating Logo View */}
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F5A524] transition-transform duration-300 group-hover:scale-105 shadow-sm">
            <AcademicCapIcon className="h-5 w-5 text-[#0A0E17]" />
          </div>
          
          {/* Elegant Corporate Typography */}
          <div className="flex flex-col min-w-0">
            <span className="text-[17px] font-bold tracking-tight text-white transition-colors">
              MPSC UPSC TEST
            </span>
          </div>
        </Link>
      </div>

      {/* 🧭 Structural Navigation Body Grid */}
      <div className="flex h-full grow flex-col pt-4">
        
        {/* Understated List Marker Line */}
        <div className="px-5 pb-3 pt-1 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            LEARNING
          </span>
        </div>

        {/* Dynamic Nav Elements Scroll viewport */}
        <div className="grow overflow-y-auto hide-scrollbar">
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
              "size-8 rounded-lg bg-[#1E293B]/50 text-slate-400 shadow-xs hover:text-white transition-all duration-200",
              "border border-[#1E293B]"
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