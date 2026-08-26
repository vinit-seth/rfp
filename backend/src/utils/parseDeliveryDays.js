function parseDeliveryDays(value) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  // Direct number: "14"
  const numericValue = Number(normalized);

  if (Number.isFinite(numericValue)) {
    return numericValue;
  }

  // "14 days"
  const daysMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*days?/
  );

  if (daysMatch) {
    return Number(daysMatch[1]);
  }

  // "2 weeks"
  const weeksMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*weeks?/
  );

  if (weeksMatch) {
    return Number(weeksMatch[1]) * 7;
  }

  // "1 month", "2 months"
  const monthsMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*months?/
  );

  if (monthsMatch) {
    return Number(monthsMatch[1]) * 30;
  }

  return null;
}

module.exports = {
  parseDeliveryDays,
};