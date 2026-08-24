export function groupProposalsByRfp(proposals) {
  const groups = new Map();

  for (const proposal of proposals) {
    const rfp =
      proposal.rfp && typeof proposal.rfp === "object"
        ? proposal.rfp
        : null;

    const rfpId = rfp?._id || proposal.rfp || null;

    if (!rfpId) continue;

    const key = String(rfpId);

    if (!groups.has(key)) {
      groups.set(key, {
        rfpId: key,
        rfpTitle: rfp?.title || "Unknown RFP",
        proposals: [],
      });
    }

    groups.get(key).proposals.push(proposal);
  }

  return Array.from(groups.values());
}