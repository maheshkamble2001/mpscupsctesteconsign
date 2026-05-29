import { encryptData, decryptData } from "../../configs/encryption";
import { instance as axios } from "../../configs/axiosInstance";
import Cookies from "js-cookie";

const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";

//  Get Exam Type Api
export const getExamTypesList = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data,access_token })
    : { ...data,access_token };

  try {
    const response = await axios.get("/examtypes-list", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
   
    return decrypted;
    
  } catch (error) {
    console.error("Error inside getExamTypesList:", error);
    throw error;
  }
};

// get active exam types list
export const getActiveExamTypesList = async () => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ access_token })
    : { access_token };

  try {
    const response = await axios.get("/examtypes-active-list", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
  
    return decrypted;
  } catch (error) {
    console.error("Error inside getActiveExamTypesList:", error);
    throw error;
  }
};

// Add Exam Type Api

export const createExamType = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/examtype-create`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside createExamType:", error);
    throw error;
  }
};

//edit Exam Type api
export const editExamType = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/examtype-edit`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside editExamType:", error);
    throw error;
  }
};

//delete exam type api 


export const deleteExamType = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/examtype-delete`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside deleteExamType:", error);
    throw error;
  }
};

// update exam type status api 

export const updateExamTypeStatus = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/examtype-status`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error in updateExamTypeStatus:", error);
    throw error;
  }
};