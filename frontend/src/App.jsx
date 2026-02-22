import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import InvoicesPage from "./pages/InvoicesPage";
import DashboardPage from "./pages/DashboardPage";

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? "bg-blue-600 text-white"
      : "text-gray-300 hover:bg-gray-700 hover:text-white"
  }`;

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
        <span className="text-lg font-bold text-blue-400 mr-4">
          InvoiceAI
        </span>
        <NavLink to="/" className={navLinkClass}>
          Upload
        </NavLink>
        <NavLink to="/invoices" className={navLinkClass}>
          Invoices
        </NavLink>
        <NavLink to="/dashboard" className={navLinkClass}>
          Dashboard
        </NavLink>
      </nav>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}
