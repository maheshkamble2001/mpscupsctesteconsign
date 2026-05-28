import { encryptData, decryptData } from "../../configs/encryption";
import { instance as axios } from "../../configs/axiosInstance";
import Cookies from "js-cookie";

const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";

//  Get Uer Role Api
export const getUserRolesList = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data,access_token })
    : { ...data,access_token };

  try {
    const response = await axios.get("/usertype-list", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
   
    return decrypted;
    
  } catch (error) {
    console.error("Error inside getUserRolesList:", error);
    throw error;
  }
};

// get active user roles list
export const getActiveUserRolesList = async () => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ access_token })
    : { access_token };

  try {
    const response = await axios.get("/usertype-active-list", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
  
    return decrypted;
  } catch (error) {
    console.error("Error inside getActiveUserRolesList:", error);
    throw error;
  }
};

// Add User Role Api

export const createUserRole = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/usertype-create`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside createUserRole:", error);
    throw error;
  }
};

//edit User Role api
export const editUserRole = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/usertype-edit`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside editUserRole:", error);
    throw error;
  }
};

//delete user role api 


export const deleteUserRole = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/usertype-delete`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside deleteUserRole:", error);
    throw error;
  }
};

// update role api 

export const updateUserRoleStatus = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/usertype-status`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error in updateUserRoleStatus:", error);
    throw error;
  }
};