// src/pages/EditUser.jsx
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetails, updateUser, getSatates } from "api/usermanagement/user";
import { getActiveUserRolesList } from "api/usermanagement/roles";
import { toast } from "sonner";
import { Button, Input, Textarea } from "components/ui";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Combobox } from "components/shared/form/Combobox";
import { Page } from "components/shared/Page";
import Cookies from "js-cookie";
import { encryptData } from "configs/encryption";

// Icons
import {
  UserIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BuildingOfficeIcon,
  HomeIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

// ✅ Schema: Only these 4 are required
const schema = yup.object().shape({
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  usertypeid: yup.string().required("User role is required"),
  stateid: yup.string().required("State is required"),
});

export default function EditUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const [states, setStates] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();

  // Theme Colors
  const srRed = "#FE4543";
  const srBlue = "#3368AF";

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      mobile: "",
      usertypeid: "",
      stateid: "",
      city: "",
      address: "",
    },
  });

  // ✅ Fetch Dropdowns (Roles & States)
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [roleRes, stateRes] = await Promise.all([
          getActiveUserRolesList(),
          getSatates()
        ]);

        if (roleRes?.code === 200) {
          setUserTypes(roleRes.data.usertypes.map(ut => ({
            label: ut.UserType,
            value: ut.UserTypeID,
          })));
        }

        if (stateRes?.code === 200) {
          setStates(stateRes.data.map(st => ({
            label: st.StateName,
            value: st.StateID,
          })));
        }
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      }
    };
    fetchDropdowns();
  }, []);

  // ✅ Fetch User Details & Populate Form
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserDetails({ userid: id });
        if (res?.code === 200 && res.data?.user) {
          const user = res.data.user;
          setValue("firstname", user.FirstName || "");
          setValue("lastname", user.LastName || "");
          setValue("email", user.EmailID || "");
          setValue("mobile", user.Mobile || "");
          setValue("usertypeid", String(user.UserTypeID) || "");
          setValue("stateid", user.StateID || "");
          setValue("city", user.City || "");
          setValue("address", user.Address || "");
        }
      } catch (error) {
        toast.error("Failed to fetch user details");
      }
    };
    fetchUser();
  }, [id, setValue]);

  // ✅ Update User
  const handleUpdateUser = async (data) => {
    try {
      setIsLoading(true);

      const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";
      const access_token = Cookies.get("access_token");
      const formData = new FormData();

      const payload = {
        access_token,
        userid: id,
        firstname: data.firstname,
        lastname: data.lastname,
        emailid: data.email,
        mobile: data.mobile,
        usertypeid: data.usertypeid,
        stateid: data.stateid,
        city: data.city,
        address: data.address,
      };

      if (isEncryptionEnabled) {
        formData.append("reqData", encryptData(payload));
      } else {
        Object.keys(payload).forEach((key) => {
          formData.append(key, payload[key] || "");
        });
      }

      const res = await updateUser(formData);

      if (res?.code === 200) {
        toast.success("User updated successfully");
        navigate("/usermanagement/manage-users");
      } else {
        toast.error(res?.message || "Failed to update user");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page title="Update User">
      <div 
        className="w-full min-h-screen px-4 sm:px-8 py-8"
        style={{ background: "linear-gradient(135deg, rgb(242, 247, 253), rgb(255, 240, 240))" }}
      >
        <div className="max-w-7xl ">
          {/* Back Button */}
          <button
            onClick={() => navigate("/usermanagement/manage-users")}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm"
          >
            <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Users</span>
          </button>

          {/* Main Card - Left Aligned */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${srBlue}10` }}>
                  <PencilIcon className="h-6 w-6" style={{ color: srBlue }} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Update User
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    update the user details below
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleUpdateUser)} className="p-6 sm:p-8">
              {/* Personal Information Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                  <UserIcon className="h-5 w-5" style={{ color: srBlue }} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Personal Information
                  </h3>
                </div>
                
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    {...register("firstname")}
                    label="First Name *"
                    placeholder="Enter first name"
                    error={errors?.firstname?.message}
                />

                  <Input
                    {...register("lastname")}
                    label="Last Name *"
                    placeholder="Enter last name"
                    error={errors?.lastname?.message}
                 />

                  <Input
                    {...register("email")}
                    label="Email Address *"
                    placeholder="Enter email address"
                    icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                    error={errors?.email?.message}
                 />

                  <Input
                    {...register("mobile")}
                    label="Mobile Number"
                    placeholder="Enter 10-digit mobile number"
                    icon={<DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />}
                    error={errors?.mobile?.message}
                />
                </div>
              </div>

              {/* Role & Location Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                  <BriefcaseIcon className="h-5 w-5" style={{ color: srBlue }} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Role & Location
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Controller
                    name="usertypeid"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Combobox
                        data={userTypes}
                        highlight
                        label="User Role *"
                        placeholder="Select user role"
                        value={userTypes.find((ut) => String(ut.value) === String(value)) || null}
                        onChange={(val) => onChange(val?.value || "")}
                        displayField="label"
                        searchFields={["label"]}
                        error={errors?.usertypeid?.message}
                        className="rounded-lg"
                      />
                    )}
                  />

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
                      />
                    )}
                  />

                  <div className="sm:col-span-2">
                    <Input
                      {...register("city")}
                      label="City"
                      placeholder="Enter city name"
                      icon={<BuildingOfficeIcon className="h-5 w-5 text-gray-400" />}
                      error={errors?.city?.message}
                   />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                  <HomeIcon className="h-5 w-5" style={{ color: srBlue }} />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Address Details
                  </h3>
                </div>

                <Textarea
                  {...register("address")}
                  label="Full Address"
                  placeholder="Enter complete address (street, area, landmark, etc.)"
                  rows={6}
                  error={errors?.address?.message}
               />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate("/usermanagement/manage-users")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  className="rounded text-white  shadow-md hover:shadow-lg transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${srBlue} 0%, ${srRed} 100%)`
                  }}
                >
                  <PencilIcon className="h-4.5 w-4.5 inline-block " />
                  Update User
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Page>
  );
}