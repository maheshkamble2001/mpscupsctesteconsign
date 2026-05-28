import { useState } from "react";
import PropTypes from "prop-types";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export function FrontendSearch({ onLocalSearch, placeholder = "Search..." }) {
  const [searchValue, setSearchValue] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onLocalSearch) onLocalSearch(value);
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>

      <input
        type="text"
        className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50
                   focus:outline-none focus:border-1 focus:shadow-[0_0_6px_rgba(0,148,222,0.6)]
                   dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
      />
    </div>
  );
}

FrontendSearch.propTypes = {
  onLocalSearch: PropTypes.func,
  placeholder: PropTypes.string,
};
