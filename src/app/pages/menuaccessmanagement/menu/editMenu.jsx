import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useRef, useState, useEffect } from "react";
import { XMarkIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input, Button } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { toast } from "sonner";

// ✅ API
import { menuAccessCodesEdit, getMenuModulesDropdown } from "api/menuaccessmanagement/menus";
import { BUTTON_CONFIG } from "constants/app2.constant";

const schema = yup.object().shape({
  moduleid: yup.string().required("Module name is required"),
  access_code: yup
    .number()
    .typeError("Access code is required")
    .required("Access code is required")
    .test("len", "Access code must be exactly 6 digits", (val) =>
      val ? val.toString().length === 6 : false
    ),
  access_name: yup.string().required("Access name is required"),
});

export const EditMenuModal = ({ isOpen, onClose, onSuccess, menuAccessCode }) => {
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const saveRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      moduleid: "",
      access_code: "",
      access_name: "",
    },
  });

  // 🔹 Fetch modules for dropdown
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await getMenuModulesDropdown();
        if (res.code === 200) {
          const { rows } = res.data.menumodules;
          const moduleOptions = rows.map(({ id, modulename }) => ({
            label: modulename,
            value: id,
          }));
          setModules(moduleOptions);
        }
      } catch (err) {
        console.error("Failed to fetch modules:", err);
      }
    };

    if (isOpen) fetchModules();
  }, [isOpen]);

  // 🔹 Prefill data when modal opens
  useEffect(() => {
    if (isOpen && menuAccessCode) {
      reset({
        moduleid: menuAccessCode.moduleid,
        access_code: menuAccessCode.access_code,
        access_name: menuAccessCode.access_name,
      });
    }
  }, [isOpen, menuAccessCode, reset]);

  // 🔹 Submit Handler
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        id: menuAccessCode.id,
        moduleid: data.moduleid,
        access_code: data.access_code,
        access_name: data.access_name,
      };

      const res = await menuAccessCodesEdit(payload);

      if (res?.code === 200) {
        toast.success(res.message || "Menu Access Code updated successfully");
        onSuccess?.();
        reset();
        onClose();
      } else {
        toast.error(res?.message || "Failed to update menu access code");
      }
    } catch (error) {
      console.error("Edit menu access code error:", error);
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
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #ffffff, #fef7f7)"
            }}
          >
            {/* Decorative top bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background: "linear-gradient(90deg, #3368AF, #FE4543)"
              }}
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
                      Edit Menu
                    </DialogTitle>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Update menu access code details
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
              <div className="space-y-4">
                {/* Module Name Dropdown */}
                <Controller
                  name="moduleid"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Listbox
                      label="Module Name"
                      data={modules}
                      value={modules.find((m) => m.value === value) || null}
                      onChange={(val) => onChange(val?.value ?? "")}
                      placeholder="Select Module"
                      displayField="label"
                      error={errors.moduleid?.message}
                      searchFields={["label"]}
                      highlight
                    />
                  )}
                />

                <Input
                  label="Access Code"
                  type="text"
                  placeholder="Enter 6 digit Access Code"
                  {...register("access_code")}
                  error={errors.access_code?.message}
                  maxLength={6}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  }}
                />

                <Input
                  label="Access Name"
                  placeholder="Enter Access Name"
                  {...register("access_name")}
                  error={errors.access_name?.message}
                />
              </div>

              {/* Info note */}
              <div className="mt-4 rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-blue-700">
                  💡 Update the access code details as needed.
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
                  className="flex-1 rounded font-semibold text-white shadow-md transition-all hover:shadow-lg bg-[image:var(--app-btn-primary)]"
                >
                  Update Menu
                </Button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};