import React from "react";

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

export default function RfpDetailsTable({ rfp }) {
  if (!rfp) return null;

  const items = Array.isArray(rfp.items)
    ? rfp.items
    : [];

  const rows = [
    ["Title", rfp.title],
    ["Description", rfp.description],
    ["Budget", formatCurrency(rfp.budget)],
    [
      "Delivery",
      rfp.deliveryDays
        ? `${rfp.deliveryDays} days`
        : "—",
    ],
    ["Payment Terms", rfp.paymentTerms],
    ["Warranty", rfp.warranty],
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr
              key={label}
              className="border-b border-gray-100 last:border-b-0"
            >
              <th className="w-1/3 bg-gray-50 px-5 py-4 font-semibold text-gray-700">
                {label}
              </th>

              <td className="px-5 py-4 text-gray-600">
                {value || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="bg-gray-50 px-5 py-4">
            <h4 className="font-semibold text-gray-700">
              Required Items
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-5 py-3 font-semibold text-gray-700">
                    Item
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-700">
                    Quantity
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-700">
                    Specifications
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-700">
                    Unit Budget
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item._id || item.id || index}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {item.name || "—"}
                    </td>

                    <td className="px-5 py-3 text-gray-600">
                      {item.qty ?? "—"}
                    </td>

                    <td className="px-5 py-3 text-gray-600">
                      {item.specs || "—"}
                    </td>

                    <td className="px-5 py-3 text-gray-600">
                      {formatCurrency(item.unitBudget)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}