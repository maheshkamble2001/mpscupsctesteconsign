// src/components/layout/sidebar/MenuItem.jsx
import PropTypes from "prop-types";
import clsx from "clsx";
import { NavLink, useRouteLoaderData } from "react-router";
import { useTranslation } from "react-i18next";

// Local Imports
import { Badge } from "components/ui";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { useSidebarContext } from "app/contexts/sidebar/context";

export function MenuItem({ data }) {
  const { transKey, path, id } = data;
  const { lgAndDown } = useBreakpointsContext();
  const { close } = useSidebarContext();
  const { t } = useTranslation();

  const title = t(transKey) || data.title;
  const info = useRouteLoaderData("root")?.[id]?.info;

  const handleMenuItemClick = () => lgAndDown && close();

  return (
    <NavLink
      to={path}
      onClick={handleMenuItemClick}
      id={id}
      className={({ isActive }) =>
        clsx(
          "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 outline-hidden",
          "text-xs+ tracking-tight transition-all duration-300 ease-in-out group",
          
          // ✨ Dynamic alignment padding & modern editorial text colors
          isActive
            ? "text-primary font-bold bg-primary/5 dark:bg-primary/10"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/60 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/40"
        )
      }
    >
      {({ isActive }) => (
        <div
          data-menu-active={isActive}
          className="flex w-full min-w-0 items-center justify-between"
        >
          {/* Left Text Block and Bullet Pin */}
          <div className="flex min-w-0 items-center space-x-2.5">
            {/* 🎯 Micro-dot active indicator ring */}
            <div
              className={clsx(
                "size-1.5 shrink-0 rounded-full transition-all duration-300 ease-out",
                isActive
                  ? "bg-primary scale-110 shadow-[0_0_8px_rgba(53,103,174,0.6)]"
                  : "bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-400 group-hover:scale-105"
              )}
            />
            <span className="truncate leading-normal">{title}</span>
          </div>

          {/* 🔴 High-visibility Alert Notification Badge */}
          {info && info.val && (
            <Badge
              color={info.color || "secondary"}
              className={clsx(
                "h-4.5 min-w-[1.125rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[9px] font-black tracking-normal",
                "ring-2 ring-white dark:ring-slate-900 transition-transform duration-300 group-hover:scale-105",
                isActive 
                  ? "bg-primary text-white" 
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              {info.val}
            </Badge>
          )}
        </div>
      )}
    </NavLink>
  );
}

MenuItem.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    transKey: PropTypes.string,
  }).isRequired,
};