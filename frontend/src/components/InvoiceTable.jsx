import React from "react";

const STATUS_STYLES = {
  paid: "bg-green-800 text-green-300",
  pending: "bg-yellow-800 text-yellow-300",
  unknown: "bg-gray-700 text-gray-400",
  success: "bg-green-800 text-green-300",
  failed: "bg-red-800 text-red-300",
};

function StatusBadge({ value }) {
  const cls = STATUS_STYLES[value?.toLowerCase()] || "bg-gray-700 text-gray-400";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {value || "—"}
    </span>
  );
}

function fmt(value, prefix = "") {
  if (value === null || value === undefined) return "—";
  return `${prefix}${Number(value).toFixed(2)}`;
}

export default function InvoiceTable({ invoices }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16">
        No invoices found. Upload some files to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
          <tr>
            {[
              "ID", "Invoice #", "Vendor", "Date", "Amount",
              "Tax", "Total", "Payment", "Source", "Processing",
            ].map((h) => (
              <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-gray-800 transition-colors">
              <td className="px-4 py-3 text-gray-400">{inv.id}</td>
              <td className="px-4 py-3 font-mono text-blue-300">{inv.invoice_number || "—"}</td>
              <td className="px-4 py-3">{inv.vendor_name || "—"}</td>
              <td className="px-4 py-3 whitespace-nowrap">{inv.invoice_date || "—"}</td>
              <td className="px-4 py-3">{fmt(inv.amount, "$")}</td>
              <td className="px-4 py-3">{fmt(inv.tax_amount, "$")}</td>
              <td className="px-4 py-3 font-semibold">{fmt(inv.total_amount, "$")}</td>
              <td className="px-4 py-3">
                <StatusBadge value={inv.payment_status} />
              </td>
              <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate" title={inv.source_file}>
                {inv.source_file}
              </td>
              <td className="px-4 py-3">
                <StatusBadge value={inv.processing_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
