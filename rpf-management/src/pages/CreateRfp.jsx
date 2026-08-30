import React, { useState } from "react";
import { createRfp } from "../api";
import { useNavigate } from "react-router-dom";
import RfpDetailsTable from "./RfpDetailTable";

export default function CreateRfp() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  async function handleCreate(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const data = await createRfp(text);
      const rfpId = data?._id || data?.id;
      setResult(data.structuredRfp || data);
      if (rfpId) {
        navigate(`/rfps/${rfpId}`);
      } else {
        alert("RFP created, but no ID was returned.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create RFP — check console");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Create RFP</h1>
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <textarea
            className="
              min-h-48 w-full resize-y rounded-lg border
              border-gray-300 bg-white p-4 text-sm text-gray-900
              outline-none transition
              placeholder:text-gray-400
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20
            "
            placeholder="Describe what you need (e.g., 10 laptops/monitors, 16GB RAM, 14-inch, warranty, delivery time in weeks/days, payment terms, Total budget and unit budget if known...)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="rounded-lg border border-gray-500 bg-gray-300 px-4 py-2.5 text-sm font-medium text-black transition enabled:hover:bg-blue-400 enabled:active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Parsing…" : "Create RFP"}
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Structured RFP
            </h3>

            <RfpDetailsTable rfp={result} />
          </div>
        )}
      </div>
    </div>
  );
}
