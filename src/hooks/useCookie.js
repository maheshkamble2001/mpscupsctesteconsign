import Cookies from "js-cookie";

export default function useCookie() {
  const setCookie = (name, value, options = {}) => {
    Cookies.set(name, value, { path: "/", ...options });
  };

  const getCookie = (name) => {
    return Cookies.get(name);
  };

  const removeCookie = (name) => {
    Cookies.remove(name, { path: "/" });
  };

  return {
    setCookie,
    getCookie,
    removeCookie,
  };
}
