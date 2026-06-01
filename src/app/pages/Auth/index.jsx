import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { AcademicCapIcon } from "@heroicons/react/24/solid";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// --- Firebase Imports ---
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "configs/firebaseconfig";

// --- Local & Custom In-built UI Imports ---
import { Button, Input } from "components/ui"; 
import { useAuthContext } from "app/contexts/auth/context";
import { schema } from "./schema";
import { Page } from "components/shared/Page";
import { fixedEncrypt } from "configs/encryption";

// --- Styled Google Icon ---
const GoogleIcon = () => (
  <svg className="mr-3 h-5 w-5 flex-shrink-0" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin } = useAuthContext();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  // --- Manual Credentials Login ---
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await login({ username: data.username, password: fixedEncrypt(data.password) });
      if (response?.code === 200) {
        toast.success(response?.message || "Login Successful");
        navigate("/dashboards/home", { replace: true });
      } else {
        toast.error(response?.message || "Invalid credentials");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  // --- Google Firebase Sign-In ---
  const handleGoogleSignIn = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setIsLoading(true);

      const payload = {
        email: user.email,
        socialId: user.providerData[0].uid,
      };

      const response = await googleLogin(payload);

      if (response?.code === 200) {
        toast.success(response?.message || "Success");
        navigate("/dashboards/home", { replace: true });
      } else {
        toast.error(response?.message || "Authentication failed");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast.error(error?.message || "Google Sign-In Cancelled");
      setIsLoading(false);
    }
  };

  return (
    <Page title="Admin Login">
      <main className="min-h-screen flex w-full bg-white">
        
        {/* LEFT SIDE: Brand Presentation (Hidden on small screens) */}
        <div className="hidden lg:flex w-1/2 bg-[#0A0E17] flex-col justify-between p-12 relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(245,165,36,0.05)_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5A524] shadow-lg">
                <AcademicCapIcon className="h-6 w-6 text-[#0A0E17]" />
              </div>
              <span className="text-xl font-bold tracking-wide text-white">Mock Test</span>
            </div>
          </div>

          <div className="relative z-10 max-w-md">
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Empowering your <span className="text-[#F5A524]">preparation</span> journey.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Access comprehensive test series, track your progress with advanced analytics, and achieve your goals with our industry-leading preparation platform.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-sm font-semibold text-slate-500">
            <p>© {new Date().getFullYear()} Mock Test Portal.</p>
            <div className="h-4 w-px bg-slate-700" />
            <p>All rights reserved.</p>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="absolute top-8 left-6 sm:left-12 flex lg:hidden items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5A524]">
              <AcademicCapIcon className="h-5 w-5 text-[#0A0E17]" />
            </div>
            <span className="text-lg font-bold tracking-wide text-slate-900">Mock Test</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[420px]"
          >
            <div className="mb-10">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
                Welcome back
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Please enter your credentials to access the admin portal.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</label>
                <Input
                  placeholder="Enter your username"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 transition-all focus:border-[#F5A524] focus:bg-white focus:ring-4 focus:ring-[#F5A524]/10"
                  prefix={<UserIcon className="size-5 text-slate-400" />}
                  {...register("username")}
                  error={errors?.username?.message}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 transition-all focus:border-[#F5A524] focus:bg-white focus:ring-4 focus:ring-[#F5A524]/10"
                  prefix={<LockClosedIcon className="size-5 text-slate-400" />}
                  suffix={
                    <button
                      type="button"
                      className="transition-colors hover:text-slate-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="size-5 text-slate-400" />
                      ) : (
                        <EyeIcon className="size-5 text-slate-400" />
                      )}
                    </button>
                  }
                  {...register("password")}
                  error={errors?.password?.message}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-xl bg-[#F5A524] text-sm font-bold text-[#0A0E17] transition-all hover:bg-[#e09621] active:scale-[0.99] disabled:opacity-70 shadow-lg shadow-[#F5A524]/20"
                >
                  {isLoading ? "SIGNING IN..." : "SIGN IN"}
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 py-3">
                <div className="h-[1px] flex-1 bg-slate-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">or</span>
                <div className="h-[1px] flex-1 bg-slate-200" />
              </div>

              {/* Google Button */}
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={handleGoogleSignIn}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* --- Full Screen Loader --- */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0E17]/80 backdrop-blur-md"
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-700 border-t-[#F5A524]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AcademicCapIcon className="h-6 w-6 text-[#F5A524]" />
                  </div>
                </div>
                <p className="mt-6 font-bold tracking-widest text-[#F5A524] animate-pulse text-xs uppercase">
                  Authenticating
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Page>
  );
}