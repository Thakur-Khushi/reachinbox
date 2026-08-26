import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "4000", 10),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",

  databaseUrl: required("DATABASE_URL"),

  redisHost: process.env.REDIS_HOST ?? "127.0.0.1",
  redisPort: parseInt(process.env.REDIS_PORT ?? "6379", 10),

  sessionSecret: process.env.SESSION_SECRET ?? "dev_secret_change_me",

  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ??
    "http://localhost:4000/auth/google/callback",

  workerConcurrency: parseInt(process.env.WORKER_CONCURRENCY ?? "5", 10),

  etherealUser: process.env.ETHEREAL_USER ?? "",
  etherealPass: process.env.ETHEREAL_PASS ?? "",
};
