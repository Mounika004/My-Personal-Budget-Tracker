import axios from "axios";

// Base API URL (client/.env must have REACT_APP_API_URL=http://localhost:3001/api)
const base = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const instance = axios.create({
  baseURL: base,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default instance;
