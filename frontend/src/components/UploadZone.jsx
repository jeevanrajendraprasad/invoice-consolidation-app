import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { uploadFiles } from "../services/api";
import ProgressBar from "./ProgressBar";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "text/csv": [".csv"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/zip": [".zip"],
};

export default function UploadZone({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_TYPES,
    onDrop: (accepted, rejected) => {
      setFiles((prev) => [...prev, ...accepted]);
      setResults(null);
      if (rejected.length > 0) {
        toast.error(`${rejected.length} file(s) rejected — unsupported type.`);
      }
    },
  });

  const removeFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    setUploading(true);
    setProgress(0);

    try {
      const { data } = await uploadFiles(formData, (event) => {
        if (event.total) {
          setProgress(Math.round((event.loaded * 100) / event.total));
        }
      });
      setResults(data.results);
      toast.success("Upload complete!");
      setFiles([]);
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      toast.error("Upload failed. Check backend connection.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-400 bg-blue-950"
            : "border-gray-600 bg-gray-900 hover:border-blue-500 hover:bg-gray-800"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">📂</div>
        <p className="text-gray-300 font-medium">
          {isDragActive ? "Drop files here..." : "Drag & drop files here, or click to select"}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Supported: PDF, Excel (.xlsx/.xls), CSV, JPG, PNG, ZIP
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2"
            >
              <span className="text-sm text-gray-200 truncate max-w-xs">{file.name}</span>
              <span className="text-xs text-gray-500 mr-4">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <button
                onClick={() => removeFile(idx)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {uploading && <ProgressBar progress={progress} />}

      {results && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={`rounded-lg px-4 py-2 text-sm flex justify-between ${
                r.status === "success"
                  ? "bg-green-900 text-green-300"
                  : r.status === "rejected"
                  ? "bg-yellow-900 text-yellow-300"
                  : "bg-red-900 text-red-300"
              }`}
            >
              <span className="font-medium">{r.filename}</span>
              <span>
                {r.status === "success"
                  ? `✓ ${r.records_extracted} record(s) extracted`
                  : r.reason || r.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
      >
        {uploading ? "Uploading..." : `Upload ${files.length > 0 ? `(${files.length} file${files.length > 1 ? "s" : ""})` : ""}`}
      </button>
    </div>
  );
}
