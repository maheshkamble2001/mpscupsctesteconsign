import { useState, useEffect } from "react";
import { toast } from "sonner";
import { deleteUserRole } from "api/usermanagement/roles";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Custom Components
import { ConfirmModal } from "components/shared/ConfirmModal";

export const DeleteUserRoleModal = ({ isOpen, onClose, selectedRole, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const state = error ? "error" : success ? "success" : "pending";

  const messages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "Are you sure?",
      description: `Are you sure you want to delete the role "${selectedRole?.role}"? Once deleted, it cannot be restored.`,
      actionText: "Delete",
    },
    success: {
      title: "Role Deleted",
    },
    error: {
      description:
        "Ensure internet is on and retry. Contact support if issue remains.",
    },
  };

  const handleDelete = async () => {
    if (!selectedRole?.usertypeid) {
      toast.error("Usertype ID is missing.");
      return;
    }

    try {
      setLoading(true);
      const payload = { usertypeid: selectedRole.usertypeid };
      const res = await deleteUserRole(payload);

      if (res.code === 200) {
        toast.success("User role deleted successfully");
        setSuccess(true);
        setError(false);
        onSuccess?.(selectedRole);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        toast.error(res.message || "Deletion failed");
        setError(true);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Something went wrong");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSuccess(false);
      setError(false);
      setLoading(false);
    }
  }, [isOpen]);

  return (
    <ConfirmModal
      show={isOpen}
      onClose={onClose}
      messages={messages}
      onOk={handleDelete}
      confirmLoading={loading}
      state={state}
    />
  );
};
