export function getExperience(startDate) {
  const start = new Date(startDate);
  const now = new Date();

  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  if (now.getDate() < start.getDate()) {
    months--;
  }

  months = Math.max(0, months);

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} ${
      remainingMonths === 1 ? "month" : "months"
    }`;
  }

  if (remainingMonths === 0) {
    return `${years} ${
      years === 1 ? "year" : "years"
    }`;
  }

  return `${years} ${
    years === 1 ? "year" : "years"
  } and ${remainingMonths} ${
    remainingMonths === 1 ? "month" : "months"
  }`;
}