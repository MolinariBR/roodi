import type { order_status } from "@prisma/client";

const ORDER_STATUS_TRANSITIONS: Record<order_status, readonly order_status[]> = {
  created: ["searching_rider", "canceled"],
  searching_rider: ["rider_assigned", "to_merchant", "canceled"],
  rider_assigned: ["to_merchant", "canceled"],
  to_merchant: ["at_merchant", "canceled"],
  at_merchant: ["waiting_order", "canceled"],
  waiting_order: ["to_customer", "canceled"],
  to_customer: ["at_customer", "canceled"],
  at_customer: ["finishing_delivery", "canceled"],
  finishing_delivery: ["completed", "canceled"],
  completed: [],
  canceled: [],
};

export const RIDER_ACTIVE_ORDER_STATUSES: readonly order_status[] = [
  "rider_assigned",
  "to_merchant",
  "at_merchant",
  "waiting_order",
  "to_customer",
  "at_customer",
  "finishing_delivery",
];

export const isOrderStatusTransitionAllowed = (
  fromStatus: order_status,
  toStatus: order_status,
): boolean => {
  return ORDER_STATUS_TRANSITIONS[fromStatus].includes(toStatus);
};
