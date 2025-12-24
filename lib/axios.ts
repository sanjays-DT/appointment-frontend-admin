import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
