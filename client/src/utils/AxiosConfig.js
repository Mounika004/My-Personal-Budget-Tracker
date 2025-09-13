import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const instance = axios.create({
  baseURL,
  timeout: 20000,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
