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

const resolveApiBaseUrl = (): string | null => {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return value ? value : null;
};

const resolveValidationToken = (): string | null => {
  const value = process.env.BACKEND_ADMIN_VALIDATION_TOKEN?.trim();
  return value ? value : null;
};

const isClerkAdmin = (metadata: unknown): boolean => {
  if (!metadata || typeof metadata !== "object") {
    return false;
  }

  const role = Reflect.get(metadata, "role");
  return role === "admin";
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

  const hasAdminRole =
    isClerkAdmin(user.publicMetadata) || isClerkAdmin(user.privateMetadata);
  if (!hasAdminRole) {
    return null;
  }

  const isAdminInBackend = await validateAdminInBackend(email);
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
