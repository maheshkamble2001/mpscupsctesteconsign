import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { instance } from "configs/axiosInstance";
import { decryptData } from "configs/encryption";
import useCookie from "hooks/useCookie";

const AxiosInterceptor = ({ children }) => {
  const [isSet, setIsSet] = useState(false);
  const navigate = useNavigate();
  const { removeCookie } = useCookie();

  useEffect(() => {
    const resInterceptor = (response) => {
      const data = decryptData(response);
      if (data.code === 401) {
        removeCookie();
        localStorage.removeItem("toggle");
        navigate("/");
      }
      return response;
    };

    const errInterceptor = (error) => error;

    const id = instance.interceptors.response.use(
      resInterceptor,
      errInterceptor
    );
    setIsSet(true);

    return () => instance.interceptors.response.eject(id);
  }, [navigate, removeCookie]);

  return isSet && children;
};

export default AxiosInterceptor;
