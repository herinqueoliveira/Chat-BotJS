import dotenv from "dotenv";

dotenv.config();

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",

  geminiApiKey: required("GEMINI_API_KEY"),

  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  corsOrigins: (process.env.CORS_ORIGIN || "http://127.0.0.1:5500,http://localhost:5500")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
