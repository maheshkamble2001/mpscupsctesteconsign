


// Import Dependencies
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

// Local Imports
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { useSidebarContext } from "app/contexts/sidebar/context";
import { navigation } from "app/navigation";
import { useDidUpdate } from "hooks";
import { isRouteActive } from "utils/isRouteActive";
import { MainPanel } from "./MainPanel";
import { PrimePanel } from "./PrimePanel";
import { Transition } from "@headlessui/react";

// ----------------------------------------------------------------------

export function Sidebar() {
  const { pathname } = useLocation();
  const { name, lgAndDown } = useBreakpointsContext();
  const { isExpanded, close } = useSidebarContext();
  const navigate = useNavigate();

  const initialSegment = useMemo(
    () => navigation.find((item) => isRouteActive(item.path, pathname)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [activeSegmentPath, setActiveSegmentPath] = useState(
    initialSegment?.path,
  );

  const currentSegment = useMemo(
    () => navigation.find((item) => item.path === activeSegmentPath),
    [activeSegmentPath]
  );

  // useEffect(() => {
  //   if (currentSegment?.childs?.[0]?.path) {
  //     navigate(currentSegment.childs[0].path);
  //   }
  // }, [currentSegment, navigate]);

  useEffect(() => {
  if (
    currentSegment?.childs?.[0]?.path &&
    pathname === currentSegment.path
  ) {
    navigate(currentSegment.childs[0].path);
  }
}, [currentSegment, navigate, pathname]);

//------------------------------------------

  useDidUpdate(() => {
    if (lgAndDown && isExpanded) close();
  }, [name]);

  useDidUpdate(() => {
    if (lgAndDown && isExpanded) close();
  }, [name]);

  return (
    <div className="relative h-full">
      {/* MainPanel - shows when expanded */}
      <Transition
        show={!isExpanded}
        enter="transition-all duration-300"
        enterFrom="opacity-0 w-0"
        enterTo="opacity-100 w-64" // adjust width as needed
        leave="transition-all duration-300"
        leaveFrom="opacity-100 w-64"
        leaveTo="opacity-0 w-0"
        className="absolute left-0 top-0 bottom-0 overflow-hidden"
      >
        <div className="h-full">
          <MainPanel
            nav={navigation}
            activeSegment={activeSegmentPath}
            setActiveSegment={setActiveSegmentPath}
          />
        </div>
      </Transition>

      {/* PrimePanel - shows when collapsed */}
      <Transition
        show={isExpanded}
        enter="transition-all duration-300"
        enterFrom="opacity-0 w-0"
        enterTo="opacity-100 w-20" // small collapsed width
        leave="transition-all duration-300"
        leaveFrom="opacity-100 w-20"
        leaveTo="opacity-0 w-0"
        className="absolute left-0 top-0 bottom-0 overflow-hidden"
      >
        <div className="h-full">
          <PrimePanel
            close={close}
            pathname={pathname}
            nav={navigation}
          />
        </div>
      </Transition>
    </div>
  );
}
