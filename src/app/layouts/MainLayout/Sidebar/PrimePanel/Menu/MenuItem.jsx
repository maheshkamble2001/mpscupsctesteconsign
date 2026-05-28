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
          "relative flex items-center w-full transition-all duration-200 group pl-3 pr-2 py-2.5 rounded-xl my-0.5",
          "text-[13px] font-medium tracking-wide",
          isActive
            ? "text-[#0A0E17] font-semibold bg-[#F5A524]"
            : "text-slate-400 hover:text-white hover:bg-[#1E293B]/50",
          className
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3 w-full">
            {!hideIcon && Icon && (
              <Icon
                className={clsx(
                  "h-5 w-5 shrink-0 transition-colors duration-200",
                  isActive 
                    ? "text-[#0A0E17] stroke-[2]" 
                    : "text-slate-500 group-hover:text-white"
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