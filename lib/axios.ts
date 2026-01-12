import axios from "axios";

const localUrl = "http://localhost:5000/api";
const BASE_URL =
  window.location.hostname === "localhost"
    ? localUrl
    : "https://appointment-backend-qntn.onrender.com/api";


const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
       (config.headers as any) = { ...config.headers, Authorization: `Bearer ${token}` };
    }
  }
  return config;
});

export default instance;
