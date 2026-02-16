import { z } from "zod";

export const ADMIN_ACCESS_COOKIE_NAME = "roodi_admin_access_token";
export const ADMIN_REFRESH_COOKIE_NAME = "roodi_admin_refresh_token";
export const ADMIN_IDENTITY_COOKIE_NAME = "roodi_admin_identity";

const adminIdentitySchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  role: z.literal("admin"),
});

export type AdminIdentity = z.infer<typeof adminIdentitySchema>;

export const encodeAdminIdentity = (identity: AdminIdentity): string => {
  return Buffer.from(JSON.stringify(identity), "utf8").toString("base64url");
};

export const decodeAdminIdentity = (encodedValue: string | undefined): AdminIdentity | null => {
  if (!encodedValue) {
    return null;
  }

  try {
    const decoded = Buffer.from(encodedValue, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded);
    const parsedIdentity = adminIdentitySchema.safeParse(parsed);

    if (!parsedIdentity.success) {
      return null;
    }

    return parsedIdentity.data;
  } catch {
    return null;
  }
};

export const resolveApiBaseUrl = (): string | null => {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return value && value.length > 0 ? value : null;
};
