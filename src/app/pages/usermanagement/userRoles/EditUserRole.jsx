import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useRef, useEffect, useState } from "react";
import { XMarkIcon, PencilIcon, } from "@heroicons/react/24/outline";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";

import { Input, Button } from "components/ui";
import { editUserRole } from "api/usermanagement/roles";
import { SaveIcon } from "lucide-react";

export const EditUserRole = ({ isOpen, onClose, selectedRole, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const saveRef = useRef(null);

  const schema = yup.object().shape({
    usertype: yup.string().required("Role name is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: { usertype: "" },
    resolver: yupResolver(schema),
  });

  // Populate form field when selectedRole changes
  useEffect(() => {
    if (selectedRole) {
      setValue("usertype", selectedRole.role);
    }
  }, [selectedRole, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        usertypeid: selectedRole?.usertypeid,
        usertype: data.usertype,
      };

      const res = await editUserRole(payload);
      if (res.code === 200) {
        toast.success("User role updated successfully");
        // Pass updated data to parent for UI update
        onSuccess?.(payload);
        reset();
        onClose();
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
        onClose={() => {
          reset();
          onClose();
        }}
        initialFocus={saveRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel 
            className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #ffffff, #fef7f7)"
            }}
          >
            {/* Decorative top bar */}
            <div 
              className="h-1.5 w-full"
           
            />

            {/* Header with Icon */}
            <div className="px-6 pt-5 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(51,104,175,0.1), rgba(254,69,67,0.1))"
                    }}
                  >
                    <PencilIcon className="h-5 w-5" style={{ color: "#3368AF" }} />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                      Update User Role
                    </DialogTitle>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Edit role name and permissions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                  className="rounded-full p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6">
              <div className="mt-2">
                <Input
                  label="Role Name"
                  placeholder="Enter role here..."
                  {...register("usertype")}
                  error={errors?.usertype?.message}
              />
              </div>

              {/* Info note */}
              <div className="mt-4 rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-blue-700">
                  💡 Changes will affect all users assigned to this role.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                  variant="outlined"
                  className="flex-1 rounded border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  ref={saveRef}
                  className="flex-1 rounded  font-semibold text-white shadow-md transition-all hover:shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #3368AF, #FE4543)"
                  }}
                >
                  <SaveIcon className="mr-1.5 h-4 w-4 inline-block" />
                  Update Role
                </Button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};