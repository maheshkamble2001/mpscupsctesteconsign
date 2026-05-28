import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
 
// Shared Modal
import { ConfirmModal } from "components/shared/ConfirmModal";
 
export const CommonDeleteModal = ({
  isOpen,
  onClose,
  title = "Are you sure?",
  description,
  itemName,
  deleteApi,
  payload,
  onSuccess,
  // New Props for customization
  buttonText,
  successTitle,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
 
  const state = error ? "error" : success ? "success" : "pending";
 
  const messages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title,
      description:
        description ||
        `Are you sure you want to delete ${
          itemName ? `"${itemName}"` : "this item"
        }? This action cannot be undone.`,
      // Agar buttonText prop hai toh wo use hoga, nahi toh default "Delete"
      actionText: buttonText || "Delete",
    },
    success: {
      // Agar successTitle prop hai toh wo use hoga, nahi toh default "Successfully Deleted"
      title: successTitle || "Successfully Deleted",
      description: "Deleted Successfully",
    },
    error: {
      title: "Deletion Failed",
      description:
        "We couldn't delete the record. Please check your connection and try again.",
    },
  };
 
  const handleDelete = async () => {
    if (!deleteApi) {
      toast.error("Delete API not provided");
      return;
    }
 
    try {
      setLoading(true);
      setError(false);
      const res = await deleteApi(payload);
 
      if (res?.code === 200) {
        // toast.success(successMessage);
        setSuccess(true);
        onSuccess?.(payload);
       
        // Auto close after showing success state
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        toast.error(res?.message || "Deletion failed");
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
      setLoading(false);
      setSuccess(false);
      setError(false);
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