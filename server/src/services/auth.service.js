import { USER_ROLES } from "../constants/status.constants.js";
import { ApiError } from "../utils/ApiError.js";
import { signAccessToken } from "../utils/token.js";
import { userService } from "./user.service.js";
import { env } from "../config/env.js";

const publicAuthPayload = (user) => ({
  user,
  token: signAccessToken(user)
});

export const authService = {
  cookieOptions() {
    return {
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production"
    };
  },
  async register({ name, email, password, role = USER_ROLES.CANDIDATE }) {
    if (!Object.values(USER_ROLES).includes(role)) {
      throw new ApiError(400, "Invalid role");
    }

    const user = await userService.createUser({ name, email, password, role });
    return publicAuthPayload(user);
  },
  async login({ email, password }) {
    const userWithPassword = await userService.findByEmail(email, true);
    if (!userWithPassword) throw new ApiError(401, "Invalid email or password");

    const isPasswordCorrect = await userService.verifyPassword(userWithPassword, password);
    if (!isPasswordCorrect) throw new ApiError(401, "Invalid email or password");

    const user = await userService.findById(userWithPassword._id?.toString?.() || userWithPassword._id);
    return publicAuthPayload(user);
  }
};
