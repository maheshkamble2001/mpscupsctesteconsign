import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
// Custom Components
import { ConfirmModal } from "components/shared/ConfirmModal";
import { assignMenusToRoles } from "api/menuaccessmanagement/menus";

export const ConfirmAssignModal = ({ isOpen, onClose, data, onSuccess }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const state = error ? "error" : success ? "success" : "pending";

  const messages = {
    pending: {
      Icon: ExclamationTriangleIcon,
      title: "Are you sure?",
      description: `Are you sure you want to assign this menus?`,
      actionText: "Assign Menu",
    },
    success: {
      title: "Menu Assigned",
      description: `Menus assigned successfully!`,
    },
    error: {
      description: "",
    },
  };

  const handleAssign = async () => {
    const info=data.data?.table?.getSelectedRowModel()?.rows.map(({original})=>{
      const {access_code,access_name}=original;
      return {access_code,access_name}
    })
    if (!data.id) {
      toast.error("Please select role");
      return;
    }

    if (!data.data || Object(data.data).length === 0) {
      toast.error("Please select menus");
      return;
    }

    try {
      setConfirmLoading(true);
      const payload = { UserTypeID: data.id, access_codes:info};

      const res = await assignMenusToRoles(payload);

      if (res.code === 200) {
        toast.success(res.message);
        setSuccess(true);
        setError(false);
        setTimeout(() => {
          onSuccess?.(data);
          onClose();
        }, 1500);
      } else {
        toast.error(res.message);
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
      onOk={handleAssign}
      confirmLoading={confirmLoading}
      state={state}
    />
  );
};
