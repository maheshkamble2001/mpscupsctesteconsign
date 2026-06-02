import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Local UI Infrastructure Components
import { Button, Input } from "components/ui";
import { Combobox } from "components/shared/form/Combobox";
import { Page } from "components/shared/Page";

// Visual Language Asset Icons
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    ClockIcon,
    CheckBadgeIcon,
    CheckIcon,
} from "@heroicons/react/24/outline";

// Actual API Import
import { editExam } from "api/applicationmanagement/exam";

// Validation Rules Engine Setup
const schema = yup.object().shape({
    ExamName: yup.string().required("Exam name is required"),
    ExamShortName: yup.string().required("Short name is required"),
    ExamTypeId: yup.string().required("Exam type is required"),
    ExamMedium: yup.string().required("Exam medium is required"),
    Stage: yup.string().required("Stage is required"),
    Duration: yup
        .number()
        .typeError("Duration must be a valid number")
        .required("Duration is required")
        .positive("Duration must be greater than 0"),
    TotalQuestions: yup
        .number()
        .typeError("Total questions must be a number")
        .required("Total questions is required")
        .positive("Must be greater than 0"),
    TotalMarks: yup
        .number()
        .typeError("Total marks must be a number")
        .required("Total marks is required")
        .positive("Must be greater than 0"),
    MarkPerCorrect: yup
        .number()
        .typeError("Mark per correct must be a number")
        .required("Required")
        .positive("Must be greater than 0"),
    NegativeMark: yup
        .number()
        .typeError("Negative mark must be a number")
        .required("Required"),
    CuttOff: yup
        .number()
        .typeError("Cut off must be a number")
        .required("Required")
        .min(0, "Cannot be negative"),
});

export default function UpdateExam() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);

    // Default dummy data for dropdowns
    const [examTypes, setExamTypes] = useState([
        { label: "MPSC GROUP B", value: "1" },
        { label: "MPSC State Service", value: "2" },
    ]);
    const [mediums, setMediums] = useState([
        { label: "English", value: "English" },
        { label: "Hindi", value: "Hindi" },
        { label: "Marathi", value: "Marathi" },
        { label: "English,Marathi,Hindi", value: "English,Marathi,Hindi" },
        { label: "Bilingual", value: "English,Hindi" }
    ]);

    // Brand Palette Style Variable
    const srBlue = "#3368AF";

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            ExamName: "",
            ExamShortName: "",
            ExamTypeId: "",
            ExamMedium: "",
            Stage: "",
            Duration: "",
            TotalQuestions: "",
            TotalMarks: "",
            MarkPerCorrect: "",
            NegativeMark: "",
            CuttOff: "",
        },
    });

    // ✅ Initialize Data and Prefill exclusively from state (Table Row Data)
    useEffect(() => {
        const initializePageData = async () => {
            try {
                setIsPageLoading(true);

                // Yahan aage chalkar getExamTypesDropdown(), wagera call kar sakte ho

                if (location.state && Object.keys(location.state).length > 0) {
                    const initialData = location.state;

                    setValue("ExamName", initialData.ExamName || "");
                    setValue("ExamShortName", initialData.ExamShortName || "");
                    setValue("ExamTypeId", initialData.ExamTypeId ? String(initialData.ExamTypeId) : "");
                    setValue("Stage", initialData.Stage || "");

                    // "100 mins" string se sirf '100' extract karna
                    const parsedDuration = parseInt(initialData.Duration, 10);
                    setValue("Duration", isNaN(parsedDuration) ? "" : parsedDuration);

                    setValue("TotalQuestions", initialData.TotalQuestions ?? "");
                    setValue("TotalMarks", initialData.TotalMarks ?? "");
                    setValue("MarkPerCorrect", initialData.MarkPerCorrect ?? "");
                    setValue("NegativeMark", initialData.NegativeMark ?? "");
                    setValue("CuttOff", initialData.CuttOff ?? "");
                    setValue("ExamMedium", initialData.ExamMedium || "");
                } else {
                    toast.error("No valid exam payload found in routing context");
                    navigate("/applicationmanagement/manage-exams");
                }
            } catch (err) {
                console.error("Initialization Error:", err);
                toast.error("Failed to compile layout parameters");
            } finally {
                setIsPageLoading(false);
            }
        };

        initializePageData();
    }, [location.state, setValue, navigate]);

    // ✅ Form Submission Engine
    const handleUpdateExamSubmit = async (data) => {
        try {
            setIsLoading(true);

            // Extract subjects safely against nested payload variables
            const subjectsArray = location?.state?.Subjects && Array.isArray(location.state.Subjects) 
                ? location.state.Subjects.map(s => s?.SubjectID || s?.id || s)
                : [1, 2, 3, 4, 5, 6, 7];

            // Payload generated matching your API exactly
            const payload = {
                ExamId: location?.state?.exam_id || Number(id),
                ExamName: data.ExamName,
                ExamShortName: data.ExamShortName,
                ExamTypeId: Number(data.ExamTypeId),
                Stage: data.Stage,
                Duration: Number(data.Duration),
                TotalMarks: Number(data.TotalMarks),
                TotalQuestions: Number(data.TotalQuestions),
                MarkPerCorrect: Number(data.MarkPerCorrect),
                NegativeMark: Number(data.NegativeMark),
                CuttOff: Number(data.CuttOff),
                ExamMedium: data.ExamMedium,
                Subjects: subjectsArray,
            };

            const res = await editExam(payload);
            
            if (res?.code === 200) {
                toast.success(res.message || `Exam parameters updated successfully`);
                setIsLoading(false); // Clear before navigation to prevent memory leak
                navigate(-1);
                return; // Stop execution to ensure block remains clean
            } else {
                toast.error(res?.message || "Failed to update exam record");
                setIsLoading(false);
            }
        } catch (err) {
            console.error("Transmission Error:", err);
            toast.error("An operational error occurred while updating records");
            setIsLoading(false);
        }
    };

    if (isPageLoading) {
        return (
            <Page title="Edit Exam">
                <div className="flex min-h-screen w-full items-center justify-center bg-gray-50/50">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                        <p className="text-sm font-medium text-gray-500">Hydrating exam data parameters...</p>
                    </div>
                </div>
            </Page>
        );
    }

    return (
        <Page title="Edit Exam">
            <div
                className="min-h-screen w-full px-4 py-8 sm:px-8"
                style={{ background: "linear-gradient(135deg, rgb(242, 247, 253), rgb(255, 240, 240))" }}
            >
                <div className="mx-auto max-w-7xl">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="group mb-6 flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-white/80 px-4 py-2 text-gray-600 shadow-sm backdrop-blur-sm transition-colors hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-medium">Back to Manage Exams</span>
                    </button>

                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-5 sm:px-8 sm:py-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl p-2" style={{ backgroundColor: `${srBlue}10` }}>
                                    <PencilSquareIcon className="h-6 w-6" style={{ color: srBlue }} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Update Exam Parameters</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Modify exam configuration, timing structures, and grading parameters.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(handleUpdateExamSubmit)} className="p-6 sm:p-8">

                            {/* Block Segment 1: Basic Information */}
                            <div className="mb-8">
                                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                    <DocumentTextIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    <Input
                                        {...register("ExamName")}
                                        label="Exam Name"
                                        placeholder="Enter exam full name"
                                        error={errors?.ExamName?.message}
                                        required
                                    />

                                    <Input
                                        {...register("ExamShortName")}
                                        label="Short Name"
                                        placeholder="e.g. SSC, UPSC"
                                        error={errors?.ExamShortName?.message}
                                        required
                                    />

                                    <Input
                                        {...register("Stage")}
                                        label="Stage"
                                        placeholder="e.g. MPSC, Prelims"
                                        error={errors?.Stage?.message}
                                        required
                                    />

                                    <Controller
                                        name="ExamTypeId"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <Combobox
                                                data={examTypes}
                                                highlight
                                                label="Exam Type"
                                                placeholder="Select exam type"
                                                value={examTypes.find((t) => String(t.value) === String(value)) || null}
                                                onChange={(val) => onChange(val?.value || "")}
                                                displayField="label"
                                                searchFields={["label"]}
                                                error={errors?.ExamTypeId?.message}
                                                className="rounded-lg"
                                                required
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="ExamMedium"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <Combobox
                                                data={mediums}
                                                highlight
                                                label="Exam Medium"
                                                placeholder="Select medium"
                                                value={mediums.find((m) => m.value === value) || null}
                                                onChange={(val) => onChange(val?.value || "")}
                                                displayField="label"
                                                searchFields={["label"]}
                                                error={errors?.ExamMedium?.message}
                                                className="rounded-lg"
                                                required
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Block Segment 2: Structure & Timing */}
                            <div className="mb-8">
                                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                    <ClockIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Structure & Timing</h3>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-3">
                                    <Input
                                        {...register("Duration")}
                                        type="number"
                                        label="Duration (Minutes)"
                                        placeholder="e.g. 100"
                                        error={errors?.Duration?.message}
                                        required
                                    />

                                    <Input
                                        {...register("TotalQuestions")}
                                        type="number"
                                        label="Total Questions"
                                        placeholder="e.g. 50"
                                        error={errors?.TotalQuestions?.message}
                                        required
                                    />

                                    <Input
                                        {...register("TotalMarks")}
                                        type="number"
                                        step="0.01"
                                        label="Total Marks"
                                        placeholder="e.g. 100.22"
                                        error={errors?.TotalMarks?.message}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Block Segment 3: Marking Scheme */}
                            <div className="mb-8">
                                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                    <CheckBadgeIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Marking Scheme</h3>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-3">
                                    <Input
                                        {...register("MarkPerCorrect")}
                                        type="number"
                                        step="0.01"
                                        label="Mark Per Correct"
                                        placeholder="e.g. 2"
                                        error={errors?.MarkPerCorrect?.message}
                                        required
                                    />

                                    <Input
                                        {...register("NegativeMark")}
                                        type="number"
                                        step="0.01"
                                        label="Negative Marking"
                                        placeholder="e.g. -1"
                                        error={errors?.NegativeMark?.message}
                                        required
                                    />

                                    <Input
                                        {...register("CuttOff")}
                                        type="number"
                                        step="0.01"
                                        label="Cut Off Marks"
                                        placeholder="e.g. 35"
                                        error={errors?.CuttOff?.message}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Action Buttons Footer Block */}
                            <div className="flex flex-col justify-end gap-3 border-t border-gray-200 pt-6 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    className="rounded text-white shadow-md transition-all hover:shadow-lg font-medium cursor-pointer"
                                    style={{ background: `var(--app-btn-primary)` }}
                                >
                                    <CheckIcon className="mr-1 inline-block h-4.5 w-4.5 text-white" />
                                    Save changes
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </Page>
    );
}
