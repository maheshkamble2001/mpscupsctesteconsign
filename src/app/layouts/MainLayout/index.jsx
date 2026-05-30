import { useEffect, useState } from "react";
import clsx from "clsx";
import { Outlet } from "react-router";
import Cookies from "js-cookie";

// Local Imports
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import ScrollToTop from "components/ScrollToTop/ScrollToTop";

export default function MainLayout() {
  // ✅ Create local reactive state initialized from current cookie storage
  const [isFullScreen, setIsFullScreen] = useState(
    Cookies.get("isFullScreenEnabled") === "true"
  );

  useEffect(() => {
    const handleLayoutSync = () => {
      // Re-evaluate current cookie flag values
      setIsFullScreen(Cookies.get("isFullScreenEnabled") === "true");
    };

    // Listen for custom toolbars or table settings changing properties
    window.addEventListener("fullscreenchange-state", handleLayoutSync);
    
    return () => {
      window.removeEventListener("fullscreenchange-state", handleLayoutSync);
    };
  }, []);

  return (
    <>
      <ScrollToTop />

      {/* Hide or translate header if table claims full screen area control */}
      {!isFullScreen && <Header />}

      <main
        className={clsx(
          "main-content transition-content grid",
          isFullScreen 
            ? "grid-cols-1 fixed inset-0 z-60 bg-white dark:bg-gray-950 overflow-hidden" 
            : "grid-cols-1"
        )}
      >
        <Outlet />
      </main>

      {/* Conditionally hide navigation components reactively */}
      {!isFullScreen && <Sidebar />}
    </>
  );
}