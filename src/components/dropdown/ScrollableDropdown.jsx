// components/ui/ScrollableDropdown.jsx

import { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Transition,
} from "@headlessui/react";
import { Button } from "components/ui";

export function ScrollableDropdown({ options = [], selected, onChange, placeholder = "Select" }) {
    const current = options.find((o) => o.value === selected);

    return (
        <div className="max-w-xl">
            <Menu as="div" className="relative inline-block text-start w-full">
                <MenuButton
                    as="button"
                    className="w-full flex justify-between items-center border rounded-md px-3 py-2 bg-white text-left text-sm font-small text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                    {({ open }) => (
                        <>
                            <span>{current?.label || placeholder}</span>
                            <ChevronDownIcon
                                className={clsx("size-4 text-gray-500 transition-transform", open && "rotate-180")}
                                aria-hidden="true"
                            />
                        </>
                    )}
                </MenuButton>


                <Transition
                    as={Fragment}
                    enter="transition ease-out"
                    enterFrom="opacity-0 translate-y-2"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-2"
                >
                    <MenuItems className="absolute z-[100] mt-1.5 max-h-48 min-w-full overflow-y-auto rounded-lg border bg-white py-1 shadow-md dark:bg-dark-700">
                        {options.map((opt) => (
                            <MenuItem key={opt.value}>
                                {({ focus }) => (
                                    <button
                                        onClick={() => onChange(opt.value)}
                                        className={clsx(
                                            "flex h-9 w-full items-center px-3 text-left",
                                            focus && "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-white"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                )}
                            </MenuItem>
                        ))}
                    </MenuItems>
                </Transition>
            </Menu>
        </div>
    );
}
