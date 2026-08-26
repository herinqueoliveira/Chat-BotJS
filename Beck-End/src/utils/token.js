import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const AUTH_COOKIE_NAME = "chatbot_token";

export function signAuthToken(user) {
  return jwt.sign(
    { sub: user.id, name: user.name, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    path: "/",
  };
}
