// Import Dependencies
import { TbGridDots, TbList, TbUpload } from "react-icons/tb";
import { HiOutlineDocumentDownload, HiOutlineX } from "react-icons/hi";
import { BsFileSpreadsheet } from "react-icons/bs";
import clsx from "clsx";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

// Local Imports
import { Button } from "components/ui";
import { TableConfig } from "components/tables/users-datatable/TableConfig";
import { CollapsibleSearch } from "components/shared/CollapsibleSearch";
import { FaFileExcel } from "react-icons/fa";
import Cookies from "js-cookie";

// ----------------------------------------------------------------------

export function CustomToolbar({
  table,
  onExportExcel,
  hideToolbar = false,
  onSearch,
  children,
}) {
  const isFullScreenEnabled = table.getState().tableSettings.enableFullScreen;

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [animateModal, setAnimateModal] = useState(false);

  const rowCount = table.getFilteredRowModel().rows.length;
  const fileSize = (rowCount * 0.35).toFixed(1);

  const handleExportClick = () => {
    setIsExportModalOpen(true);
    setTimeout(() => setAnimateModal(true), 10);
  };

  const handleCloseModal = () => {
    setAnimateModal(false);
    setTimeout(() => setIsExportModalOpen(false), 300);
  };

  const handleConfirmExport = () => {
    onExportExcel();
    handleCloseModal();
  };

  useEffect(() => {
    Cookies.set("isFullScreenEnabled", isFullScreenEnabled ? "true" : "false");

    // Broadcast the event across the active DOM view tree
    window.dispatchEvent(new Event("fullscreenchange-state"));
  }, [isFullScreenEnabled]);

  return (
    <>
      <div
        className={clsx(
          "flex flex-wrap items-center justify-between gap-3",
          isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x) py-3",
        )}
      >
        {/* Left Container: Search component aur filters ko saath me align karne ke liye */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <CollapsibleSearch onSearch={onSearch} />

          {/* Agar child (Listbox) pass hoga, toh search ke turant baad yahan dikhega */}
          {children && (
            <div className="hidden w-64 shrink-0 sm:block">{children}</div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {onExportExcel && (
            <Button
              variant="outlined"
              onClick={handleExportClick}
              className="flex items-center gap-2"
            >
              <FaFileExcel className="h-4 w-4 text-green-700" />
              Export to Excel
            </Button>
          )}
          {!hideToolbar && (
            <>
              <TableConfig table={table} />
              <ViewTypeSelect table={table} />
            </>
          )}
        </div>

        {/* Responsive Mobile View Wrapper: Choti screens par filters proper space lein */}
        {children && <div className="mt-1 w-full sm:hidden">{children}</div>}
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className={clsx(
              "fixed inset-0 bg-black/50 transition-all duration-300",
              animateModal ? "backdrop-blur-sm" : "",
            )}
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div
            className={clsx(
              "relative w-full max-w-sm transform overflow-hidden rounded-xl bg-white shadow-xl transition-all duration-300 dark:bg-gray-900",
              animateModal
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-4 scale-95 opacity-0",
            )}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              <HiOutlineX className="h-4 w-4" />
            </button>

            {/* Icon */}
            <div className="pt-6 text-center">
              <div className="inline-flex animate-bounce rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <BsFileSpreadsheet className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Title */}
            <div className="mt-3 px-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Export Data
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Download records as Excel file
              </p>
            </div>

            {/* Info Box */}
            <div className="mx-6 mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    Total Records
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {rowCount.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    Estimate File Size
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  ~{fileSize} KB
                </span>
              </div>
            </div>

            {/* Note */}
            <div className="mx-6 mt-3 rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
              <p className="text-center text-xs text-blue-700 dark:text-blue-300">
                ✓ File will be downloaded automatically
              </p>
            </div>

            {/* Buttons */}
            <div className="p-6 pt-3">
              <div className="flex gap-2">
                <Button
                  onClick={handleCloseModal}
                  variant="outlined"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmExport}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-2 text-sm font-medium text-white transition-all hover:from-green-700 hover:to-emerald-700"
                >
                  <div className="flex items-center justify-center gap-1">
                    <HiOutlineDocumentDownload className="h-4 w-4" />
                    Export
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ViewTypeSelect({ table }) {
  const setViewType = table.options.meta.setViewType;
  const setTableSettings = table.options.meta.setTableSettings; // ✅ Extract setter
  const viewType = table.getState().viewType;

  const handleViewChange = (newView) => {
    setViewType(newView);

    // ✅ Turn off fullscreen immediately when layout switches toggle
    setTableSettings((prev) => ({
      ...prev,
      enableFullScreen: false,
    }));
  };

  return (
    <div
      data-tab
      className="text-xs-plus flex rounded-lg bg-gray-100 px-1 py-1 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    >
      <Button
        className={clsx(
          "shrink-0 rounded-md px-2 py-1 font-medium transition-all duration-200",
          viewType === "list"
            ? "bg-white shadow-sm dark:bg-gray-700 dark:text-white"
            : "",
        )}
        unstyled
        onClick={() => handleViewChange("list")} // ✅ Updated
      >
        <TbList className="size-4" />
      </Button>

      <Button
        className={clsx(
          "shrink-0 rounded-md px-2 py-1 font-medium transition-all duration-200",
          viewType === "grid"
            ? "bg-white shadow-sm dark:bg-gray-700 dark:text-white"
            : "",
        )}
        unstyled
        onClick={() => handleViewChange("grid")} // ✅ Updated
      >
        <TbGridDots className="size-4" />
      </Button>
    </div>
  );
}

CustomToolbar.propTypes = {
  table: PropTypes.object,
  onExportExcel: PropTypes.func,
  onSearch: PropTypes.func,
  children: PropTypes.node,
};

ViewTypeSelect.propTypes = {
  table: PropTypes.object,
};
