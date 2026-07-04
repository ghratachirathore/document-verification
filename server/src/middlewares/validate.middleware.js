import { ApiError } from "../utils/ApiError.js";
import {
  isNonEmptyString,
  isOptionalNumber,
  isStrongEnoughPassword,
  isValidDocumentType,
  isValidEmail,
  isValidHrAction,
  isValidResourceId,
  isValidRole,
  normalizeEmail,
  normalizeString
} from "../utils/validators.js";

export const requireFields = (...fields) => (req, res, next) => {
  const missingFields = fields.filter((field) => {
    const value = req.body?.[field];
    return value === undefined || value === null || value === "";
  });

  if (missingFields.length) {
    throw new ApiError(400, `Missing required fields: ${missingFields.join(", ")}`);
  }

  next();
};

const fail = (message) => {
  throw new ApiError(400, message);
};

export const validateRegister = (req, res, next) => {
  req.body.name = normalizeString(req.body.name);
  req.body.email = req.body.email ? normalizeEmail(req.body.email) : req.body.email;
  req.body.role = req.body.role || "candidate";

  if (!isNonEmptyString(req.body.name)) fail("Name is required");
  if (!isValidEmail(req.body.email)) fail("A valid email is required");
  if (!isStrongEnoughPassword(req.body.password)) fail("Password must be at least 8 characters");
  if (!isValidRole(req.body.role)) fail("Invalid role");

  next();
};

export const validateLogin = (req, res, next) => {
  req.body.email = req.body.email ? normalizeEmail(req.body.email) : req.body.email;

  if (!isValidEmail(req.body.email)) fail("A valid email is required");
  if (!isNonEmptyString(req.body.password)) fail("Password is required");

  next();
};

export const validateDocumentUpload = (req, res, next) => {
  req.body.type = normalizeString(req.body.type);
  if (!isValidDocumentType(req.body.type)) fail("Invalid document type");
  next();
};

export const validateResourceIdParam = (paramName = "id") => (req, res, next) => {
  if (!isValidResourceId(req.params[paramName])) fail(`Invalid ${paramName}`);
  next();
};

export const validateHrAction = (req, res, next) => {
  req.body.action = normalizeString(req.body.action);
  req.body.message = req.body.message ? normalizeString(req.body.message) : req.body.message;

  if (!isValidHrAction(req.body.action)) fail("Invalid HR action");
  if (req.body.action === "request_clarification" && req.body.message && !isNonEmptyString(req.body.message)) {
    fail("Clarification message cannot be empty");
  }

  next();
};

export const validateClarification = (req, res, next) => {
  req.body.message = normalizeString(req.body.message);
  if (!isNonEmptyString(req.body.message)) fail("Clarification message is required");
  next();
};

export const validateCandidateFilters = (req, res, next) => {
  if (!isOptionalNumber(req.query.minCgpa)) fail("minCgpa must be numeric");
  if (!isOptionalNumber(req.query.maxCgpa)) fail("maxCgpa must be numeric");

  ["search", "skill", "branch", "status"].forEach((key) => {
    if (req.query[key]) req.query[key] = normalizeString(req.query[key]);
  });

  next();
};
