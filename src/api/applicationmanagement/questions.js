import { encryptData, decryptData } from "../../configs/encryption";
import { instance as axios } from "../../configs/axiosInstance";
import Cookies from "js-cookie";

const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";


// ✅ GET QUESTIONS LIST
export const getQuestionsList = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data, access_token })
    : { ...data, access_token };

  try {
    const response = await axios.get("/questions-bank/list", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;

    return decrypted;
  } catch (error) {
    console.error("Error inside getQuestionsList:", error);
    throw error;
  }
};



// ✅ CREATE QUESTION
export const createQuestion = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post("/questions-bank/add", payload);

    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;

    return decrypted;
  } catch (error) {
    console.error("Error inside createQuestion:", error);
    throw error;
  }
};



// ✅ EDIT QUESTION
export const editQuestion = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post("/questions-bank/edit", payload);

    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;

    return decrypted;
  } catch (error) {
    console.error("Error inside editQuestion:", error);
    throw error;
  }
};



// ✅ DELETE QUESTION
export const deleteQuestion = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post("/questions-bank/delete", payload);

    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;

    return decrypted;
  } catch (error) {
    console.error("Error inside deleteQuestion:", error);
    throw error;
  }
};