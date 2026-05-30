// Import Dependencies
import { useEffect, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// Local Imports
import { ConfirmModal } from "components/shared/ConfirmModal";
import { toast } from "sonner"; // ✅ Linked to your questions API endpoint
import { deleteQuestion } from "api/applicationmanagement/questions";

// ----------------------------------------------------------------------

export function ModalBox({
  show,
  onClose,
  data = "",
  list
}) {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const state = error ? "error" : success ? "success" : "pending";

  // Text contexts updated to reflect Question Assessment terms
  const messages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "Are you sure?",
      description:
        "Are you sure you want to delete this question blueprint? Once removed, it will be unmapped from all ongoing assessment test sets.",
      actionText: "Delete",
    },
    success: {
      title: "Question Deleted",
    },
    error: {
      description: "Something went wrong while removing the question from the question bank.",
    },
  };

  const onOk = async () => {
    if (!data) {
      toast.error("Invalid Question Identifier");
      return;
    }

    try {
      setConfirmLoading(true);

      // Payload parameter matching backend mapping structure
      const res = await deleteQuestion({ QuestionID: data }); 
      
      if (res.code === 200) {
        toast.success(res.message || "Question deleted successfully from bank");
        list(); // Triggers table re-fetch hook in parent container
        setSuccess(true);
        setError(false);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        list();
        toast.error(res.message || "Deletion failed");
        setError(true);
      }
    } catch (err) {
      console.error("Delete operation failure:", err);
      toast.error("Something went wrong during deletion");
      setError(true);
    } finally {
      setConfirmLoading(false);
    }
  };

  // Reset local transactional layout state cycles whenever modal is toggled or dismissed
  useEffect(() => {
    if (!show) {
      setSuccess(false);
      setError(false);
      setConfirmLoading(false);
    }
  }, [show]);

  return (
    <ConfirmModal
      show={show}
      onClose={() => {
        setSuccess(false);
        setError(false);
        onClose();
      }}
      messages={messages}
      onOk={onOk}
      confirmLoading={confirmLoading}
      state={state}
    />
  );
}

ModalBox.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  list: PropTypes.func.isRequired,
};