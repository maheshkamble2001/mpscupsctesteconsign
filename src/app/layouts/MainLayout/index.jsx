// Import Dependencies
import clsx from "clsx";
import { Outlet } from "react-router";

// Local Imports
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import ScrollToTop from "components/ScrollToTop/ScrollToTop";

// ----------------------------------------------------------------------

export default function MainLayout() {
  return (
    <>
      <ScrollToTop />

      <Header />

      <main
        className={clsx("main-content transition-content grid grid-cols-1")}
      >
        <Outlet />
      </main>

      <Sidebar />
    </>
  );
}