import axios from "axios";
import { isLoggedIn } from "utils/jwt";
// Axios instances
export const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin`,
});

export const masterInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/master`,
});

export const adminInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin`,
});

export const setJwtToken = () => ({
  headers: {
    Authorization: "Bearer " + isLoggedIn(),
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const setMultiPartHeader = () => ({
  headers: {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
  },
});
