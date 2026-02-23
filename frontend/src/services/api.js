import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

export const uploadFiles = (formData, onUploadProgress) =>
  api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

export const fetchInvoices = (params) =>
  api.get("/invoices", { params });

export const fetchInvoice = (id) =>
  api.get(`/invoices/${id}`);

export const fetchLogs = () =>
  api.get("/logs");

export const getExportUrl = () => `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/export`;

export default api;
