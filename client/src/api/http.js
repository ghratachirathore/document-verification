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
    if (!error.response) {
      error.userMessage = "Unable to reach the API. Check VITE_API_URL, backend availability, and CORS settings.";
    }
    return Promise.reject(error);
  }
);

export const unwrap = (response) => {
  if (!response) throw new Error("No API response received");
  if (response.status === 204) return {};
  if (!response.data) throw new Error("Empty API response received");
  if (response.data.success === false) throw new Error(response.data.message || "API request failed");
  if (!Object.prototype.hasOwnProperty.call(response.data, "data")) {
    throw new Error(response.data.message || "Unexpected API response format");
  }
  return response.data.data;
};

export const getApiErrorMessage = (error, fallback = "Request failed") =>
  error?.response?.data?.message || error?.userMessage || error?.message || fallback;
