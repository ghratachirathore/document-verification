import { USER_ROLES } from "../constants/status.constants.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/token.js";
import { userService } from "../services/user.service.js";

const getTokenFromRequest = (req) => {
  if (req.cookies?.accessToken) return req.cookies.accessToken;

  const authHeader = req.header("Authorization");
  if (authHeader) {
    const [scheme, token, extra] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token || extra) {
      throw new ApiError(401, "Invalid authorization header");
    }
    return token;
  }

  return req.header("x-access-token");
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) throw new ApiError(401, "Unauthorized request");

  let decodedToken;
  try {
    decodedToken = verifyAccessToken(token);
  } catch (error) {
    throw new ApiError(401, error.name === "TokenExpiredError" ? "Access token expired" : "Invalid access token");
  }

  const user = await userService.findById(decodedToken.id);

  if (!user) throw new ApiError(401, "Invalid access token");

  req.user = user;
  next();
});

export const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) throw new ApiError(401, "Authentication is required before role authorization");
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(403, "You do not have permission to access this resource");
    }
    next();
  };

export const candidateOnly = authorizeRoles(USER_ROLES.CANDIDATE);
export const hrOnly = authorizeRoles(USER_ROLES.HR);
