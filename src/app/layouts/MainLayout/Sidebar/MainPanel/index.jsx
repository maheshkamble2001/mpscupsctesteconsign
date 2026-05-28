// Import Dependencies
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router";
import clsx from "clsx";

// Local Imports
import Logo from "../../../../../assets/logo.png";
import { Menu } from "./Menu";
import { useThemeContext } from "app/contexts/theme/context";
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

export function MainPanel({ nav, setActiveSegment, activeSegment }) {
  const { cardSkin } = useThemeContext();
  const navigate = useNavigate(); // ✅ Add navigation
  const { role } = useAuthContext();
  
  return (
    <div className="main-panel">
      <div
        className={clsx(
          "bg-[#0A0E17] flex h-full w-full flex-col items-center border-r border-[#1E293B]/50",
        )}
      >
        {/* Application Logo */}
        <div className="flex h-20 w-full items-center justify-center mt-2">
          <Link to="/" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F5A524] transition-transform duration-300 hover:scale-105">
            <img src={Logo} alt="App Logo" className="h-7 w-7 object-contain brightness-0 invert" />
          </Link>
        </div>

        <Menu
          nav={nav.filter(n => role.includes(n.role))}
          activeSegment={activeSegment}
          setActiveSegment={(path) => {
            setActiveSegment(path); // Update active segment
            navigate(path);         // ✅ Navigate to clicked route
          }}
        />
      </div>
    </div>
  );
}

MainPanel.propTypes = {
  nav: PropTypes.array,
  setActiveSegment: PropTypes.func,
  activeSegment: PropTypes.string,
};