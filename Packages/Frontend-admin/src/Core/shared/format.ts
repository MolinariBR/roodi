export const formatCurrencyBRL = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export const formatDistanceKm = (distanceMeters: number | undefined): string => {
  if (typeof distanceMeters !== "number") {
    return "-";
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
};

export const formatDurationMinutes = (durationSeconds: number | undefined): string => {
  if (typeof durationSeconds !== "number") {
    return "-";
  }

  return `${Math.round(durationSeconds / 60)} min`;
};
