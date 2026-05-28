import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { useSidebarContext } from "app/contexts/sidebar/context";

export function MenuItem({ data, className, hideIcon }) {
  const { path, transKey, Icon } = data;
  const { t } = useTranslation();
  const { lgAndDown } = useBreakpointsContext();
  const { close } = useSidebarContext();

  const title = t(transKey) || data.title;

  return (
    <NavLink
      to={path}
      onClick={() => lgAndDown && close()}
      className={({ isActive }) =>
        clsx(
          "relative flex items-center w-full transition-all duration-200 group pl-3 pr-2 py-2 rounded-lg",
          "text-xs+ font-medium tracking-tight",
          isActive
            ? "text-primary font-semibold bg-primary/5 dark:bg-primary/10"
            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40",
          className
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* ✨ Left active indicator pill bar */}
          <span
            className={clsx(
              "absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r-full bg-primary transition-all duration-300 origin-left",
              isActive ? "scale-100 opacity-100" : "scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-60"
            )}
          />

          <div className="flex items-center gap-2.5 w-full">
            {!hideIcon && Icon && (
              <Icon
                className={clsx(
                  "h-4.5 w-4.5 shrink-0 transition-colors duration-200",
                  isActive 
                    ? "text-primary stroke-[2]" 
                    : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                )}
              />
            )}
            <span className="text-left leading-normal">{title}</span>
          </div>
        </>
      )}
    </NavLink>
  );
}

MenuItem.propTypes = {
  data: PropTypes.shape({
    path: PropTypes.string.isRequired,
    transKey: PropTypes.string,
    title: PropTypes.string.isRequired,
    Icon: PropTypes.elementType,
  }).isRequired,
  className: PropTypes.string,
  hideIcon: PropTypes.bool,
};