import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchInvoices, getExportUrl } from "../services/api";
import InvoiceTable from "../components/InvoiceTable";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (vendor) params.vendor = vendor;
      if (paymentStatus) params.payment_status = paymentStatus;
      const { data } = await fetchInvoices(params);
      setInvoices(data);
    } catch {
      toast.error("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleExport = () => {
    window.open(getExportUrl(), "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-gray-400 text-sm">{invoices.length} record(s) found</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Download Excel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Filter by vendor..."
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="unknown">Unknown</option>
        </select>
        <button
          onClick={load}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Apply
        </button>
        <button
          onClick={() => {
            setVendor("");
            setPaymentStatus("");
            setTimeout(load, 0);
          }}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          Reset
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-16">Loading invoices...</div>
      ) : (
        <InvoiceTable invoices={invoices} />
      )}
    </div>
  );
}
