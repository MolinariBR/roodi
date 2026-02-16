import { cookies } from "next/headers";

import {
  ADMIN_ACCESS_COOKIE_NAME,
  ADMIN_IDENTITY_COOKIE_NAME,
  ADMIN_REFRESH_COOKIE_NAME,
  decodeAdminIdentity,
  encodeAdminIdentity,
  type AdminIdentity,
} from "@core/auth/admin-session.shared";

const ACCESS_TOKEN_MIN_MAX_AGE_SECONDS = 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const isSecureCookie = (): boolean => {
  return process.env.NODE_ENV === "production";
};

const buildCookieOptions = (maxAgeSeconds: number) => {
  return {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
};

export const persistAdminSession = (input: {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
  identity: AdminIdentity;
}): void => {
  const cookieStore = cookies();
  cookieStore.set(
    ADMIN_ACCESS_COOKIE_NAME,
    input.accessToken,
    buildCookieOptions(Math.max(ACCESS_TOKEN_MIN_MAX_AGE_SECONDS, input.accessTokenExpiresInSeconds)),
  );
  cookieStore.set(
    ADMIN_REFRESH_COOKIE_NAME,
    input.refreshToken,
    buildCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS),
  );
  cookieStore.set(
    ADMIN_IDENTITY_COOKIE_NAME,
    encodeAdminIdentity(input.identity),
    buildCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS),
  );
};

export const clearAdminSession = (): void => {
  const cookieStore = cookies();
  cookieStore.set(ADMIN_ACCESS_COOKIE_NAME, "", buildCookieOptions(0));
  cookieStore.set(ADMIN_REFRESH_COOKIE_NAME, "", buildCookieOptions(0));
  cookieStore.set(ADMIN_IDENTITY_COOKIE_NAME, "", buildCookieOptions(0));
};

export const readAdminAccessToken = (): string | null => {
  const value = cookies().get(ADMIN_ACCESS_COOKIE_NAME)?.value?.trim();
  return value && value.length > 0 ? value : null;
};

export const readAdminRefreshToken = (): string | null => {
  const value = cookies().get(ADMIN_REFRESH_COOKIE_NAME)?.value?.trim();
  return value && value.length > 0 ? value : null;
};

export const readAdminIdentity = (): AdminIdentity | null => {
  const value = cookies().get(ADMIN_IDENTITY_COOKIE_NAME)?.value;
  return decodeAdminIdentity(value);
};
