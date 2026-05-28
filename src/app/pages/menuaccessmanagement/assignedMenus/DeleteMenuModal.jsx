import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
// Custom Components
import { ConfirmModal } from "components/shared/ConfirmModal";
import { deleteAssignedMenu } from "api/menuaccessmanagement/menus";
export const DeleteMenuModal = ({ isOpen, onClose, data, onSuccess }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const state = error ? "error" : success ? "success" : "pending";

  const messages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "Are you sure?",
      description: `Are you sure you want to unassign this menu?`,
      actionText: "Unassign Menu",
    },
    success: {
      title: "Unassign Menu",
    }
  };

  const handleDelete = async () => {
    if (Object(data).length==0) {
      toast.error("Access code and Role is missing.");
      return;
    }

    try {
      setConfirmLoading(true);
      const payload = data;

      const res = await deleteAssignedMenu(payload);

      if (res.code === 200) {
        toast.success(res.message);
        setSuccess(true);
        setError(false);
        setTimeout(() => {
          onSuccess?.(data);
          onClose();
        }, 1500);
      } else {
        toast.error(res.message || "Deletion failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Something went wrong");
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSuccess(false);
      setError(false);
      setConfirmLoading(false);
    }
  }, [isOpen]);

  return (
    <ConfirmModal
      show={isOpen}
      onClose={onClose}
      messages={messages}
      onOk={handleDelete}
      confirmLoading={confirmLoading}
      state={state}
    />
  );
};
