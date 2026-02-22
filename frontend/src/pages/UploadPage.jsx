import React, { useState } from "react";
import UploadZone from "../components/UploadZone";
import { fetchLogs } from "../services/api";

export default function UploadPage() {
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const handleUploadComplete = async () => {
    try {
      const { data } = await fetchLogs();
      setLogs(data);
      setShowLogs(true);
    } catch {
      // logs are optional
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Upload Invoices</h1>
        <p className="text-gray-400 text-sm">
          Upload PDF, Excel, CSV, images, or ZIP files. The AI will extract and normalize
          all invoice data automatically.
        </p>
      </div>

      <UploadZone onUploadComplete={handleUploadComplete} />

      {showLogs && logs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-300">Upload History</h2>
          <div className="space-y-2">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-2 text-sm"
              >
                <span className="text-gray-300 truncate max-w-xs">{log.filename}</span>
                <span className="text-gray-500 text-xs mx-4">{log.file_type}</span>
                <span className="text-gray-400">{log.records_extracted} records</span>
                <span
                  className={`ml-4 text-xs font-semibold ${
                    log.status === "success" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
