import axios from "axios";

const normalizeApiBaseUrl = (configuredUrl) => {
  const fallbackBaseUrl = "/api/v1";
  if (!configuredUrl) return fallbackBaseUrl;

  const trimmed = configuredUrl.trim();
  if (!trimmed) return fallbackBaseUrl;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const pathname = parsed.pathname.replace(/\/+$/, "");
      const basePath = pathname && pathname !== "/" ? pathname : "/api/v1";
      return `${parsed.origin}${basePath.endsWith("/api/v1") ? basePath : `${basePath}/api/v1`}`;
    } catch {
      return `${trimmed.replace(/\/+$/, "")}/api/v1`;
    }
  }

  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const cleanedPath = normalizedPath.replace(/\/+$/, "");
  return cleanedPath.endsWith("/api/v1") ? cleanedPath : `${cleanedPath}/api/v1`;
};

export const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL || ""),
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
