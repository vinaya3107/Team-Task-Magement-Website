import axios from "axios";

let rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
if (rawBaseURL.endsWith('/api')) {
  rawBaseURL = rawBaseURL.slice(0, -4);
}

const API = axios.create({
  baseURL: rawBaseURL,
});

console.log("=== API AXIOS CONFIG ===");
console.log("rawBaseURL:", rawBaseURL);

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ttm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[AXIOS REQ] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
  return config;
});

// Handle errors
API.interceptors.response.use(
  (response) => {
    console.log(`[AXIOS RES] ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error(`[AXIOS ERR]`, error.response?.status, error.message, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('ttm_token');
      localStorage.removeItem('ttm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
