import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("eduverify_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("eduverify_token");
      localStorage.removeItem("eduverify_user");
      window.dispatchEvent(new Event("eduverify:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export const unwrap = (response) => response.data.data;
