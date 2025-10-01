import axios from "axios";

const api = axios.create({
  // baseURL: "http://127.0.0.1:8000", // FastAPI backend
  baseURL: "https://medconnect-api-xly3.onrender.com",
});

export default api;
