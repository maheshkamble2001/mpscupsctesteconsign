import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Local Imports
import { Button, Input } from "components/ui";
import { Combobox } from "components/shared/form/Combobox";
import { Page } from "components/shared/Page";

// API Import
import { addExam } from "api/applicationmanagement/exam";

// Icons
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  PlusIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { getSubjectsDropdown } from "api/applicationmanagement/subject";
import { getExamTypesDropdown } from "api/applicationmanagement/examtype";

// ✅ Schema validation strictly typed for database protection
const schema = yup.object().shape({
  ExamName: yup.string().required("Exam name is required"),
  ExamShortName: yup.string().required("Short name is required"),
  ExamTypeId: yup.string().required("Exam type is required"),
  Stage: yup.string().required("Stage is required"),
  ExamMedium: yup.array().of(yup.string()).min(1, "At least one medium is required").required("Exam medium is required"),
  Subjects: yup.array().of(yup.string()).min(1, "Select at least one subject").required("Subjects are required"),
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
  MarkPerCorrect: yup
    .number()
    .typeError("Mark per correct must be a number")
    .required("Required")
    .positive("Must be greater than 0"),
  TotalMarks: yup
    .number()
    .typeError("Total marks must be a number")
    .required("Total marks is required")
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

export default function AddExam() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const srBlue = "#3368AF";

  const [examTypes, setExamTypes] = useState([]);
  const [stages] = useState([
    { label: "Prelims", value: "Prelims" },
    { label: "Mains", value: "Mains" },
    { label: "Both", value: "Both" },
  ]);
  const [mediums] = useState([
    { label: "English", value: "English" },
    { label: "Hindi", value: "Hindi" },
    { label: "Marathi", value: "Marathi" },
  ]);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Fetch API Dropdowns
  useEffect(() => {
    const fetchMasterMetadataContext = async () => {
      try {
        const [subjectRes, examTypeRes] = await Promise.all([
          getSubjectsDropdown(),
          getExamTypesDropdown()
        ]);

        if (subjectRes?.data) {
          const formattedSubjects = subjectRes.data.map(sub => ({
            label: sub.label || sub.subjectName,
            value: String(sub.value || sub.id)
          }));
          setAvailableSubjects(formattedSubjects);
        }

        if (examTypeRes?.data) {
          const formattedExams = examTypeRes.data.map(exam => ({
            label: exam.label || exam.examTypeName,
            value: String(exam.value || exam.id)
          }));
          setExamTypes(formattedExams);
        }
      } catch (error) {
        console.error("Master Metadata Fetch Failure Context:", error);
        toast.error("Failed to load category taxonomy dependencies");
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
    setValue,
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ExamName: "",
      ExamShortName: "",
      ExamTypeId: "",
      Stage: "",
      ExamMedium: [],
      Subjects: [],
      Duration: "",
      TotalQuestions: "",
      MarkPerCorrect: "",
      TotalMarks: "",
      NegativeMark: "",
      CuttOff: "",
    },
  });

  // Watch input targets for dynamic auto-calculation engine
  const watchedTotalQuestions = watch("TotalQuestions");
  const watchedMarkPerCorrect = watch("MarkPerCorrect");

  // Automated Formula Engine: Total Questions * Mark Per Correct = Total Marks
  useEffect(() => {
    const questions = parseFloat(watchedTotalQuestions);
    const marksPerQuestion = parseFloat(watchedMarkPerCorrect);

    if (!isNaN(questions) && !isNaN(marksPerQuestion)) {
      const calculatedTotal = Number((questions * marksPerQuestion).toFixed(2));
      setValue("TotalMarks", calculatedTotal, { shouldValidate: true });
    } else {
      setValue("TotalMarks", "");
    }
  }, [watchedTotalQuestions, watchedMarkPerCorrect, setValue]);

  const handleAddExam = async (data) => {
    try {
      setIsLoading(true);
      
      const payload = {
        ExamName: data.ExamName,
        ExamShortName: data.ExamShortName,
        ExamTypeId: data.ExamTypeId,
        Stage: data.Stage,
        Duration: data.Duration,
        TotalQuestions: data.TotalQuestions,
        MarkPerCorrect: data.MarkPerCorrect,
        TotalMarks: data.TotalMarks, // Form state holds the accurate auto-calculated value
        NegativeMark: data.NegativeMark,
        CuttOff: data.CuttOff,
        ExamMedium: data.ExamMedium?.join(','),
        Subjects: data.Subjects,
      };

      const res = await addExam(payload);

      if (res?.code === 200) {
        toast.success(res.message || "Exam profile created successfully");
        navigate("/applicationmanagement/manage-exams");
      } else {
        toast.error(res?.message || "Failed to create exam record");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Transmission Error:", err);
      toast.error("A network error occurred while processing the request");
      setIsLoading(false);
    }
  };

  return (
    <Page title="Add Exam">
      <div
        className="min-h-screen w-full px-4 py-8 sm:px-8"
        style={{
          background: "linear-gradient(135deg, rgb(242, 247, 253), rgb(255, 240, 240))",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group mb-6 flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-white/80 px-4 py-2 text-gray-600 shadow-sm backdrop-blur-sm transition-colors hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back to Exams</span>
          </button>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-5 sm:px-8 sm:py-6">
              <div className="flex items-center gap-3">
                <div
                  className="rounded-xl p-2"
                  style={{ backgroundColor: `${srBlue}10` }}
                >
                  <PlusIcon className="h-6 w-6" style={{ color: srBlue }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    Add Exam
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Fill out the configuration parameters to structure a new examination profile
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(handleAddExam)} className="p-6 sm:p-8">
              {/* Block Segment 1: Basic Information */}
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <DocumentTextIcon className="h-5 w-5" style={{ color: srBlue }} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Basic Information
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    {...register("ExamName")}
                    label="Exam Name"
                    placeholder="Enter full descriptive name"
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
                    name="Stage"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Combobox
                        data={stages}
                        highlight
                        label="Stage"
                        placeholder="Select stage"
                        value={stages.find((s) => s.value === value) || null}
                        onChange={(val) => onChange(val?.value || "")}
                        displayField="label"
                        searchFields={["label"]}
                        error={errors?.Stage?.message}
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
                        multiple
                        label="Exam Medium"
                        placeholder="Select medium"
                        value={mediums.filter((m) => value?.includes(m.value))}
                        onChange={(val) => {
                          const selectedValues = Array.isArray(val) ? val.map((item) => item.value) : val ? [val.value] : [];
                          onChange(selectedValues);
                        }}
                        displayField="label"
                        searchFields={["label"]}
                        error={errors?.ExamMedium?.message}
                        className="rounded-lg"
                        required
                      />
                    )}
                  />

                  <Controller
                    name="Subjects"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Combobox
                        data={availableSubjects}
                        highlight
                        multiple
                        label="Subjects"
                        placeholder="Select subject"
                        value={availableSubjects.filter((s) => value?.includes(s.value))}
                        onChange={(val) => {
                          const selectedValues = Array.isArray(val) ? val.map((item) => item.value) : val ? [val.value] : [];
                          onChange(selectedValues);
                        }}
                        displayField="label"
                        searchFields={["label"]}
                        error={errors?.Subjects?.message}
                        className="rounded-lg"
                        required
                      />
                    )}
                  />
                </div>
              </div>

              {/* Block Segment 2: Structure, Timing & Marks */}
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <ClockIcon className="h-5 w-5" style={{ color: srBlue }} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Structure & Timing
                  </h3>
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
                    {...register("MarkPerCorrect")}
                    type="number"
                    step="0.01"
                    label="Mark Per Correct"
                    placeholder="e.g. 2"
                    error={errors?.MarkPerCorrect?.message}
                    required
                  />
                </div>
              </div>

              {/* Block Segment 3: Marking Scheme Calculations */}
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <CheckBadgeIcon className="h-5 w-5" style={{ color: srBlue }} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Marking Scheme
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <Input
                    {...register("TotalMarks")}
                    type="number"
                    step="0.01"
                    label="Total Marks (Auto-calculated)"
                    placeholder="Total Marks"
                    error={errors?.TotalMarks?.message}
                    disabled // System generated field to avoid human computation drift
                    className="bg-gray-100/80 cursor-not-allowed font-semibold text-gray-700"
                    required
                  />

                  <Input
                    {...register("NegativeMark")}
                    type="number"
                    step="0.01"
                    label="Negative Marking"
                    placeholder="e.g. -0.25"
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
                  className="cursor-pointer rounded text-black shadow-md transition-all hover:shadow-lg font-medium"
                  style={{
                    background: `var(--app-btn-primary)`,
                  }}
                >
                  <PlusIcon className="mr-1 inline-block h-4.5 w-4.5 " />
                  Save Exam
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Page>
  );
}