// Import Dependencies
import { useCallback, useEffect, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Local Imports
import { ConfirmModal } from "components/shared/ConfirmModal";
import { Button } from "components/ui";
import { useDisclosure } from "hooks";
import { toast } from "sonner";
import { deleteUser } from "api/usermanagement/user";

// ----------------------------------------------------------------------

const promise = () =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      Math.random() > 0.5 ? resolve() : reject();
    }, 2000),
  );

export function ModalBox({
  show,
  onClose,
  data="",
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
        "Are you sure you want to delete this record? Once deleted, it cannot be restored.",
      actionText: "Delete",
    },
    success: {
      title: "Record Deleted",
    },
    error: {
      description:"Something went wrong while deleting the user.",
    },
  };

  const onOk = async () => {
    // if (!data) {
    //   toast.error("User ID is missing.");
    //   return;
    // }
    try {
      setConfirmLoading(true);

      const res = await deleteUser({ userid: data|| "" }); // <- your API
      if (res.code === 200) {
        toast.success(res.message);
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
    <>
      {/* <Button
        onClick={() => {
          setSuccess(false);
          setError(false);
          open();
        }}
      >
        Confirm Modal
      </Button> */}

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
    </>
  );
}
