import { VERIFICATION_STATUS } from "../constants/status.constants.js";

export const normalizeString = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(kumar|kumari|mr|ms|mrs|dr)\./g, "")
    .replace(/[^a-z0-9\s.]/g, " ")
    .replace(/\b(kumar|kumari|mr|ms|mrs|dr)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const levenshteinDistance = (left = "", right = "") => {
  const a = normalizeString(left);
  const b = normalizeString(right);

  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);

  for (let j = 1; j <= b.length; j += 1) rows[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + substitutionCost
      );
    }
  }

  return rows[a.length][b.length];
};

export const similarityScore = (left = "", right = "") => {
  const a = normalizeString(left);
  const b = normalizeString(right);
  const maxLength = Math.max(a.length, b.length);

  if (!maxLength) return 100;

  const distance = levenshteinDistance(a, b);
  return Math.max(0, Math.round((1 - distance / maxLength) * 100));
};

export const confidenceLabel = (score) => {
  if (score >= 95) return "Match";
  if (score >= 85) return "Minor Difference";
  if (score >= 65) return "Needs Review";
  return "High Risk";
};

export const statusFromScore = (score) => {
  if (score >= 95) return VERIFICATION_STATUS.VERIFIED;
  if (score >= 85) return VERIFICATION_STATUS.MINOR_DIFFERENCES;
  if (score >= 65) return VERIFICATION_STATUS.NEEDS_REVIEW;
  return VERIFICATION_STATUS.HIGH_RISK;
};

export const averageScore = (scores) => {
  const validScores = scores.filter((score) => Number.isFinite(score));
  if (!validScores.length) return 0;
  return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length);
};
