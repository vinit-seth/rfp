import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRfp, listVendors, sendRfp } from "../api";
import RfpDetailsTable from "./RfpDetailTable";

export default function RfpDetail() {
  const { id } = useParams(); // route param — use this for API calls
  const [rfp, setRfp] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  // reload when `id` changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (!id) {
      console.warn("No RFP id in route");
      return;
    }
    setLoading(true);
    try {
      const [r, vs] = await Promise.all([getRfp(id), listVendors()]);
      // Defensive: if the API wraps r within an object, handle both shapes
      const actualRfp = r?.rfp ?? r;
      setRfp(actualRfp);
      setVendors(Array.isArray(vs) ? vs : (vs?.vendors ?? []));
    } catch (err) {
      console.error("Failed to load RFP or vendors", err);
      alert("Failed to load RFP / vendors. See console for details.");
    } finally {
      setLoading(false);
    }
  }

  function toggle(vIdRaw) {
    // ensure string form because some IDs can be ObjectId objects (safety)
    const vId = String(vIdRaw);
    const s = new Set(selected);
    if (s.has(vId)) s.delete(vId);
    else s.add(vId);
    setSelected(s);
  }

  async function handleSend() {
    // use route param `id` — safer than reading rfp._id (avoids undefined)
    const rfpId = id || rfp?._id;
    if (!rfpId) {
      return alert("RFP id missing. Cannot send.");
    }

    const arr = Array.from(selected);
    if (arr.length === 0) return alert("Pick at least one vendor");

    setSending(true);
    try {
      // sendRfp should accept (rfpId, vendorsArray)
      await sendRfp(rfpId, arr);
      alert("RFP sent to selected vendors");
    } catch (err) {
      console.error("sendRfp failed", err);
      alert("Failed to send — check server logs.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-gray-900">No RFP found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">
          RFP: {rfp.title || rfp._id}
        </h1>

        {/* Details */}
        <div className="mt-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            RFP Details
          </h3>

          <RfpDetailsTable rfp={rfp} />
        </div>

        {/* Vendors */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            Send to vendors
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {vendors.length === 0 && (
              <div className="text-sm text-gray-500">No vendors yet</div>
            )}
            {vendors.map((v) => {
              const vId = String(v._id || v.id || v.email || v.name);
              const isSelected = selected.has(vId);

              return (
                <label
                  key={vId}
                  className="flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(vId)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div className="min-w-0 flex-1">
                    <strong
                      className="block truncate text-sm text-gray-900"
                      title={v.name}
                    >
                      {v.name}
                    </strong>

                    <div
                      className="mt-1 truncate text-xs text-gray-500"
                      title={v.email}
                    >
                      {v.email}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="rounded-lg border border-gray-500 bg-gray-300 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-blue-400 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSend}
              disabled={sending || !id}
            >
              {sending ? "Sending..." : "Send RFP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
