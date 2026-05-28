import axios from "axios";
import { decryptData } from "../configs/encryption";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Vite uses `import.meta.env`
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => decryptData(response),
  (error) => Promise.reject(error)
);

export default axiosInstance;
