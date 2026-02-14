import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "@src/app";

describe("auth endpoints", () => {
  const app = createApp();

  it("returns 400 on register when role is admin", async () => {
    const response = await request(app).post("/v1/auth/register").send({
      name: "Admin User",
      email: "admin.invalid@roodi.app",
      password: "Secret123",
      role: "admin",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("BAD_REQUEST");
  });

  it("returns 422 on login when payload is invalid", async () => {
    const response = await request(app).post("/v1/auth/login").send({
      email: "invalid-email",
      password: "",
      role: "rider",
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 on refresh with invalid token", async () => {
    const response = await request(app).post("/v1/auth/refresh").send({
      refresh_token: "invalid.refresh.token",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 on logout with invalid token", async () => {
    const response = await request(app).post("/v1/auth/logout").send({
      refresh_token: "invalid.refresh.token",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 422 on forgot password when email is invalid", async () => {
    const response = await request(app).post("/v1/auth/password/forgot").send({
      email: "invalid-email",
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 on verify otp when challenge_id is invalid", async () => {
    const response = await request(app).post("/v1/auth/password/otp/verify").send({
      challenge_id: "invalid-uuid",
      otp: "123456",
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 on reset password when reset token is invalid", async () => {
    const response = await request(app).post("/v1/auth/password/reset").send({
      reset_token: "invalid.reset.token",
      new_password: "StrongPass123",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("BAD_REQUEST");
  });
});
