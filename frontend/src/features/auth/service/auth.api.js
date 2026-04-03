import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  withCredentials: true,
});

export const authApi = {
  login: async (credentials) => axiosInstance.post("/auth/login", credentials),
  register: async (userData) => axiosInstance.post("/auth/register", userData),
  logout: async () => axiosInstance.post("/auth/logout"),
  getCurrentUser: async () => axiosInstance.get("/auth/get-user"),
};
