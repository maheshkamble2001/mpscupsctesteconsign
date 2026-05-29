import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useRef, useEffect, useState } from "react";
import { XMarkIcon, PencilIcon } from "@heroicons/react/24/outline";
import { SaveIcon } from "lucide-react";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";

// Components & APIs
import { Input, Button } from "components/ui";
import { editExamType } from "api/applicationmanagement2/examtype";
// import { editExamType } from "api/usermanagement/examtypes";

export const EditExamType = ({ isOpen, onClose, selectedExamType, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const saveRef = useRef(null);

  const schema = yup.object().shape({
    examtype: yup.string().required("Exam type name is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: { examtype: "" },
    resolver: yupResolver(schema),
  });

  // Populate form field when selectedExamType payload updates
  useEffect(() => {
    if (selectedExamType) {
      setValue("examtype", selectedExamType.examType);
    }
  }, [selectedExamType, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        examtypeid: selectedExamType?.examtypeid,
        examtype: data.examtype,
      };

      const res = await editExamType({name: data.examtype, id: selectedExamType?.examtypeid});
      if (res.code === 200) {
        toast.success("Exam type updated successfully");
        
        // Return structured field map to update state dynamically in main table array
        onSuccess?.({
          examtypeid: payload.examtypeid,
          examType: payload.examtype,
        });
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
            {/* Decorative top bar accent */}
            <div className="h-1.5 w-full" />

            {/* Title / Description */}
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
                      Update Exam Type
                    </DialogTitle>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Modify configuration name or settings parameters
                    </p>
                  </div>
                </div>
                <button
                  type="button"
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

            {/* Input Segment Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6">
              <div className="mt-2">
                <Input
                  label="Exam Type Name"
                  placeholder="Enter exam type here..."
                  {...register("examtype")}
                  error={errors?.examtype?.message}
                />
              </div>

              {/* Action Operations controls */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                  className="flex-1 rounded-md border border-gray-200 bg-white py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 outline-none"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  loading={loading}
                  ref={saveRef}
                  className="flex-1 rounded font-semibold text-black shadow-md transition-all hover:shadow-lg"
                  style={{
                    background: "var(--app-btn-primary)"
                  }}
                >
                  <SaveIcon className="mr-1.5 h-4 w-4 inline-block" />
                  Update Type
                </Button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};