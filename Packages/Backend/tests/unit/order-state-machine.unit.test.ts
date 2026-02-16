import { describe, expect, it } from "vitest";

import { isOrderStatusTransitionAllowed } from "@modules/orders/domain/order.state-machine";

describe("unit: order state machine", () => {
  it("accepts valid transitions", () => {
    expect(isOrderStatusTransitionAllowed("searching_rider", "rider_assigned")).toBe(true);
    expect(isOrderStatusTransitionAllowed("to_customer", "at_customer")).toBe(true);
    expect(isOrderStatusTransitionAllowed("finishing_delivery", "completed")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(isOrderStatusTransitionAllowed("searching_rider", "completed")).toBe(false);
    expect(isOrderStatusTransitionAllowed("to_customer", "waiting_order")).toBe(false);
    expect(isOrderStatusTransitionAllowed("completed", "to_customer")).toBe(false);
  });
});
