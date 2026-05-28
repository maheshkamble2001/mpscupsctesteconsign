// Import Dependencies
import { useCallback, useEffect, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Local Imports
import { ConfirmModal } from "components/shared/ConfirmModal";
import { useDisclosure } from "hooks";
import { toast } from "sonner";
import { deleteStudent } from "api/studentmanagement/student";
// import { deleteStudent } from "api/studentmanagement/student"; // <- Updated target path

// ----------------------------------------------------------------------

export function ModalBox({
  show,
  onClose,
  data = "",
  list
}) {
  const [isOpen, { open, close }] = useDisclosure();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const state = error ? "error" : success ? "success" : "pending";

  const messages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "Are you sure?",
      description:
        "Are you sure you want to delete this student record? Once deleted, it cannot be restored.",
      actionText: "Delete",
    },
    success: {
      title: "Student Record Deleted",
    },
    error: {
      description: "Something went wrong while deleting the student record.",
    },
  };

  const onOk = async () => {
    try {
      setConfirmLoading(true);

      // Payload parameter matches student database structural layout ('id')
      const res = await deleteStudent(
        { id: data || "" }
      ); 
      
      if (res.code === 200) {
        toast.success(res.message || "Student record deleted successfully");
        list();
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
      toast.error("Something went wrong");
      setError(true);
    } finally {
      setConfirmLoading(false);
    }
  };

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