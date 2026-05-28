import { encryptData, decryptData } from "../../configs/encryption";
import { instance as axios } from "../../configs/axiosInstance";
import Cookies from "js-cookie";

const access_token = Cookies.get("access_token");
const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";

export const getUsersList = async (data) => {
  const payload = isEncryptionEnabled
    ? encryptData({ ...data, access_token })
    : { ...data, access_token };
  try {
    const response = await axios.get(`/users-all-list`, {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });
    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside getUsersList:", error);
    throw error;
  }
};

export const getUserDetails = async (data) => {
  const payload = isEncryptionEnabled
    ? encryptData({ ...data, access_token })
    : { ...data, access_token };

  try {
    const response = await axios.get(`/user-details`, {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;

  } catch (error) {
    console.error("Error inside getUsersList:", error);
    throw error;
  }
};


export const updateUserStatus = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/user-status`, payload);
    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside updateUserStatus:", error);
    throw error;
  }
};
// export const UserCreate = async (formData) => {
//   try {
//     const response = await axios.post(`/user-create`, formData, {
//       headers: {
//         Authorization: `Bearer ${Cookies.get("access_token")}`,
//         // Do NOT set Content-Type here — let Axios set it to multipart/form-data
//       },
//     });

//     const decrypted = isEncryptionEnabled
//       ? decryptData(response)
//       : response.data;
//     return decrypted;
//   } catch (error) {
//     console.error("Error in createUser:", error);
//     throw error;
//   }
// };

export const UserCreate = async (data, option) => {
  return decryptData(
    await axios.post(`/user-create`, data, option)
  );
};

// export const updateUser = async (formData) => {
//   try {
//     const response = await axios.post(`/user-edit`, formData, {
//       headers: {
//         Authorization: `Bearer ${Cookies.get("access_token")}`,
//         // Do NOT set Content-Type here — let Axios set it to multipart/form-data
//       },
//     });

//     const decrypted = isEncryptionEnabled
//       ? decryptData(response)
//       : response.data;
//     return decrypted;
//   } catch (error) {
//     console.error("Error in createUser:", error);
//     throw error;
//   }
// };

export const updateUser = async (data, option) => {
  return decryptData(
    await axios.post(`/user-edit`, data, option)
  );
};

// export const deleteUser = async (formData) => {
//   try {
//     const response = await axios.post(`/user-delete`, formData, {
//       headers: {
//         Authorization: `Bearer ${Cookies.get("access_token")}`,
//         // Do NOT set Content-Type here — let Axios set it to multipart/form-data
//       },
//     });

//     const decrypted = isEncryptionEnabled
//       ? decryptData(response)
//       : response.data;
//     return decrypted;
//   } catch (error) {
//     console.error("Error in createUser:", error);
//     throw error;
//   }
// };

export const deleteUser = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/user-delete`, payload);

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside deleteUser:", error);
    throw error;
  }
};

export const markAsRecovered = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/mark-as-recovered`, payload);
    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside updateUserStatus:", error);
    throw error;
  }
};

export const alloteItemUser = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/itemallotment-create`, payload);
    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside updateUserStatus:", error);
    throw error;
  }
};
export const getUserTypeList = async (data) => {
  const payload = isEncryptionEnabled
    ? encryptData({ ...data, access_token })
    : { ...data, access_token };



  try {
    const response = await axios.get(`/usertype-list`, {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });



    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside getUsersList:", error);
    throw error;
  }
};
export const getItemAllotmentListbyID = async (data) => {
  const payload = isEncryptionEnabled
    ? encryptData({ ...data, access_token })
    : { ...data, access_token };


  try {
    const response = await axios.get(`/itemallotment-list-by-id`, {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });



    const decrypted = isEncryptionEnabled
      ? decryptData(response)
      : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside getUsersList:", error);
    throw error;
  }
};

export const getSatates = async () => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ access_token })
    : { access_token };

  try {
    const response = await axios.get("/state-dropdown", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside getSatates:", error);
    throw error;
  }
}; 
