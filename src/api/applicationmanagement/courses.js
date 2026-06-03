import { encryptData, decryptData } from "../../configs/encryption";
import { instance as axios } from "../../configs/axiosInstance";
import Cookies from "js-cookie";

const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";

//  Get Course Api
export const getCoursesList = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data,access_token })
    : { ...data,access_token };

  try {
    const response = await axios.get("/exam-courses-list", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
   
    return decrypted;
    
  } catch (error) {
    console.error("Error inside getCoursesList:", error);
    throw error;
  }
};
