// middleware/GhostGuard.jsx
import { Navigate, useOutlet } from "react-router";
import Cookies from "js-cookie";
import { REDIRECT_URL_KEY } from "constants/app.constant";

export default function GhostGuard() {
  const outlet = useOutlet();
  const accessToken = Cookies.get("access_token");
  const email = Cookies.get("email");
  const role = Cookies.get("role");

  const redirectUrl = new URLSearchParams(window.location.search).get(REDIRECT_URL_KEY);

  // Agar already logged in hai (cookie present), to dashboard bhej do
  if (accessToken && email && role) {
    return (
      <Navigate
        to={redirectUrl && redirectUrl !== "" ? redirectUrl : "/dashboards/home"}
        replace
      />
    );
  }

  // Agar login nahi hai, to outlet (login/register page) dikhao
  return <>{outlet}</>;
}
