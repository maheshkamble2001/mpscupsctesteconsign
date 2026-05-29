import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useRef, useState, useEffect } from "react";
import { XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";

// API
import { updateSubject } from "api/applicationmanagement/subject";

// UI Components
import { Input, Button } from "components/ui";

export const EditSubjectModal = ({ isOpen, onClose, onSuccess, subjectData }) => {
  const [loading, setLoading] = useState(false);
  const updateRef = useRef(null);
  console.log("Received subjectData in EditSubjectModal:", subjectData); // Debug log to verify data reception
  // Validation Schema matching field requirements
  const schema = yup.object().shape({
    subjectName: yup.string().required("Subject name is required"),
    description: yup.string().optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      subjectName: "",
      description: "",
      status: 1,
    },
    resolver: yupResolver(schema),
  });
  // Watch the status value to handle toggle visual changes correctly
  const currentStatus = watch("status");

  // Populate data when popup opens or subjectData changes
  useEffect(() => {
    if (subjectData && isOpen) {
      reset({
        subjectName: subjectData.subjectName || "",
        description: subjectData.description === "-" ? "" : (subjectData.description || ""),
        status: subjectData.status !== undefined ? subjectData.status : 1,
      });
    }
  }, [subjectData, isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = {
        subjectId: subjectData?.subject_id,
        id: subjectData?.subject_id, // Backward compatibility safety
        ...data,
      };

      const res = await updateSubject(payload);
      console.log("Response from updateSubject API:", res); // Debug log to verify API response
      if (res?.code == 200) {
        toast.success("Subject updated successfully");
        onSuccess?.();
        reset();
        onClose();
      } else {
        toast.error(res?.message || "Failed to update subject");
      }
    } catch (error) {
      console.error("Error updating subject:", error);
      toast.error("Something went wrong while updating subject");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
        onClose={handleClose}
        initialFocus={updateRef}
      >
        {/* Backdrop filter */}
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

        {/* Modal Element Wrapper */}
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
              background: "linear-gradient(135deg, #ffffff, #fef7f7)",
            }}
          >
            {/* Header Structure */}
            <div className="px-6 pt-5 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(51,104,175,0.1), rgba(254,69,67,0.1))",
                    }}
                  >
                    <PencilSquareIcon className="h-5 w-5" style={{ color: "#3368AF" }} />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                      Edit Subject
                    </DialogTitle>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Update the subject details below
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Input Data Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-4">
              <div>
                <Input
                  label="Subject Name"
                  placeholder="e.g., English, Mathematics"
                  {...register("subjectName")}
                  error={errors?.subjectName?.message}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter brief details about this subject..."
                  {...register("description")}
                  className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
                {errors?.description?.message && (
                  <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                )}
              </div>

             

              {/* Functional Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-md border border-gray-200 bg-white py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 outline-none"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  loading={loading}
                  ref={updateRef}
                  className="flex-1 rounded font-semibold text-black shadow-md transition-all hover:shadow-lg"
                  style={{
                    background: "var(--app-btn-primary)",
                  }}
                >
                  Update Subject
                </Button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default EditSubjectModal;