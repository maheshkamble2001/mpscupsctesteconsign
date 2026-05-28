import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// --- Firebase Imports ---
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "configs/firebaseconfig";

// --- Local & Custom In-built UI Imports ---
import Logo from "assets/logo.png"; 
import { Button, Input } from "components/ui"; // आपके इन-बिल्ट UI कॉम्पोनेंट्स
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
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#f0f4f9_50%,_#e8eff9_100%)]">
        {/* Background Decorative Dots */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(53,103,174,0.08)_1px,transparent_1px)] [background-size:32px_32px] opacity-70" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-[460px] px-4"
        >
          {/* Glassmorphism Card */}
          <div className="rounded-3xl border border-[var(--app-login-border-color2)] bg-[var(--app-login-card-bg-color1)] p-8 shadow-[0_20px_50px_rgba(53,103,174,0.1)] backdrop-blur-xl">
            
            {/* Logo Section */}
            <div className="mb-6 flex flex-col items-center">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.7 }}
                className="mb-3 h-20 w-20 overflow-hidden rounded-full bg-[var(--app-bg-color2)] p-1 shadow-md flex items-center justify-center"
              >
                <img src={Logo} alt="SR Logo" className="h-full w-full object-contain" />
              </motion.div>
              <h2 className="text-2xl font-black tracking-tight text-[var(--app-text-color1)] text-center">
                MPSC UPSC TEST
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-color2)] mt-1">
                Management Portal
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Username Input - Focused to Royal Blue */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--app-text-color3)] ml-1">Username</label>
                <Input
                  placeholder="Enter username"
                  className="h-12 rounded-xl border border-gray-200 bg-white/90 text-[var(--app-text-color4)] transition-all focus:border-orange-600 focus:ring-0"
                  prefix={<UserIcon className="size-5 text-gray-400" />}
                  {...register("username")}
                  error={errors?.username?.message}
                />
              </div>

              {/* Password Input - Focused to Royal Blue */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--app-text-color3)] ml-1">Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="h-12 rounded-xl border border-gray-200 bg-white/90 text-[var(--app-text-color4)] transition-all focus:border-orange-600 focus:ring-0"
                  prefix={<LockClosedIcon className="size-5 text-gray-400" />}
                  suffix={
                    <button
                      type="button"
                      className="transition-colors hover:text-[var(--app-text-color1)]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="size-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="size-5 text-gray-400" />
                      )}
                    </button>
                  }
                  {...register("password")}
                  error={errors?.password?.message}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-xl bg-red-600 text-sm font-bold tracking-widest text-white transition-all hover:bg-red-700 active:scale-[0.99] disabled:opacity-70 shadow-lg shadow-red-600/20"
                >
                  {isLoading ? "SIGNING IN..." : "SIGN IN"}
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 py-1">
                <div className="h-[1px] flex-1 bg-gray-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">or continue with</span>
                <div className="h-[1px] flex-1 bg-gray-200" />
              </div>

              {/* Google Button */}
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={handleGoogleSignIn}
                className="flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                <GoogleIcon />
                <span>Google Account</span>
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* --- Full Screen Loader --- */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md"
            >
              <div className="relative flex flex-col items-center">
                <div className="h-20 w-20 animate-spin rounded-full border-4 border-gray-100 border-t-red-500" />
                <motion.img 
                  src={Logo} 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute top-5 h-10 w-10 object-contain" 
                  alt="Loading..."
                />
                <p className="mt-6 font-bold tracking-[0.2em] text-gray-800 animate-pulse text-xs">
                  Loading...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Page>
  );
}