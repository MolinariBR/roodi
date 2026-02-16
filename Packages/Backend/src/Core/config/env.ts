import { config as loadEnv } from "dotenv";
import path from "node:path";
import { z } from "zod";

const resolveEnvFile = (): string => {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  return nodeEnv === "production" ? ".env.production" : ".env.development";
};

loadEnv({ path: path.resolve(process.cwd(), resolveEnvFile()) });

const csvToArray = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const optionalEmailSchema = z
  .string()
  .trim()
  .email()
  .or(z.literal(""))
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : undefined;
  });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  API_VERSION: z.string().min(1).default("1.0.0"),
  APP_VERSION: z.string().min(1).default("1.0.0"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(10000),
  SENTRY_DSN: z.string().optional(),
  MAINTENANCE_MODE: z
    .string()
    .transform((value) => value.toLowerCase() === "true")
    .default("false"),
  MAINTENANCE_MESSAGE: z.string().optional(),
  ADMIN_WEB_URL: z.string().url().default("http://localhost:3001"),
  LANDING_WEB_URL: z.string().url().default("http://localhost:3002"),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3001,http://localhost:3002"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:5432/roodi_dev?schema=public"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  REDIS_PREFIX: z.string().min(1).default("roodi:dev"),
  JWT_ISSUER: z.string().min(1).default("roodi.local"),
  JWT_AUDIENCE: z.string().min(1).default("roodi-api"),
  JWT_ACCESS_SECRET: z.string().min(1).default("change-me-access-secret"),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default("15m"),
  JWT_REFRESH_SECRET: z.string().min(1).default("change-me-refresh-secret"),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default("30d"),
  AUTH_PASSWORD_HASH_ALGORITHM: z.enum(["bcrypt", "argon2"]).default("bcrypt"),
  AUTH_PASSWORD_HASH_ROUNDS: z.coerce.number().int().min(4).max(16).default(12),
  OTP_CODE_LENGTH: z.coerce.number().int().min(4).max(8).default(6),
  OTP_EXPIRES_MINUTES: z.coerce.number().int().min(1).max(30).default(10),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(5),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().min(0).max(300).default(60),
  RESEND_API_BASE_URL: z.string().url().default("https://api.resend.com"),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: optionalEmailSchema,
  RESEND_REPLY_TO: optionalEmailSchema,
  TOMTOM_API_KEY: z.string().optional(),
  OPENROUTESERVICE_API_KEY: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().optional(),
  MET_NO_BASE_URL: z.string().url().default("https://api.met.no/weatherapi/locationforecast/2.0/compact"),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  INFINITEPAY_API_BASE_URL: z.string().url().default("https://api.infinitepay.io"),
  INFINITEPAY_API_KEY: z.string().optional(),
  INFINITEPAY_HANDLE: z.string().optional(),
  INFINITEPAY_WEBHOOK_SECRET: z.string().optional(),
  INFINITEPAY_WEBHOOK_URL: z.string().url().optional(),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  apiVersion: parsedEnv.API_VERSION,
  appVersion: parsedEnv.APP_VERSION,
  logLevel: parsedEnv.LOG_LEVEL,
  requestTimeoutMs: parsedEnv.REQUEST_TIMEOUT_MS,
  sentryDsn: parsedEnv.SENTRY_DSN,
  maintenanceMode: parsedEnv.MAINTENANCE_MODE,
  maintenanceMessage: parsedEnv.MAINTENANCE_MESSAGE,
  adminWebUrl: parsedEnv.ADMIN_WEB_URL,
  landingWebUrl: parsedEnv.LANDING_WEB_URL,
  corsAllowedOrigins: csvToArray(parsedEnv.CORS_ALLOWED_ORIGINS),
  databaseUrl: parsedEnv.DATABASE_URL,
  redisUrl: parsedEnv.REDIS_URL,
  redisPrefix: parsedEnv.REDIS_PREFIX,
  jwtIssuer: parsedEnv.JWT_ISSUER,
  jwtAudience: parsedEnv.JWT_AUDIENCE,
  jwtAccessSecret: parsedEnv.JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: parsedEnv.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshSecret: parsedEnv.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: parsedEnv.JWT_REFRESH_EXPIRES_IN,
  authPasswordHashAlgorithm: parsedEnv.AUTH_PASSWORD_HASH_ALGORITHM,
  authPasswordHashRounds: parsedEnv.AUTH_PASSWORD_HASH_ROUNDS,
  otpCodeLength: parsedEnv.OTP_CODE_LENGTH,
  otpExpiresMinutes: parsedEnv.OTP_EXPIRES_MINUTES,
  otpMaxAttempts: parsedEnv.OTP_MAX_ATTEMPTS,
  otpResendCooldownSeconds: parsedEnv.OTP_RESEND_COOLDOWN_SECONDS,
  resendApiBaseUrl: parsedEnv.RESEND_API_BASE_URL,
  resendApiKey: parsedEnv.RESEND_API_KEY,
  resendFromEmail: parsedEnv.RESEND_FROM_EMAIL,
  resendReplyTo: parsedEnv.RESEND_REPLY_TO,
  tomtomApiKey: parsedEnv.TOMTOM_API_KEY,
  openRouteServiceApiKey: parsedEnv.OPENROUTESERVICE_API_KEY,
  openWeatherApiKey: parsedEnv.OPENWEATHER_API_KEY,
  metNoBaseUrl: parsedEnv.MET_NO_BASE_URL,
  googleMapsApiKey: parsedEnv.GOOGLE_MAPS_API_KEY,
  infinitePayApiBaseUrl: parsedEnv.INFINITEPAY_API_BASE_URL,
  infinitePayApiKey: parsedEnv.INFINITEPAY_API_KEY,
  infinitePayHandle: parsedEnv.INFINITEPAY_HANDLE,
  infinitePayWebhookSecret: parsedEnv.INFINITEPAY_WEBHOOK_SECRET,
  infinitePayWebhookUrl: parsedEnv.INFINITEPAY_WEBHOOK_URL,
} as const;
