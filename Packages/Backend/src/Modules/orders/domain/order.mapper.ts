import type { Prisma, orders } from "@prisma/client";

const decimalToNumber = (value: Prisma.Decimal | null | undefined): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const decimalToMoney = (value: Prisma.Decimal | null | undefined): number => {
  return decimalToNumber(value) ?? 0;
};

const toDestinationPayload = (order: orders): Record<string, string> | undefined => {
  const destinationPayload = {
    ...(order.destination_cep ? { cep: order.destination_cep } : {}),
    ...(order.destination_state ? { state: order.destination_state } : {}),
    ...(order.destination_city ? { city: order.destination_city } : {}),
    ...(order.destination_neighborhood ? { neighborhood: order.destination_neighborhood } : {}),
    ...(order.destination_street ? { street: order.destination_street } : {}),
    ...(order.destination_number ? { number: order.destination_number } : {}),
    ...(order.destination_complement ? { complement: order.destination_complement } : {}),
  };

  return Object.keys(destinationPayload).length > 0 ? destinationPayload : undefined;
};

export const toOrderPayload = (order: orders): Record<string, unknown> => {
  const destination = toDestinationPayload(order);

  return {
    id: order.id,
    status: order.status,
    total_brl: decimalToMoney(order.total_brl),
    created_at: order.created_at.toISOString(),
    commerce_id: order.commerce_user_id,
    ...(order.rider_user_id ? { rider_id: order.rider_user_id } : {}),
    ...(order.quote_id ? { quote_id: order.quote_id } : {}),
    urgency: order.urgency,
    ...(order.distance_m !== null ? { distance_m: order.distance_m } : {}),
    ...(order.duration_s !== null ? { duration_s: order.duration_s } : {}),
    ...(order.eta_min !== null ? { eta_min: order.eta_min } : {}),
    ...(order.zone !== null ? { zone: order.zone } : {}),
    price: {
      base_zone_brl: decimalToMoney(order.base_zone_brl),
      urgency_brl: decimalToMoney(order.urgency_brl),
      sunday_brl: decimalToMoney(order.sunday_brl),
      holiday_brl: decimalToMoney(order.holiday_brl),
      rain_brl: decimalToMoney(order.rain_brl),
      peak_brl: decimalToMoney(order.peak_brl),
      total_brl: decimalToMoney(order.total_brl),
    },
    confirmation_code_required: order.confirmation_code_required,
    confirmation_code_status: order.confirmation_code_status,
    payment_status: order.payment_status,
    payment_required: order.payment_required,
    ...(order.payment_confirmed_at
      ? { payment_confirmed_at: order.payment_confirmed_at.toISOString() }
      : {}),
    ...(destination ? { destination } : {}),
  };
};
