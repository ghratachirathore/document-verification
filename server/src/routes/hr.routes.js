import { Router } from "express";
import {
  getAnalytics,
  getCandidateDetail,
  listCandidates,
  requestClarification,
  updateCandidateAction
} from "../controllers/hr.controller.js";
import { hrOnly, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  validateCandidateFilters,
  validateClarification,
  validateHrAction,
  validateResourceIdParam
} from "../middlewares/validate.middleware.js";

const router = Router();

router.use(verifyJWT, hrOnly);
router.route("/analytics").get(getAnalytics);
router.route("/candidates").get(validateCandidateFilters, listCandidates);
router.route("/candidates/:id").get(validateResourceIdParam("id"), getCandidateDetail);
router.route("/candidates/:id/action").patch(validateResourceIdParam("id"), validateHrAction, updateCandidateAction);
router.route("/candidates/:id/clarifications").post(validateResourceIdParam("id"), validateClarification, requestClarification);

export default router;
