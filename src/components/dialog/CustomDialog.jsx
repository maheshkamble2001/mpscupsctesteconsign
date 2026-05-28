import React, { useEffect, useState } from "react";

const CustomDialog = ({ isOpen, onClose, title, children }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Small delay to trigger enter animation
    if (isOpen) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      {/* Background Click Closes Modal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Animated Panel */}
      <div
        className={`
          relative z-10 bg-white w-full max-w-5xl h-[85vh] rounded-md shadow-lg p-6 transform transition-all duration-300 ease-out
          ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold mb-1">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-2xl font-bold leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(85vh-80px)] pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomDialog;
