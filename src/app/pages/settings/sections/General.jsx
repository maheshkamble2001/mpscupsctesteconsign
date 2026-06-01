import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  LockClosedIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  CheckBadgeIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

// Local Imports
import { Button, Input } from "components/ui";
import { changePassword } from "api/login/login";
import { fixedEncrypt } from "configs/encryption";

export default function General() {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Theme Colors
  const primaryColor = "var(--color-primary-600)";
  const primaryLight = "var(--color-primary-100)";

  const schema = Yup.object().shape({
    oldPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string().required("New password is required"),
    confirmPassword: Yup.string()
      .required("Confirm password is required")
      .oneOf([Yup.ref("newPassword")], "Passwords must match"),
  });

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPasswordValue = watch("newPassword");

  const handleAddSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      const res = await changePassword({
        password: fixedEncrypt(data.oldPassword),
        newPassword: fixedEncrypt(data.newPassword),
        confirmPassword: fixedEncrypt(data.confirmPassword),
      });
      if (res.code === 200) {
        toast.success(res.message);
        reset();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Error changing password");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]"
    >
      <div className="max-w-6xl mx-auto px-6 py-8 lg:py-12">

        {/* Back Button */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-8 group"
        >
          <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </motion.button>

        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Left Side - Info Section */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="hidden lg:flex flex-col justify-center"
          >
            <div className="space-y-6">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: primaryLight,
                }}
              >
                <ShieldCheckIcon className="h-10 w-10" style={{ color: primaryColor }} />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Password <br />
                <span style={{ color: primaryColor }}>Security</span>
              </h1>

              <p className="text-gray-500 leading-relaxed">
                Keep your account secure by updating your password regularly.
                Choose a strong password that you haven't used before.
              </p>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">End-to-end encrypted</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Secure password storage</span>
                </div>
                <div className="flex items-center gap-3">
                  <SparklesIcon className="h-5 w-5" style={{ color: primaryColor }} />
                  <span className="text-sm text-gray-600">Password strength monitoring</span>
                </div>
              </div>

              {/* Decorative circles */}
              <div className="relative mt-8">
                <div
                  className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full opacity-20"
                  style={{ background: primaryColor }}
                />
                <div
                  className="absolute -right-10 -top-10 w-24 h-24 rounded-full opacity-20"
                  style={{ background: primaryColor }}
                />
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form Card */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

              {/* Card Header */}
              <div className="px-8 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: primaryLight }}>
                    <LockClosedIcon className="h-5 w-5" style={{ color: primaryColor }} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                </div>
                <p className="text-sm text-gray-500 ml-11">
                  Enter your current password and choose a new one
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(handleAddSubmit)} className="px-8 pb-8 space-y-5">

                {/* Current Password */}
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3368AF] transition-colors" />
                    <input
                      type={showOldPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3368AF] focus:ring-2 focus:ring-[#3368AF]/20 transition-all outline-none text-sm"
                      {...register("oldPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors?.oldPassword && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.oldPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Create new password"
                      className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3368AF] focus:ring-2 focus:ring-[#3368AF]/20 transition-all outline-none text-sm"
                      {...register("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors?.newPassword && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.newPassword.message}</p>
                  )}

                  {/* Password Hint */}
                  {newPasswordValue && !errors?.newPassword && (
                    <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                      <CheckBadgeIcon className="h-3 w-3" />
                      Password is ready
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3368AF] focus:ring-2 focus:ring-[#3368AF]/20 transition-all outline-none text-sm"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors?.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => navigate(-1)}
                    type="button"
                    variant="outlined"
                    className="flex-1 h-12 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={submitLoading}
                    color="warning"
                    variant="filled"
                    className="flex-1 h-12 rounded-xl font-semibold shadow-md hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </div>

            {/* Mobile Security Note */}
            <div className="lg:hidden text-center mt-6">
              <p className="text-xs text-gray-400">
                🔒 Your password is encrypted and secure
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
