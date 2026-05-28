import PropTypes from "prop-types";
import { useRef, useEffect, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { SearchIcon } from "lucide-react";
import clsx from "clsx";
import { BUTTON_CONFIG } from "constants/app2.constant";

export function CollapsibleSearch({ onSearch, className, searchValue: externalSearchValue, ...props }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(externalSearchValue || "");
  const inputRef = useRef();

  // Sync with external search value when it changes
  useEffect(() => {
    if (externalSearchValue !== undefined) {
      setSearchValue(externalSearchValue);
    }
  }, [externalSearchValue]);

  const handleToggle = () => {
    if (isExpanded) {
      setIsExpanded(false);
      setSearchValue("");
      if (onSearch) onSearch(""); // Clear search on close
    } else {
      setIsExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  };

  const triggerSearch = (e) => {
    e?.preventDefault();
    if (onSearch) onSearch(searchValue);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    // Remove the auto-search on input change
    // Search will only trigger on button click
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      triggerSearch(e);
    }
  };

  return (
    <div className={clsx("group relative flex h-12 items-center justify-start", className)}>
      <form
        onSubmit={triggerSearch}
        className={clsx(
          "relative flex h-10 items-center rounded-full bg-white transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:bg-gray-950",
          isExpanded ? "w-[360px] shadow-lg shadow-blue-500/5" : "w-28 shadow-sm"
        )}
      >
        {/* --- DYNAMIC BORDER LOGIC --- */}
        <div
          className={clsx(
            "absolute inset-[-1.5px] overflow-hidden rounded-full transition-all duration-700",
            isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <div
            className={clsx(
              "absolute inset-[-200%] transition-all duration-500",
              !isExpanded 
                ? "animate-spin bg-[conic-gradient(from_0deg,transparent,rgb(54,109,176),rgb(255,69,66),transparent)]" 
                : `bg-[image:var(--app-btn-primary)]`
            )}
            style={{ animationDuration: "4s",background: !isExpanded
              ? "conic-gradient(from 0deg, transparent, rgb(54,109,176), rgb(255,69,66), transparent)"
              :"var(--app-btn-primary)"
            }}
          
          />
        </div>

        {/* --- INNER CONTENT --- */}
        <div className="absolute inset-[1px] flex items-center overflow-hidden rounded-full bg-white px-1 dark:bg-gray-950">
          
          {!isExpanded ? (
            /* COLLAPSED MODE: Full Gradient Button */
            <button
              type="button"
              onClick={handleToggle}
              className="flex h-8 w-full items-center justify-center gap-2 rounded-full text-white transition-all hover:brightness-110 active:scale-95 bg-[image:var(--app-btn-primary)]"
            >
              <MagnifyingGlassIcon className="h-3.5 w-3.5 stroke-[3px]" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Search</span>
            </button>
          ) : (
            /* EXPANDED MODE: Icon + Input + Gradient Search Button + Close */
            <>
              <div className="ml-2 flex h-8 w-5 shrink-0 items-center justify-center text-[rgb(54,109,176)]">
                <MagnifyingGlassIcon className="h-4 w-4 stroke-[2.5px]" />
              </div>

              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent px-2 text-sm font-semibold outline-none placeholder:text-gray-400"
                placeholder="Search..."
                value={searchValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                {...props}
              />

              <div className="flex items-center gap-2 pr-1 shrink-0">
                {/* Search Button with Gradient - Only this triggers search */}
                <button
                  type="submit"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md transition-all hover:brightness-110 hover:scale-105 active:scale-95 bg-[image:var(--app-btn-primary)]"
                >
                  <SearchIcon className="h-3.5 w-3.5" />
                </button>

                {/* Close Button - Clears search and closes */}
                <button
                  type="button"
                  onClick={handleToggle}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
                >
                  <XMarkIcon className="h-4 w-4 stroke-[2.5px]" />
                </button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

CollapsibleSearch.propTypes = {
  onSearch: PropTypes.func,
  className: PropTypes.string,
  searchValue: PropTypes.string,
};