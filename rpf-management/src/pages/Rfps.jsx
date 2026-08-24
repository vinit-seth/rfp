import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listRfps } from "../api";

export default function Rfps() {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await listRfps();
        if (mounted) setRfps(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load RFPs", err);
        if (mounted) setError("Failed to load RFPs");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-gray-900">Loading RFPs...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-red-600">{error}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">All RFPs</h1>

        {rfps.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-gray-600">
              No RFPs yet. Create one from the natural-language form.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {rfps.map((rfp) => (
              <li
                key={rfp._id}
                className="
                  rounded-xl border border-gray-200
                  bg-white p-5 shadow-sm
                  transition hover:shadow-md
                "
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {rfp.title}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <div>Budget: {rfp.budget ?? "—"}</div>

                      <div>
                        Delivery:{" "}
                        {rfp.deliveryDays ? `${rfp.deliveryDays} days` : "—"}
                      </div>

                      <div>Payment: {rfp.paymentTerms ?? "—"}</div>
                    </div>
                  </div>

                  <Link
                    to={`/rfps/${rfp._id}`}
                    className="rounded-lg border border-gray-500 bg-gray-300 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-blue-400 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
