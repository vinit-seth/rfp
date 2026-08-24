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

function getId(value) {
  if (!value) return null;

  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return String(value);
}

export default function ProposalComparisonTable({
  comparison,
}) {
  if (!comparison) {
    return null;
  }

  const proposals = Array.isArray(comparison.proposals)
    ? comparison.proposals
    : [];

  const ranking = Array.isArray(comparison.ranking)
    ? comparison.ranking
    : [];

  if (!proposals.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
        No proposal comparison data is available.
      </div>
    );
  }

  /*
   * Create a lookup:
   *
   * proposal _id
   *      ↓
   * ranking score + rationale
   */
  const rankingById = new Map(
    ranking.map((item) => [
      String(item.id),
      item,
    ])
  );

  /*
   * Prefer the backend ranking order.
   * This means highest-ranked proposal appears first.
   *
   * Proposals that don't appear in ranking are
   * appended afterward.
   */
  const rankedProposals = [...proposals].sort(
    (a, b) => {
      const aRank = ranking.findIndex(
        (item) =>
          String(item.id) === String(a._id)
      );

      const bRank = ranking.findIndex(
        (item) =>
          String(item.id) === String(b._id)
      );

      if (aRank === -1 && bRank === -1) {
        return 0;
      }

      if (aRank === -1) return 1;
      if (bRank === -1) return -1;

      return aRank - bRank;
    }
  );

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-base font-semibold text-gray-900">
            Proposal Comparison
          </h4>

          <p className="text-sm text-gray-500">
            {proposals.length}{" "}
            {proposals.length === 1
              ? "proposal"
              : "proposals"}{" "}
            compared
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-275 w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-5 py-4 font-semibold text-gray-700">
                Rank
              </th>

              <th className="px-5 py-4 font-semibold text-gray-700">
                Vendor
              </th>

              <th className="px-5 py-4 font-semibold text-gray-700">
                Total
              </th>

              <th className="px-5 py-4 font-semibold text-gray-700">
                Delivery
              </th>

              <th className="px-5 py-4 font-semibold text-gray-700">
                Payment
              </th>

              <th className="px-5 py-4 font-semibold text-gray-700">
                Warranty
              </th>

              <th className="px-5 py-4 font-semibold text-gray-700">
                Score
              </th>

              <th className="px-5 py-4 font-semibold text-gray-700">
                Assessment
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {rankedProposals.map(
              (proposal, index) => {
                const proposalId = getId(
                  proposal._id
                );

                const rankData =
                  rankingById.get(
                    proposalId
                  );

                const rank =
                  rankData
                    ? ranking.findIndex(
                        (item) =>
                          String(item.id) ===
                          proposalId
                      ) + 1
                    : null;

                const isWinner = rank === 1;

                return (
                  <tr
                    key={
                      proposalId ||
                      index
                    }
                    className={
                      isWinner
                        ? "bg-green-50/60"
                        : "hover:bg-gray-50"
                    }
                  >
                    {/* Rank */}
                    <td className="px-5 py-5 align-top">
                      {rank ? (
                        <span
                          className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-bold ${
                            isWinner
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          #{rank}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          —
                        </span>
                      )}
                    </td>

                    {/* Vendor */}
                    <td className="px-5 py-5 align-top">
                      <div className="font-semibold text-gray-900">
                        {proposal.vendorName ||
                          proposal.vendor
                            ?.name ||
                          "Unknown vendor"}
                      </div>

                      {(proposal.contactEmail ||
                        proposal.vendor
                          ?.email) && (
                        <div className="mt-1 text-xs text-gray-500">
                          {proposal.contactEmail ||
                            proposal.vendor
                              ?.email}
                        </div>
                      )}

                      {isWinner && (
                        <span className="mt-2 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                          Top ranked
                        </span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="px-5 py-5 align-top">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(
                          proposal.total
                        )}
                      </span>
                    </td>

                    {/* Delivery */}
                    <td className="px-5 py-5 align-top text-gray-600">
                      {proposal.deliveryDays !=
                      null
                        ? `${proposal.deliveryDays} days`
                        : "—"}
                    </td>

                    {/* Payment */}
                    <td className="px-5 py-5 align-top text-gray-600">
                      {proposal.paymentTerms ||
                        "—"}
                    </td>

                    {/* Warranty */}
                    <td className="px-5 py-5 align-top text-gray-600">
                      {proposal.warranty ||
                        "—"}
                    </td>

                    {/* Score */}
                    <td className="px-5 py-5 align-top">
                      {rankData?.score != null ? (
                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 font-semibold text-blue-700">
                          {rankData.score}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          —
                        </span>
                      )}
                    </td>

                    {/* Rationale */}
                    <td className="max-w-md px-5 py-5 align-top">
                      <p className="leading-6 text-gray-600">
                        {rankData?.rationale ||
                          "No assessment available."}
                      </p>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {/* Item-level details */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Proposed Items
        </h4>

        <div className="grid gap-4 lg:grid-cols-2">
          {rankedProposals.map(
            (proposal, index) => (
              <div
                key={
                  getId(proposal._id) ||
                  index
                }
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h5 className="font-semibold text-gray-900">
                    {proposal.vendorName ||
                      proposal.vendor
                        ?.name ||
                      "Unknown vendor"}
                  </h5>

                  <span className="text-sm font-semibold text-gray-700">
                    {formatCurrency(
                      proposal.total
                    )}
                  </span>
                </div>

                {Array.isArray(
                  proposal.items
                ) &&
                proposal.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="pb-2 pr-3 font-semibold text-gray-600">
                            Item
                          </th>

                          <th className="pb-2 px-3 font-semibold text-gray-600">
                            Qty
                          </th>

                          <th className="pb-2 px-3 font-semibold text-gray-600">
                            Unit
                          </th>

                          <th className="pb-2 pl-3 font-semibold text-gray-600">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {proposal.items.map(
                          (
                            item,
                            itemIndex
                          ) => (
                            <tr
                              key={
                                item._id ||
                                item.id ||
                                itemIndex
                              }
                              className="border-b border-gray-100 last:border-0"
                            >
                              <td className="py-2 pr-3 font-medium text-gray-800">
                                {item.name ||
                                  "Item"}

                                {item.notes && (
                                  <div className="mt-0.5 text-gray-400">
                                    {
                                      item.notes
                                    }
                                  </div>
                                )}
                              </td>

                              <td className="px-3 py-2 text-gray-600">
                                {item.qty ??
                                  "—"}
                              </td>

                              <td className="px-3 py-2 text-gray-600">
                                {formatCurrency(
                                  item.unitPrice
                                )}
                              </td>

                              <td className="py-2 pl-3 font-medium text-gray-800">
                                {formatCurrency(
                                  item.totalPrice
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    No item details available.
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}