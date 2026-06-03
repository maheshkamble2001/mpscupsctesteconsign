import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  DocumentTextIcon,
  ClockIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/20/solid";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { TrashIcon, LayoutListIcon } from "lucide-react";
import { StyledSwitch } from "components/shared/form/StyledSwitch";
import clsx from "clsx";

function Actions({ row, table }) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {/* View Exam Profile */}
      <button
        onClick={() => table.options.meta?.onViewUser?.(row.original.exam_id)}
        data-tooltip
        data-tab-item
        data-tooltip-content="View Details"
        className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
      >
        <DocumentTextIcon className="size-[18px]" />
      </button>

      {/* Update Button */}
      <button
        onClick={() => table.options.meta?.onEditUser?.(row.original.exam_id)}
        data-tooltip
        data-tab-item
        data-tooltip-content="Update"
        className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
      >
        <PencilSquareIcon className="size-[18px]" />
      </button>

      {/* 🚀 Delete Button - Ab sidha global ModalBox ko trigger karega bina conflict ke */}
      <button
        onClick={() => table.options.meta?.deleteRow?.(row)}
        data-tooltip
        data-tab-item
        data-tooltip-content="Delete"
        className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <TrashIcon className="size-[18px]" />
      </button>
    </div>
  );
}

Actions.propTypes = {
  table: PropTypes.object,
  row: PropTypes.object,
};

function Item({ row, table }) {
  const [loading, setLoading] = useState(false);

  // Status toggle handler
  const onChange = async (checked) => {
    setLoading(true);
    if (table.options.meta?.onStatusChange) {
      await table.options.meta.onStatusChange(row.original.exam_id, checked);
    } else {
      console.warn("ManageExams file ke table meta me 'onStatusChange' function bana do API link karne ke liye!");
    }
    setLoading(false);
  };

  return (
    <div
      className={clsx(
        "group relative flex flex-col overflow-hidden rounded-[20px] border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)]",
        row.getIsSelected() && "border-[#F5A524] ring-2 ring-[#F5A524]",
      )}
    >
      {/* Top Header Row: Selection Checkbox & Switch */}
      <div className="mb-4 flex w-full items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            {row.original.ExamShortName || "EXAM"}
          </span>
        </div>
        
        {/* Toggle switch for status */}
        {/* <StyledSwitch
          checked={row.original.status === 1 || row.original.status === true}
          onChange={onChange}
          loading={loading}
        /> */}
      </div>

      {/* Avatar & Title Row */}
      <div className="mb-5 flex items-center gap-3.5">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[#0A0E17] text-[15px] font-bold uppercase text-white shadow-sm">
          {row.original.ExamName?.charAt(0) || "E"}
        </div>
        <div className="flex min-w-0 flex-col text-left">
          <h3
            className="line-clamp-1 text-[16px] font-bold tracking-tight text-slate-900"
            title={row.original.ExamName}
          >
            {row.original.ExamName}
          </h3>
          <p className="mt-0.5 truncate text-[12px] font-medium text-slate-500">
            {row.original.ExamType || "General"}
          </p>
        </div>
      </div>

      {/* Info Grid (Premium mini-stats) */}
      <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl border border-slate-100/80 bg-slate-50/70 p-3">
        <div className="flex flex-col items-center text-center">
          <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md border border-slate-100 bg-white shadow-sm">
            <ClockIcon className="size-3 text-blue-500" />
          </div>
          <span className="text-[12px] font-bold text-slate-900">
            {row.original.Duration || "-"}
          </span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Duration
          </span>
        </div>

        <div className="flex flex-col items-center border-x border-slate-200/50 text-center">
          <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md border border-slate-100 bg-white shadow-sm">
            <LayoutListIcon className="size-3 text-indigo-500" />
          </div>
          <span className="text-[12px] font-bold text-slate-900">
            {row.original.TotalQuestions || "0"}
          </span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Questions
          </span>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md border border-slate-100 bg-white shadow-sm">
            <DocumentDuplicateIcon className="size-3 text-orange-500" />
          </div>
          <span className="text-[12px] font-bold text-slate-900">
            {row.original.TotalMarks || "0"}
          </span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Marks
          </span>
        </div>
      </div>

      {/* Footer / Actions Row */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
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
        <Item key={row.original.exam_id} row={row} table={table} />
      ))}
    </div>
  );
};

ExamGridView.propTypes = {
  table: PropTypes.object.isRequired,
  rows: PropTypes.array.isRequired,
};
