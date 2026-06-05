// src/pages/AddCourse.jsx
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Local Imports
import { Button, Input, Textarea } from "components/ui";
import { Combobox } from "components/shared/form/Combobox";
import { Page } from "components/shared/Page";

// Icons
import {
    BookOpenIcon,
    CalendarIcon,
    CurrencyRupeeIcon,
    DocumentTextIcon,
    PhotoIcon,
    UserGroupIcon,
    ArrowLeftIcon,
    PlusIcon,
    CloudArrowUpIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { addCourse, getExamDropdown } from "api/applicationmanagement/courses";
import Cookies from "js-cookie";
import { encryptData } from "configs/encryption";

// Schema validation matching course fields
const schema = yup.object().shape({
    CourseTitle: yup.string().required("Course title is required"),
    CourseCode: yup.string().required("Course code is required"),
    ExamId: yup.string().required("Exam selection is required"),
    StartDate: yup.string().required("Start date is required"),
    TagLine: yup.string().required("Tagline is required"),
    // Description: yup.string().required("Description is required"),
    // CoverImage: yup.mixed().required("Cover image file is required"),
    CourseListPrice: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? undefined : value))
        .typeError("List price must be a number")
        .positive("Price must be positive")
        .required("List price is required"),
    CourseLaunchPrice: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? undefined : value))
        .typeError("Launch price must be a number")
        .positive("Price must be positive")
        .required("Launch price is required"),
    NoOfSeats: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? undefined : value))
        .typeError("Seats count must be a number")
        .integer("Seats must be a whole number")
        .positive("Seats must be positive")
        .required("Number of seats is required"),
    // EMI: yup.string().required("Please select EMI availability option"),
});

export default function AddCourse() {
    const [isLoading, setIsLoading] = useState(false);
    const [exams, setExams] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);

    const navigate = useNavigate();
    const srBlue = "#3368AF";

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            CourseTitle: "",
            CourseCode: "",
            ExamId: "",
            StartDate: new Date().toISOString().split("T")[0],
            TagLine: "",
            Description: "",
            CoverImage: null,
            CourseListPrice: "",
            CourseLaunchPrice: "",
            NoOfSeats: "",
            // EMI: "0", 
            Status: 1,
            isdeleted: 0,
            addedon: new Date().toISOString(),
        },
    });

    // Watch cover image field to generate reactive localized UI preview assets
    const watchCoverImage = watch("CoverImage");

    useEffect(() => {
        if (watchCoverImage && watchCoverImage.length > 0) {
            const file = watchCoverImage[0];
            if (file instanceof File) {
                const previewUrl = URL.createObjectURL(file);
                setImagePreview(previewUrl);
                return () => URL.revokeObjectURL(previewUrl);
            }
        } else {
            setImagePreview(null);
        }
    }, [watchCoverImage]);

    // Fetch Exams Dropdown Data
    const fetchDropdowns = async () => {
        try {
            const res = await getExamDropdown();
            if (res?.code === 200) {
                // Defensive mapping rule fallback strings check matching criteria keys safely
                const formattedExams = res.data.map((ex) => ({
                    label: ex.ExamName || ex.examName || "Unknown Exam",
                    value: String(ex.ExamId || ex.ExamID || ex.examId || ex.id),
                }));
                setExams(formattedExams);
            }
        } catch (error) {
            console.error("Error fetching exam values:", error);
        }
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    // Form Submit Action Handler
    const handleAddCourse = async (data) => {
        try {
            setIsLoading(true);

            const access_token = Cookies.get("access_token");
            const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";
            const formData = new FormData();

            const payload = {
                CourseTitle: data.CourseTitle,
                CourseCode: data.CourseCode || null,
                ExamId: Number(data.ExamId),
                StartDate: data.StartDate
                    ? new Date(data.StartDate).toISOString()
                    : null,
                TagLine: data.TagLine || null,
                Description: data.Description || null,
                CourseListPrice: data.CourseListPrice
                    ? Number(data.CourseListPrice)
                    : null,
                CourseLaunchPrice: data.CourseLaunchPrice
                    ? Number(data.CourseLaunchPrice)
                    : null,
                NoOfSeats: data.NoOfSeats
                    ? Number(data.NoOfSeats)
                    : null,
                access_token: access_token
            };

            if (data.CoverImage && data.CoverImage[0]) formData.append("CourseCoverImage", data.CoverImage[0]);

            if (isEncryptionEnabled) {
                formData.append("reqData", encryptData(payload));
            } else {
                Object.keys(payload).forEach(key => formData.append(key, payload[key]));
            }
           

            if (data.CoverImage && data.CoverImage[0]) {
                formData.append("CourseCoverImage", data.CoverImage[0]);
            }

            const res = await addCourse(formData);

            if (res?.code === 200) {
                toast.success("Course profile added successfully");
                navigate("/applicationmanagement/manage-courses");
            } else {
                toast.error(res?.message || "Failed to create course configuration");
            }
        } catch (err) {
            console.error("Error adding course:", err);
            toast.error("Something went wrong processing your request");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Page title="Add Course">
            <div
                className="w-full min-h-screen px-4 sm:px-8 py-8"
                style={{ background: "linear-gradient(135deg, rgb(242, 247, 253), rgb(255, 240, 240))" }}
            >
                <div className="max-w-7xl">
                    {/* Back Action Trigger Button */}
                    <button
                        type="button"
                        onClick={() => navigate("/applicationmanagement/manage-courses")}
                        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm"
                    >
                        <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Courses</span>
                    </button>

                    {/* Core Configuration Panel Body Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Form Top Banner Header */}
                        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl" style={{ backgroundColor: `${srBlue}10` }}>
                                    <PlusIcon className="h-6 w-6" style={{ color: srBlue }} />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add Course</h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Fill out the configuration parameters to register a new course profile
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Interface Structure Wrapper */}
                        <form onSubmit={handleSubmit(handleAddCourse)} className="p-6 sm:p-8">

                            {/* Block Segment 1: Core Identities */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                    <BookOpenIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Course Identities</h3>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input
                                        {...register("CourseTitle")}
                                        label="Course Title"
                                        placeholder="Enter course designation title"
                                        error={errors?.CourseTitle?.message}
                                        required
                                    />

                                    <Input
                                        {...register("CourseCode")}
                                        label="Course Code"
                                        placeholder="Enter unique key tracking code"
                                        error={errors?.CourseCode?.message}
                                        required
                                    />

                                    <Controller
                                        name="ExamId"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <Combobox
                                                data={exams}
                                                highlight
                                                label="Target Exam"
                                                placeholder="Select affiliated exam variant"
                                                // Fixed object/string lookup mapping strategy structure execution explicitly
                                                value={exams.find((ex) => String(ex.value) === String(value)) || null}
                                                onChange={(val) => onChange(val?.value || "")}
                                                displayField="label"
                                                searchFields={["label"]}
                                                error={errors?.ExamId?.message}
                                                className="rounded-lg"
                                                required
                                            />
                                        )}
                                    />

                                    <Input
                                        {...register("StartDate")}
                                        type="date"
                                        min={new Date().toISOString().split("T")[0]}
                                        label="Batch Start Date"
                                        error={errors?.StartDate?.message}
                                        icon={<CalendarIcon className="h-5 w-5 text-gray-400" />}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Block Segment 2: Commercial Layout Matrices */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                    <CurrencyRupeeIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Pricing & Capacity Matrices</h3>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                                    <Input
                                        {...register("CourseListPrice")}
                                        label="List Price (₹)"
                                        placeholder="0.00"
                                        error={errors?.CourseListPrice?.message}
                                        required
                                    />

                                    <Input
                                        {...register("CourseLaunchPrice")}
                                        label="Launch Offer Price (₹)"
                                        placeholder="0.00"
                                        error={errors?.CourseLaunchPrice?.message}
                                        required
                                    />

                                    <Input
                                        {...register("NoOfSeats")}
                                        label="Total Seat Allocation"
                                        placeholder="e.g. 60"
                                        error={errors?.NoOfSeats?.message}
                                        icon={<UserGroupIcon className="h-5 w-5 text-gray-400" />}
                                        required
                                    />

                                    {/* <div className="flex flex-col">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                            EMI Option <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            {...register("EMI")}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-all focus:border-[#3368AF] focus:ring-1 focus:ring-[#3368AF] h-[38px]"
                                        >
                                            <option value="1">Available</option>
                                            <option value="0">Not Available</option>
                                        </select>
                                        {errors?.EMI && (
                                            <p className="text-xs text-red-500 mt-1">{errors.EMI.message}</p>
                                        )}
                                    </div> */}
                                </div>
                            </div>

                            {/* Block Segment 3: Marketing and Content Copy Blocks */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                    <DocumentTextIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Content Declarations</h3>
                                </div>

                                <div className="space-y-5">
                                    <Input
                                        {...register("TagLine")}
                                        label="Marketing Tagline"
                                        placeholder="Provide crisp promotional description summary tag line context"
                                        error={errors?.TagLine?.message}
                                        required
                                    />

                                    {/* ✅ Redesigned Image Dropzone Wrapper Field */}
                                    <div className="flex flex-col w-full">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                                            <PhotoIcon className="h-4 w-4 text-gray-400" />
                                            Course Cover Image
                                            {/* <span className="text-red-500">*</span> */}
                                        </label>

                                        <div className="relative group w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100/70 hover:border-[#3368AF]/50 transition-all duration-200 overflow-hidden min-h-[160px] p-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                {...register("CoverImage")}
                                                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                            />

                                            {!imagePreview ? (
                                                <div className="text-center pointer-events-none flex flex-col items-center gap-2">
                                                    <div className="p-3 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-[#3368AF] group-hover:scale-110 transition-all duration-200">
                                                        <CloudArrowUpIcon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-700">Click to upload banner</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">Supports PNG, JPG or WEBP formats</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative w-full max-w-md h-40 rounded-lg overflow-hidden shadow-inner border border-gray-200 bg-white group/preview">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Cover Preview"
                                                        className="h-full w-full object-cover group-hover/preview:scale-[1.02] transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                        <div className="flex items-center gap-1.5 text-white font-medium text-xs bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md">
                                                            <ArrowPathIcon className="h-3.5 w-3.5 animate-spin-reverse" />
                                                            Change Banner
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* {errors?.CoverImage && (
                                            <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.CoverImage.message}</p>
                                        )} */}
                                    </div>

                                    <Textarea
                                        {...register("Description")}
                                        label="Course Complete Breakdown Description"
                                        placeholder="Provide complete structural outline schedules, syllabi parameters context"
                                        rows={4}
                                        error={errors?.Description?.message}
                                    // required
                                    />
                                </div>
                            </div>

                            {/* Action Buttons Footer Block */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => navigate("/applicationmanagement/manage-courses")}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    className="rounded text-black shadow-md hover:shadow-lg transition-all"
                                    style={{
                                        background: `var(--app-btn-primary)`,
                                    }}
                                >
                                    <PlusIcon className="h-4.5 w-4.5 inline-block mr-1" />
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