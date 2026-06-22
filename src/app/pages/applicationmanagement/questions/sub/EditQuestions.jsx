import React, { useEffect, useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
  PencilSquareIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ListBulletIcon,
  CheckIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import { getSubjectsDropdown } from "api/applicationmanagement/subject";
import { getExamTypesDropdown } from "api/applicationmanagement/examtype";
import { editQuestion } from "api/applicationmanagement/questions";

// Validation Rules Engine Setup
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
    .min(4, "An assessment requires exactly 4 options")
    .max(4, "An assessment requires exactly 4 options"),
  correctOptionIndex: yup
    .string()
    .required("You must allocate a designated correct target option"),
  explanation: yup.string().required("Providing an answer rationale explanation is required"),
});

export default function UpdateQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Dynamic Master Collection Arrays State Management
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [examTypeOptions, setExamTypeOptions] = useState([]);

  // Brand Palette Style Variable
  const srBlue = "#3368AF";

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      questionText: "",
      subjectId: "",
      examTypeId: "",
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctOptionIndex: "0",
      explanation: "",
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "options",
  });

  const currentOptions = watch("options");

  const correctOptionDropdownItems = currentOptions.map((_, index) => ({
    label: `Option ${String.fromCharCode(65 + index)}`,
    value: String(index),
  }));

  // ✅ Initialize Data and Prefill exclusively from state matching your JSON structure
  useEffect(() => {
    const initializePageData = async () => {
      try {
        setIsPageLoading(true);

        // 1. Resolve configuration dropdown arrays simultaneously
        const [subjectRes, examTypeRes] = await Promise.all([
          getSubjectsDropdown(),
          getExamTypesDropdown(),
        ]);

        if (subjectRes?.data) {
          setSubjectOptions(
            subjectRes.data.map((sub) => ({
              label: sub.label || sub.subjectName,
              value: String(sub.value || sub.id),
            }))
          );
        }

        if (examTypeRes?.data) {
          setExamTypeOptions(
            examTypeRes.data.map((exam) => ({
              label: exam.label || exam.examTypeName,
              value: String(exam.value || exam.id),
            }))
          );
        }

        // 2. Hydrate form state EXCLUSIVELY from route location state
        if (location.state && Object.keys(location.state).length > 0) {
          const initialData = location.state;

          // Target exact keys from your specific payload: Option1, Option2, Option3, Option4
          const rawOptions = [
            initialData.Option1 || "",
            initialData.Option2 || "",
            initialData.Option3 || "",
            initialData.Option4 || "",
          ];

          // Map your specific data-row properties directly into React Hook Form values
          setValue("questionText", initialData.Question || "");
          setValue("subjectId", initialData.SubjectId ? String(initialData.SubjectId) : "");
          setValue("examTypeId", initialData.ExamTypeId ? String(initialData.ExamTypeId) : "");
          setValue("explanation", initialData.AnswerDesc || "");

          if (rawOptions[0] || rawOptions[1]) {
            setValue("options", rawOptions.map(txt => ({ text: txt })));
            
            // Matches "B. R. Ambedkar" against the raw options array to instantly find index 2
            const correctVal = initialData.CorrectOption || "";
            const matchIndex = rawOptions.findIndex(opt => opt === correctVal);
            setValue("correctOptionIndex", matchIndex >= 0 ? String(matchIndex) : "0");
          }
        } else {
          toast.error("No valid question payload found in routing state context");
          navigate("/questionbank/manage-questions");
        }
      } catch (err) {
        console.error("Initialization Flow Failure Architecture:", err);
        toast.error("Failed to compile layout parameters configurations");
      } finally {
        setIsPageLoading(false);
      }
    };

    initializePageData();
  }, [location.state, setValue, navigate]);

  // ✅ Form Submission Put Engine
  const handleUpdateQuestionSubmit = async (data, selectedStatus) => {
    try {
      setIsLoading(true);

      const option1Text = data.options[0]?.text || "";
      const option2Text = data.options[1]?.text || "";
      const option3Text = data.options[2]?.text || "";
      const option4Text = data.options[3]?.text || "";

      const selectedCorrectIndex = parseInt(data.correctOptionIndex, 10);
      const correctOptionString = data.options[selectedCorrectIndex]?.text || "";

      // Reassembles client state arrays back into your expected database properties
      const payload = {
        QuestionID: location?.state?.QuestionID || id,
        Question: data.questionText,
        Option1: option1Text,
        Option2: option2Text,
        Option3: option3Text,
        Option4: option4Text,
        CorrectOption: correctOptionString,
        ExamTypeId: parseInt(data.examTypeId, 10),
        SubjectId: parseInt(data.subjectId, 10),
        AnswerDesc: data.explanation,
        Status: selectedStatus,
        TestID: 1,
      };

      const res = await editQuestion(payload);

      if (res?.code === 200 || res?.status === "success" || res?.success) {
        toast.success(`Question metrics updated successfully as ${selectedStatus}`);
        navigate(-1);
      } else {
        toast.error(res?.message || "Failed to commit updated dataset entry row");
      }
    } catch (err) {
      console.error("Transmission Error Block:", err);
      toast.error("An operational error occurred updating records data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <Page title="Edit Question">
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-50/50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-sm font-medium text-gray-500">Hydrating question data parameters...</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Edit Question">
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
                  <PencilSquareIcon className="h-6 w-6" style={{ color: srBlue }} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Update Question Parameters</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Modify database query statements, reconstruct response vectors, and map criteria elements.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="p-6 sm:p-8">
              
              {/* Question Text */}
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

              {/* Options mapping loop */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <ListBulletIcon className="h-5 w-5" style={{ color: srBlue }} />
                    <h3 className="text-lg font-semibold text-gray-800">Answer Options</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <Input
                          {...register(`options.${index}.text`)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          error={errors?.options?.[index]?.text?.message}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct option index matching allocation */}
              <div className="mb-8 max-w-md">
                <Controller
                  name="correctOptionIndex"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      data={correctOptionDropdownItems}
                      highlight
                      label="Correct Answer"
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

              {/* Explanation Textarea mapped to AnswerDesc */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                  <InformationCircleIcon className="h-5 w-5" style={{ color: srBlue }} />
                  <h3 className="text-lg font-semibold text-gray-800">Answer Explanation</h3>
                </div>
                <Textarea
                  {...register("explanation")}
                  label="Explanation "
                  placeholder="Explain step-by-step logic detailing why this solution is valid..."
                  rows={4}
                  error={errors?.explanation?.message}
                  required
                />
              </div>

              {/* Taxonomy Select Parameters */}
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
                        placeholder="Select target subject validation field"
                        value={subjectOptions.find((sub) => sub.value === value) || null}
                        onChange={(val) => onChange(val?.value || "")}
                        displayField="label"
                        searchFields={["label"]}
                        error={errors?.subjectId?.message}
                        className="rounded-lg"
                        required
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
                        placeholder="Select criteria examination map"
                        value={examTypeOptions.find((ex) => ex.value === value) || null}
                        onChange={(val) => onChange(val?.value || "")}
                        displayField="label"
                        searchFields={["label"]}
                        error={errors?.examTypeId?.message}
                        className="rounded-lg"
                        required
                      />
                    )}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
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
                  onClick={handleSubmit((data) => handleUpdateQuestionSubmit(data, "review"))}
                  className="rounded border border-gray-300 bg-white text-gray-700 shadow-xs hover:bg-gray-50 transition-all font-medium"
                >
                  Send to Review
                </Button> */}

                <Button
                  type="button"
                  loading={isLoading}
                  onClick={handleSubmit((data) => handleUpdateQuestionSubmit(data, "published"))}
                  className="rounded text-black shadow-md hover:shadow-lg transition-all font-medium"
                  style={{ background: `var(--app-btn-primary)` }}
                >
                  <CheckIcon className="h-4.5 w-4.5 inline-block mr-1" />
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