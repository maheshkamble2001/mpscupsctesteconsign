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


// Icons
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
  PlusIcon,
  DocumentTextIcon,
  LinkIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { addUpcomingExam } from "api/applicationmanagement/upcomingexams";

// ✅ Schema validation strictly mapped for tbl_upcomingexams column types
const schema = yup.object().shape({
  ExamTitle: yup.string().max(500, "Title cannot exceed 500 characters").required("Exam Title is required"),
  Slug: yup.string().max(255, "Slug cannot exceed 255 characters").optional(),
  Organization: yup.string().max(100, "Organization cannot exceed 100 characters").required("Organization is required"),
  Category: yup.string().max(100, "Category cannot exceed 100 characters").required("Category is required"),
  ExamType: yup.string().oneOf(["State", "Central"], "Invalid type").required("Exam Type is required"),
  StateId: yup.string().when("ExamType", {
    is: "State",
    then: () => yup.string().required("State is required when Exam Type is 'State'"),
    otherwise: () => yup.string().nullable().optional(),
  }),
  NotificationDate: yup.date().typeError("Invalid date format").required("Notification date is required"),
  ApplicationStartDate: yup.date().typeError("Invalid date format").required("Application start date is required"),
  ApplicationEndDate: yup
    .date()
    .typeError("Invalid date format")
    .required("Application end date is required")
    .min(yup.ref("ApplicationStartDate"), "End date must be after start date"),
  ExamDate: yup
    .date()
    .typeError("Invalid date format")
    .required("Exam date is required")
    .min(yup.ref("ApplicationEndDate"), "Exam date must be after application closing date"),
  Status: yup.string().oneOf(["UPCOMING", "OPEN", "CLOSED"]).required("Status is required"),
  TotalPosts: yup
    .number()
    .typeError("Must be a valid number")
    .integer("Must be a whole number")
    .min(0, "Cannot be negative")
    .required("Total posts is required"),
  Eligibility: yup.string().required("Eligibility criteria is required"),
  Description: yup.string().optional(),
  OfficialURL: yup.string().url("Must be a valid URL").required("Official URL is required"),
  SyllabusURL: yup.string().url("Must be a valid URL").optional().nullable(),
});

export default function AddUpcomingExam() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const srBlue = "#3368AF";

  // Form Option States
  const [statesList, setStatesList] = useState([
  { label: "Andhra Pradesh", value: "1" },
  { label: "Arunachal Pradesh", value: "2" },
  { label: "Assam", value: "3" },
  { label: "Bihar", value: "4" },
  { label: "Chhattisgarh", value: "5" },
  { label: "Goa", value: "6" },
  { label: "Gujarat", value: "7" },
  { label: "Haryana", value: "8" },
  { label: "Himachal Pradesh", value: "9" },
  { label: "Jharkhand", value: "10" },
  { label: "Karnataka", value: "11" },
  { label: "Kerala", value: "12" },
  { label: "Madhya Pradesh", value: "13" },
  { label: "Maharashtra", value: "14" },
  { label: "Manipur", value: "15" },
  { label: "Meghalaya", value: "16" },
  { label: "Mizoram", value: "17" },
  { label: "Nagaland", value: "18" },
  { label: "Odisha", value: "19" },
  { label: "Punjab", value: "20" },
  { label: "Rajasthan", value: "21" },
  { label: "Sikkim", value: "22" },
  { label: "Tamil Nadu", value: "23" },
  { label: "Telangana", value: "24" },
  { label: "Tripura", value: "25" },
  { label: "Uttar Pradesh", value: "26" },
  { label: "Uttarakhand", value: "27" },
  { label: "West Bengal", value: "28" },
  { label: "Delhi (UT)", value: "29" },
  { label: "Jammu & Kashmir (UT)", value: "30" }
]);
  const [categories] = useState([
    { label: "Civil Services", value: "Civil" },
    { label: "Police / Defense", value: "Police" },
    { label: "Banking / Insurance", value: "Banking" },
    { label: "Railways", value: "Railways" },
    { label: "Staff Selection", value: "SSC" },
  ]);
  const [examTypes] = useState([
    { label: "Central Government", value: "Central" },
    { label: "State Government", value: "State" },
  ]);
  const [statusOptions] = useState([
    { label: "Upcoming", value: "UPCOMING" },
    { label: "Open (Apply Now)", value: "OPEN" },
    { label: "Closed", value: "CLOSED" },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ExamTitle: "",
      Slug: "",
      Organization: "",
      Category: "",
      ExamType: "",
      StateId: "",
      NotificationDate: "",
      ApplicationStartDate: "",
      ApplicationEndDate: "",
      ExamDate: "",
      Status: "UPCOMING",
      TotalPosts: 0,
      Eligibility: "",
      Description: "",
      OfficialURL: "",
      SyllabusURL: "",
    },
  });

  // Watch fields for automatic operations
  const watchedExamTitle = watch("ExamTitle");
  const watchedExamType = watch("ExamType");

  // Auto-generate clean URL slug from Exam Title
  useEffect(() => {
    if (watchedExamTitle) {
      const generatedSlug = watchedExamTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("Slug", generatedSlug, { shouldValidate: true });
    } else {
      setValue("Slug", "");
    }
  }, [watchedExamTitle, setValue]);

  // Fetch state master dependencies if needed
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await getStatesDropdown();
        if (res?.data) {
          const formattedStates = res.data.map(st => ({
            label: st.label || st.stateName,
            value: String(st.value || st.id)
          }));
          setStatesList(formattedStates);
        }
      } catch (error) {
        console.error("Failed to load states dropdown values:", error);
      }
    };
    fetchStates();
  }, []);

  const handleAddUpcomingExam = async (data) => {
    try {
      setIsLoading(true);

      // Clean payload explicitly configured to match database table design
      const payload = {
        ExamTitle: data.ExamTitle,
        Slug: data.Slug || null,
        Organization: data.Organization,
        Category: data.Category,
        ExamType: data.ExamType,
        StateId: data.ExamType === "State" ? Number(data.StateId) : null,
        NotificationDate: data.NotificationDate,
        ApplicationStartDate: data.ApplicationStartDate,
        ApplicationEndDate: data.ApplicationEndDate,
        ExamDate: data.ExamDate,
        Status: data.Status,
        TotalPosts: Number(data.TotalPosts),
        Eligibility: data.Eligibility,
        Description: data.Description || null,
        OfficialURL: data.OfficialURL,
        SyllabusURL: data.SyllabusURL || null,
        Source: "ADMIN", // Explicitly tag origin point as specified in enum
        IsActive: true,
        IsDeleted: false,
      };

      const res = await addUpcomingExam(payload);

      if (res?.code === 200) {
        toast.success(res.message || "Upcoming exam recorded successfully");
        navigate(-1);
      } else {
        toast.error(res?.message || "Failed to preserve exam record entry");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Payload Transmission Error:", err);
      toast.error("An operational error intercepted database persistence processing");
      setIsLoading(false);
    }
  };

  return (
    <Page title="Add Upcoming Exam">
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
            <span className="text-sm font-medium">Back to Listings</span>
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
                    Add Upcoming Exam
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Construct a new timeline tracking notice file using direct model structures.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(handleAddUpcomingExam)} className="p-6 sm:p-8">
              {/* Block Segment 1: Profile Classification */}
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <DocumentTextIcon className="h-5 w-5" style={{ color: srBlue }} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Primary Configurations
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="sm:col-span-2">
                    <Input
                      {...register("ExamTitle")}
                      label="Exam Title"
                      placeholder="e.g. UPSC Civil Services Examination 2026"
                      error={errors?.ExamTitle?.message}
                      required
                    />
                  </div>

                  <Input
                    {...register("Slug")}
                    label="URL Slug (Auto-generated)"
                    placeholder="url-slug-format"
                    error={errors?.Slug?.message}
                    className="bg-gray-50/80 font-mono text-xs"
                    required
                  />

                  <Input
                    {...register("Organization")}
                    label="Conducting Authority / Organization"
                    placeholder="e.g. UPSC, MPSC, IBPS"
                    error={errors?.Organization?.message}
                    required
                  />

                  <Controller
                    name="Category"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Combobox
                        data={categories}
                        highlight
                        label="Exam Category Domain"
                        placeholder="Select domain classification"
                        value={categories.find((c) => c.value === value) || null}
                        onChange={(val) => onChange(val?.value || "")}
                        displayField="label"
                        searchFields={["label"]}
                        error={errors?.Category?.message}
                        required
                      />
                    )}
                  />

                  <Controller
                    name="ExamType"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Combobox
                        data={examTypes}
                        highlight
                        label="Jurisdiction / Exam Type"
                        placeholder="Select jurisdiction"
                        value={examTypes.find((t) => t.value === value) || null}
                        onChange={(val) => {
                          onChange(val?.value || "");
                          if (val?.value !== "State") setValue("StateId", "");
                        }}
                        displayField="label"
                        searchFields={["label"]}
                        error={errors?.ExamType?.message}
                        required
                      />
                    )}
                  />

                  {/* Conditionally rendered based on ExamType choice */}
                  {watchedExamType === "State" && (
                    <Controller
                      name="StateId"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Combobox
                          data={statesList}
                          highlight
                          label="Target Demography State"
                          placeholder="Search state region"
                          value={statesList.find((s) => String(s.value) === String(value)) || null}
                          onChange={(val) => onChange(val?.value || "")}
                          displayField="label"
                          searchFields={["label"]}
                          error={errors?.StateId?.message}
                          required
                        />
                      )}
                    />
                  )}

                  <Input
                    {...register("TotalPosts")}
                    type="number"
                    label="Total Posts / Vacancies"
                    placeholder="0"
                    error={errors?.TotalPosts?.message}
                    required
                  />

                  <Controller
                    name="Status"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Combobox
                        data={statusOptions}
                        highlight
                        label="Current Gateway Status"
                        placeholder="Select status"
                        value={statusOptions.find((s) => s.value === value) || null}
                        onChange={(val) => onChange(val?.value || "")}
                        displayField="label"
                        searchFields={["label"]}
                        error={errors?.Status?.message}
                        required
                      />
                    )}
                  />
                </div>
              </div>

              {/* Block Segment 2: Chronological Sequence Milestones */}
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <CalendarDaysIcon className="h-5 w-5" style={{ color: srBlue }} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Chronological Timeline Map
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <Input
                    {...register("NotificationDate")}
                    type="date"
                    label="Official Notification Date"
                    error={errors?.NotificationDate?.message}
                    required
                  />

                  <Input
                    {...register("ApplicationStartDate")}
                    type="date"
                    label="Application Window Opens"
                    error={errors?.ApplicationStartDate?.message}
                    required
                  />

                  <Input
                    {...register("ApplicationEndDate")}
                    type="date"
                    label="Application Window Closes"
                    error={errors?.ApplicationEndDate?.message}
                    required
                  />

                  <Input
                    {...register("ExamDate")}
                    type="date"
                    label="Date of Examination"
                    error={errors?.ExamDate?.message}
                    required
                  />
                </div>
              </div>

              {/* Block Segment 3: Eligibility & Narrative Explanations */}
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <GlobeAltIcon className="h-5 w-5" style={{ color: srBlue }} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Specifications & Criteria Information
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Eligibility Ruleset *</label>
                    <textarea
                      {...register("Eligibility")}
                      rows={3}
                      placeholder="Detail age requirements, degree requirements, educational prerequisites..."
                      className={`w-full rounded-lg border p-3 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                        errors?.Eligibility ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors?.Eligibility && <p className="text-xs text-red-500">{errors.Eligibility.message}</p>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Narrative Overview Description</label>
                    <textarea
                      {...register("Description")}
                      rows={4}
                      placeholder="Provide generic summaries, structural profiles, or operational context flags..."
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Block Segment 4: Verification Links Assets */}
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <LinkIcon className="h-5 w-5" style={{ color: srBlue }} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Integration URL Addresses
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    {...register("OfficialURL")}
                    type="url"
                    label="Official Recruitment Portal URL"
                    placeholder="https://example-recruitment.gov.in"
                    error={errors?.OfficialURL?.message}
                    required
                  />

                  <Input
                    {...register("SyllabusURL")}
                    type="url"
                    label="Syllabus/Scheme Blueprint Document URL"
                    placeholder="https://example-recruitment.gov.in/syllabus.pdf"
                    error={errors?.SyllabusURL?.message}
                  />
                </div>
              </div>

              {/* Action Control Panel */}
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
                  <PlusIcon className="mr-1 inline-block h-4.5 w-4.5" />
                  Save Upcoming Exam
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Page>
  );
}