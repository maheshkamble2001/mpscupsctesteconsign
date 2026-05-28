// src/pages/UpdateStudent.jsx
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Local Imports
import { Button, Input, Textarea } from "components/ui";
import { Combobox } from "components/shared/form/Combobox";
import { Page } from "components/shared/Page";
import { updateStudent, getStateDropdown, getStudentDetails } from "api/studentmanagement/student";

// Icons
import {
    UserIcon,
    EnvelopeIcon,
    DevicePhoneMobileIcon,
    BuildingOfficeIcon,
    HomeIcon,
    ArrowLeftIcon,
    CalendarIcon,
    PencilIcon,
} from "@heroicons/react/24/outline";

// ✅ Schema validation matching standard field configurations
const schema = yup.object().shape({
    name: yup.string().required("Full name is required"),
    emailid: yup
        .string()
        .email("Invalid email format")
        .required("Email address is required"),
    mobile: yup
        .string()
        .required("Mobile is required")
        .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
    admissiondate: yup
        .string()
        .required("Admission date is required")
    ,
    stateid: yup.string().required("State is required"),
    address: yup.string().required("Address is required"),
    city: yup.string().required("City is required"),
});

export default function UpdateStudent() {
    const [isLoading, setIsLoading] = useState(false);
    const [states, setStates] = useState([]);

    const { id } = useParams(); // Retrieves student identity token from URL path parameters
    const navigate = useNavigate();

    // Custom styling palette
    const srRed = "#FE4543";
    const srBlue = "#3368AF";

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        control,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            mobile: "",
            emailid: "",
            stateid: "",
            city: "",
            address: "",
            admissiondate: "",
        },
    });

    // ✅ Fetch Dropdowns (States)
    const fetchDropdowns = async () => {
        try {
            const res = await getStateDropdown();

            if (res?.code === 200 && Array.isArray(res.data)) {
                const formattedStates = res.data.map((st) => ({
                    label: st.StateName,
                    value: st.StateID,
                }));

                setStates(formattedStates);
            }
        } catch (error) {
            console.error("Error fetching dropdown values:", error);
        }
    };

    // ✅ Fetch Existing Student Record details for context hydration
    const fetchStudentProfileDetails = async () => {
        try {
            const res = await getStudentDetails({ id: id });

            if (res?.code === 200 && res.data?.student) {
                const profile = res.data.student; // ✅ correct path

                setValue("name", profile.Name || "");
                setValue("mobile", profile.Mobile || "");
                setValue("emailid", profile.EmailID || "");
                setValue("stateid", profile.StateID || "");
                setValue("city", profile.City || "");
                setValue("address", profile.Address || "");

                setValue(
                    "admissiondate",
                    profile.AdmissionDate
                        ? profile.AdmissionDate.split("T")[0]
                        : ""
                );
            }
        } catch (error) {
            console.error("Error retrieving historical student info:", error);
            toast.error("Failed to recover student record content");
        }
    };

    useEffect(() => {
        fetchDropdowns();
        if (id) {
            fetchStudentProfileDetails();
        }
    }, [id]);

    // ✅ Form Submit Action Handler
    const handleUpdateStudent = async (data) => {
        try {
            setIsLoading(true);

            const payload = {
                id: id, // Appending critical primary context key for relational targeting
                name: data.name,
                mobile: data.mobile,
                emailid: data.emailid,
                stateid: data.stateid,
                city: data.city,
                address: data.address,
                admissiondate: data.admissiondate,
            };

            const res = await updateStudent(payload);

            if (res?.code === 200) {
                toast.success("Student updated successfully");
                navigate("/studentmanagement/manage-students");
            } else {
                toast.error(res?.message || "Failed to update student profile");
            }
        } catch (err) {
            toast.error("Something went wrong processing request");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Page title="Update Student">
            <div
                className="w-full min-h-screen px-4 sm:px-8 py-8"
                style={{ background: "linear-gradient(135deg, rgb(242, 247, 253), rgb(255, 240, 240))" }}
            >
                <div className="max-w-7xl">
                    {/* Back Action Trigger Button */}
                    <button
                        type="button"
                        onClick={() => navigate("/studentmanagement/manage-students")}
                        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm"
                    >
                        <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Students</span>
                    </button>

                    {/* Core Configuration Panel Body Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Form Top Banner Header */}
                        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl" style={{ backgroundColor: `${srBlue}10` }}>
                                    <PencilIcon className="h-6 w-6" style={{ color: srBlue }} />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Update Student</h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Modify the target parameter parameters to rewrite the student profile configuration data
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Interface Structure Wrapper */}
                        <form onSubmit={handleSubmit(handleUpdateStudent)} className="p-6 sm:p-8">

                            {/* Block Segment 1: Personal Credentials Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                    <UserIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input
                                        {...register("name")}
                                        label="Full Name"
                                        placeholder="Enter full name"
                                        error={errors?.name?.message}
                                        required
                                    />

                                    <Input
                                        {...register("emailid")}
                                        label="Email Address"
                                        placeholder="Enter student email address"
                                        icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                                        error={errors?.emailid?.message}
                                        required
                                    />

                                    <Input
                                        {...register("mobile")}
                                        label="Mobile"
                                        placeholder="Enter 10-digit primary mobile"
                                        icon={<DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />}
                                        error={errors?.mobile?.message}
                                        required
                                        onChange={(e) => {
                                            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Block Segment 2: Registration Core Details */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                    <CalendarIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Admission Details</h3>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input
                                        {...register("admissiondate", {
                                            validate: (value) => {
                                                if (!value) return "Admission date is required";

                                                if (value > formattedToday) {
                                                    return "Future date is not allowed";
                                                }

                                                return true;
                                            },
                                        })}
                                        type="date"
                                        label="Admission Date"
                                        max={new Date().toISOString().split("T")[0]} // ✅ today
                                        error={errors?.admissiondate?.message}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Block Segment 3: Geographic Allocations Selection Wrapper */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                    <HomeIcon className="h-5 w-5" style={{ color: srBlue }} />
                                    <h3 className="text-lg font-semibold text-gray-800">Address Details</h3>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Controller
                                        name="stateid"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <Combobox
                                                data={states}
                                                highlight
                                                label="State"
                                                placeholder="Select state"
                                                value={states.find((st) => st.value === value) || null}
                                                onChange={(val) => onChange(val?.value || "")}
                                                displayField="label"
                                                searchFields={["label"]}
                                                error={errors?.stateid?.message}
                                                className="rounded-lg"
                                                required
                                            />
                                        )}
                                    />

                                    <Input
                                        {...register("city")}
                                        label="City"
                                        placeholder="Enter city designation"
                                        icon={<BuildingOfficeIcon className="h-5 w-5 text-gray-400" />}
                                        error={errors?.city?.message}
                                        required
                                    />
                                </div>

                                <div className="mt-5">
                                    <Textarea
                                        {...register("address")}
                                        label="Address"
                                        placeholder="Enter explicit mailing address context (street, block info, apartment marker)"
                                        rows={4}
                                        error={errors?.address?.message}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Action Buttons Footer Block */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => navigate("/studentmanagement/manage-students")}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    className="rounded text-white shadow-md hover:shadow-lg transition-all"
                                    style={{
                                        background: `linear-gradient(135deg, ${srBlue} 0%, ${srRed} 100%)`,
                                    }}
                                >
                                    <PencilIcon className="h-4.5 w-4.5 inline-block mr-1" />
                                    Update
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </Page>
    );
}