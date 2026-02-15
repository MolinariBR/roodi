import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { redirect } from "next/navigation";

const adminUsersResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      email: z.string().email(),
      role: z.enum(["admin", "commerce", "rider"]),
      status: z.enum(["active", "suspended", "blocked"]),
    }),
  ),
});

export type AdminSession = {
  clerkUserId: string;
  email: string;
  displayName: string;
};

const resolveBooleanEnv = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const resolveNodeEnv = (): string => {
  const value = process.env.NODE_ENV?.trim();
  return value && value.length > 0 ? value : "development";
};

const isNonProductionEnv = (): boolean => {
  return resolveNodeEnv() !== "production";
};

const resolveDevAuthBypassEnabled = (): boolean => {
  return isNonProductionEnv() && resolveBooleanEnv(process.env.ADMIN_DEV_AUTH_BYPASS);
};

const resolveDevAllowedEmails = (): Set<string> => {
  const value = process.env.ADMIN_DEV_ALLOWED_EMAILS?.trim();
  if (!value) {
    return new Set<string>();
  }

  const emails = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);

  return new Set(emails);
};

const isDevEmailAllowed = (email: string): boolean => {
  const allowedEmails = resolveDevAllowedEmails();
  if (allowedEmails.size === 0 || allowedEmails.has("*")) {
    return true;
  }

  return allowedEmails.has(email.toLowerCase());
};

const resolveApiBaseUrl = (): string | null => {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return value ? value : null;
};

const resolveValidationToken = (): string | null => {
  const value = process.env.BACKEND_ADMIN_VALIDATION_TOKEN?.trim();
  return value ? value : null;
};

const validateAdminInBackend = async (email: string): Promise<boolean> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const validationToken = resolveValidationToken();

  if (!apiBaseUrl || !validationToken) {
    return false;
  }

  let endpoint: URL;
  try {
    endpoint = new URL("/v1/admin/users?page=1&limit=100&role=admin", apiBaseUrl);
  } catch {
    return false;
  }

  try {
    const response = await fetch(endpoint.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${validationToken}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const payload = await response.json();
    const parsed = adminUsersResponseSchema.safeParse(payload);
    if (!parsed.success) {
      return false;
    }

    const normalizedEmail = email.toLowerCase();
    return parsed.data.data.some((adminUser) => {
      return (
        adminUser.email.toLowerCase() === normalizedEmail &&
        adminUser.role === "admin" &&
        adminUser.status === "active"
      );
    });
  } catch {
    return false;
  }
};

export const resolveAdminSession = async (): Promise<AdminSession | null> => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  if (!user) {
    return null;
  }

  const email = user.primaryEmailAddress?.emailAddress?.trim();
  if (!email) {
    return null;
  }

  const normalizedEmail = email.toLowerCase();

  if (resolveDevAuthBypassEnabled()) {
    if (isDevEmailAllowed(normalizedEmail)) {
      return {
        clerkUserId: userId,
        email,
        displayName: user.firstName ?? user.fullName ?? email,
      };
    }
  }

  const isAdminInBackend = await validateAdminInBackend(normalizedEmail);
  if (!isAdminInBackend) {
    return null;
  }

  return {
    clerkUserId: userId,
    email,
    displayName: user.firstName ?? user.fullName ?? email,
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
