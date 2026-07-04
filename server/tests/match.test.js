import assert from "node:assert/strict";
import test from "node:test";
import {
  confidenceLabel,
  levenshteinDistance,
  normalizeString,
  similarityScore,
  statusFromScore
} from "../src/utils/match.util.js";
import { VERIFICATION_STATUS } from "../src/constants/status.constants.js";

test("normalizes strings for credential comparison", () => {
  assert.equal(normalizeString(" Aman   K. Sharma "), "aman k. sharma");
  assert.equal(normalizeString("Dr. Priya Kumar"), "priya");
});

test("calculates levenshtein distance", () => {
  assert.equal(levenshteinDistance("aman", "aman"), 0);
  assert.equal(levenshteinDistance("aman", "amank"), 1);
});

test("scores similar names without immediate mismatch", () => {
  const score = similarityScore("Aman Sharma", "Aman K Sharma");
  assert.ok(score >= 85);
  assert.equal(confidenceLabel(score), "Minor Difference");
});

test("maps confidence to verification statuses", () => {
  assert.equal(statusFromScore(96), VERIFICATION_STATUS.VERIFIED);
  assert.equal(statusFromScore(88), VERIFICATION_STATUS.MINOR_DIFFERENCES);
  assert.equal(statusFromScore(70), VERIFICATION_STATUS.NEEDS_REVIEW);
  assert.equal(statusFromScore(40), VERIFICATION_STATUS.HIGH_RISK);
});
