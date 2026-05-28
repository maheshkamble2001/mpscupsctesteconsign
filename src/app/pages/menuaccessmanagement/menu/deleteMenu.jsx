// DeleteMenuAccessCodeModal.jsx
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Custom Components
import { ConfirmModal } from "components/shared/ConfirmModal";

// API
import { menuAccessCodesDelete } from "api/menuaccessmanagement/menus";

export const DeleteMenuAccessCodeModal = ({
  isOpen,
  onClose,
  menuAccessCode,
  onSuccess,
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const state = error ? "error" : success ? "success" : "pending";

  const messages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "Are you sure?",
      description: `Are you sure you want to delete access code "${menuAccessCode?.access_code}"? This action cannot be undone.`,
      actionText: "Delete",
    },
    success: {
      title: "Access Code Deleted",
      description: `Access Code "${menuAccessCode?.access_code}" was deleted successfully.`,
    },
    error: {
      description: "Something went wrong while deleting the access code.",
    },
  };

  const handleDelete = async () => {
    if (!menuAccessCode?.id) {
      toast.error("Access code ID is missing.");
      return;
    }

    try {
      setConfirmLoading(true);

      // 🔥 API call
      const res = await menuAccessCodesDelete({ id: menuAccessCode.id });

      if (res.code === 200) {
        toast.success(res.message || "Access code deleted successfully");
        setSuccess(true);
        setError(false);

        setTimeout(() => {
          onSuccess?.(menuAccessCode);
          onClose();
        }, 1500);
      } else {
        toast.error(res.message || "Deletion failed");
        setError(true);
      }
    } catch (err) {
      console.error("Delete menu access code error:", err);
      toast.error("Something went wrong");
      setError(true);
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
