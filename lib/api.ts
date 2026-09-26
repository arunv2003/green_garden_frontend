import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL||"http://green-garden.arunverma.online/api"||"https://green-garden-backend.vercel.app/api" || "http://localhost:5007/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("gg_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      // If unauthorized and not already on login page
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("gg_token");
        localStorage.removeItem("gg_user");
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      console.warn("403 Forbidden:", error.response?.data?.message || "Access denied for current role");
    }
    return Promise.reject(error);
  }
);

export default api;
