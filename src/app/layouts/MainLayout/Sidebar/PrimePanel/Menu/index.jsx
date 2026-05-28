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

  // Find root IDs that contain an active child route to auto-expand them on layout mount
  const initialOpenRoots = useMemo(() => {
    const roots = nav.filter((item) => item.type === "root");
    return roots
      .filter((root) => {
        const children = nav.filter(
          (child) => child.id.startsWith(root.id + ".") && child.type === "item"
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
          {nav
            .filter((item) => item.type === "root")
            .map((root) => {
              const children = nav.filter(
                (child) =>
                  child.id.startsWith(root.id + ".") &&
                  child.type === "item"
              );

              const isOpen = openRoots.includes(root.id);
              const isChildActive = children.some((child) =>
                isRouteActive(child.path, pathname)
              );

              return (
                <div key={root.id} className="mb-1.5 w-full">
                  {children.length === 0 ? (
                    <MenuItem
                      data={root}
                      className="px-3 py-2 rounded-xl transition-all duration-200 hover:bg-[#1E293B]/50"
                    />
                  ) : (
                    <>
                      {/* 📂 EDITORIAL ACCORDION TRIGGER */}
                      <div
                        className={clsx(
                          "flex items-center justify-between cursor-pointer transition-all duration-200",
                          "rounded-xl px-3 py-2.5 text-[13px] font-medium gap-2 group",
                          isChildActive
                            ? "bg-[#F5A524] text-[#0A0E17] font-bold"
                            : "text-slate-400 hover:bg-[#1E293B]/50 hover:text-white"
                        )}
                        onClick={() => toggleRoot(root.id)}
                      >
                        <div className="flex items-center gap-2.5">
                          {root.Icon && (
                            <root.Icon
                              className={clsx(
                                "h-4.5 w-4.5 transition-colors duration-200",
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
                            "h-4 w-4 transition-all duration-300",
                            isChildActive 
                              ? "text-[#0A0E17]" // Match dark theme accent contrast when child is active
                              : clsx(
                                  isOpen ? "text-slate-400" : "text-slate-500 group-hover:text-slate-400",
                                ),
                            isOpen && "rotate-180"
                          )}
                        />
                      </div>

                      {/* 🌿 SUB-MENU NESTED ITEMS GRID */}
                      <div
                        style={{
                          maxHeight: isOpen ? `${children.length * 44}px` : "0",
                          transition: "max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          overflow: "hidden",
                        }}
                      >
                        {/* Elegant nesting tree-line indicator trail */}
                        <div className="mt-1 flex flex-col ml-5 pl-3 border-l border-[#1E293B] gap-1">
                          {children.map((child) => (
                            <MenuItem
                              key={child.id}
                              data={child}
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
  nav: PropTypes.array.isRequired,
  pathname: PropTypes.string.isRequired,
};