import React, { useState, useEffect, useRef } from "react";
import { ArrowUturnLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@headlessui/react";
import { verifyRole } from "utils/utilities";
import clsx from "clsx";

export function SelectionBar({ selectedCount, totalRows, onAssign, onCancel }) {
  if (selectedCount === 0) return null;

  // Dragging Logic States
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const handleMouseDown = (e) => {
    // Buttons par click karne se drag trigger na ho
    if (e.target.closest("button")) return;

    setIsDragging(true);
    hasMovedRef.current = false;
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      // Check if mouse has moved significantly
      const moveDistance =
        Math.abs(e.clientX - (offsetRef.current.x + position.x)) +
        Math.abs(e.clientY - (offsetRef.current.y + position.y));

      if (moveDistance > 3) {
        hasMovedRef.current = true;
      }

      setPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position.x, position.y]);

  const handleAssignClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // drag block hone ki wajah se yahan direct action execute hoga
    if (onAssign && !verifyRole(100009)) {
      onAssign();
    }
  };

  const handleCancelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // drag block hone ki wajah se yahan direct action execute hoga
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: 0% 0%;
            }
            100% {
              background-position: 200% 0%;
            }
          }
          
          .animate-shimmer {
            animation: shimmer 3s linear infinite;
          }
        `}
      </style>

      <div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate(calc(-50% + ${position.x}px), calc(0px + ${position.y}px))`,
        }}
        className={clsx(
          "fixed bottom-6 left-1/2 z-50 w-full max-w-2xl px-4",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab",
        )}
      >
        {/* Modern Soft Theme with Border Gradient */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-r from-blue-50 to-red-50 shadow-2xl backdrop-blur-xl">
          {/* Gradient Accent Bar with Animation */}
          <div className="animate-shimmer absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#3368AF] via-[#FE4543] to-[#3368AF] bg-[length:200%_100%]" />

          <div className="flex items-center justify-between gap-6 p-5">
            {/* Count Metadata Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#3368AF] to-[#FE4543] opacity-50 blur-md" />
                <div className="relative flex h-12 w-12 shrink-0 transform items-center justify-center rounded-full bg-gradient-to-r from-[#3368AF] to-[#FE4543] text-lg font-bold text-white shadow-lg transition-transform duration-300 hover:scale-110">
                  {selectedCount}
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-base font-bold tracking-wide text-slate-800">
                  {selectedCount} Item{selectedCount !== 1 ? "s" : ""} Selected
                </p>
                <p className="text-xs font-medium text-slate-600">
                  from {totalRows} total {totalRows !== 1 ? "items" : "item"}
                </p>
              </div>
            </div>

            {/* Dynamic Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAssignClick}
                disabled={verifyRole(100009)}
                className={clsx(
                  "flex transform items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-300",
                  "focus:ring-2 focus:ring-[#3368AF] focus:ring-offset-2 focus:outline-none",
                  verifyRole(100009)
                    ? "cursor-not-allowed bg-gray-700/50 text-gray-400 opacity-50"
                    : "cursor-pointer bg-gradient-to-r from-[#3368AF] to-[#FE4543] text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95",
                )}
              >
                <CheckIcon className="h-4 w-4 stroke-[2.5]" />
                Assign Menu
              </Button>

              <Button
                onClick={handleCancelClick}
                className="group relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gray-700/50 text-gray-300 transition-all duration-300 hover:scale-105 hover:bg-gray-600/50 hover:text-white active:scale-95"
                data-tooltip
                data-tooltip-content="Cancel Selection"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <ArrowUturnLeftIcon className="relative z-10 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}