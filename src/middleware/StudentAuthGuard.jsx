// middleware/AuthGuard.jsx
import { Navigate, useLocation, useOutlet } from "react-router";
import { useAuthContext } from "app/contexts/auth/context";
import Cookies from "js-cookie";
import { REDIRECT_URL_KEY } from "../constants/app.constant";

export default function StudentAuthGuard() {
  const outlet = useOutlet();
  const location = useLocation();
  const { isAuthenticated, isInitialized } = useAuthContext();

  const accessToken = Cookies.get("access_token");
  const name = Cookies.get("name");
  const email = Cookies.get("email");
  const userid = Cookies.get("userid");
  const role = Cookies.get("role");
  // ⛔ Wait for auth initialization
  if (!isInitialized) {
    return null; // or <LoadingScreen />
  }

  // 🔐 Not logged in → redirect to login
  const isValidSession =
    !!accessToken &&
    !!userid &&
    !!email &&
    !!role;

  if (!isValidSession && !location.pathname.includes("/login")) {
    const redirectPath = location.pathname + location.search;

    return (
      <Navigate
        // to={`/login?${REDIRECT_URL_KEY}=${encodeURIComponent(redirectPath)}`}
         to={`/home`}
        replace
      />
    );
  }


  // ✅ Authenticated → allow access
  return <>{outlet}</>;
}
