import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Custom Components & APIs
import { ConfirmModal } from "components/shared/ConfirmModal";
import { deleteSubject } from "api/applicationmanagement/subject";

export const DeleteSubjectModal = ({ isOpen, onClose, selectedSubject, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  // Deriving state mapping for the generic ConfirmModal wrapper
  const state = error ? "error" : success ? "success" : "pending";

  const messages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "Are you sure?",
      description: `Are you sure you want to delete the subject "${selectedSubject?.subjectName}"? Once deleted, it cannot be restored.`,
      actionText: "Delete",
    },
    success: {
      title: "Subject Deleted",
    },
    error: {
      description:
        "Ensure internet is on and retry. Contact support if issue remains.",
    },
  };

  const handleDelete = async () => {
    // Check for target subject ID keys (handling both camelCase and snake_case properties safely)
    const subjectId = selectedSubject?.subject_id || selectedSubject?.subjectId;

    if (!subjectId) {
      toast.error("Subject ID is missing.");
      return;
    }

  	try {
      setLoading(true);
      const payload = { id: subjectId, subjectId: subjectId }; // Double mapping parameter payload safely
      const res = await deleteSubject(payload);

      if (res?.code === 200 || res?.code === 201) {
        toast.success("Subject deleted successfully");
        setSuccess(true);
        setError(false);
        onSuccess?.(selectedSubject);
        
        // Brief timeout window before cleaning UI layer visibility context down
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        toast.error(res?.message || "Deletion failed");
        setError(true);
      }
    } catch (err) {
      console.error("Delete subject error:", err);
      toast.error("Something went wrong");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Reset local lifecycle state steps when the modal transitions closed
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

export default DeleteSubjectModal;