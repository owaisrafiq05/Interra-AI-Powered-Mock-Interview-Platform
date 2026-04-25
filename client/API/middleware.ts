import axios from "axios";

const getAccessToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "" : undefined);

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
