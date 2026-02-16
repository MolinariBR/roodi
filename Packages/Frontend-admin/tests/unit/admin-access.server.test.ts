import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => {
  return {
    auth: vi.fn(),
    currentUser: vi.fn(),
  };
});

vi.mock("next/navigation", () => {
  return {
    redirect: vi.fn(),
  };
});

const loadModule = async () => import("@core/auth/admin-access.server");

describe("unit: admin access guard", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    delete process.env.ADMIN_DEV_AUTH_BYPASS;
    delete process.env.ADMIN_DEV_ALLOWED_EMAILS;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.BACKEND_ADMIN_VALIDATION_TOKEN;
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
  });

  it("returns null when user is not authenticated", async () => {
    const clerkServer = await import("@clerk/nextjs/server");
    vi.mocked(clerkServer.auth).mockResolvedValue({ userId: null } as never);

    const { resolveAdminSession } = await loadModule();
    const session = await resolveAdminSession();

    expect(session).toBeNull();
  });

  it("allows session with dev auth bypass enabled", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    process.env.ADMIN_DEV_AUTH_BYPASS = "true";
    process.env.ADMIN_DEV_ALLOWED_EMAILS = "*";

    const clerkServer = await import("@clerk/nextjs/server");
    vi.mocked(clerkServer.auth).mockResolvedValue({ userId: "user_dev_1" } as never);
    vi.mocked(clerkServer.currentUser).mockResolvedValue({
      firstName: "Dev Admin",
      fullName: "Dev Admin",
      primaryEmailAddress: {
        emailAddress: "dev.admin@roodi.app",
      },
    } as never);

    const { resolveAdminSession } = await loadModule();
    const session = await resolveAdminSession();

    expect(session).not.toBeNull();
    expect(session?.email).toBe("dev.admin@roodi.app");
    expect(session?.displayName).toBe("Dev Admin");
  });

  it("redirects to login when requireAdminSession finds no valid session", async () => {
    const clerkServer = await import("@clerk/nextjs/server");
    const nextNavigation = await import("next/navigation");

    vi.mocked(clerkServer.auth).mockResolvedValue({ userId: null } as never);
    vi.mocked(nextNavigation.redirect).mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    const { requireAdminSession } = await loadModule();

    await expect(requireAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(nextNavigation.redirect).toHaveBeenCalledWith("/admin/login?error=unauthorized");
  });

  it("validates admin user in backend when bypass is disabled", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3333";
    process.env.BACKEND_ADMIN_VALIDATION_TOKEN = "admin-token";

    const clerkServer = await import("@clerk/nextjs/server");
    vi.mocked(clerkServer.auth).mockResolvedValue({ userId: "user_prod_1" } as never);
    vi.mocked(clerkServer.currentUser).mockResolvedValue({
      firstName: "Admin",
      fullName: "Admin User",
      primaryEmailAddress: {
        emailAddress: "admin@roodi.app",
      },
    } as never);

    const fetchMock = vi.fn<typeof fetch>(async (..._args: Parameters<typeof fetch>) => {
      return new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              email: "admin@roodi.app",
              role: "admin",
              status: "active",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    vi.stubGlobal("fetch", fetchMock);

    const { resolveAdminSession } = await loadModule();
    const session = await resolveAdminSession();

    expect(session).not.toBeNull();
    expect(session?.email).toBe("admin@roodi.app");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const firstCall = fetchMock.mock.calls.at(0);
    expect(String(firstCall?.[0] ?? "")).toContain("/v1/admin/users?");
  });
});
