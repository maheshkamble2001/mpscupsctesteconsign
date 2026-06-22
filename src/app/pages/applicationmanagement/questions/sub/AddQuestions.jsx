import React, { useEffect, useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Local UI Infrastructure Components
import { Button, Input, Textarea } from "components/ui";
import { Combobox } from "components/shared/form/Combobox";
import { Page } from "components/shared/Page";

// Visual Language Asset Icons
import {
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    ListBulletIcon,
    CheckIcon,
    InformationCircleIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";

// API Endpoints Integration Context
import { createQuestion } from "api/applicationmanagement/questions";
import { getSubjectsDropdown } from "api/applicationmanagement/subject";
import { getExamTypesDropdown } from "api/applicationmanagement/examtype";

// ✅ Validation Rules Engine Setup (Strictly 4 Options required for Backend Mapping)
const schema = yup.object().shape({
    questionText: yup.string().required("Question content description is required"),
    subjectId: yup.string().required("Subject category allocation is required"),
    examTypeId: yup.string().required("Exam type context target is required"),
    options: yup
        .array()
        .of(
            yup.object().shape({
                text: yup.string().required("Option content cannot be empty"),
            })
        )
        .min(4, "An assessment requires exactly 4 options to map to Option1-Option4 backend keys")
        .max(4, "An assessment requires exactly 4 options to map to Option1-Option4 backend keys"),
    correctOptionIndex: yup
        .string()
        .required("You must allocate a designated correct target option"),
    explanation: yup.string().required("Providing an answer rationale explanation is required"),
});

export default function AddQuestion() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Dynamic Master Collection Arrays State Management
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [examTypeOptions, setExamTypeOptions] = useState([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // Brand Palette
    const srBlue = "#3368AF";

    // Async API Pipeline Fetch Engine
    useEffect(() => {
        const fetchMasterMetadataContext = async () => {
            try {
                setIsDataLoading(true);
                const [subjectRes, examTypeRes] = await Promise.all([
                    getSubjectsDropdown(),
                    getExamTypesDropdown()
                ]);

                if (subjectRes?.data) {
                    const formattedSubjects = subjectRes.data.map(sub => ({
                        label: sub.label || sub.subjectName, 
                        value: String(sub.value || sub.id)
                    }));
                    setSubjectOptions(formattedSubjects);
                }

                if (examTypeRes?.data) {
                    const formattedExams = examTypeRes.data.map(exam => ({
                        label: exam.label || exam.examTypeName,
                        value: String(exam.value || exam.id)
                    }));
                    setExamTypeOptions(formattedExams);
                }
            } catch (error) {
                console.error("Master Metadata Fetch Failure Context:", error);
                toast.error("Failed to load category taxonomy dependencies");
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchMasterMetadataContext();
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            questionText: "",
            subjectId: "", // Track by ID instead of plain string name
            examTypeId: "", // Track by ID instead of plain string name
            options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }], // Fixed 4 choice initial seed
            correctOptionIndex: "",
            explanation: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "options",
    });

    const currentOptions = watch("options");

    const correctOptionDropdownItems = currentOptions.map((_, index) => ({
        label: `Option ${String.fromCharCode(65 + index)}`,
        value: String(index),
    }));

    // ✅ Form Submit Action Handler - Configured to bind perfectly with your backend API
    const handleAddQuestionSubmit = async (data, selectedStatus) => {
        try {
            setIsLoading(true);

            // 1. Map options array out to explicit flat parameters expected by Validator/Model
            const option1Text = data.options[0]?.text || "";
            const option2Text = data.options[1]?.text || "";
            const option3Text = data.options[2]?.text || "";
            const option4Text = data.options[3]?.text || "";

            // 2. Fetch the literal text value of the correct option choice string
            const selectedCorrectIndex = parseInt(data.correctOptionIndex, 10);
            const correctOptionString = data.options[selectedCorrectIndex]?.text || "";

            // 3. Assemble backend schema-compliant model body payload
            const payload = {
                Question: data.questionText,
                Option1: option1Text,
                Option2: option2Text,
                Option3: option3Text,
                Option4: option4Text,
                CorrectOption: correctOptionString, // Back-end expects the text, not the index
                ExamTypeId: parseInt(data.examTypeId, 10), // Back-end validation rule requires an integer
                SubjectId: parseInt(data.subjectId, 10), // Back-end validation rule requires an integer
                AnswerDesc: data.explanation, // Maps to Sequelize key configuration field
                TestID: 1 // Fallback default test parameter grouping index if required
            };

            const res = await createQuestion(payload);

            // Accept standard response conditions matching code wrappers
            if (res?.code === 200 || res?.status === "success" || res?.success) {
                toast.success(`Question successfully saved as ${selectedStatus}`);
                navigate("/applicationmanagement/manage-questions-bank");
            } else {
                toast.error(res?.message || "Failed to save question record");
            }
        } catch (err) {
            console.error("Submission Error Pipeline Context:", err);
            toast.error("Something went wrong processing request");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Page title="Add Question">
            <div
                className="w-full min-h-screen px-4 sm:px-8 py-8"
                style={{ background: "linear-gradient(135deg, rgb(242, 247, 253), rgb(255, 240, 240))" }}
            >
                <div className="max-w-7xl">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm"
                    >
                        <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Question Bank</span>
                    </button>

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl" style={{ backgroundColor: `${srBlue}10` }}>
                                    <PlusIcon className="h-6 w-6" style={{ color: srBlue }} />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add Question</h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Configure assessment data criteria, choices parameters, solutions context, and lifecycle target.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={(e) => e.preventDefault()} className="p-6 sm:p-8">

                            {/* Block Segment 1: Core Question Context */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                    <DocumentTextIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Assessment Description</h3>
                                </div>

                                <Textarea
                                    {...register("questionText")}
                                    label="Question"
                                    placeholder="Enter explicit description for the assessment puzzle or query text..."
                                    rows={4}
                                    error={errors?.questionText?.message}
                                    required
                                />
                            </div>

                            {/* Block Segment 2: Answer Options Selection */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <ListBulletIcon className="h-5 w-5" style={{ color: srBlue }} />
                                        <h3 className="text-lg font-semibold text-gray-800">Answer Options</h3>
                                    </div>
                                    {fields.length < 4 && (
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            onClick={() => append({ text: "" })}
                                            className="text-xs py-1 px-2.5 h-auto flex items-center gap-1"
                                        >
                                            <PlusIcon className="h-3.5 w-3.5" /> Add Option
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-start gap-3 items-center">
                                            <div className="flex-1">
                                                <Input
                                                    {...register(`options.${index}.text`)}
                                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                    error={errors?.options?.[index]?.text?.message}
                                                />
                                            </div>
                                            {fields.length > 4 && (
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition-colors mt-[2px]"
                                                    title="Delete Option"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {errors?.options?.message && (
                                        <p className="text-sm text-red-500 mt-1">{errors.options.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Block Segment 3: Correct Option Selector */}
                            <div className="mb-8 max-w-md">

                                <Controller
                                    name="correctOptionIndex"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <Combobox
                                            data={correctOptionDropdownItems}
                                            highlight
                                            label="Correct Answer "
                                            placeholder="Choose designated correct question alternative..."
                                            value={correctOptionDropdownItems.find((item) => item.value === value) || null}
                                            onChange={(val) => onChange(val?.value || "")}
                                            displayField="label"
                                            searchFields={["label"]}
                                            error={errors?.correctOptionIndex?.message}
                                            className="rounded-lg"
                                            required
                                        />
                                    )}
                                />
                            </div>

                            {/* Block Segment 4: Answer Explanation */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                    <InformationCircleIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Answer Explanation</h3>
                                </div>

                                <Textarea
                                    {...register("explanation")}
                                    label="Explanation "
                                    placeholder="Explain step-by-step logic detailing why this solution is mathematically or contextually valid..."
                                    rows={4}
                                    error={errors?.explanation?.message}
                                    required
                                />
                            </div>

                            {/* Block Segment 5: Taxonomy Mapping Parameters */}
                            <div className="mb-8">

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Controller
                                        name="subjectId"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <Combobox
                                                data={subjectOptions}
                                                highlight
                                                label="Subject"
                                                placeholder={isDataLoading ? "Loading subjects..." : "Select target subject validation field"}
                                                value={subjectOptions.find((sub) => sub.value === value) || null}
                                                onChange={(val) => onChange(val?.value || "")}
                                                displayField="label"
                                                searchFields={["label"]}
                                                error={errors?.subjectId?.message}
                                                className="rounded-lg"
                                                required
                                                disabled={isDataLoading}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="examTypeId"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <Combobox
                                                data={examTypeOptions}
                                                highlight
                                                label="Exam Type"
                                                placeholder={isDataLoading ? "Loading exams..." : "Select criteria examination map"}
                                                value={examTypeOptions.find((ex) => ex.value === value) || null}
                                                onChange={(val) => onChange(val?.value || "")}
                                                displayField="label"
                                                searchFields={["label"]}
                                                error={errors?.examTypeId?.message}
                                                className="rounded-lg"
                                                required
                                                disabled={isDataLoading}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons Footer Block */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => navigate("/applicationmanagement/manage-questions-bank")}
                                >
                                    Cancel
                                </Button>

                                {/* <Button
                                    type="button"
                                    variant="outlined"
                                    loading={isLoading}
                                    onClick={handleSubmit((data) => handleAddQuestionSubmit(data, "review"))}
                                    className="rounded border border-gray-300 bg-white text-gray-700 shadow-xs hover:bg-gray-50 transition-all font-medium"
                                >
                                    Save & Review
                                </Button> */}

                                <Button
                                    type="button"
                                    loading={isLoading}
                                    onClick={handleSubmit((data) => handleAddQuestionSubmit(data, "published"))}
                                    className="rounded text-black shadow-md hover:shadow-lg transition-all font-medium"
                                    style={{
                                        background: `var(--app-btn-primary)`,
                                    }}
                                >
                                    {/* <CheckIcon className="h-4.5 w-4.5 inline-block mr-1" /> */}
                                    Save 
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </Page>
    );
}