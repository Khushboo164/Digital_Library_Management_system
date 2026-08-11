import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.PROD ? "https://digital-library-management-system-ui7w.onrender.com/api" : "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add JWT token to authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
