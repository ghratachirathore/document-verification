import { Router } from "express";
import { getMyProfile, getMyReport } from "../controllers/candidate.controller.js";
import { candidateOnly, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT, candidateOnly);
router.route("/me").get(getMyProfile);
router.route("/me/report").get(getMyReport);

export default router;
