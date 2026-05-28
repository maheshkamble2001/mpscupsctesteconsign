import { encryptData, decryptData } from "../../configs/encryption";
import { instance as axios } from "../../configs/axiosInstance";
import Cookies from "js-cookie";

const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";

export const getStudentList = async (data) => {
    const access_token = Cookies.get("access_token");
    const payload = isEncryptionEnabled
        ? encryptData({ ...data, access_token })
        : { ...data, access_token };
    try {
        const response = await axios.get(`/students-all-list`, {
            params: isEncryptionEnabled ? { reqData: payload } : payload,
        });
        const decrypted = isEncryptionEnabled
            ? decryptData(response)
            : response.data;
        return decrypted;
    } catch (error) {
        console.error("Error inside getStudentList:", error);
        throw error;
    }
};

export const getStudentDetails = async (data) => {
    const access_token = Cookies.get("access_token");
    const payload = isEncryptionEnabled
        ? encryptData({ ...data, access_token })
        : { ...data, access_token };
    try {
        const response = await axios.get(`/student-details`, {
            params: isEncryptionEnabled ? { reqData: payload } : payload,
        });
        const decrypted = isEncryptionEnabled
            ? decryptData(response)
            : response.data;
        return decrypted;
    } catch (error) {
        console.error("Error inside getStudentDetails:", error);
        throw error;
    }
};

export const getStateDropdown = async (data) => {
    const access_token = Cookies.get("access_token");
    const payload = isEncryptionEnabled
        ? encryptData({ ...data, access_token })
        : { ...data, access_token };
    try {
        const response = await axios.get(`/state-dropdown`, {
            params: isEncryptionEnabled ? { reqData: payload } : payload,
        });
        const decrypted = isEncryptionEnabled
            ? decryptData(response)
            : response.data;
        return decrypted;
    } catch (error) {
        console.error("Error inside getStateDropdown:", error);
        throw error;
    }
};

export const updateStudentStatus = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/student-status`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside updateStudentStatus:", error);
    throw error;
  }
};

export const deleteStudent = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/student-delete`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside deleteStudent:", error);
    throw error;
  }
};

export const updateStudent = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/student-edit`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside updateStudent:", error);
    throw error;
  }
};
export const addStudent = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/student-create`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside addStudent:", error);
    throw error;
  }
};