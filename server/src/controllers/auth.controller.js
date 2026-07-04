import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authService } from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const payload = await authService.register(req.body);

  return res
    .status(201)
    .cookie("accessToken", payload.token, authService.cookieOptions())
    .json(new ApiResponse(201, payload, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body);

  return res
    .status(200)
    .cookie("accessToken", payload.token, authService.cookieOptions())
    .json(new ApiResponse(200, payload, "Logged in successfully"));
});

export const me = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, { user: req.user }, "Authenticated user"));
});

export const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken", authService.cookieOptions())
    .json(new ApiResponse(200, { loggedOut: true }, "Logged out successfully"));
});
