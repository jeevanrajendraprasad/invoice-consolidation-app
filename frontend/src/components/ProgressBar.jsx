import React from "react";

export default function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
      <div
        className="h-3 bg-blue-500 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
      <p className="text-xs text-gray-400 mt-1 text-right">{progress}%</p>
    </div>
  );
}
