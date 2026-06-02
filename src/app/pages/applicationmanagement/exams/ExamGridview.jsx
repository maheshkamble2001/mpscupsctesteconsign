import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Card, Avatar, AvatarDot, Badge } from "components/ui";
import { Transition } from "@headlessui/react";
import { CheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { DocumentTextIcon, ClockIcon, DocumentDuplicateIcon } from "@heroicons/react/20/solid";
import { StyledSwitch } from "components/shared/form/StyledSwitch";
import { ConfirmModal } from "components/shared/ConfirmModal";
import clsx from "clsx";
import { TrashIcon, LayoutListIcon } from "lucide-react";

const confirmMessages = {
  pending: {
    description:
      "Are you sure you want to delete this exam? Once deleted, it cannot be restored.",
  },
  success: {
    title: "Exam Deleted",
  },
};

function Actions({ row, table }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const openModal = () => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };

  const handleDeleteRows = useCallback(async () => {
    setConfirmDeleteLoading(true);
    try {
      await table.options.meta?.deleteRow(row);
      setDeleteSuccess(true);
    } catch (error) {
      setDeleteError(true);
    } finally {
      setConfirmDeleteLoading(false);
    }
  }, [row, table.options.meta]);

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  return (
    <>
      <div className="flex items-center justify-end gap-0.5">
        {/* View Exam Profile */}
        <button
          onClick={() => table.options.meta?.onViewUser?.(row.original.exam_id)}
          data-tooltip
          data-tab-item
          data-tooltip-content="View Details"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
        >
          <DocumentTextIcon className="size-[18px]" />
        </button>

        {/* Update Button */}
        <button
          onClick={() => table.options.meta?.onEditUser?.(row.original.exam_id)}
          data-tooltip
          data-tab-item
          data-tooltip-content="Update"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
        >
          <PencilSquareIcon className="size-[18px]" />
        </button>

        {/* Delete Button */}
        <button
          onClick={openModal}
          data-tooltip
          data-tab-item
          data-tooltip-content="Delete"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <TrashIcon className="size-[18px]" />
        </button>
      </div>
      <ConfirmModal
        show={deleteModalOpen}
        onClose={closeModal}
        messages={confirmMessages}
        onOk={handleDeleteRows}
        confirmLoading={confirmDeleteLoading}
        state={state}
      />
    </>
  );
}

Actions.propTypes = {
  table: PropTypes.object,
  row: PropTypes.object,
};

function Item({ row, table }) {
  const [loading, setLoading] = useState(false);

  const canSelect = row.getCanSelect();

  const onChange = async (checked) => {
    setLoading(true);
    if (table.options.meta?.onStatusChange) {
      await table.options.meta.onStatusChange(row.original.exam_id, checked);
    }
    setLoading(false);
  };

  return (
    <div
      className={clsx(
        "group relative flex flex-col overflow-hidden rounded-[20px] border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)]",
        row.getIsSelected() && "ring-2 ring-[#F5A524] border-[#F5A524]"
      )}
    >
      {/* Top Header Row: Selection Checkbox & Switch */}
      <div className="flex w-full items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div 
            onClick={row.getToggleSelectedHandler()}
            className={clsx(
              "flex size-[18px] cursor-pointer items-center justify-center rounded border transition-colors",
              row.getIsSelected() ? "bg-[#F5A524] border-[#F5A524] text-black" : "border-slate-300 bg-white hover:border-slate-400"
            )}
          >
            {row.getIsSelected() && <CheckIcon className="size-3.5 stroke-[3px]" />}
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            {row.original.ExamShortName || "EXAM"}
          </span>
        </div>
        
        <StyledSwitch
          checked={row.original.status === 1 || row.original.status === true}
          onChange={onChange}
          loading={loading}
        />
      </div>

      {/* Avatar & Title Row (Matching the dark avatar styling) */}
      <div className="flex items-center gap-3.5 mb-5">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[#0A0E17] text-[15px] font-bold text-white shadow-sm uppercase">
          {row.original.ExamName?.charAt(0) || "E"}
        </div>
        <div className="flex min-w-0 flex-col text-left">
          <h3 
            className="text-[16px] font-bold tracking-tight text-slate-900 line-clamp-1"
            title={row.original.ExamName}
          >
            {row.original.ExamName}
          </h3>
          <p className="text-[12px] font-medium text-slate-500 truncate mt-0.5">
            {row.original.ExamType || "General"}
          </p>
        </div>
      </div>

      {/* Info Grid (Premium mini-stats exactly matching dashboard metrics) */}
      <div className="grid grid-cols-3 gap-3 mb-4 rounded-xl bg-slate-50/70 p-3 border border-slate-100/80">
        <div className="flex flex-col items-center text-center">
          <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-100 shadow-sm">
            <ClockIcon className="size-3 text-blue-500" />
          </div>
          <span className="text-[12px] font-bold text-slate-900">{row.original.Duration || "-"}</span>
          <span className="mt-0.5 text-[9px] font-bold tracking-widest text-slate-400 uppercase">Duration</span>
        </div>
        
        <div className="flex flex-col items-center text-center border-x border-slate-200/50">
          <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-100 shadow-sm">
            <LayoutListIcon className="size-3 text-indigo-500" />
          </div>
          <span className="text-[12px] font-bold text-slate-900">{row.original.TotalQuestions || "0"}</span>
          <span className="mt-0.5 text-[9px] font-bold tracking-widest text-slate-400 uppercase">Questions</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-100 shadow-sm">
            <DocumentDuplicateIcon className="size-3 text-orange-500" />
          </div>
          <span className="text-[12px] font-bold text-slate-900">{row.original.TotalMarks || "0"}</span>
          <span className="mt-0.5 text-[9px] font-bold tracking-widest text-slate-400 uppercase">Marks</span>
        </div>
      </div>

      {/* Footer / Actions Row */}
      <div className="mt-auto border-t border-slate-100 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
           {row.original.Stage && (
             <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700">
               {row.original.Stage}
             </span>
           )}
        </div>
        <Actions row={row} table={table} />
      </div>
    </div>
  );
}

Item.propTypes = {
  table: PropTypes.object,
  row: PropTypes.object,
};

export const ExamGridView = ({ table, rows }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {rows.map((row) => (
        <Item key={row.id} row={row} table={table} />
      ))}
    </div>
  );
};

ExamGridView.propTypes = {
  table: PropTypes.object.isRequired,
  rows: PropTypes.array.isRequired,
};
