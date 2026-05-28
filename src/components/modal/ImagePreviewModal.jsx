import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { Fragment, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline"; // ✅ heroicons cross icon

export function ImagePreviewModal({ isOpen, onClose, imageUrl }) {
    const closeBtnRef = useRef(null);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
                onClose={onClose}
                initialFocus={closeBtnRef}
            >
                {/* Overlay */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
                </TransitionChild>

                {/* Modal Panel */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 [transform:translate3d(0,1rem,0)]"
                    enterTo="opacity-100 [transform:translate3d(0,0,0)]"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 [transform:translate3d(0,0,0)]"
                    leaveTo="opacity-0 [transform:translate3d(0,1rem,0)]"
                >
                    <DialogPanel className="scrollbar-sm relative flex w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white pb-2 pt-2 text-center transition-all duration-300 dark:bg-dark-700">

                        {/* ❌ Cross Close Button */}
                        <button
                            ref={closeBtnRef}
                            onClick={onClose}
                            className="absolute top-3 right-3 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-dark-500 focus:outline-none"
                        >
                            <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>

                        {/* Fixed Image Container */}
                        <div className="flex justify-center items-center mx-auto w-[500px] h-[300px] bg-gray-100 dark:bg-dark-600 rounded-md overflow-hidden">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-contain m-0 p-0 block"
                                />

                            ) : (
                                <span className="text-gray-500 text-sm">No Image</span>
                            )}
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
