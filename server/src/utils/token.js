import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signAccessToken = (user) =>
  jwt.sign(
    {
      id: user._id?.toString?.() || user.id,
      email: user.email,
      role: user.role
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret);
