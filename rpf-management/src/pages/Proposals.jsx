import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProposals, compareRfp, recommendRfp } from "../api";
import ProposalComparisonTable from "./ProposalComparisonTable";
import RecommendationCard from "./RecommendationCard";
import { groupProposalsByRfp } from "../utils/groupProposals";

export default function Proposals() {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [err, setErr] = useState(null);
  const [comparisons, setComparisons] = useState({});
  const [recommendations, setRecommendations] = useState({});
  const [compareLoadingRfpId, setCompareLoadingRfpId] = useState(null);
  const [recLoadingRfpId, setRecLoadingRfpId] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const result = await listProposals();

        if (mounted && Array.isArray(result)) {
          setProposals(result);
        }
      } catch (error) {
        console.error("Failed to load proposals", error);
        if (mounted) {
          setErr("Failed to fetch proposals");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    const interval = setInterval(load, 100000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  async function handleCompare(rfpId) {
    if (!rfpId) {
      return alert("Missing RFP id");
    }

    setCompareLoadingRfpId(rfpId);

    try {
      const res = await compareRfp(rfpId);

      setComparisons((current) => ({
        ...current,
        [rfpId]: res,
      }));

      // A fresh comparison should invalidate
      // the previous recommendation.
      setRecommendations((current) => {
        const next = { ...current };
        delete next[rfpId];
        return next;
      });
    } catch (err) {
      console.error("compareRfp failed", err);
      alert("Compare failed");
    } finally {
      setCompareLoadingRfpId(null);
    }
  }

  async function handleRecommend(rfpId) {
    if (!rfpId) {
      return alert("Missing RFP id");
    }

    if (!comparisons[rfpId]) {
      return alert("Compare the proposals first.");
    }

    setRecLoadingRfpId(rfpId);

    try {
      const res = await recommendRfp(rfpId);
      console.log("Recommendation", res);

      setRecommendations((current) => ({
        ...current,
        [rfpId]: res,
      }));
    } catch (err) {
      console.error("recommendRfp failed", err);
      alert("Recommendation failed");
    } finally {
      setRecLoadingRfpId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-gray-900">
            Loading proposals...
          </h1>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-red-600">{err}</h1>
        </div>
      </div>
    );
  }

  if (!proposals.length) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              No proposals yet
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Proposals will appear here when registered vendors reply to an RFP
              and the RFP ID can be identified from the email subject or body.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const rfpGroups = groupProposalsByRfp(proposals);
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>

        <p className="mt-2 mb-6 text-sm text-gray-500">
          Vendor responses automatically extracted from recent proposal emails.
        </p>

        {rfpGroups.map((group) => {
          const { rfpId, rfpTitle, proposals: rfpProposals } = group;
          const comparison = comparisons[rfpId];
          const recommendation = recommendations[rfpId];
          const hasComparison = comparison != null;

          return (
            <section
              key={rfpId}
              className="rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {/* RFP header */}
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {rfpTitle}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {rfpProposals.length}{" "}
                      {rfpProposals.length === 1 ? "proposal" : "proposals"}
                    </p>
                  </div>

                  <Link
                    to={`/rfps/${rfpId}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View RFP →
                  </Link>
                </div>
              </div>

              {/* Proposals */}
              <div className="divide-y divide-gray-100">
                {rfpProposals.map((proposal) => {

                  const vendor =
                    proposal.vendor && typeof proposal.vendor === "object"
                      ? proposal.vendor
                      : null;

                  const vendorName =
                    vendor?.name || proposal.vendorName || "Unknown vendor";

                  const vendorEmail =
                    vendor?.email || proposal.contactEmail || "";

                  const total =
                    typeof proposal.total === "number"
                      ? `₹${proposal.total.toLocaleString("en-IN")}`
                      : proposal.total || "—";

                  return (
                    <div
                      key={proposal._id}
                      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
                        {/* Main information */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <strong className="text-lg font-semibold text-gray-900">
                              {vendorName}
                            </strong>

                            <span className="text-gray-600">— {total}</span>
                          </div>

                          {vendorEmail && (
                            <div className="mt-1 text-xs text-gray-500">
                              {vendorEmail}
                            </div>
                          )}

                          <div className="mt-4 text-sm text-gray-600">
                            <strong className="font-semibold text-gray-800">
                              RFP:
                            </strong>{" "}
                            {rfpTitle}
                          </div>

                          {/* Items */}
                          <div className="mt-5">
                            <strong className="text-sm font-semibold text-gray-900">
                              Proposed items
                            </strong>

                            {Array.isArray(proposal.items) &&
                            proposal.items.length ? (
                              <ul className="mt-2 space-y-1 pl-5">
                                {proposal.items.slice(0, 5).map((item) => {
                                  let priceLabel = "Price not specified";

                                  if (item.totalPrice != null) {
                                    priceLabel = `₹${Number(item.totalPrice).toLocaleString("en-IN")}`;
                                  } else if (item.unitPrice != null) {
                                    priceLabel = `₹${Number(item.unitPrice).toLocaleString("en-IN")} / unit`;
                                  }

                                  return (
                                    <li
                                      key={
                                        item.id ??
                                        item._id ??
                                        JSON.stringify(item)
                                      }
                                      className="text-sm text-gray-700"
                                    >
                                      <strong>{item.name || "Item"}</strong>
                                      {" — "}
                                      Qty: {item.qty ?? 1}
                                      {" — "}
                                      {priceLabel}
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <div className="mt-2 text-sm text-gray-400">
                                No line items could be extracted.
                              </div>
                            )}
                          </div>

                          {/* Commercial terms */}
                          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                            {proposal.deliveryDays && (
                              <span>
                                <strong>Delivery:</strong>{" "}
                                {proposal.deliveryDays} days
                              </span>
                            )}

                            {proposal.paymentTerms && (
                              <span>
                                <strong>Payment:</strong>{" "}
                                {proposal.paymentTerms}
                              </span>
                            )}

                            {proposal.warranty && (
                              <span>
                                <strong>Warranty:</strong> {proposal.warranty}
                              </span>
                            )}
                          </div>

                          <div className="mt-4 text-xs text-gray-400">
                            AI-extracted from vendor email
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 lg:w-32 lg:text-right">
                          <div className="mt-2 text-xs text-gray-400">
                            {proposal.createdAt
                              ? new Date(proposal.createdAt).toLocaleString()
                              : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RFP-level actions */}
              <div className="border-t border-gray-200 px-6 py-5">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleCompare(rfpId)}
                    disabled={compareLoadingRfpId === rfpId}
                    className="rounded-lg border border-gray-500 bg-gray-300 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-blue-400 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {compareLoadingRfpId === rfpId
                      ? "Comparing..."
                      : "Compare Proposals"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRecommend(rfpId)}
                    disabled={!hasComparison || recLoadingRfpId === rfpId}
                    className={`rounded-lg px-4 py-2.5 text-sm font-medium transition
  ${
    hasComparison
      ? "border border-gray-500 bg-gray-300 text-black transition hover:bg-blue-400 active:bg-blue-700"
      : "cursor-not-allowed border border-gray-400 bg-gray-100 text-gray-400"
  }
`}
                  >
                    {recLoadingRfpId === rfpId
                      ? "Thinking..."
                      : "Recommend Vendor"}
                  </button>
                </div>

                {/* Comparison */}
                {comparison && (
                  <div className="mt-6">
                    <ProposalComparisonTable comparison={comparison} />
                  </div>
                )}

                {/* Recommendation */}
                {recommendation && (
                  <div className="mt-6">
                    <RecommendationCard
                      recommendation={recommendation}
                      proposals={comparison?.proposals || []}
                    />
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
