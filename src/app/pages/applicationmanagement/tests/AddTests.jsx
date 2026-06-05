import React, { useEffect, useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Cookies from "js-cookie";

// Local Custom Framework UI/Form Imports
import { Button, Input } from "components/ui";
import { Combobox } from "components/shared/form/Combobox";
import { Page } from "components/shared/Page";

// Icons 
import {
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    AcademicCapIcon,
    ClockIcon,
    BookOpenIcon,
    AdjustmentsHorizontalIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/outline";

// API Layer Imports
import { addTest } from "api/applicationmanagement/tests";
import { encryptData } from "configs/encryption";
import { getExamDropdown } from "api/applicationmanagement/courses";
import { getSubjectsDropdown } from "api/applicationmanagement/subject";
import { getExamsDetails } from "api/applicationmanagement/exam";

// Validation Schema updated with all Sequelize attributes
const schema = yup.object().shape({
    TestName: yup.string().required("Test name is required"),
    TestType: yup.string().required("Test type is required"),
    ExamId: yup.string().required("Target exam allocation is required"),
    Duration: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? undefined : value))
        .typeError("Duration must be a numeric minute configuration")
        .integer("Duration must be a whole number value")
        .positive("Duration must be a positive limit parameter")
        .required("Duration time configuration is required"),
    Description: yup.string().nullable(),
    Tags: yup.string().nullable(),
    noOfQuestions: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? 0 : value))
        .typeError("Must be a valid number")
        .integer("Must be a whole number")
        .min(0, "Cannot be negative"),
    marksPerQuestion: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? 0 : value))
        .typeError("Must be a numeric metric value")
        .min(0, "Cannot be negative"),
    negativeMarks: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? 0 : value))
        .typeError("Must be a numeric metric value"),
    Attempts: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? 0 : value))
        .typeError("Must be a whole number")
        .integer("Must be an integer")
        .min(0, "Use 0 for unlimited attempts"),
    isShuffle: yup.boolean(),
    isAnswerShuffle: yup.boolean(),
    isAllowReview: yup.boolean(),
    isShowWarningTimer: yup.boolean(),
    isDisableRightClick: yup.boolean(),
    languages: yup
        .array()
        .of(yup.string())
        .min(1, "Please select at least one language option")
        .required("Language tracking assignment is required"),
    subjects: yup
        .array()
        .of(
            yup.object().shape({
                SubjectId: yup.string().required("Subject selection is required"),
                questionCount: yup
                    .number()
                    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
                    .typeError("Count must be a number")
                    .integer("Must be a whole number")
                    .positive("Must be at least 1 question")
                    .required("Question distribution count is required"),
            })
        )
        .min(1, "At least one subject allocation matrix is required to construct this test framework"),
});

export default function AddTest() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
    const [exams, setExams] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [isQuestionCountManuallyEdited, setIsQuestionCountManuallyEdited] = useState(false);

    const navigate = useNavigate();
    const srBlue = "#3368AF";
    const [availableLanguages] = useState([
        { label: "English", value: "English" },
        { label: "Marathi", value: "Marathi" },
        { label: "Hindi", value: "Hindi" }
    ]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue,
        watch,
        getValues,
        clearErrors,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            TestName: "",
            TestType: "Regular",
            ExamId: "",
            Duration: "",
            Description: "",
            Tags: "",
            noOfQuestions: 0,
            marksPerQuestion: 0,
            negativeMarks: 0,
            Attempts: 0,
            isShuffle: false,
            isAnswerShuffle: false,
            isAllowReview: true,
            isShowWarningTimer: true,
            isDisableRightClick: false,
            languages: ["English"],
            subjects: [{ SubjectId: "", questionCount: "" }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "subjects",
    });

    // Track rows to determine selected values in real-time
    const watchedSubjects = watch("subjects") || [];

    useEffect(() => {
        if (!watchedSubjects) return;

        const totalCalculatedQuestions = watchedSubjects.reduce((accumulator, item) => {
            const parsedCount = parseInt(item?.questionCount, 10);
            return accumulator + (isNaN(parsedCount) ? 0 : parsedCount);
        }, 0);

        // Using shouldTouch: true along with shouldValidate ensures react-hook-form catches the form state mutations immediately
        setValue("noOfQuestions", totalCalculatedQuestions, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });
    }, [watchedSubjects, setValue, isQuestionCountManuallyEdited]);

    // 1. Load initial dropdown datasets
    const loadInitialDropdownData = async () => {
        try {
            const examRes = await getExamDropdown();
            if (examRes?.code === 200) {
                setExams(examRes.data.map((ex) => ({
                    label: ex.ExamName || "Unknown Exam",
                    value: String(ex.ExamId || ex.id),
                })));
            }
            const subjectRes = await getSubjectsDropdown();
            if (subjectRes?.code === 200) {
                setAvailableSubjects(subjectRes.data);
            } else {
                toast.error("No valid sub-allocation matrix datasets found for this course archetype");
            }
        } catch (error) {
            console.error("Error loading component dependency options datasets:", error);
            toast.error("Failed to fetch prerequisite configuration lists");
        }
    };

    useEffect(() => {
        loadInitialDropdownData();
    }, []);

    // 2. Handle Exam drop-down updates
    const handleExamChange = async (selectedExamId, hookFormOnChange) => {
        hookFormOnChange(selectedExamId);

        replace([{ SubjectId: "", questionCount: "" }]);
        setAvailableSubjects([]);

        if (!selectedExamId) return;

        try {
            setIsSubjectsLoading(true);
            const examRes = await getExamsDetails({ ExamId: selectedExamId });

            if (examRes?.code === 200 && examRes?.data) {
                const examBlueprint = examRes.data;

                setValue("Duration", examBlueprint.Duration || "");
                setValue("noOfQuestions", examBlueprint.TotalQuestions || 0);
                setValue("marksPerQuestion", examBlueprint.MarkPerCorrect || 0);

                const calculatedNegative = examBlueprint.NegativeMark || 0;
                setValue("negativeMarks", calculatedNegative);

                if (examBlueprint.ExamMedium) {
                    const mappedLanguages = examBlueprint.ExamMedium.split(",").map(lang => lang.trim());
                    setValue("languages", mappedLanguages);
                }

                if (Array.isArray(examBlueprint.Subjects) && examBlueprint.Subjects.length > 0) {
                    const runtimeSubjects = examBlueprint.Subjects.map(sub => ({
                        label: sub.SubjectName?.trim() || "Unnamed Subject",
                        value: String(sub.SubjectId)
                    }));

                    setAvailableSubjects(runtimeSubjects);

                    const structures = examBlueprint.Subjects.map(sub => ({
                        SubjectId: String(sub.SubjectId),
                        questionCount: ""
                    }));
                    replace(structures);
                    return;
                }
            }
        } catch (error) {
            console.error("Error loading dynamic subjects matrix payload:", error);
            toast.error("Failed to load matching tracking modules.");
        } finally {
            setIsSubjectsLoading(false);
        }
    };

    // 3. Intercept Subject changes per dynamic row
    const handleSubjectChange = (index, selectedItem, hookFormOnChange, currentOldValue) => {
        const newValue = selectedItem?.value || "";
        hookFormOnChange(newValue);
    };


    const handleQuestionChange = (e, index) => {
        const value = Number(e.target.value);

        // Example 1: total calculation
        const subjects = getValues("subjects");

        const total = subjects.reduce(
            (sum, s) => sum + Number(s.questionCount || 0),
            0
        );

        setIsQuestionCountManuallyEdited(!isQuestionCountManuallyEdited);
        // Example 2: validation
        if (value < 0) {
            setError(`subjects.${index}.questionCount`, {
                message: "Cannot be negative"
            });
        } else {
            clearErrors(`subjects.${index}.questionCount`);
        }
    };

    // 4. Clean append method with validation rules
    const handleAddNewSubjectRow = () => {
        // Prevent appending if no exam or subjects are loaded yet
        if (!availableSubjects.length) {
            toast.error("Please select a Target Exam first to load subject lists.");
            return;
        }

        // Check if there's already an incomplete empty row waiting
        const hasEmptyRow = watchedSubjects.some(sub => !sub.SubjectId);
        if (hasEmptyRow) {
            toast.warning("Please choose a subject in your existing row before appending another.");
            return;
        }

        // Limit maximum dynamic rows to total number of available subjects fetched
        if (fields.length >= availableSubjects.length) {
            toast.error("All available subjects for this selected exam have already been allocated.");
            return;
        }
        setIsQuestionCountManuallyEdited(!isQuestionCountManuallyEdited)
        append({ SubjectId: "", questionCount: "" });
    };

    const handleAddTest = async (data) => {
        try {
            console.log("Form submission intercepted with data:", data);
            setIsLoading(true);
            const access_token = Cookies.get("access_token");
            const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";

            const processedLanguages = Array.isArray(data.languages) && data.languages.length > 0
                ? data.languages.join(",")
                : "English";

            const payload = {
                TestName: data.TestName,
                TestType: data.TestType,
                ExamId: Number(data.ExamId),
                Duration: Number(data.Duration),
                Description: data.Description || null,
                Tags: data.Tags || null,
                noOfQuestions: Number(data.noOfQuestions),
                marksPerQuestion: Number(data.marksPerQuestion),
                negativeMarks: Number(data.negativeMarks),
                Attempts: Number(data.Attempts),
                languages: processedLanguages,
                isShuffle: data.isShuffle,
                isAnswerShuffle: data.isAnswerShuffle,
                isAllowReview: data.isAllowReview,
                isShowWarningTimer: data.isShowWarningTimer,
                isDisableRightClick: data.isDisableRightClick,
                isDeleted: false,
                subjects: data.subjects.map((sub) => ({
                    SubjectId: Number(sub.SubjectId),
                    questionCount: Number(sub.questionCount)
                })),
                access_token: access_token
            };


            const res = await addTest(payload);

            if (res?.code === 200) {
                toast.success("Test added successfully");
                navigate("/applicationmanagement/manage-tests");
            } else {
                toast.error(res?.message || "Failed to finalize test configuration layout parameters");
            }
        } catch (err) {
            console.error("Critical submission failure intercepted:", err);
            toast.error("An error occurred during transaction deployment execution");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Page title="Add Test Profile">
            <div
                className="w-full min-h-screen px-4 sm:px-8 py-8"
                style={{ background: "linear-gradient(135deg, rgb(242, 247, 253), rgb(255, 240, 240))" }}
            >
                <div className="max-w-7xl">
                    <button
                        type="button"
                        onClick={() => navigate("/applicationmanagement/manage-tests")}
                        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm"
                    >
                        <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Tests</span>
                    </button>

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl" style={{ backgroundColor: `${srBlue}10` }}>
                                    <PlusIcon className="h-6 w-6" style={{ color: srBlue }} />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add Test</h2>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(handleAddTest)} className="p-6 sm:p-8 space-y-8">
                            {/* BLOCK SEGMENT 1: Meta Properties */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                    <AcademicCapIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">General Specifications</h3>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input
                                        {...register("TestName")}
                                        label="Test Title"
                                        placeholder="Enter Test Title"
                                        error={errors?.TestName?.message}
                                        required
                                    />

                                    <div className="flex flex-col">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                            Test Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            {...register("TestType")}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-all focus:border-[#3368AF] focus:ring-1 focus:ring-[#3368AF] h-[38px]"
                                        >
                                            <option value="">Select Test Type</option>
                                            <option value="FullMock">Full Mock</option>
                                            <option value="Sectinal">Sectional Test</option>
                                            <option value="TopicWise">Topic-wise Test</option>
                                            <option value="PYQ">Previous Year Questions</option>
                                        </select>
                                    </div>

                                    <Controller
                                        name="ExamId"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <Combobox
                                                data={exams}
                                                highlight
                                                label="Target Exam"
                                                placeholder="Select exam"
                                                value={exams.find((ex) => String(ex.value) === String(value)) || null}
                                                onChange={(val) => handleExamChange(val?.value || "", onChange)}
                                                displayField="label"
                                                searchFields={["label"]}
                                                error={errors?.ExamId?.message}
                                                required
                                            />
                                        )}
                                    />

                                    <Input
                                        {...register("Duration")}
                                        type="number"
                                        label="Duration (Minutes)"
                                        placeholder="e.g., 180"
                                        error={errors?.Duration?.message}
                                        icon={<ClockIcon className="h-5 w-5 text-gray-400" />}
                                        required
                                    />

                                    <Controller
                                        name="languages"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <Combobox
                                                data={availableLanguages}
                                                highlight
                                                multiple
                                                label="Languages"
                                                placeholder="Select languages"
                                                value={availableLanguages.filter((lang) => value?.includes(lang.value))}
                                                onChange={(val) => {
                                                    const selectedValues = Array.isArray(val)
                                                        ? val.map((item) => item.value)
                                                        : val ? [val.value] : [];
                                                    onChange(selectedValues);
                                                }}
                                                displayField="label"
                                                searchFields={["label"]}
                                                error={errors?.languages?.message}
                                                className="rounded-lg"
                                                required
                                            />
                                        )}
                                    />

                                    <Input
                                        {...register("Tags")}
                                        label="Tags / Keywords"
                                        placeholder="e.g., Term1, Algebra, Final"
                                        error={errors?.Tags?.message}
                                    />

                                    <div className="sm:col-span-2 flex flex-col">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                            Description
                                        </label>
                                        <textarea
                                            {...register("Description")}
                                            rows={3}
                                            placeholder="Provide overview details or instructions regarding this test template..."
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-all focus:border-[#3368AF] focus:ring-1 focus:ring-[#3368AF]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* BLOCK SEGMENT 2: Marking Evaluation */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                    <AdjustmentsHorizontalIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Marking Rules & Bounds</h3>
                                </div>

                                <div className="grid gap-5 grid-cols-2 sm:grid-cols-4">
                                    <Input
                                        {...register("noOfQuestions")}
                                        type="number"
                                        label="Total Questions"
                                        placeholder="0"
                                        error={errors?.noOfQuestions?.message}
                                    />
                                    <Input
                                        {...register("marksPerQuestion")}
                                        type="number"
                                        step="0.01"
                                        label="Marks Per Question"
                                        placeholder="0"
                                        error={errors?.marksPerQuestion?.message}
                                    />
                                    <Input
                                        {...register("negativeMarks")}
                                        type="number"
                                        step="0.01"
                                        label="Negative Marks"
                                        placeholder="0"
                                        error={errors?.negativeMarks?.message}
                                    />
                                    <Input
                                        {...register("Attempts")}
                                        type="number"
                                        label="Allowed Attempts"
                                        placeholder="0"
                                        error={errors?.Attempts?.message}
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 italic mt-1.5 pl-1">
                                    * Note: Configuration of "0" inside allowed attempts specifies infinite attempts.
                                </p>
                            </div>

                            {/* BLOCK SEGMENT 3: System Behavioral Toggles */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                    <ShieldCheckIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Behavioral Flag Configurations</h3>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 bg-slate-50 p-5 rounded-xl border border-slate-200/60">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input type="checkbox" {...register("isShuffle")} className="w-4 h-4 text-[#3368AF] border-gray-300 rounded focus:ring-[#3368AF]" />
                                        <div className="text-sm font-medium text-gray-700">Shuffle Questions</div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input type="checkbox" {...register("isAnswerShuffle")} className="w-4 h-4 text-[#3368AF] border-gray-300 rounded focus:ring-[#3368AF]" />
                                        <div className="text-sm font-medium text-gray-700">Shuffle Answer Choices</div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input type="checkbox" {...register("isAllowReview")} className="w-4 h-4 text-[#3368AF] border-gray-300 rounded focus:ring-[#3368AF]" />
                                        <div className="text-sm font-medium text-gray-700">Allow Bookmark / Review</div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input type="checkbox" {...register("isShowWarningTimer")} className="w-4 h-4 text-[#3368AF] border-gray-300 rounded focus:ring-[#3368AF]" />
                                        <div className="text-sm font-medium text-gray-700">Show Warning Counter UI</div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input type="checkbox" {...register("isDisableRightClick")} className="w-4 h-4 text-[#3368AF] border-gray-300 rounded focus:ring-[#3368AF]" />
                                        <div className="text-sm font-medium text-gray-700">Prohibit Context Menu (Right-click)</div>
                                    </label>
                                </div>
                            </div>

                            {/* BLOCK SEGMENT 4: Dynamic Subject Distribution Array */}
                            <div>
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <BookOpenIcon className="h-5 w-5" style={{ color: srBlue }} />
                                        <h3 className="text-lg font-semibold text-gray-800">Subject Distribution Framework</h3>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddNewSubjectRow}
                                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                                    >
                                        <PlusIcon className="h-3.5 w-3.5" />
                                        Add Subject Matrix
                                    </button>
                                </div>

                                {isSubjectsLoading && (
                                    <p className="text-xs text-slate-500 animate-pulse pl-1 mb-2">Fetching dependent subject sets...</p>
                                )}

                                {errors?.subjects?.message && (
                                    <p className="text-xs font-semibold text-red-500 mb-4 bg-red-50 p-2.5 rounded-lg border border-red-100">
                                        {errors.subjects.message}
                                    </p>
                                )}

                                <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    {fields.map((field, index) => {
                                        // Gather all SubjectIds selected in OTHER rows
                                        const otherSelectedSubjectIds = watchedSubjects
                                            .filter((_, idx) => idx !== index)
                                            .map((sub) => String(sub?.SubjectId))
                                            .filter(Boolean);

                                        // Filter choices so selected items are hidden everywhere else
                                        const filteredSubjectsForThisRow = availableSubjects.filter(
                                            (sub) => !otherSelectedSubjectIds.includes(String(sub.value))
                                        );

                                        return (
                                            <div
                                                key={field.id}
                                                className="grid grid-cols-12 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/70 items-end shadow-xs"
                                            >
                                                <div className="col-span-12 sm:col-span-6">
                                                    <Controller
                                                        name={`subjects.${index}.SubjectId`}
                                                        control={control}
                                                        render={({ field: { value, onChange } }) => (
                                                            <Combobox
                                                                data={filteredSubjectsForThisRow}
                                                                highlight
                                                                disabled={isSubjectsLoading}
                                                                label={index === 0 ? "Subject Segment" : ""}
                                                                placeholder={availableSubjects.length ? "Select subject" : "Select an exam first"}
                                                                value={availableSubjects.find((s) => String(s.value) === String(value)) || null}
                                                                onChange={(val) => handleSubjectChange(index, val, onChange, value)}
                                                                displayField="label"
                                                                searchFields={["label"]}
                                                                error={errors?.subjects?.[index]?.SubjectId?.message}
                                                                required
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div className="col-span-10 sm:col-span-5">
                                                    <Input
                                                        {...register(`subjects.${index}.questionCount`, {
                                                            onChange: (e) => handleQuestionChange(e, index)
                                                        })}
                                                        type="number"
                                                        label={index === 0 ? "Allocated Questions" : ""}
                                                        placeholder="0"
                                                        error={errors?.subjects?.[index]?.questionCount?.message}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-span-2 sm:col-span-1 flex justify-center pb-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            remove(index)
                                                            setIsQuestionCountManuallyEdited(!isQuestionCountManuallyEdited);
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                        title="Remove execution boundary row"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* SUBMISSION ACTION BUTTONS */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isLoading}
                                    onClick={() => navigate("/applicationmanagement/manage-tests")}
                                    className="px-5 py-2 text-sm font-medium border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors rounded-lg"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-black shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
                                    style={{
                                        background: "var(--app-btn-primary)",
                                        fontSize: "14px",
                                    }} >
                                    {isLoading ? "Saving..." : "Add Test"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Page>
    );
}