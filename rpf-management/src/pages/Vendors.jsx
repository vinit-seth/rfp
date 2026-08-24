import React, { useEffect, useState } from "react";
import { listVendors, createVendor } from "../api";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await listVendors();
      setVendors(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const v = await createVendor({ name, email });
      setVendors((s) => [v, ...s]);
      setName("");
      setEmail("");
    } catch (err) {
      console.error(err);
      alert("Failed to create vendor");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>

        {/* Add vendor */}
        <form
          className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          onSubmit={handleAdd}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Vendor name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Vendor email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button className="rounded-lg border border-gray-500 bg-gray-300 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-blue-400 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" type="submit">
              Add vendor
            </button>
          </div>
        </form>

        {/* Vendor list */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">All vendors</h3>

          {loading ? (
            <div className="mt-4 text-sm text-gray-500">Loading...</div>
          ) : (
            <ul className="mt-4 divide-y divide-gray-100">
              {vendors.map((v) => (
                <li key={v._id} className="py-4 first:pt-0 last:pb-0">
                  <strong className="text-sm font-semibold text-gray-900">
                    {v.name}
                  </strong>

                  <div className="mt-1 text-sm text-gray-500">{v.email}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
