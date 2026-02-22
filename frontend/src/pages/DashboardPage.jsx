import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { fetchInvoices } from "../services/api";

const COLORS = ["#22c55e", "#f59e0b", "#6b7280"];

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-gray-900 rounded-xl px-6 py-5 border border-gray-700">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices()
      .then(({ data }) => setInvoices(data))
      .catch(() => toast.error("Failed to load dashboard data."));
  }, []);

  // KPIs
  const totalValue = invoices.reduce((s, i) => s + (Number(i.total_amount) || 0), 0);
  const paid = invoices.filter((i) => i.payment_status === "paid");
  const pending = invoices.filter((i) => i.payment_status === "pending");

  // Pie — payment status breakdown
  const pieData = [
    { name: "Paid", value: paid.length },
    { name: "Pending", value: pending.length },
    { name: "Unknown", value: invoices.length - paid.length - pending.length },
  ].filter((d) => d.value > 0);

  // Bar — invoices per vendor
  const vendorMap = {};
  invoices.forEach((inv) => {
    const v = inv.vendor_name || "Unknown";
    vendorMap[v] = (vendorMap[v] || 0) + 1;
  });
  const vendorData = Object.entries(vendorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Line — monthly invoice volume
  const monthMap = {};
  invoices.forEach((inv) => {
    if (!inv.upload_timestamp) return;
    const month = inv.upload_timestamp.slice(0, 7); // YYYY-MM
    monthMap[month] = (monthMap[month] || 0) + 1;
  });
  const monthData = Object.entries(monthMap)
    .sort()
    .map(([month, count]) => ({ month, count }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total Invoice Value"
          value={`$${totalValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
          sub="Sum of all total_amount"
        />
        <KpiCard
          label="Paid Invoices"
          value={paid.length}
          sub={`$${paid.reduce((s, i) => s + (Number(i.total_amount) || 0), 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
        />
        <KpiCard
          label="Pending Invoices"
          value={pending.length}
          sub={`$${pending.reduce((s, i) => s + (Number(i.total_amount) || 0), 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie chart */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Payment Status Breakdown</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No data yet.</p>
          )}
        </div>

        {/* Bar chart */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Invoices per Vendor</h2>
          {vendorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vendorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">No data yet.</p>
          )}
        </div>
      </div>

      {/* Line chart */}
      {monthData.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Monthly Invoice Volume</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
              <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
