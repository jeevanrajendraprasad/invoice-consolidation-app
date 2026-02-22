import axios from "axios";

const api = axios.create({
  baseURL: "/api",
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

export const getExportUrl = () => "/api/export";

export default api;
