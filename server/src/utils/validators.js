import mongoose from "mongoose";
import { DOCUMENT_TYPES, HR_DECISIONS, USER_ROLES } from "../constants/status.constants.js";

export const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

export const isValidEmail = (value) =>
  isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

export const isStrongEnoughPassword = (value) => isNonEmptyString(value) && value.length >= 8;

export const isValidRole = (value) => Object.values(USER_ROLES).includes(value);

export const isValidDocumentType = (value) => Object.values(DOCUMENT_TYPES).includes(value);

export const isValidHrAction = (value) => ["approve", "reject", "request_clarification"].includes(value);

export const isValidDecision = (value) => Object.values(HR_DECISIONS).includes(value);

export const isValidMongoObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const isValidResourceId = (value) => isNonEmptyString(value) && (isValidMongoObjectId(value) || value.length >= 12);

export const isOptionalNumber = (value) => value === undefined || value === "" || Number.isFinite(Number(value));

export const normalizeEmail = (value) => value.trim().toLowerCase();

export const normalizeString = (value) => (typeof value === "string" ? value.trim() : value);
