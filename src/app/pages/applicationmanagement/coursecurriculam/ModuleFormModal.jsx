import React, { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon, Bars3BottomLeftIcon, PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input, Button } from "components/ui";
import { toast } from "sonner";
import { addCourseCurriculum, editCourseCurriculum } from "api/applicationmanagement/coursecarriculam";

export const ModuleFormModal = ({ isOpen, onClose, editData, onSave }) => {
    const [loading, setLoading] = useState(false);
    const actionButtonRef = useRef(null);

    const schema = yup.object().shape({
        title: yup.string().required("Module title description label is required"),
        duration: yup.string().required("Time duration allocation metric is required (e.g., 2 Weeks)"),
        description: yup.string().optional(),
    });

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: { title: "", duration: "", description: "" },
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        if (editData) {
            setValue("title", editData.ModuleName);
            setValue("duration", editData.Duration);
            setValue("description", editData.Description || "");
        } else {
            reset({ title: "", duration: "", description: "" });
        }
    }, [editData, isOpen, setValue, reset]);

    const onSubmitForm = async (data) => {
        try {
            setLoading(true);
            let res = null;
            const payload = {
                ModuleName: data.title,
                Duration: data.duration,
                CourseCarriculam: data.description,
                CourseId: editData?.CourseId || null,
            };
            if (editData?.ModuleName) {
                res = await editCourseCurriculum({ ...payload, CurriculumId: editData.CurriculumId });
            } else {
                res = await addCourseCurriculum(payload);
            }
            if (res?.code === 200) {
                toast.success(res?.message || `Module ${editData?.ModuleName ? "updated" : "added"} successfully`);
                onSave();
            } else {
                toast.error(res?.message || `Failed to ${editData?.ModuleName ? "update" : "add"} module`);
            }
            reset();
            onClose();
        } catch (error) {
            console.error("Failed handling module form transaction payload:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            {/* Increased max-w-lg to max-w-4xl to accommodate the single row layout nicely */}
            <Dialog as="div" className="fixed inset-0 z-[105] flex items-center justify-center px-4 py-6 sm:px-5" onClose={() => { reset(); onClose(); }} initialFocus={actionButtonRef}>
                <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                    <DialogPanel className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl bg-white" style={{ background: "linear-gradient(135deg, #ffffff, #fafdff)" }}>
                        <div className="px-6 pt-5 pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, rgba(51,104,175,0.08), rgba(0,0,0,0.02))" }}>
                                        <Bars3BottomLeftIcon className="h-5 w-5" style={{ color: "#3368AF" }} />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-lg font-bold text-gray-900">
                                            {editData?.ModuleName ? "Update Syllabus Module" : "Configure Syllabus Module"}
                                        </DialogTitle>
                                        <p className="text-xs text-gray-500 mt-0.5">Design computational tracking benchmarks for lessons</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => { reset(); onClose(); }} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-all"><XMarkIcon className="h-5 w-5" /></button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmitForm)} className="px-6 pb-6 space-y-4 mt-3">
                            {/* Setting grid-cols-1 forces every child div to take up 100% of the row width */}
                            <div className="grid grid-cols-1 gap-4">

                                {/* Field 1: Title */}
                                <div>
                                    <Input label="Module Unit Heading" placeholder="e.g., Intro to Web Frameworks" {...register("title")} error={errors?.title?.message} />
                                </div>

                                {/* Field 2: Duration */}
                                <div>
                                    <Input label="Estimated Term" type="number" placeholder="e.g., 2 Weeks" {...register("duration")} error={errors?.duration?.message} />
                                </div>

                                {/* Field 3: Description */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Targets / Milestone Objectives</label>
                                    <textarea rows={4} placeholder="Map subcategories, textbook indexes, or tracking goals..." {...register("description")} className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium focus:outline-none resize-none transition-all ${errors?.description ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-slate-400"}`} />
                                    {errors?.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                                </div>

                            </div>

                            {/* Buttons Footer */}
                            <div className="mt-6 flex gap-3 pt-2">
                                <button type="button" onClick={() => { reset(); onClose(); }} className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all outline-none">Cancel</button>
                                <Button type="submit" loading={loading} ref={actionButtonRef} className="flex-1 rounded-xl font-semibold text-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5" style={{ background: "var(--app-btn-primary)" }}>
                                    {editData?.ModuleName ? <><CheckIcon className="h-4 w-4 stroke-[2.5]" /> Update Module</> : <><PlusIcon className="h-4 w-4 stroke-[2.5]" /> Append Unit</>}
                                </Button>
                            </div>
                        </form>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
};