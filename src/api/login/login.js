import { encryptData, decryptData } from "../../configs/encryption";
import { instance as axios } from "../../configs/axiosInstance";
import Cookies from "js-cookie";
const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";

export const getLogIn = async (data) => {
  const payload = isEncryptionEnabled
    ? { reqData: encryptData(data) }
    : data;

  const response = await axios.post(`/login`, payload);

  return decryptData(response);
};

// change password
export const changePassword = async (data) => {
  const payload = isEncryptionEnabled
    ? {reqData:encryptData({ ...data, access_token: Cookies.get("access_token") })}
    : { ...data, access_token: Cookies.get("access_token") };

  console.log("payload:", payload);

  try {
    const response = await axios.post(`/change-password`, payload);
    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside change password:", error);
    throw error;
  }
};

// google-login

export const getGoogleLogin = async (data) => {
  const payload = isEncryptionEnabled
    ? { reqData: encryptData(data) }
    : data;

  const response = await axios.post(`/google-login`, payload);

  return decryptData(response);
};
