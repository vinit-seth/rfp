import React from "react";

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

function getProposalId(proposal) {
  if (!proposal) return null;

  return String(
    proposal._id ||
      proposal.id ||
      ""
  );
}

export default function RecommendationCard({
  recommendation,
  proposals = [],
}) {
  if (!recommendation) {
    return null;
  }

  const recommendations = Array.isArray(
    recommendation.recommendation
  )
    ? recommendation.recommendation
    : [];

  if (!recommendations.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
        No recommendation is available.
      </div>
    );
  }

  const proposalsById = new Map(
    proposals.map((proposal) => [
      getProposalId(proposal),
      proposal,
    ])
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          AI Recommendation
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Vendors ranked based on the proposal evaluation.
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map(
          (item, index) => {
            const proposal =
              proposalsById.get(
                String(item.id)
              );

            const vendorName =
              proposal?.vendorName ||
              proposal?.vendor?.name ||
              "Unknown vendor";

            const email =
              proposal?.contactEmail ||
              proposal?.vendor?.email;

            const isTopRecommendation =
              index === 0;

            return (
              <div
                key={
                  item.id || index
                }
                className={`rounded-xl border p-5 ${
                  isTopRecommendation
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {vendorName}
                      </h4>

                      {isTopRecommendation && (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Recommended
                        </span>
                      )}
                    </div>

                    {email && (
                      <p className="mt-1 text-xs text-gray-500">
                        {email}
                      </p>
                    )}
                  </div>

                  {item.score != null && (
                    <div className="shrink-0 text-left sm:text-right">
                      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Score
                      </div>

                      <div
                        className={`text-2xl font-bold ${
                          isTopRecommendation
                            ? "text-green-700"
                            : "text-blue-600"
                        }`}
                      >
                        {item.score}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-lg bg-white/70 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Why this vendor?
                  </div>

                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {item.rationale ||
                      "No rationale provided."}
                  </p>
                </div>

                {proposal && (
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                    <span>
                      <strong className="text-gray-800">
                        Total:
                      </strong>{" "}
                      {formatCurrency(
                        proposal.total
                      )}
                    </span>

                    {proposal.deliveryDays !=
                      null && (
                      <span>
                        <strong className="text-gray-800">
                          Delivery:
                        </strong>{" "}
                        {
                          proposal.deliveryDays
                        }{" "}
                        days
                      </span>
                    )}

                    {proposal.paymentTerms && (
                      <span>
                        <strong className="text-gray-800">
                          Payment:
                        </strong>{" "}
                        {
                          proposal.paymentTerms
                        }
                      </span>
                    )}

                    {proposal.warranty && (
                      <span>
                        <strong className="text-gray-800">
                          Warranty:
                        </strong>{" "}
                        {proposal.warranty}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}