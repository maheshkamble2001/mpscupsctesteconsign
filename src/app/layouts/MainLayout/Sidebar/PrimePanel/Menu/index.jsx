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
    <div className="flex h-full flex-col overflow-hidden bg-white text-slate-600 dark:bg-slate-900">
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
                      className="px-3 py-2 rounded-xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    />
                  ) : (
                    <>
                      {/* 📂 EDITORIAL ACCORDION TRIGGER */}
                      <div
                        className={clsx(
                          "flex items-center justify-between cursor-pointer transition-all duration-200",
                          "rounded-xl px-3 py-2.5 text-xs+ font-medium gap-2 group",
                          isChildActive
                            ? "bg-slate-50 text-slate-900 font-bold dark:bg-slate-800/40 dark:text-slate-100"
                            : "text-slate-500 hover:bg-slate-50/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
                        )}
                        onClick={() => toggleRoot(root.id)}
                      >
                        <div className="flex items-center gap-2.5">
                          {root.Icon && (
                            <root.Icon
                              className={clsx(
                                "h-4.5 w-4.5 transition-colors duration-200",
                                isChildActive
                                  ? "text-primary stroke-[2]"
                                  : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                              )}
                            />
                          )}
                          <span className="tracking-tight">{root.title}</span>
                        </div>

                        <ChevronDownIcon
                          className={clsx(
                            "h-4 w-4 text-slate-400 transition-transform duration-300",
                            isOpen ? "rotate-180 text-slate-600 dark:text-slate-300" : "group-hover:text-slate-600"
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
                        <div className="mt-1 flex flex-col ml-5 pl-3 border-l border-slate-100 gap-1 dark:border-slate-800/60">
                          {children.map((child) => (
                            <MenuItem
                              key={child.id}
                              data={child}
                              className={clsx(
                                "px-3 py-2 text-xs rounded-lg transition-all duration-150",
                                isRouteActive(child.path, pathname)
                                  ? "text-primary font-semibold"
                                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
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