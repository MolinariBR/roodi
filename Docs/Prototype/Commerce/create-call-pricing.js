(function () {
  const ZONES = [
    { maxKm: 1.5, fee: 7.0, label: "Zona 1 (0-1.5 km)" },
    { maxKm: 2.3, fee: 8.0, label: "Zona 2 (1.6-2.3 km)" },
    { maxKm: 3.1, fee: 9.0, label: "Zona 3 (2.4-3.1 km)" },
    { maxKm: 3.9, fee: 10.0, label: "Zona 4 (3.2-3.9 km)" },
    { maxKm: 4.7, fee: 11.0, label: "Zona 5 (4.0-4.7 km)" },
    { maxKm: 5.5, fee: 12.0, label: "Zona 6 (4.8-5.5 km)" },
    { maxKm: 6.3, fee: 13.0, label: "Zona 7 (5.6-6.3 km)" },
    { maxKm: 7.1, fee: 14.0, label: "Zona 8 (6.4-7.1 km)" },
    { maxKm: 7.9, fee: 15.0, label: "Zona 9 (7.2-7.9 km)" },
    { maxKm: 8.7, fee: 16.0, label: "Zona 10 (8.0-8.7 km)" },
    { maxKm: 9.5, fee: 17.0, label: "Zona 11 (8.8-9.5 km)" },
    { maxKm: 10.3, fee: 18.0, label: "Zona 12 (9.6-10.3 km)" },
    { maxKm: 11.1, fee: 19.0, label: "Zona 13 (10.4-11.1 km)" },
    { maxKm: 11.9, fee: 20.0, label: "Zona 14 (11.2-11.9 km)" },
    { maxKm: 12.7, fee: 25.0, label: "Zona 15 (12.0-12.7 km)" },
  ];

  const ADDERS = {
    sunday: 1.0,
    holiday: 2.0,
    rain: 2.0,
    peak: 1.0,
  };

  const URGENCY_RULES = {
    padrao: 0.0,
    urgente: 2.0,
    agendado: 0.0,
  };

  // Flags mantidos em false até integração real (admin/backend).
  const SYSTEM_CONTEXT = {
    holiday: false,
    rain: false,
  };

  const distanceInput = document.getElementById("price-distance");
  const datetimeInput = document.getElementById("price-datetime");
  const urgencyButtons = Array.from(document.querySelectorAll("[data-urgency]"));

  const zoneLabelEl = document.getElementById("zoneLabel");
  const baseFeeValueEl = document.getElementById("baseFeeValue");
  const urgencyFeeValueEl = document.getElementById("urgencyFeeValue");
  const extrasFeeValueEl = document.getElementById("extrasFeeValue");
  const totalFeeValueEl = document.getElementById("totalFeeValue");
  const activeAddersTextEl = document.getElementById("activeAddersText");

  const distanceValueEl = document.getElementById("distanceValue");
  const etaValueEl = document.getElementById("etaValue");
  const feeValueEl = document.getElementById("feeValue");

  if (
    !distanceInput ||
    !datetimeInput ||
    urgencyButtons.length === 0 ||
    !zoneLabelEl ||
    !baseFeeValueEl ||
    !urgencyFeeValueEl ||
    !extrasFeeValueEl ||
    !totalFeeValueEl ||
    !activeAddersTextEl ||
    !distanceValueEl ||
    !etaValueEl ||
    !feeValueEl
  ) {
    return;
  }

  function toLocalDatetimeInputValue(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  }

  function parseNumber(value, fallback) {
    if (value == null || value === "") return fallback;
    const parsed = Number.parseFloat(String(value).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function formatCurrency(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function signedCurrency(value) {
    const sign = value >= 0 ? "+" : "-";
    return sign + " " + formatCurrency(Math.abs(value));
  }

  function getZone(distanceKm) {
    for (const zone of ZONES) {
      if (distanceKm <= zone.maxKm) return zone;
    }
    return ZONES[ZONES.length - 1];
  }

  function isPeak(date) {
    const hour = date.getHours();
    return (hour >= 11 && hour < 14) || (hour >= 18 && hour < 22);
  }

  function calcEta(distanceKm, urgency) {
    let eta = Math.max(6, Math.round(distanceKm * 2.8 + 3));
    if (urgency === "urgente") eta = Math.max(5, eta - 2);
    if (urgency === "agendado") eta += 4;
    return eta;
  }

  if (!datetimeInput.value) {
    datetimeInput.value = toLocalDatetimeInputValue(new Date());
  }

  let activeUrgency =
    urgencyButtons.find((button) => button.classList.contains("is-active"))?.dataset.urgency || "padrao";

  function setActiveUrgency(urgency) {
    activeUrgency = urgency;
    urgencyButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.urgency === urgency);
    });
  }

  function updatePrice() {
    const distanceKm = Math.max(0.1, parseNumber(distanceInput.value, 0.1));
    const parsedDate = new Date(datetimeInput.value);
    const referenceDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    const zone = getZone(distanceKm);
    const urgencyFee = URGENCY_RULES[activeUrgency] ?? 0;
    const isSunday = referenceDate.getDay() === 0;
    const hasHoliday = SYSTEM_CONTEXT.holiday;
    const hasRain = SYSTEM_CONTEXT.rain;
    const hasPeak = isPeak(referenceDate);

    const extras =
      (isSunday ? ADDERS.sunday : 0) +
      (hasHoliday ? ADDERS.holiday : 0) +
      (hasRain ? ADDERS.rain : 0) +
      (hasPeak ? ADDERS.peak : 0);

    const totalFee = Number((zone.fee + urgencyFee + extras).toFixed(2));
    const etaMinutes = calcEta(distanceKm, activeUrgency);

    const activeAdders = [];
    if (isSunday) activeAdders.push("domingo");
    if (hasHoliday) activeAdders.push("feriado");
    if (hasRain) activeAdders.push("chuva");
    if (hasPeak) activeAdders.push("pico");

    zoneLabelEl.textContent = zone.label;
    baseFeeValueEl.textContent = formatCurrency(zone.fee);
    urgencyFeeValueEl.textContent = signedCurrency(urgencyFee);
    extrasFeeValueEl.textContent = "+ " + formatCurrency(extras);
    totalFeeValueEl.textContent = formatCurrency(totalFee);

    activeAddersTextEl.textContent = activeAdders.length
      ? "Acrescimos ativos: " + activeAdders.join(", ") + "."
      : "Sem acrescimos ativos.";

    distanceValueEl.textContent = distanceKm.toFixed(1);
    etaValueEl.textContent = String(etaMinutes);
    feeValueEl.textContent = formatCurrency(totalFee);
  }

  urgencyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveUrgency(button.dataset.urgency || "padrao");
      updatePrice();
    });
  });

  distanceInput.addEventListener("input", updatePrice);
  datetimeInput.addEventListener("change", updatePrice);

  updatePrice();
})();
