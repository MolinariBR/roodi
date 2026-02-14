import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "@src/app";

describe("public endpoints", () => {
  const app = createApp();

  it("returns 422 on /v1/public/leads with invalid payload", async () => {
    const response = await request(app).post("/v1/public/leads").send({
      name: "",
      contact: "",
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 on /v1/public/legal/:documentType with invalid document type", async () => {
    const response = await request(app).get("/v1/public/legal/invalid-doc");

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
