import { encryptData, decryptData } from "../../configs/encryption";
import { instance as axios } from "../../configs/axiosInstance";
import Cookies from "js-cookie";
 
const access_token = Cookies.get("access_token");
const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";

//-----------------------------------menus-------------------------------//
//menu list

export const getMenuAccessCodesList = async (data) => {
  const access_token = Cookies.get("access_token");
  const payload = isEncryptionEnabled
    ? encryptData({ ...data, access_token })
    : { ...data, access_token };

  try {
    const response = await axios.get("/menuaccesscodes-list", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside getMenuAccessCodesList:", error);
    throw error;
  }
};

// menu modules dropdown
export const getMenuModulesDropdown = async (data) => {
  const access_token = Cookies.get("access_token");
  const payload = isEncryptionEnabled
    ? encryptData({ ...data, access_token })
    : { ...data, access_token };
  
  try {
    const response = await axios.get("/menumodules-dropdown", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside getMenuModulesDropdown:", error);
    throw error;
  }
};

//menu add

export const menuAccessCodesAdd = async (data) => {
  const access_token = Cookies.get("access_token");
  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/menuaccesscodes-add`, payload);
    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside menu access management:", error);
    throw error;
  }
};

//update menu status

export const updateMenuAccessCodeStatus = async (data) => {
  const access_token = Cookies.get("access_token");
  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/menuaccesscodes-status`, payload);
    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside menu access management:", error);
    throw error;
  }
};

// edit menu
export const menuAccessCodesEdit = async (data) => {
  const access_token = Cookies.get("access_token");
  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/menuaccesscodes-edit`, payload);
    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside menu access management:", error);
    throw error;
  }
};

// delete menu

export const menuAccessCodesDelete = async (data) => {
  const access_token = Cookies.get("access_token");
  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/menuaccesscodes-delete`, payload);
    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside menu access management:", error);
    throw error;
  }
};
//-----------------------------------Assign menus-------------------------------//

export const getRoleModuleList = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data,access_token })
    : { ...data,access_token };

  try {
    const response = await axios.get("/list-roles-with-module", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
    
  } catch (error) {
    console.error("Error inside getRoleModuleList:", error);
    throw error;
  }
};

// assign menu list 
export const getAssignMenuList = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data, access_token })
    : { ...data, access_token };

  try {
    const response = await axios.get("/unassigned-roleaccess", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside getAssignMenuList:", error);
    throw error;
  }
};
//assign menu to roles
export const assignMenusToRoles = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/assign-roleaccess`, payload);
    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside assignMenusToRoles", error);
    throw error;
  }
};

//--------------------------Assigned Menu ---------------------------//
export const getAssignedMenuList = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data, access_token })
    : { ...data, access_token };

  try {
    const response = await axios.get("/roleaccess-list", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside getPettyCashList:", error);
    throw error;
  }
};

export const deleteAssignedMenu = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/delete-roleaccess`, payload);
    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside menu access management:", error);
    throw error;
  }
};
export const getUserRoleDropdown = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data, access_token })
    : { ...data, access_token };

  try {
    const response = await axios.get("/userrole-dropdown", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside getPettyCashList:", error);
    throw error;
  }
};
