import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Custom Components & APIs
import { ConfirmModal } from "components/shared/ConfirmModal";
import { deleteExamType } from "api/applicationmanagement2/examtype";
// import { deleteExamType } from "api/usermanagement/examtypes";

export const DeleteExamTypeModal = ({ isOpen, onClose, selectedExamType, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const state = error ? "error" : success ? "success" : "pending";

  const messages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "Are you sure?",
      description: `Are you sure you want to delete the exam type "${selectedExamType?.examType}"? Once deleted, it cannot be restored.`,
      actionText: "Delete",
    },
    success: {
      title: "Exam Type Deleted",
    },
    error: {
      description:
        "Ensure internet is on and retry. Contact support if issue remains.",
    },
  };

  const handleDelete = async () => {
    if (!selectedExamType?.examtypeid) {
      toast.error("Exam Type ID is missing.");
      return;
    }

    try {
      setLoading(true);
      const payload = { id: selectedExamType.examtypeid };
      const res = await deleteExamType(payload);

      if (res.code === 200) {
        toast.success("Exam type deleted successfully");
        setSuccess(true);
        setError(false);
        onSuccess?.(selectedExamType);
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

  // Reset local lifecycle state when the modal triggers closed
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