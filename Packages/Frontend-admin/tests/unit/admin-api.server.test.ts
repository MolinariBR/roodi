import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAdminOrders,
  updateAdminPricingRules,
  type PricingRules,
} from "@core/api-client/admin-api.server";

const API_BASE_URL = "http://localhost:3333";
const ADMIN_TOKEN = "admin-contract-token";

const pricingPayload: PricingRules = {
  urgency_addon_brl: {
    padrao: 0,
    urgente: 2,
    agendado: 1,
  },
  conditional_addons_brl: {
    sunday: 1,
    holiday: 2,
    rain: 2,
    peak: 1,
  },
  minimum_charge_brl: 7,
  max_distance_km: 12.7,
  distance_zones_brl: [
    {
      zone: 1,
      min_km: 0,
      max_km: 1.5,
      value_brl: 7,
    },
  ],
};

describe("unit: admin api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = API_BASE_URL;
    process.env.BACKEND_ADMIN_VALIDATION_TOKEN = ADMIN_TOKEN;
  });

  it("builds orders query with status filter and parses response", async () => {
    const fetchMock = vi.fn<typeof fetch>(async (..._args: Parameters<typeof fetch>) => {
      return new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: "00000000-0000-0000-0000-000000000901",
              status: "searching_rider",
              total_brl: 11,
              created_at: "2026-02-16T12:00:00.000Z",
              commerce_id: "00000000-0000-0000-0000-000000000201",
              urgency: "padrao",
              price: {
                base_zone_brl: 10,
                urgency_brl: 0,
                sunday_brl: 0,
                holiday_brl: 0,
                rain_brl: 0,
                peak_brl: 1,
                total_brl: 11,
              },
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            total_pages: 1,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await getAdminOrders({
      page: 1,
      limit: 20,
      status: "searching_rider",
    });

    expect(result.error).toBeNull();
    expect(result.data?.data).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCall = fetchMock.mock.calls.at(0);
    const calledUrl = String(firstCall?.[0] ?? "");
    const calledOptions = (firstCall?.[1] ?? {}) as RequestInit;
    expect(calledUrl).toContain("/v1/admin/orders?");
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).toContain("limit=20");
    expect(calledUrl).toContain("status=searching_rider");
    expect(calledOptions.method).toBe("GET");
    expect((calledOptions.headers as Record<string, string>).Authorization).toBe(
      `Bearer ${ADMIN_TOKEN}`,
    );
  });

  it("returns backend message when orders endpoint fails", async () => {
    const fetchMock = vi.fn<typeof fetch>(async (..._args: Parameters<typeof fetch>) => {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: "Falha ao listar pedidos.",
          },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await getAdminOrders({});
    expect(result.data).toBeNull();
    expect(result.error).toBe("Falha ao listar pedidos.");
  });

  it("sends PUT payload for pricing update and validates contract", async () => {
    const fetchMock = vi.fn<typeof fetch>(async (..._args: Parameters<typeof fetch>) => {
      return new Response(JSON.stringify(pricingPayload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await updateAdminPricingRules(pricingPayload);

    expect(result.error).toBeNull();
    expect(result.data).toEqual(pricingPayload);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstCall = fetchMock.mock.calls.at(0);
    const calledUrl = String(firstCall?.[0] ?? "");
    const calledOptions = (firstCall?.[1] ?? {}) as RequestInit;
    expect(calledUrl).toContain("/v1/admin/pricing/rules");
    expect(calledOptions.method).toBe("PUT");
    expect(calledOptions.body).toBe(JSON.stringify(pricingPayload));
  });
});
