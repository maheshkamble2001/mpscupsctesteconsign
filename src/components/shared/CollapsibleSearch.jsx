import PropTypes from "prop-types";
import { useRef, useEffect, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export function CollapsibleSearch({ onSearch, className, searchValue: externalSearchValue, ...props }) {
  const [searchValue, setSearchValue] = useState(externalSearchValue || "");
  const inputRef = useRef();

  // Sync with external search value when it changes
  useEffect(() => {
    if (externalSearchValue !== undefined) {
      setSearchValue(externalSearchValue);
    }
  }, [externalSearchValue]);

  const triggerSearch = (e) => {
    e?.preventDefault();
    if (onSearch) onSearch(searchValue);
  };

  const handleClear = () => {
    setSearchValue("");
    if (onSearch) onSearch(""); // Clear search on click
    inputRef.current?.focus();   // Return focus back to input
  };

  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      triggerSearch(e);
    }
  };

  return (
    <div className={clsx("flex h-12 items-center justify-start", className)}>
      <form
        onSubmit={triggerSearch}
        className="relative flex h-10 w-[340px] items-center rounded-xl border border-gray-300 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
      >
        {/* Search Icon */}
        <div className="flex h-full w-9 items-center justify-center pl-1 text-gray-400">
          <MagnifyingGlassIcon className="h-4 w-4 stroke-[2px]" />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          className="w-full flex-1 bg-transparent px-1 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
          placeholder="Search..."
          value={searchValue}
          onChange={handleInputChange}
          onOriginalKeyPress={handleKeyPress} // Handled safely via onSubmit, keeping your explicit handler
          onKeyDown={handleKeyPress} 
          {...props}
        />

        <div className="flex items-center gap-1 pr-1.5">
          {/* Clear Button (Visible only if there's text to clear) */}
          {searchValue && onSearch && (
            <button
              type="button"
              onClick={handleClear}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              title="Clear search"
            >
              <XMarkIcon className="h-4 w-4 stroke-[2px]" />
            </button>
          )}

          {/* Action Submit Button */}
          <button
            type="submit"
            className="flex h-7 px-2.5 items-center justify-center rounded-lg bg-gray-900 text-xs font-medium text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-950 dark:hover:bg-gray-200"
          >
            Search
          </button>
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