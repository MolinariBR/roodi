import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();
const cookiesMock = vi.fn();

vi.mock("next/navigation", () => {
  return {
    redirect: redirectMock,
  };
});

vi.mock("next/headers", () => {
  return {
    cookies: cookiesMock,
  };
});

const loadModule = async () => import("@core/auth/admin-access.server");

const buildCookieStore = (values: Record<string, string | undefined>) => {
  return {
    get: (key: string) => {
      const value = values[key];
      return value ? { name: key, value } : undefined;
    },
  };
};

describe("unit: admin access guard", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
  });

  it("returns null when access cookie does not exist", async () => {
    cookiesMock.mockReturnValue(buildCookieStore({}));
    const { resolveAdminSession } = await loadModule();

    const session = await resolveAdminSession();
    expect(session).toBeNull();
  });

  it("returns null when identity cookie is invalid", async () => {
    cookiesMock.mockReturnValue(
      buildCookieStore({
        roodi_admin_access_token: "token",
        roodi_admin_identity: "invalid",
      }),
    );
    const { resolveAdminSession } = await loadModule();

    const session = await resolveAdminSession();
    expect(session).toBeNull();
  });

  it("returns session when cookies are valid and backend accepts token", async () => {
    const identity = Buffer.from(
      JSON.stringify({
        id: "00000000-0000-0000-0000-000000000101",
        name: "Admin Roodi",
        email: "admin@roodi.app",
        role: "admin",
      }),
      "utf8",
    ).toString("base64url");

    cookiesMock.mockReturnValue(
      buildCookieStore({
        roodi_admin_access_token: "admin.jwt.token",
        roodi_admin_identity: identity,
      }),
    );

    const fetchMock = vi.fn<typeof fetch>(async () => {
      return new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { resolveAdminSession } = await loadModule();
    const session = await resolveAdminSession();

    expect(session).not.toBeNull();
    expect(session?.email).toBe("admin@roodi.app");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("redirects to login when requireAdminSession finds no valid session", async () => {
    cookiesMock.mockReturnValue(buildCookieStore({}));
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    const { requireAdminSession } = await loadModule();
    await expect(requireAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/admin/login?error=unauthorized");
  });
});
