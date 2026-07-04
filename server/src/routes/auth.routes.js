import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateLogin, validateRegister } from "../middlewares/validate.middleware.js";

const router = Router();

router.route("/register").post(validateRegister, register);
router.route("/login").post(validateLogin, login);
router.route("/me").get(verifyJWT, me);
router.route("/logout").post(verifyJWT, logout);

export default router;
