import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import SimpleBar from "simplebar-react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { isRouteActive } from "utils/isRouteActive";
import { useDataScrollOverflow, useDidUpdate } from "hooks";
import { MenuItem } from "./MenuItem";

export function Menu({ nav, pathname }) {
  const { ref, recalculate } = useDataScrollOverflow();

  // Parse root configuration sets containing an actively loaded router node path
  const initialOpenRoots = useMemo(() => {
    if (!Array.isArray(nav)) return [];
    const roots = nav.filter((item) => item?.type === "root");
    return roots
      .filter((root) => {
        const children = nav.filter(
          (child) => child?.id?.startsWith(root.id + ".") && child?.type === "item"
        );
        return children.some((child) => isRouteActive(child.path, pathname));
      })
      .map((root) => root.id);
  }, [nav, pathname]);

  const [openRoots, setOpenRoots] = useState(initialOpenRoots);

  useDidUpdate(recalculate, [nav]);

  const toggleRoot = (rootId) => {
    setOpenRoots((prev) =>
      prev.includes(rootId)
        ? prev.filter((id) => id !== rootId)
        : [...prev, rootId]
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent text-slate-300">
      <SimpleBar scrollableNodeProps={{ ref }} className="h-full overflow-x-hidden pb-6">
        <div className="flex h-full flex-1 flex-col px-3">
          {Array.isArray(nav) &&
            nav
              .filter((item) => item?.type === "root")
              .map((root) => {
                const children = nav.filter(
                  (child) =>
                    child?.id?.startsWith(root.id + ".") &&
                    child?.type === "item"
                );

                const isOpen = openRoots.includes(root.id);
                const isChildActive = children.some((child) =>
                  isRouteActive(child.path, pathname)
                );

                return (
                  <div key={root.id} className="mb-1.5 w-full select-none">
                    {children.length === 0 ? (
                      <MenuItem
                        data={root}
                        className="px-3 py-2 rounded-xl transition-all duration-200 "
                      />
                    ) : (
                      <>
                        {/* 📂 Accordion Folder Group Action Header */}
                        <div
                          className={clsx(
                            "flex items-center justify-between cursor-pointer transition-all duration-200",
                            "rounded-xl px-3 py-2.5 text-[13px] font-medium gap-2 group",
                            isChildActive
                              ? "bg-[#F5A524] text-[#0A0E17] font-bold"
                              : "text-slate-400  hover:text-white"
                          )}
                          onClick={() => toggleRoot(root.id)}
                        >
                          <div className="flex items-center gap-2.5">
                            {root.Icon && (
                              <root.Icon
                                className={clsx(
                                  "h-4.5 w-4.5 transition-colors duration-200 shrink-0",
                                  isChildActive
                                    ? "text-[#0A0E17] stroke-[2]"
                                    : "text-slate-500 group-hover:text-white"
                                )}
                              />
                            )}
                            <span className="tracking-tight">{root.title}</span>
                          </div>

                          <ChevronDownIcon
                            className={clsx(
                              "h-4 w-4 transition-transform duration-300 shrink-0",
                              isChildActive ? "text-[#0A0E17]" : "text-slate-500 group-hover:text-slate-400",
                              isOpen && "rotate-180"
                            )}
                          />
                        </div>

                        {/* 🌿 Sub-Menu Tree Layout Wrapper Container */}
                        <div
                          className={clsx(
                            "transition-all duration-200 ease-in-out overflow-hidden",
                            isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0 pointer-events-none"
                          )}
                        >
                          <div className="flex flex-col ml-5 pl-1 border-l border-[#1E293B] gap-1">
                            {children.map((child) => (
                              <MenuItem
                                key={child.id}
                                data={child}
                                hideIcon
                                className={clsx(
                                  "px-3 py-2 text-xs rounded-lg transition-all duration-150",
                                  isRouteActive(child.path, pathname)
                                    ? "text-[#F5A524] font-semibold"
                                    : "text-slate-400 hover:text-white"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
        </div>
      </SimpleBar>
    </div>
  );
}

Menu.propTypes = {
  nav: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["root", "item"]).isRequired,
      title: PropTypes.string.isRequired,
      path: PropTypes.string,
      Icon: PropTypes.elementType,
    })
  ).isRequired,
  pathname: PropTypes.string.isRequired,
};