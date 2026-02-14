import request from "supertest";
import { describe, expect, it } from "vitest";

import { TokenService } from "@modules/auth/infra/token.service";
import { createApp } from "@src/app";

const VALID_QUOTE_PAYLOAD = {
  origin_bairro: "Centro",
  destination_bairro: "Bacuri",
  urgency: "padrao",
  requested_at_iso: "2026-02-14T12:00:00.000Z",
};

describe("commerce quotes endpoint", () => {
  const app = createApp();
  const tokenService = new TokenService();

  it("returns 401 when authorization header is missing", async () => {
    const response = await request(app).post("/v1/commerce/quotes").send(VALID_QUOTE_PAYLOAD);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 403 for non-commerce role", async () => {
    const riderAccessToken = tokenService.issueAccessToken({
      id: "00000000-0000-0000-0000-000000000999",
      role: "rider",
    }).token;

    const response = await request(app)
      .post("/v1/commerce/quotes")
      .set("authorization", `Bearer ${riderAccessToken}`)
      .send(VALID_QUOTE_PAYLOAD);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});
