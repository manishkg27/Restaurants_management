import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});



// Response interceptor to handle errors globally if needed
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (401), we could trigger logout, but let AuthContext handle specific pages
    if (error.response && error.response.status === 401) {
      // Avoid infinite loop if we are already trying to login/logout
      if (!error.config.url.includes("/auth/login") && !error.config.url.includes("/auth/profile")) {
        localStorage.removeItem("eatify_token");
        // We can let the component/hook react to this by throwing it
      }
    }
    return Promise.reject(error);
  }
);

export default API;
