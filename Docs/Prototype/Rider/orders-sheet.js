(function () {
  const overlayEl = document.getElementById("ordersSheetOverlay");
  const sheetEl = document.getElementById("ordersSheet");
  const closeEl = document.getElementById("ordersSheetClose");
  const titleEl = document.getElementById("ordersSheetTitle");
  const bodyEl = document.getElementById("ordersSheetBody");
  const orderCardEls = document.querySelectorAll("[data-order-id]");
  const filterTriggerEls = document.querySelectorAll('[data-orders-action="filters"]');
  const filterChipEls = document.querySelectorAll("[data-filter-chip]");

  if (!overlayEl || !sheetEl || !closeEl || !titleEl || !bodyEl) return;
  if (orderCardEls.length === 0) return;

  const ORDER_DETAILS = {
    order_001: {
      id: "#PED-20260213-001",
      merchant: "Burger King • Centro",
      statusLabel: "Concluída",
      statusTone: "success",
      filterStatus: "concluida",
      ticket: "R$ 14,50",
      type: "Comida",
      startedAt: "13:24",
      finishedAt: "13:42",
      duration: "18 min",
      distance: "4.2 km",
      pickupAddress: "Av. Central, 240",
      dropoffAddress: "Rua das Flores, 120",
      mapsLink: "https://www.google.com/maps/search/?api=1&query=Av+Central+240",
      financial: [
        { key: "Base", value: "R$ 12,00" },
        { key: "Distância", value: "R$ 1,80" },
        { key: "Bônus", value: "R$ 0,70" },
        { key: "Total líquido", value: "R$ 14,50" },
      ],
      timeline: [
        { step: "Comerciante acionou", time: "13:20" },
        { step: "Solicitação aceita", time: "13:21" },
        { step: "A caminho do comércio", time: "13:24" },
        { step: "Chegada no comércio", time: "13:30" },
        { step: "Aguardando pedido", time: "13:31" },
        { step: "A caminho do cliente", time: "13:35" },
        { step: "Chegada no cliente", time: "13:41" },
        { step: "Entrega finalizada", time: "13:42" },
      ],
    },
    order_002: {
      id: "#PED-20260213-002",
      merchant: "Subway • Paulista",
      statusLabel: "Concluída",
      statusTone: "success",
      filterStatus: "concluida",
      ticket: "R$ 11,80",
      type: "Comida",
      startedAt: "12:44",
      finishedAt: "12:58",
      duration: "14 min",
      distance: "3.1 km",
      pickupAddress: "Av. Paulista, 980",
      dropoffAddress: "Alameda Santos, 220",
      mapsLink: "https://www.google.com/maps/search/?api=1&query=Av+Paulista+980",
      financial: [
        { key: "Base", value: "R$ 9,50" },
        { key: "Distância", value: "R$ 1,90" },
        { key: "Bônus", value: "R$ 0,40" },
        { key: "Total líquido", value: "R$ 11,80" },
      ],
      timeline: [
        { step: "Comerciante acionou", time: "12:40" },
        { step: "Solicitação aceita", time: "12:41" },
        { step: "A caminho do comércio", time: "12:44" },
        { step: "Chegada no comércio", time: "12:48" },
        { step: "Aguardando pedido", time: "12:49" },
        { step: "A caminho do cliente", time: "12:52" },
        { step: "Chegada no cliente", time: "12:57" },
        { step: "Entrega finalizada", time: "12:58" },
      ],
    },
    order_003: {
      id: "#PED-20260213-003",
      merchant: "Domino's • Jardins",
      statusLabel: "Com bônus",
      statusTone: "warning",
      filterStatus: "bonus",
      ticket: "R$ 18,30",
      type: "Comida",
      startedAt: "11:17",
      finishedAt: "11:40",
      duration: "23 min",
      distance: "5.4 km",
      pickupAddress: "Rua Augusta, 455",
      dropoffAddress: "Alameda Lorena, 740",
      mapsLink: "https://www.google.com/maps/search/?api=1&query=Rua+Augusta+455",
      financial: [
        { key: "Base", value: "R$ 13,80" },
        { key: "Distância", value: "R$ 2,40" },
        { key: "Bônus pico", value: "R$ 2,10" },
        { key: "Total líquido", value: "R$ 18,30" },
      ],
      timeline: [
        { step: "Comerciante acionou", time: "11:11" },
        { step: "Solicitação aceita", time: "11:13" },
        { step: "A caminho do comércio", time: "11:17" },
        { step: "Chegada no comércio", time: "11:24" },
        { step: "Aguardando pedido", time: "11:26" },
        { step: "A caminho do cliente", time: "11:30" },
        { step: "Chegada no cliente", time: "11:39" },
        { step: "Entrega finalizada", time: "11:40" },
      ],
    },
    order_004: {
      id: "#PED-20260213-004",
      merchant: "Açaí House • Zona Sul",
      statusLabel: "Cancelada",
      statusTone: "danger",
      filterStatus: "cancelada",
      ticket: "R$ 0,00",
      type: "Comida",
      startedAt: "09:07",
      finishedAt: "09:16",
      duration: "09 min",
      distance: "2.6 km",
      pickupAddress: "Rua Gama, 110",
      dropoffAddress: "Rua Delta, 31",
      mapsLink: "https://www.google.com/maps/search/?api=1&query=Rua+Gama+110",
      cancelInfo: {
        reason: "Cliente sem resposta no local de entrega",
        cancelledBy: "Comércio",
      },
      financial: [
        { key: "Base", value: "R$ 0,00" },
        { key: "Taxa cancelamento", value: "R$ 0,00" },
        { key: "Total líquido", value: "R$ 0,00" },
      ],
      timeline: [
        { step: "Comerciante acionou", time: "09:03" },
        { step: "Solicitação aceita", time: "09:04" },
        { step: "A caminho do comércio", time: "09:07" },
        { step: "Chegada no comércio", time: "09:11" },
        { step: "A caminho do cliente", time: "09:13" },
        { step: "Corrida cancelada", time: "09:16" },
      ],
    },
    order_005: {
      id: "#PED-20260213-005",
      merchant: "Sushi Express • Moema",
      statusLabel: "Concluída",
      statusTone: "success",
      filterStatus: "concluida",
      ticket: "R$ 22,10",
      type: "Comida",
      startedAt: "08:09",
      finishedAt: "08:35",
      duration: "26 min",
      distance: "6.0 km",
      pickupAddress: "Av. Ibirapuera, 1550",
      dropoffAddress: "Alameda dos Arapanés, 390",
      mapsLink: "https://www.google.com/maps/search/?api=1&query=Av+Ibirapuera+1550",
      financial: [
        { key: "Base", value: "R$ 16,20" },
        { key: "Distância", value: "R$ 3,90" },
        { key: "Bônus", value: "R$ 2,00" },
        { key: "Total líquido", value: "R$ 22,10" },
      ],
      timeline: [
        { step: "Comerciante acionou", time: "08:01" },
        { step: "Solicitação aceita", time: "08:04" },
        { step: "A caminho do comércio", time: "08:09" },
        { step: "Chegada no comércio", time: "08:16" },
        { step: "Aguardando pedido", time: "08:18" },
        { step: "A caminho do cliente", time: "08:23" },
        { step: "Chegada no cliente", time: "08:34" },
        { step: "Entrega finalizada", time: "08:35" },
      ],
    },
  };

  const FILTER_OPTIONS = {
    period: ["Hoje", "7 dias", "30 dias"],
    status: ["Todas", "Concluídas", "Canceladas", "Com bônus"],
    sort: ["Mais recente", "Maior valor", "Maior distância"],
  };

  const filterState = {
    period: "Hoje",
    status: "Todas",
    sort: "Mais recente",
  };

  let isOpen = false;
  let hideTimer;
  let currentMode = "order";
  let currentOrderId = null;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function statusToneClass(tone) {
    if (tone === "danger") return "ds-order-sheet-chip-danger";
    if (tone === "warning") return "ds-order-sheet-chip-warning";
    return "ds-order-sheet-chip-success";
  }

  function renderGroup(title, items) {
    const itemsMarkup = items
      .map(
        (item) => `
          <li class="ds-sheet-item">
            <p class="ds-sheet-item-key">${escapeHtml(item.key)}</p>
            <p class="ds-sheet-item-value">${escapeHtml(item.value)}</p>
          </li>
        `,
      )
      .join("");

    return `
      <section class="ds-sheet-group">
        <h3 class="ds-sheet-group-title">${escapeHtml(title)}</h3>
        <ul class="ds-sheet-list">${itemsMarkup}</ul>
      </section>
    `;
  }

  function renderOrderSheet(orderId) {
    const order = ORDER_DETAILS[orderId];
    if (!order) return "<p class=\"ds-order-sheet-note\">Pedido não encontrado.</p>";

    const summaryItems = [
      { key: "Pedido", value: order.id },
      { key: "Tipo", value: order.type },
      { key: "Início", value: order.startedAt },
      { key: "Fim", value: order.finishedAt },
      { key: "Duração", value: order.duration },
      { key: "Distância", value: order.distance },
    ];

    const addressItems = [
      { key: "Coleta", value: order.pickupAddress },
      { key: "Entrega", value: order.dropoffAddress },
    ];

    const timelineItems = order.timeline.map((step) => ({ key: step.step, value: step.time }));
    const cancelItems = order.cancelInfo
      ? [
          { key: "Motivo do cancelamento", value: order.cancelInfo.reason },
          { key: "Cancelado por", value: order.cancelInfo.cancelledBy },
        ]
      : [];

    return `
      <div class="ds-order-sheet-summary">
        <div class="ds-order-sheet-header">
          <div>
            <p class="ds-order-sheet-title">${escapeHtml(order.merchant)}</p>
            <p class="ds-order-sheet-meta">Ticket total da corrida</p>
          </div>
          <span class="ds-order-sheet-chip ${statusToneClass(order.statusTone)}">${escapeHtml(order.statusLabel)}</span>
        </div>
        <div class="ds-order-sheet-header">
          <p class="ds-sheet-group-title">Valor da corrida</p>
          <p class="ds-order-sheet-fare">${escapeHtml(order.ticket)}</p>
        </div>
        <div class="ds-order-sheet-actions">
          <button class="ds-order-sheet-action" data-orders-action="open-route" type="button">Ver rota</button>
          <button class="ds-order-sheet-action" data-orders-action="open-receipt" type="button">Comprovante</button>
          <button class="ds-order-sheet-action" data-orders-action="open-support" type="button">Ajuda</button>
        </div>
        <p class="ds-order-sheet-note" id="ordersSheetNote"></p>
      </div>
      ${renderGroup("Resumo da Corrida", summaryItems)}
      ${renderGroup("Endereços", addressItems)}
      ${renderGroup("Financeiro", order.financial)}
      ${renderGroup("Linha do Tempo", timelineItems)}
      ${cancelItems.length > 0 ? renderGroup("Cancelamento", cancelItems) : ""}
    `;
  }

  function renderFilterOptions(groupKey, options) {
    const selectedValue = filterState[groupKey];

    return options
      .map((option) => {
        const isActive = selectedValue === option ? " is-active" : "";
        return `
          <button
            class="ds-order-filter-option${isActive}"
            data-filter-group="${groupKey}"
            data-filter-value="${escapeHtml(option)}"
            type="button"
          >
            ${escapeHtml(option)}
          </button>
        `;
      })
      .join("");
  }

  function renderFilterSheet() {
    return `
      <section class="ds-order-filter-group">
        <h3 class="ds-sheet-group-title">Período</h3>
        <div class="ds-order-filter-options">${renderFilterOptions("period", FILTER_OPTIONS.period)}</div>
      </section>
      <section class="ds-order-filter-group">
        <h3 class="ds-sheet-group-title">Status</h3>
        <div class="ds-order-filter-options">${renderFilterOptions("status", FILTER_OPTIONS.status)}</div>
      </section>
      <section class="ds-order-filter-group">
        <h3 class="ds-sheet-group-title">Ordenação</h3>
        <div class="ds-order-filter-options">${renderFilterOptions("sort", FILTER_OPTIONS.sort)}</div>
      </section>
      <div class="ds-order-filter-footer">
        <button class="ds-order-filter-btn ds-order-filter-btn-secondary" data-orders-action="clear-filters" type="button">Limpar</button>
        <button class="ds-order-filter-btn ds-order-filter-btn-primary" data-orders-action="apply-filters" type="button">Aplicar</button>
      </div>
    `;
  }

  function openSheet(mode, payload) {
    window.clearTimeout(hideTimer);
    currentMode = mode;

    if (mode === "filters") {
      titleEl.textContent = "Filtrar histórico";
      bodyEl.innerHTML = renderFilterSheet();
      currentOrderId = null;
    } else {
      currentOrderId = payload;
      titleEl.textContent = "Detalhes da corrida";
      bodyEl.innerHTML = renderOrderSheet(payload);
    }

    overlayEl.classList.remove("hidden");
    sheetEl.classList.remove("hidden");
    document.body.classList.add("ds-lock-scroll");

    requestAnimationFrame(() => {
      overlayEl.classList.add("is-open");
      sheetEl.classList.add("is-open");
    });

    isOpen = true;
  }

  function closeSheet() {
    if (!isOpen) return;

    overlayEl.classList.remove("is-open");
    sheetEl.classList.remove("is-open");
    document.body.classList.remove("ds-lock-scroll");
    isOpen = false;

    hideTimer = window.setTimeout(() => {
      overlayEl.classList.add("hidden");
      sheetEl.classList.add("hidden");
      bodyEl.innerHTML = "";
    }, 230);
  }

  function applyFilterChipPreset(chipValue) {
    if (!chipValue) return;
    if (FILTER_OPTIONS.period.includes(chipValue)) filterState.period = chipValue;
    if (chipValue === "Concluídas") filterState.status = "Concluídas";
    if (chipValue === "Canceladas") filterState.status = "Canceladas";
  }

  function syncFilterChips() {
    filterChipEls.forEach((chipEl) => {
      chipEl.classList.remove("is-active");
    });

    const periodChipEl = document.querySelector(`[data-filter-chip="${filterState.period}"]`);
    if (periodChipEl) periodChipEl.classList.add("is-active");

    if (filterState.status === "Concluídas" || filterState.status === "Canceladas") {
      const statusChipEl = document.querySelector(`[data-filter-chip="${filterState.status}"]`);
      if (statusChipEl) statusChipEl.classList.add("is-active");
    }
  }

  function applyFiltersToList() {
    orderCardEls.forEach((cardEl) => {
      const order = ORDER_DETAILS[cardEl.dataset.orderId];
      if (!order) return;

      let isVisible = true;
      if (filterState.status === "Concluídas") isVisible = order.filterStatus === "concluida" || order.filterStatus === "bonus";
      if (filterState.status === "Canceladas") isVisible = order.filterStatus === "cancelada";
      if (filterState.status === "Com bônus") isVisible = order.filterStatus === "bonus";

      cardEl.classList.toggle("hidden", !isVisible);
    });
  }

  function setSheetNote(message) {
    const noteEl = document.getElementById("ordersSheetNote");
    if (!noteEl) return;
    noteEl.textContent = message;
  }

  orderCardEls.forEach((cardEl) => {
    cardEl.addEventListener("click", () => {
      openSheet("order", cardEl.dataset.orderId);
    });
  });

  filterTriggerEls.forEach((triggerEl) => {
    triggerEl.addEventListener("click", (event) => {
      event.preventDefault();
      applyFilterChipPreset(triggerEl.dataset.filterChip);
      openSheet("filters");
    });
  });

  bodyEl.addEventListener("click", (event) => {
    const optionEl = event.target.closest("[data-filter-group]");
    if (optionEl) {
      const groupKey = optionEl.dataset.filterGroup;
      const optionValue = optionEl.dataset.filterValue;
      if (groupKey && optionValue && Object.prototype.hasOwnProperty.call(filterState, groupKey)) {
        filterState[groupKey] = optionValue;
        bodyEl.innerHTML = renderFilterSheet();
      }
      return;
    }

    const actionEl = event.target.closest("[data-orders-action]");
    if (!actionEl) return;

    const action = actionEl.dataset.ordersAction;

    if (action === "clear-filters") {
      filterState.period = "Hoje";
      filterState.status = "Todas";
      filterState.sort = "Mais recente";
      bodyEl.innerHTML = renderFilterSheet();
      return;
    }

    if (action === "apply-filters") {
      applyFiltersToList();
      syncFilterChips();
      closeSheet();
      return;
    }

    if (currentMode !== "order" || !currentOrderId) return;

    const order = ORDER_DETAILS[currentOrderId];
    if (!order) return;

    if (action === "open-route") {
      window.open(order.mapsLink, "_blank", "noopener,noreferrer");
      setSheetNote("Rota aberta no Google Maps.");
      return;
    }

    if (action === "open-receipt") {
      setSheetNote(`Comprovante ${order.id} disponível no histórico financeiro.`);
      return;
    }

    if (action === "open-support") {
      setSheetNote("Se necessário, abra um chamado na Central de Ajuda.");
    }
  });

  overlayEl.addEventListener("click", closeSheet);
  closeEl.addEventListener("click", closeSheet);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSheet();
  });

  applyFiltersToList();
  syncFilterChips();
})();
