import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Card, Avatar, AvatarDot, Badge } from "components/ui";
import { Button, Transition } from "@headlessui/react";
import { CheckIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { EnvelopeIcon, PhoneIcon, UserIcon } from "@heroicons/react/20/solid";
import { StyledSwitch } from "components/shared/form/StyledSwitch";
import { ConfirmModal } from "components/shared/ConfirmModal";
import clsx from "clsx";
import { TrashIcon } from "lucide-react";

const confirmMessages = {
  pending: {
    description:
      "Are you sure you want to delete this user? Once deleted, it cannot be restored.",
  },
  success: {
    title: "User Deleted",
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
 <div className="flex items-center justify-center gap-2 py-2">
  {/* View Profile */}
  <button
    onClick={() => table.options.meta?.onViewUser?.(row.original.user_id)}
     data-tooltip
        data-tab-item
    data-tooltip-content="Profile"
    className="group relative cursor-pointer rounded-lg p-2.5 transition-all duration-200 hover:bg-blue-50"
  >
    <UserIcon className="size-5 text-slate-500 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-600 group-hover:filter group-hover:drop-shadow-[0_0_5px_rgba(37,99,235,0.4)]" />
  </button>

  {/* Update Button */}
  <button
    onClick={() => table.options.meta?.onEditUser?.(row.original.user_id)}
   data-tooltip
        data-tab-item
    data-tooltip-content="Update"
    className="group relative cursor-pointer rounded-lg p-2.5 transition-all duration-200 hover:bg-amber-50"
  >
    <PencilSquareIcon className="size-5 text-slate-500 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:text-amber-600 group-hover:filter group-hover:drop-shadow-[0_0_5px_rgba(217,119,6,0.4)]" />
  </button>

  {/* Delete Button */}
  <button
    onClick={openModal}
      data-tooltip
        data-tab-item
    data-tooltip-content="Delete"
    className="group relative cursor-pointer rounded-lg p-2.5 transition-all duration-200 hover:bg-red-50"
  >
    <TrashIcon className="size-5 text-slate-500 transition-all duration-300 group-hover:scale-110 group-hover:text-red-600 group-hover:filter group-hover:drop-shadow-[0_0_5px_rgba(220,38,38,0.4)]" />
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

  const getRoleBadge = (role) => {
    const roleMap = {
      Admin: { color: "danger", label: "Admin" },
      Manager: { color: "warning", label: "Manager" },
      User: { color: "primary", label: "User" },
      Viewer: { color: "secondary", label: "ITManager" },
    };
    return roleMap[role] || { color: "primary", label: role || "N/A" };
  };
  const badge = getRoleBadge(row.original.role);

  const canSelect = row.getCanSelect();

  const onChange = async (checked) => {
    setLoading(true);
    if (table.options.meta?.onStatusChange) {
      await table.options.meta.onStatusChange(row.original.user_id, checked);
    }
    setLoading(false);
  };

  return (
    <Card
      className={clsx(
        "px-3 py-2.5 text-center",
        row.getIsSelected() && "ring-3 ring-primary-500/50"
      )}
    >
      <div className="flex w-full items-center justify-between pb-5">
        <Badge color={badge.color} variant="outlined">
          {badge.label}
        </Badge>
        <StyledSwitch
          checked={row.original.status === 1 || row.original.status === true}
          onChange={onChange}
          loading={loading}
        />
      </div>

      <Avatar
        {...{
          "data-tooltip": true,
          "data-tooltip-content": `${row.original.name}`,
          size: 18,
          classNames: {
            root: canSelect ? "cursor-pointer" : "cursor-not-allowed",
            display: "text-xl",
          },
          component: "button",
          src: row.original.avatar,
          name: row.original.name,
          initialColor: "auto",
          indicator: (
            <Transition
              as={AvatarDot}
              show={row.getIsSelected()}
              enter="transition-all origin-bottom duration-75"
              enterFrom="opacity-0 scale-75"
              enterTo="opacity-100 scale-100"
              leave="transition-all origin-bottom duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-75"
              color="primary"
              className="bottom-0 right-0 flex size-6 items-center justify-center"
            >
              <CheckIcon className="size-3 stroke-[4px] text-white" />
            </Transition>
          ),
        }}
      />

      <h3 className="mt-2 text-base font-medium text-gray-800 dark:text-dark-100">
        {row.original.name}
      </h3>
      <div className="mx-auto mt-4 inline-grid grid-cols-1 gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-lg bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
            <PhoneIcon className="size-3.5" />
          </div>
          <p className="truncate"> {row.original.mobile || "-"}</p>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-lg bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
            <EnvelopeIcon className="size-3.5" />
          </div>
          <p className="truncate"> {row.original.email}</p>
        </div>
        <Actions row={row} table={table} />
      </div>
    </Card>
  );
}

Item.propTypes = {
  table: PropTypes.object,
  row: PropTypes.object,
};

export const UserGridView = ({ table, rows }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {rows.map((row) => (
        <Item key={row.id} row={row} table={table} />
      ))}
    </div>
  );
};

UserGridView .propTypes = {
  table: PropTypes.object.isRequired,
  rows: PropTypes.array.isRequired,
};