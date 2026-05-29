import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

import { Page } from "components/shared/Page";
import { Input, Button, Textarea } from "components/ui";
import { UserCreate } from "api/usermanagement/user";
import { Combobox } from "components/shared/form/Combobox";
import { getActiveUserRolesList } from "api/usermanagement/roles";
import { getSatates } from "api/usermanagement/user";
import { encryptData } from "configs/encryption";

// Icons
import {
  UserIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  HomeIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

// ✅ Validation Schema
const schema = yup.object().shape({
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  mobile: yup
    .string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .optional(),
  usertypeid: yup.string().required("User role is required"),
  stateid: yup.string().required("State is required"),
  city: yup.string().optional(),
  address: yup.string().optional(),
});

export default function AddUser() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const [states, setStates] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
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
    resolver: yupResolver(schema),
    
  });

  // Theme Colors
  const srRed = "#FE4543";
  const srBlue = "#3368AF";

  // ✅ Fetch Dropdown Data (Roles & States)
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch User Roles
        const roleRes = await getActiveUserRolesList();
        if (roleRes?.code === 200) {
          setUserTypes(
            roleRes.data.usertypes.map((ut) => ({
              label: ut.UserType,
              value: ut.UserTypeID,
            }))
          );
        }

        // Fetch States
        const stateRes = await getSatates();
        if (stateRes?.code === 200) {
          setStates(
            stateRes.data.map((st) => ({
              label: st.StateName,
              value: st.StateID,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      }
    };
    fetchDropdownData();
  }, []);

  // ✅ Submit handler
  const handleCreateUser = async (data) => {
    try {
      setIsLoading(true);

      const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";
      const access_token = Cookies.get("access_token");
      const formData = new FormData();

      const payload = {
        access_token,
        usertypeid: data.usertypeid,
        firstname: data.firstname,
        lastname: data.lastname,
        emailid: data.email,
        mobile: data.mobile,
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

      const res = await UserCreate(formData);

      if (res?.code === 200) {
        toast.success("User added successfully");
        navigate("/usermanagement/manage-users");
      } else {
        toast.error(res?.message || "Failed to add user");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page title="Add User">
    <div 
  className="w-full min-h-screen px-4 sm:px-8 py-8"
   style={{background:"linear-gradient(135deg, rgb(242, 247, 253), rgb(255, 240, 240))"}}

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
            {/* Header without gradient - simple solid color */}
            <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${srBlue}10` }}>
                  <UserPlusIcon className="h-6 w-6" style={{ color: srBlue }} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Add New User
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Fill in the details to create a new user account
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleCreateUser)} className="p-6 sm:p-8">
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
                    label="First Name"
                    placeholder="Enter first name"
                    error={errors?.firstname?.message}
                  />

                  <Input
                    {...register("lastname")}
                    label="Last Name"
                    placeholder="Enter last name"
                    error={errors?.lastname?.message}
                />

                  <Input
                    {...register("email")}
                    label="Email Address"
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
                        label="User Role"
                        placeholder="Select user role"
                        value={userTypes.find((ut) => ut.value === value) || null}
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
                  className="rounded border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                  onClick={() => navigate("/usermanagement/manage-users")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  className="rounded text-black font-semibold shadow-md hover:shadow-lg transition-all"
                  style={{
                    background: `var(--app-btn-primary)`
                  }}
                >
                  <UserPlusIcon className="h-4.5 w-4.5 inline-block" />
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Page>
  );
}