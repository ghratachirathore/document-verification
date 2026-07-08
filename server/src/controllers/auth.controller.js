import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authService } from "../services/auth.service.js";
import { logger } from "../utils/logger.js";

const authMeta = (req, extra = {}) => ({
  origin: req.get("origin") || "same-origin",
  email: req.body?.email,
  role: req.body?.role,
  userId: req.user?._id,
  ...extra
});

export const register = asyncHandler(async (req, res) => {
  logger.info("Auth register requested", authMeta(req));
  const payload = await authService.register(req.body);
  logger.info("Auth register succeeded", authMeta(req, { userId: payload.user?._id, role: payload.user?.role }));

  return res
    .status(201)
    .cookie("accessToken", payload.token, authService.cookieOptions())
    .json(new ApiResponse(201, payload, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  logger.info("Auth login requested", authMeta(req));
  const payload = await authService.login(req.body);
  logger.info("Auth login succeeded", authMeta(req, { userId: payload.user?._id, role: payload.user?.role }));

  return res
    .status(200)
    .cookie("accessToken", payload.token, authService.cookieOptions())
    .json(new ApiResponse(200, payload, "Logged in successfully"));
});

export const me = asyncHandler(async (req, res) => {
  logger.info("Auth me resolved", authMeta(req, { email: req.user?.email, role: req.user?.role }));
  return res.status(200).json(new ApiResponse(200, { user: req.user }, "Authenticated user"));
});

export const logout = asyncHandler(async (req, res) => {
  logger.info("Auth logout requested", authMeta(req, { email: req.user?.email, role: req.user?.role }));
  return res
    .status(200)
    .clearCookie("accessToken", authService.clearCookieOptions())
    .json(new ApiResponse(200, { loggedOut: true }, "Logged out successfully"));
});
