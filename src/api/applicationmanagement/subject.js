import { encryptData, decryptData } from "../../configs/encryption";
import { instance as axios } from "../../configs/axiosInstance";
import Cookies from "js-cookie";

const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";

export const getSubjectsList = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data,access_token })
    : { ...data,access_token };

  try {
    const response = await axios.get("/subjects-list", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
   
    return decrypted;
    
  } catch (error) {
    console.error("Error inside getSubjectsList:", error);
    throw error;
  }
};


// add-subject
export const addSubject = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/subjects-add`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside addSubject:", error);
    throw error;
  }
};

// update-subject
export const updateSubject = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/subjects-edit`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside updateSubject:", error);
    throw error;
  }
};