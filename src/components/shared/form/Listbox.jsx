// Import Dependencies
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { forwardRef, Fragment } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Input } from "components/ui";

// ----------------------------------------------------------------------

const CustomListbox = forwardRef(
  (
    {
      data,
      placeholder,
      label,
      displayField = "label",
      error,
      multiple,
      inputProps,
      rootProps,
      className,
      classNames,
      onChange,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        className={clsx(
          "flex flex-col [&_.suffix]:pointer-events-none",
          classNames?.root,
        )}
        {...rootProps}
      >
        <Listbox
          as="div"
          multiple={multiple}
          className={(className, classNames?.listbox)}
          ref={ref}
          onChange={onChange}
          {...rest}
        >
          {({ open, value: selectedValue }) => (
            <>
              {label && <Label>{label}</Label>}

              <div className={clsx("relative", label && "mt-1.5")}>
                <ListboxButton
                  as={Input}
                  component="button"
                  type="button"
                  error={error}
                  suffix={
                    <ChevronDownIcon
                      className={clsx(
                        "size-5 transition-transform",
                        open && "rotate-180",
                      )}
                    />
                  }
                  {...inputProps}
                >
                  <span className="flex items-center gap-2 truncate">
                    {/* Placeholder */}
                    {!selectedValue?.[multiple ? "length" : displayField] && (
                      <span className="text-gray-600 dark:text-dark-200">
                        {placeholder}
                      </span>
                    )}

                    {/* Multiple values */}
                    {multiple ? (
                      selectedValue?.map((item, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                        >
                          {item[displayField]}
                          {/* X button to remove */}
                          <XMarkIcon
                            className="size-4 cursor-pointer text-gray-500 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              onChange?.(
                                selectedValue.filter((v) => v !== item),
                              );
                            }}
                          />
                        </span>
                      ))
                    ) : (
                      selectedValue && (
                        <span className="flex items-center gap-1">
                          {selectedValue[displayField]}
                          {/* X button to clear single value */}
                          {/* <XMarkIcon
                            className="size-4 cursor-pointer text-gray-500 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              onChange?.(null);
                            }}
                          /> */}
                        </span>
                      )
                    )}
                  </span>
                </ListboxButton>

                <Transition
                  as={Fragment}
                  enter="transition ease-out"
                  enterFrom="opacity-0 translate-y-2"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-2"
                >
                  <ListboxOptions
                    anchor={{ to: "bottom end", gap: 8 }}
                    className="absolute z-100 max-h-60 w-(--button-width) overflow-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none"
                  >
                    {data?.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-dark-200">
                        No data found
                      </div>
                    ) : (
                      data.map((item, i) => (
                        <ListboxOption
                          key={i}
                          className={({ selected, focus }) =>
                            clsx(
                              "relative cursor-pointer select-none py-2 pl-4 pr-10 outline-hidden transition-colors rtl:pl-10 rtl:pr-4",
                              focus &&
                                !selected &&
                                "bg-gray-100 dark:bg-dark-600",
                              selected
                                ? "bg-primary-600 text-white dark:bg-primary-500"
                                : "text-gray-800 dark:text-dark-100",
                            )
                          }
                          value={item}
                        >
                          {({ selected }) => (
                            <>
                              <span className="block truncate">
                                {item[displayField]}
                              </span>

                              {selected ? (
                                <span className="absolute inset-y-0 flex items-center ltr:right-0 ltr:pr-3 rtl:left-0 rtl:pl-3">
                                  <CheckIcon
                                    className="size-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </ListboxOption>
                      ))
                    )}
                  </ListboxOptions>
                </Transition>
              </div>
            </>
          )}
        </Listbox>
      </div>
    );
  },
);

CustomListbox.displayName = "Listbox";

CustomListbox.propTypes = {
  data: PropTypes.array,
  placeholder: PropTypes.node,
  label: PropTypes.node,
  displayField: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
  multiple: PropTypes.bool,
  inputProps: PropTypes.object,
  rootProps: PropTypes.object,
  classNames: PropTypes.object,
  className: PropTypes.string,
  onChange: PropTypes.func,
};

export { CustomListbox as Listbox };
