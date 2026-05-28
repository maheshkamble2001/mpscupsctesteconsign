// Import Dependencies
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { forwardRef, Fragment, useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Input, InputErrorMsg } from "components/ui";
import { useFuse } from "hooks";
import { Highlight } from "../Highlight";

// ----------------------------------------------------------------------

const CustomCombobox = forwardRef(
  (
    {
      data,
      multiple,
      placeholder,
      label,
      error,
      displayField = "label",
      searchFields = [],
      highlight,
      inputProps,
      prefix, // Added prefix support
      rootProps,
      className,
      classNames,
      required,
      ...rest
    },
    ref,
  ) => {
    const { result: filteredData, query, setQuery } = useFuse(data, {
      keys: searchFields,
      threshold: 0.2,
      matchAllOnEmptyQuery: true,
    });

    const containerRef = useRef(null);
    const [isAbove, setIsAbove] = useState(false);

    return (
      <div ref={containerRef} className={clsx("flex flex-col relative", classNames?.root)} {...rootProps}>
        <Combobox
          as="div"
          className={clsx(classNames?.root, className)}
          multiple={multiple}
          ref={ref}
          {...rest}
        >
          {({ open, value: selectedValue }) => {
            // ✅ Fix: Position calculation inside the render function to access 'open'
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useEffect(() => {
              if (open && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const spaceBelow = viewportHeight - rect.bottom;
                const spaceAbove = rect.top;
                const dropdownHeight = 260; // Adjusted for shadow/margins
                
                if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                  setIsAbove(true);
                } else {
                  setIsAbove(false);
                }
              }
            }, [open, selectedValue]); // Re-calculate if selection changes (for multiple select height)

            return (
              <>
                {label && <Label>{label} {required && <span className="text-red-500">*</span>}</Label>}

                {multiple ? (
                  <div className="mt-2 ">
                    <ComboboxButton
                      as="div"
                      className={clsx(
                        "relative w-full cursor-default overflow-hidden rounded-lg border text-start outline-hidden transition-colors focus:outline-hidden",
                        error
                          ? "border-error dark:border-error-lighter"
                          : "border-gray-300 focus-within:border-primary-600! hover:border-gray-400 dark:border-dark-450 dark:focus-within:border-primary-500! dark:hover:border-dark-400",
                      )}
                    >
                      <div className="flex flex-nowrap items-center justify-start gap-2 px-3 py-2 ltr:pr-9 rtl:pl-9 overflow-hidden">
                        {selectedValue?.length > 0 && (
                          <div className="flex flex-nowrap items-center gap-1.5 flex-shrink-0">
                            {/* logic for 1 item + count more items */}
                            <div
                                className="flex items-center gap-1 px-2 py-1 text-sm bg-primary-100 text-primary-700 rounded-md dark:bg-primary-500/20 dark:text-primary-300 whitespace-nowrap"
                            >
                                <span>{selectedValue[0]?.[displayField]}</span>
                            </div>
                            
                            {selectedValue.length > 1 && (
                                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 whitespace-nowrap bg-primary-50 dark:bg-primary-900/30 px-1.5 py-1 rounded-md">
                                    +{selectedValue.length - 1} more
                                </span>
                            )}
                          </div>
                        )}
                        <ComboboxInput
                          as={Input}
                          classNames={{
                            root: "flex-1 min-w-[40px]",
                            input:
                              "placeholder:font-light placeholder:text-gray-600 dark:placeholder:text-dark-200",
                          }}
                          unstyled
                          displayValue={(val) => val?.[displayField]}
                          autoComplete="new"
                          placeholder={selectedValue?.length === 0 && query === "" ? placeholder : undefined}
                          onChange={(event) => setQuery(event.target.value)}
                          value={query}
                          prefix={prefix} // prefix support
                          {...inputProps}
                        />
                      </div>

                      <div className="absolute inset-y-0 flex items-center ltr:right-0 ltr:pr-2 rtl:left-0 rtl:pl-2">
                        <ChevronDownIcon
                          className={clsx("size-5 text-gray-400 transition-transform dark:text-dark-300", open && "rotate-180")}
                          aria-hidden="true"
                        />
                      </div>
                    </ComboboxButton>
                    <InputErrorMsg when={error && typeof error !== "boolean"}>{error}</InputErrorMsg>
                  </div>
                ) : (
                  <div className="mt-0 relative">
                    <ComboboxButton className="relative w-full cursor-pointer overflow-hidden text-start">
                      <ComboboxInput
                        as={Input}
                        autoComplete="new"
                        error={error}
                        displayValue={(val) => val?.[displayField]}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={placeholder}
                        prefix={prefix} // prefix support
                        suffix={
                          <ChevronDownIcon
                            className={clsx("size-5 transition-transform", open && "rotate-180")}
                            aria-hidden="true"
                          />
                        }
                        {...inputProps}
                      />
                    </ComboboxButton>
                  </div>
                )}

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom={isAbove ? "opacity-0 -translate-y-2 scale-95" : "opacity-0 translate-y-2 scale-95"}
                  enterTo="opacity-100 translate-y-0 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100 translate-y-0 scale-100"
                  leaveTo={isAbove ? "opacity-0 -translate-y-2 scale-95" : "opacity-0 translate-y-2 scale-95"}
                  afterLeave={() => setQuery("")}
                >
                  <ComboboxOptions
                    className={clsx(
                      "absolute z-50 w-full max-h-60 overflow-auto rounded-lg border border-gray-300 bg-white py-1 shadow-xl outline-hidden focus-visible:outline-none dark:border-dark-500 dark:bg-dark-750",
                      isAbove ? "bottom-full mb-2" : "mt-2",
                      multiple && (isAbove ? "mb-2" : "mt-2"),
                    )}
                  >
                    {/* ✅ START: Added "No data found" exactly like Listbox */}
                    {data?.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-dark-200">
                        No data found
                      </div>
                    ) : filteredData.length === 0 && query !== "" ? (
                      <div className="relative cursor-default select-none px-4 py-2 text-gray-800 dark:text-dark-100">
                        Nothing found for {query}
                      </div>
                    ) : (
                      filteredData.map(({ item, refIndex }) => (
                        <ComboboxOption
                          key={refIndex}
                          className={({ selected, active }) =>
                            clsx(
                              "relative cursor-pointer select-none px-4 py-1.5 outline-hidden transition-colors", // reduced py
                              active && !selected && "bg-gray-100 dark:bg-dark-600",
                              selected ? "bg-primary-600 text-white dark:bg-primary-500" : "text-gray-800 dark:text-dark-100",
                            )
                          }
                          value={item}
                        >
                          {({ selected }) => (
                            <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                              {highlight ? <Highlight query={query}>{item?.[displayField]}</Highlight> : item?.[displayField]}
                            </span>
                          )}
                        </ComboboxOption>
                      ))
                    )}
                  </ComboboxOptions>
                </Transition>
              </>
            );
          }}
        </Combobox>
      </div>
    );
  },
);

CustomCombobox.displayName = "Combobox";

CustomCombobox.propTypes = {
  data: PropTypes.array,
  multiple: PropTypes.bool,
  placeholder: PropTypes.node,
  label: PropTypes.node,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
  displayField: PropTypes.string,
  searchFields: PropTypes.node,
  highlight: PropTypes.bool,
  inputProps: PropTypes.object,
  prefix: PropTypes.node,
  rootProps: PropTypes.object,
  classNames: PropTypes.object,
  className: PropTypes.string,
  required: PropTypes.bool,
};

export { CustomCombobox as Combobox };