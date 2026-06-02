// import React, { useState, useCallback } from "react";
// import PropTypes from "prop-types";
// import { Card, Avatar, AvatarDot, Badge } from "components/ui";
// import { Transition } from "@headlessui/react";
// import { CheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
// import { DocumentTextIcon, ClockIcon, DocumentDuplicateIcon } from "@heroicons/react/20/solid";
// import { StyledSwitch } from "components/shared/form/StyledSwitch";
// import { ConfirmModal } from "components/shared/ConfirmModal";
// import clsx from "clsx";
// import { TrashIcon, LayoutListIcon } from "lucide-react";

// const confirmMessages = {
//   pending: {
//     description:
//       "Are you sure you want to delete this exam? Once deleted, it cannot be restored.",
//   },
//   success: {
//     title: "Exam Deleted",
//   },
// };

// function Actions({ row, table }) {
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
//   const [deleteSuccess, setDeleteSuccess] = useState(false);
//   const [deleteError, setDeleteError] = useState(false);

//   const closeModal = () => {
//     setDeleteModalOpen(false);
//   };

//   const openModal = () => {
//     setDeleteModalOpen(true);
//     setDeleteError(false);
//     setDeleteSuccess(false);
//   };

//   const handleDeleteRows = useCallback(async () => {
//     setConfirmDeleteLoading(true);
//     try {
//       await table.options.meta?.deleteRow(row);
//       setDeleteSuccess(true);
//     } catch (error) {
//       setDeleteError(true);
//     } finally {
//       setConfirmDeleteLoading(false);
//     }
//   }, [row, table.options.meta]);

//   const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

//   return (
//     <>
//       <div className="flex items-center justify-center gap-2 py-2">
//         {/* View Exam Profile */}
//         <button
//           onClick={() => table.options.meta?.onViewUser?.(row.original.exam_id)}
//           data-tooltip
//           data-tab-item
//           data-tooltip-content="View Details"
//           className="group relative cursor-pointer rounded-lg p-2.5 transition-all duration-200 hover:bg-blue-50"
//         >
//           <DocumentTextIcon className="size-5 text-slate-500 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-600 group-hover:filter group-hover:drop-shadow-[0_0_5px_rgba(37,99,235,0.4)]" />
//         </button>

//         {/* Update Button */}
//         <button
//           onClick={() => table.options.meta?.onEditUser?.(row.original.exam_id)}
//           data-tooltip
//           data-tab-item
//           data-tooltip-content="Update"
//           className="group relative cursor-pointer rounded-lg p-2.5 transition-all duration-200 hover:bg-amber-50"
//         >
//           <PencilSquareIcon className="size-5 text-slate-500 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:text-amber-600 group-hover:filter group-hover:drop-shadow-[0_0_5px_rgba(217,119,6,0.4)]" />
//         </button>

//         {/* Delete Button */}
//         <button
//           onClick={openModal}
//           data-tooltip
//           data-tab-item
//           data-tooltip-content="Delete"
//           className="group relative cursor-pointer rounded-lg p-2.5 transition-all duration-200 hover:bg-red-50"
//         >
//           <TrashIcon className="size-5 text-slate-500 transition-all duration-300 group-hover:scale-110 group-hover:text-red-600 group-hover:filter group-hover:drop-shadow-[0_0_5px_rgba(220,38,38,0.4)]" />
//         </button>
//       </div>
//       <ConfirmModal
//         show={deleteModalOpen}
//         onClose={closeModal}
//         messages={confirmMessages}
//         onOk={handleDeleteRows}
//         confirmLoading={confirmDeleteLoading}
//         state={state}
//       />
//     </>
//   );
// }

// Actions.propTypes = {
//   table: PropTypes.object,
//   row: PropTypes.object,
// };

// function Item({ row, table }) {
//   const [loading, setLoading] = useState(false);

//   const canSelect = row.getCanSelect();

//   const onChange = async (checked) => {
//     setLoading(true);
//     if (table.options.meta?.onStatusChange) {
//       await table.options.meta.onStatusChange(row.original.exam_id, checked);
//     }
//     setLoading(false);
//   };

//   return (
//     <Card
//       className={clsx(
//         "px-3 py-2.5 text-center",
//         row.getIsSelected() && "ring-3 ring-primary-500/50"
//       )}
//     >
//       <div className="flex w-full items-center justify-between pb-5">
//         <Badge color="primary" variant="outlined">
//           {row.original.ExamShortName}
//         </Badge>
//         <StyledSwitch
//           checked={row.original.status === 1 || row.original.status === true}
//           onChange={onChange}
//           loading={loading}
//         />
//       </div>

//       <Avatar
//         {...{
//           "data-tooltip": true,
//           "data-tooltip-content": `${row.original.ExamName}`,
//           size: 18,
//           classNames: {
//             root: canSelect ? "cursor-pointer" : "cursor-not-allowed",
//             display: "text-xl",
//           },
//           component: "button",
//           name: row.original.ExamName,
//           initialColor: "auto",
//           indicator: (
//             <Transition
//               as={AvatarDot}
//               show={row.getIsSelected()}
//               enter="transition-all origin-bottom duration-75"
//               enterFrom="opacity-0 scale-75"
//               enterTo="opacity-100 scale-100"
//               leave="transition-all origin-bottom duration-150"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-75"
//               color="primary"
//               className="bottom-0 right-0 flex size-6 items-center justify-center"
//             >
//               <CheckIcon className="size-3 stroke-[4px] text-white" />
//             </Transition>
//           ),
//         }}
//       />

//       <h3 className="mt-2 text-base font-medium text-gray-800 dark:text-dark-100 line-clamp-1">
//         {row.original.ExamName}
//       </h3>
//       <div className="mx-auto mt-4 inline-grid grid-cols-1 gap-3">
//         <div className="flex min-w-0 items-center gap-2">
//           <div className="flex size-6 items-center justify-center rounded-lg bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
//             <ClockIcon className="size-3.5" />
//           </div>
//           <p className="truncate text-sm text-gray-600"> {row.original.Duration || "-"}</p>
//         </div>
//         <div className="flex min-w-0 items-center gap-2">
//           <div className="flex size-6 items-center justify-center rounded-lg bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
//             <LayoutListIcon className="size-3.5" />
//           </div>
//           <p className="truncate text-sm text-gray-600"> {row.original.TotalQuestions} Questions</p>
//         </div>
//         <div className="flex min-w-0 items-center gap-2">
//           <div className="flex size-6 items-center justify-center rounded-lg bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
//             <DocumentDuplicateIcon className="size-3.5" />
//           </div>
//           <p className="truncate text-sm text-gray-600"> {row.original.TotalMarks} Marks</p>
//         </div>
//         <Actions row={row} table={table} />
//       </div>
//     </Card>
//   );
// }

// Item.propTypes = {
//   table: PropTypes.object,
//   row: PropTypes.object,
// };

// export const ExamGridView = ({ table, rows }) => {
//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
//       {rows.map((row) => (
//         <Item key={row.id} row={row} table={table} />
//       ))}
//     </div>
//   );
// };

// ExamGridView.propTypes = {
//   table: PropTypes.object.isRequired,
//   rows: PropTypes.array.isRequired,
// };

import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Card, Avatar, AvatarDot, Badge } from "components/ui";
import { Transition } from "@headlessui/react";
import { CheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import {
  DocumentTextIcon,
  ClockIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/20/solid";
import { ConfirmModal } from "components/shared/ConfirmModal";
import clsx from "clsx";
import { TrashIcon, LayoutListIcon } from "lucide-react";
import { StyledSwitch } from "components/shared/form/StyledSwitch";


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

  // 🚀 FIX: Ye onChange function miss ho gaya tha jiske wajah se error aa rahi thi
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
        row.getIsSelected() && "border-[#F5A524] ring-2 ring-[#F5A524]",
      )}
    >
      {/* Top Header Row: Selection Checkbox & Switch */}
      <div className="mb-4 flex w-full items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-slate-600 uppercase">
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
      <div className="mb-5 flex items-center gap-3.5">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[#0A0E17] text-[15px] font-bold text-white uppercase shadow-sm">
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

      {/* Info Grid (Premium mini-stats exactly matching dashboard metrics) */}
      <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl border border-slate-100/80 bg-slate-50/70 p-3">
        <div className="flex flex-col items-center text-center">
          <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md border border-slate-100 bg-white shadow-sm">
            <ClockIcon className="size-3 text-blue-500" />
          </div>
          <span className="text-[12px] font-bold text-slate-900">
            {row.original.Duration || "-"}
          </span>
          <span className="mt-0.5 text-[9px] font-bold tracking-widest text-slate-400 uppercase">
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
          <span className="mt-0.5 text-[9px] font-bold tracking-widest text-slate-400 uppercase">
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
          <span className="mt-0.5 text-[9px] font-bold tracking-widest text-slate-400 uppercase">
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
        <Item key={row.id} row={row} table={table} />
      ))}
    </div>
  );
};

ExamGridView.propTypes = {
  table: PropTypes.object.isRequired,
  rows: PropTypes.array.isRequired,
};
