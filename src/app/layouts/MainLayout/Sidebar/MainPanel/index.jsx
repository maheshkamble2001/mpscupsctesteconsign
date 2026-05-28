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
          "bg-white flex h-full w-full flex-col items-center border-r border-gray-200",
        )}
      >
        {/* Application Logo */}
        <div className="flex h-15 w-full items-center justify-center border-b border-gray-100 rounded-b-xl">
          <Link to="/">
            <img src={Logo} alt="App Logo" className="size-12" />
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