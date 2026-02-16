import { redirect } from "next/navigation";

import { readAdminAccessToken, readAdminIdentity } from "@core/auth/admin-session.cookies";
import { resolveApiBaseUrl } from "@core/auth/admin-session.shared";

export type AdminSession = {
  userId: string;
  email: string;
  displayName: string;
  accessToken: string;
};

const validateAdminAccessToken = async (accessToken: string): Promise<boolean> => {
  const apiBaseUrl = resolveApiBaseUrl();
  if (!apiBaseUrl) {
    return false;
  }

  let endpoint: URL;
  try {
    endpoint = new URL("/v1/admin/dashboard", apiBaseUrl);
  } catch {
    return false;
  }

  try {
    const response = await fetch(endpoint.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const resolveAdminSession = async (): Promise<AdminSession | null> => {
  const accessToken = readAdminAccessToken();
  const identity = readAdminIdentity();

  if (!accessToken || !identity || identity.role !== "admin") {
    return null;
  }

  const isValidAccessToken = await validateAdminAccessToken(accessToken);
  if (!isValidAccessToken) {
    return null;
  }

  return {
    userId: identity.id,
    email: identity.email,
    displayName: identity.name,
    accessToken,
  };
};

export const requireAdminSession = async (): Promise<AdminSession> => {
  const session = await resolveAdminSession();
  if (!session) {
    redirect("/admin/login?error=unauthorized");
  }

  return session;
};

export const redirectIfAuthenticatedAdmin = async (): Promise<void> => {
  const session = await resolveAdminSession();
  if (session) {
    redirect("/admin/dashboard");
  }
};
