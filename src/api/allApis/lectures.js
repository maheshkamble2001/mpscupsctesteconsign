import { encryptData, decryptData } from "../../configs/encryption";
import { instance as axios } from "../../configs/axiosInstance";
import Cookies from "js-cookie";

const isEncryptionEnabled = import.meta.env.VITE_ENCRYPTION === "true";

export const getLecturesList = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data,access_token })
    : { ...data,access_token };

  try {
    const response = await axios.get("/list-lectures", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
   
    return decrypted;
    
  } catch (error) {
    console.error("Error inside getLecturesList:", error);
    throw error;
  }
};


// create-lecture

export const createLecture = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/create-lecture`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside createLecture:", error);
    throw error;
  }
};


// edit-lecture

export const updateLecture= async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/edit-lecture`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error inside createLecture:", error);
    throw error;
  }
};

// status-lecture

export const updateLectureStatus = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/status-lecture`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error in updateLectureStatus:", error);
    throw error;
  }
};

// delete lecture


export const deleteLecture = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/delete-lecture`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error in deleteLecture:", error);
    throw error;
  }
};



export const getS3Lectures = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data,access_token })
    : { ...data,access_token };

  try {
    const response = await axios.get("/get-lecture-folders-from-s3", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
   
    return decrypted;
    
  } catch (error) {
    console.error("Error inside getS3Lectures:", error);
    throw error;
  }
};



// get-lecture-sources

export const getLectureSources = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data,access_token })
    : { ...data,access_token };

  try {
    const response = await axios.get("/get-lecture-sources", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
   
    return decrypted;
    
  } catch (error) {
    console.error("Error inside getLectureSources:", error);
    throw error;
  }
};

// lecture resources apis 



export const addLectureResources = async (data, option) => {
  return decryptData(
    await axios.post(`/add-lecture-source`, data, option)
  );
};


export const updateLectureResources = async (data, option) => {
  return decryptData(
    await axios.post(`/edit-lecture-source`, data, option)
  );
};


// delete lecture


export const deleteLectureSource = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/delete-lecture-source`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error in deleteLectureSource:", error);
    throw error;
  }
};

// /generate-transcript

export const generateTranscript = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data,access_token })
    : { ...data,access_token };

  try {
    const response = await axios.get("/generate-transcript", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
   
    return decrypted;
    
  } catch (error) {
    console.error("Error inside generateTranscript:", error);
    throw error;
  }
};

export const generateFlashMcq = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/generate-sample-mcq-flashcards`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error in generateFlashMcq:", error);
    throw error;
  }
}; 

export const getFlashMcqPollingStatus = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data,access_token })
    : { ...data,access_token };

  try {
    const response = await axios.get("/polling-flashmcq", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
   
    return decrypted;
    
  } catch (error) {
    console.error("Error inside getFlashMcqPollingStatus:", error);
    throw error;
  }
};

// get-lecture-mcq-flashcards?lectureid=74

export const getFlashMcq= async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? encryptData({ ...data,access_token })
    : { ...data,access_token };

  try {
    const response = await axios.get("/get-lecture-mcq-flashcards", {
      params: isEncryptionEnabled ? { reqData: payload } : payload,
    });

    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
   
    return decrypted;
    
  } catch (error) {
    console.error("Error inside getFlashMcq:", error);
    throw error;
  }
};


// generate-mcq-flashcards

export const generateFinalFlashMcq = async (data) => {
  const access_token = Cookies.get("access_token");

  const payload = isEncryptionEnabled
    ? { reqData: encryptData({ ...data, access_token }) }
    : { ...data, access_token };

  try {
    const response = await axios.post(`/generate-mcq-flashcards`, payload);
    const decrypted = isEncryptionEnabled ? decryptData(response) : response.data;
    return decrypted;
  } catch (error) {
    console.error("Error in generateFlashMcq:", error);
    throw error;
  }
}; 

