const ORDER_MOCK = {
  type: "Comida",
  estimatedFare: "R$ 14,50",
  totalDistance: "4.2 km",
  riderToMerchantDistance: "1.2 km",
  merchantToCustomerDistance: "3.0 km",
  merchantName: "Burger King, 5th Avenue",
  merchantAddress: "5th Avenue, 240",
  customerName: "Alex Johnson",
  customerAddress: "Skyline Apts, 1204",
  etaToMerchant: "8 min",
  prepEta: "6 min",
  etaToCustomer: "12 min",
  confirmationCode: "4729",
  mapsLink: "https://www.google.com/maps/search/?api=1&query=Skyline+Apts",
  whatsappLink:
    "https://wa.me/?text=" +
    encodeURIComponent("Acompanhe a rota da entrega em tempo real: https://www.google.com/maps/search/?api=1&query=Skyline+Apts"),
};

const FLOW_STATES = {
  offline: {
    badgeText: "OFFLINE",
    badgeClass: "bg-white/10 text-slate-300",
    phase: "Disponibilidade",
    title: "Você está offline",
    description: "Ative o modo online para entrar na fila de entregas.",
    body: () => `
      <div class="rounded-xl border border-white/10 bg-black/30 p-3">
        <p class="text-sm font-semibold text-white">Sem entrega ativa</p>
        <p class="mt-1 text-xs text-slate-400">Quando estiver online, o sistema poderá enviar novas solicitações.</p>
      </div>
    `,
    userActions: [{ id: "go_online", label: "Ficar online", icon: "toggle_on", variant: "primary" }],
    systemActions: [],
  },
  online_idle: {
    badgeText: "ONLINE",
    badgeClass: "bg-emerald-500/20 text-emerald-300",
    phase: "Disponibilidade",
    title: "Aguardando solicitação",
    description: "Você está disponível para receber pedidos.",
    body: () => `
      <div class="rounded-xl border border-white/10 bg-black/30 p-3">
        <p class="text-sm font-semibold text-white">Sem solicitação no momento</p>
        <p class="mt-1 text-xs text-slate-400">A próxima chamada aparece neste card.</p>
      </div>
    `,
    userActions: [{ id: "go_offline", label: "Ficar offline", icon: "toggle_off", variant: "ghost" }],
    systemActions: [{ id: "receive_request", label: "Comerciante aciona entregador", icon: "notifications_active", variant: "system" }],
  },
  request_incoming: {
    badgeText: "SOLICITAÇÃO",
    badgeClass: "bg-primary/20 text-cyan-200",
    phase: "Etapas 1 e 2 de 8",
    title: "Nova solicitação de entrega",
    description: "Analise os dados de coleta, rota e entrega para aceitar ou recusar.",
    body: () => renderRequestSummary(),
    userActions: [
      { id: "reject_request", label: "Recusar", icon: "close", variant: "ghost" },
      { id: "accept_request", label: "Aceitar pedido", icon: "check", variant: "primary" },
    ],
    systemActions: [],
  },
  to_merchant: {
    badgeText: "EM ROTA",
    badgeClass: "bg-cyan-500/20 text-cyan-200",
    phase: "Etapa 3 de 8",
    title: "A caminho do comércio",
    description: "Siga para coleta do pedido.",
    body: () => `
      <div class="space-y-3">
        <div class="rounded-xl border border-white/10 bg-black/30 p-3">
          <p class="text-2xs font-bold uppercase tracking-wide text-slate-400">Coleta</p>
          <p class="mt-1 text-sm font-semibold text-white">${ORDER_MOCK.merchantName}</p>
          <p class="mt-1 text-xs text-slate-400">Pedido: ${ORDER_MOCK.type} • ETA ${ORDER_MOCK.etaToMerchant}</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-black/30 p-3">
          <p class="text-2xs font-bold uppercase tracking-wide text-slate-400">Endereço</p>
          <p class="mt-1 text-sm text-slate-200">${ORDER_MOCK.merchantAddress}</p>
        </div>
      </div>
    `,
    userActions: [{ id: "arrive_merchant", label: "Cheguei no comércio", icon: "storefront", variant: "primary" }],
    systemActions: [],
  },
  at_merchant: {
    badgeText: "NO COMÉRCIO",
    badgeClass: "bg-amber-500/20 text-amber-200",
    phase: "Etapa 4 de 8",
    title: "Chegada registrada",
    description: "Aguardando atualização do comércio para iniciar preparo/espera.",
    body: () => `
      <div class="rounded-xl border border-white/10 bg-black/30 p-3">
        <p class="text-sm font-semibold text-white">${ORDER_MOCK.merchantName}</p>
        <p class="mt-1 text-xs text-slate-400">Confirme presença e mantenha o app ativo.</p>
      </div>
    `,
    userActions: [],
    systemActions: [{ id: "start_waiting", label: "Pedido em preparo", icon: "hourglass_top", variant: "system" }],
  },
  waiting_order: {
    badgeText: "AGUARDANDO",
    badgeClass: "bg-orange-500/20 text-orange-200",
    phase: "Etapa 5 de 8",
    title: "Aguardando o pedido",
    description: "Pedido em preparo no comércio.",
    body: () => `
      <div class="rounded-xl border border-white/10 bg-black/30 p-3">
        <p class="text-sm font-semibold text-white">Tempo estimado de preparo: ${ORDER_MOCK.prepEta}</p>
        <p class="mt-1 text-xs text-slate-400">Roadmap: ${ORDER_MOCK.riderToMerchantDistance} até comércio + ${ORDER_MOCK.merchantToCustomerDistance} até cliente.</p>
      </div>
    `,
    userActions: [],
    systemActions: [{ id: "order_ready", label: "Pedido pronto para retirada", icon: "inventory_2", variant: "system" }],
  },
  to_customer: {
    badgeText: "EM ENTREGA",
    badgeClass: "bg-blue-500/20 text-blue-200",
    phase: "Etapa 6 de 8",
    title: "A caminho do cliente",
    description: "Pedido retirado. Siga para o destino final.",
    body: () => `
      <div class="space-y-3">
        <div class="rounded-xl border border-white/10 bg-black/30 p-3">
          <p class="text-2xs font-bold uppercase tracking-wide text-slate-400">Entrega</p>
          <p class="mt-1 text-sm font-semibold text-white">${ORDER_MOCK.customerName} • ${ORDER_MOCK.customerAddress}</p>
          <p class="mt-1 text-xs text-slate-400">ETA: ${ORDER_MOCK.etaToCustomer}</p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <a class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10" href="${ORDER_MOCK.mapsLink}" rel="noreferrer" target="_blank">
            <span class="material-symbols-outlined text-base">map</span>
            Abrir Maps
          </a>
          <a class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10" href="${ORDER_MOCK.whatsappLink}" rel="noreferrer" target="_blank">
            <span class="material-symbols-outlined text-base">share</span>
            Compartilhar
          </a>
        </div>
      </div>
    `,
    userActions: [{ id: "arrive_customer", label: "Cheguei no cliente", icon: "location_on", variant: "primary" }],
    systemActions: [],
  },
  at_customer: {
    badgeText: "NO DESTINO",
    badgeClass: "bg-violet-500/20 text-violet-200",
    phase: "Etapa 7 de 8",
    title: "Chegada ao cliente",
    description: "Solicite o código de confirmação para iniciar finalização.",
    body: () => `
      <div class="rounded-xl border border-white/10 bg-black/30 p-3">
        <p class="text-sm font-semibold text-white">Confirmação de recebimento pendente</p>
        <p class="mt-1 text-xs text-slate-400">Cliente informa o código recebido pelo comerciante.</p>
      </div>
    `,
    userActions: [{ id: "start_finish", label: "Iniciar finalização", icon: "pin", variant: "primary" }],
    systemActions: [],
  },
  finishing_delivery: {
    badgeText: "FINALIZANDO",
    badgeClass: "bg-primary/20 text-cyan-200",
    phase: "Etapa 8 de 8",
    title: "Finalizar entrega",
    description: "Digite o código informado pelo cliente para concluir.",
    body: () => `
      <div class="space-y-3">
        <label class="block">
          <span class="text-2xs font-bold uppercase tracking-wide text-slate-400">Código de confirmação</span>
          <input autocomplete="one-time-code" class="field-input mt-1.5 text-center tracking-widest" id="confirmCodeInput" inputmode="numeric" maxlength="4" placeholder="0000" />
        </label>
        <p class="text-2xs text-slate-500">Protótipo: use o código ${ORDER_MOCK.confirmationCode}</p>
      </div>
    `,
    userActions: [{ id: "confirm_delivery", label: "Confirmar entrega", icon: "task_alt", variant: "primary" }],
    systemActions: [],
  },
  completed: {
    badgeText: "CONCLUÍDA",
    badgeClass: "bg-emerald-500/20 text-emerald-300",
    phase: "Fluxo encerrado",
    title: "Entrega finalizada com sucesso",
    description: "Pedido confirmado e encerrado no sistema.",
    body: () => `
      <div class="rounded-xl border border-white/10 bg-black/30 p-3">
        <p class="text-sm font-semibold text-white">${ORDER_MOCK.estimatedFare} creditado</p>
        <p class="mt-1 text-xs text-slate-400">Você pode voltar para fila online ou encerrar turno.</p>
      </div>
    `,
    userActions: [
      { id: "ready_next", label: "Voltar para fila online", icon: "replay", variant: "primary" },
      { id: "go_offline", label: "Encerrar turno", icon: "power_settings_new", variant: "ghost" },
    ],
    systemActions: [],
  },
};

const FLOW_TRANSITIONS = {
  go_online: { from: ["offline"], to: "online_idle", toast: "Modo online ativado." },
  go_offline: { from: ["online_idle", "completed"], to: "offline", toast: "Modo offline ativado." },
  receive_request: { from: ["online_idle"], to: "request_incoming", toast: "Nova solicitação recebida." },
  reject_request: { from: ["request_incoming"], to: "online_idle", toast: "Solicitação recusada." },
  accept_request: { from: ["request_incoming"], to: "to_merchant", toast: "Solicitação aceita." },
  arrive_merchant: { from: ["to_merchant"], to: "at_merchant", toast: "Chegada no comércio confirmada." },
  start_waiting: { from: ["at_merchant"], to: "waiting_order", toast: "Pedido em preparo." },
  order_ready: { from: ["waiting_order"], to: "to_customer", toast: "Pedido pronto. Siga para o cliente." },
  arrive_customer: { from: ["to_customer"], to: "at_customer", toast: "Chegada no cliente registrada." },
  start_finish: { from: ["at_customer"], to: "finishing_delivery", toast: "Inicie a confirmação do código." },
  confirm_delivery: { from: ["finishing_delivery"], to: "completed", toast: "Entrega finalizada." },
  ready_next: { from: ["completed"], to: "online_idle", toast: "Você voltou para fila online." },
};

const stateCardEl = document.getElementById("deliveryStateCard");
const toastEl = document.getElementById("flowToast");
let currentState = "offline";
let toastTimer;

function renderRequestSummary() {
  return `
    <div class="relative h-24 w-full mb-4">
      <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
        <div class="w-full border-b border-white/5 border-dashed"></div>
        <div class="w-full border-b border-white/5 border-dashed"></div>
        <div class="w-full border-b border-white/5 border-dashed"></div>
      </div>
      <svg class="w-full h-full visible overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
        <path d="M15,75 Q70,65 115,50 T210,35 T285,20" fill="none" stroke="var(--color-text-muted)" stroke-linecap="round" stroke-width="3"></path>
        <circle cx="15" cy="75" fill="var(--color-bg-dark)" r="4" stroke="var(--color-text-strong)" stroke-width="2"></circle>
        <circle cx="285" cy="20" fill="var(--color-text-strong)" r="5" stroke="var(--color-text-muted)" stroke-width="2"></circle>
      </svg>
      <div class="ds-route-axis ds-route-axis-labels">
        <p class="ds-route-axis-label">Coleta</p>
        <p class="ds-route-axis-label">Rota</p>
        <p class="ds-route-axis-label ds-route-axis-label-active">Entrega</p>
      </div>
    </div>

    <div class="ds-route-axis ds-route-summary">
      <div class="ds-route-summary-cell">
        <span class="material-symbols-outlined ds-route-summary-symbol">lunch_dining</span>
      </div>
      <div class="ds-route-summary-cell">
        <p class="ds-route-summary-value">${ORDER_MOCK.estimatedFare}</p>
      </div>
      <div class="ds-route-summary-cell">
        <p class="ds-route-summary-value">${ORDER_MOCK.totalDistance}</p>
      </div>
    </div>

    <div class="ds-route-steps">
      <div class="ds-route-step">
        <span class="ds-route-dot"></span>
        <div class="ds-route-copy">
          <p class="text-2xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Coleta • ${ORDER_MOCK.riderToMerchantDistance}</p>
          <p class="text-sm font-semibold text-white truncate">${ORDER_MOCK.merchantName}</p>
        </div>
      </div>
      <div class="ds-route-step">
        <span class="ds-route-dot ds-route-dot-active"></span>
        <div class="ds-route-copy">
          <p class="text-2xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Entrega • ${ORDER_MOCK.merchantToCustomerDistance}</p>
          <p class="text-sm font-semibold text-white truncate">${ORDER_MOCK.customerName} • ${ORDER_MOCK.customerAddress}</p>
        </div>
      </div>
    </div>
  `;
}

function actionClass(variant) {
  if (variant === "primary") return "bg-primary text-white border border-primary/60 hover:bg-primary/90";
  if (variant === "system") return "bg-black/35 text-slate-200 border border-dashed border-white/20 hover:bg-black/50";
  return "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white";
}

function renderActionButton(action) {
  return `
    <button class="w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${actionClass(action.variant)}" data-action="${action.id}" type="button">
      <span class="material-symbols-outlined text-base">${action.icon}</span>
      ${action.label}
    </button>
  `;
}

function renderActionGroup(title, actions) {
  if (!actions || actions.length === 0) return "";
  const columnsClass = actions.length > 1 ? "grid-cols-2" : "grid-cols-1";
  return `
    <div class="space-y-2">
      <p class="text-2xs text-slate-500 uppercase font-bold tracking-wide">${title}</p>
      <div class="grid ${columnsClass} gap-2">
        ${actions.map((action) => renderActionButton(action)).join("")}
      </div>
    </div>
  `;
}

function renderStateCard() {
  const cfg = FLOW_STATES[currentState];
  if (!cfg) return;

  stateCardEl.innerHTML = `
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-bold ${cfg.badgeClass}">${cfg.badgeText}</span>
        <span class="text-2xs text-slate-400 font-semibold uppercase tracking-widest">${cfg.phase}</span>
      </div>
      <span class="text-2xs text-slate-500 uppercase font-bold tracking-wide">Agora</span>
    </div>

    <div>
      <h3 class="text-sm sm:text-base font-bold text-white">${cfg.title}</h3>
      <p class="mt-1 text-xs text-slate-400">${cfg.description}</p>
    </div>

    ${cfg.body()}
    ${renderActionGroup("Ações do entregador", cfg.userActions)}
    ${renderActionGroup("Eventos do sistema", cfg.systemActions)}
  `;

  const codeInput = document.getElementById("confirmCodeInput");
  if (codeInput) codeInput.focus();
}

function showToast(message) {
  if (!message) return;
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add("hidden"), 1800);
}

function dispatchAction(actionId) {
  if (!actionId) return;

  if (actionId === "confirm_delivery") {
    const codeInput = document.getElementById("confirmCodeInput");
    const code = codeInput ? codeInput.value.trim() : "";
    if (code !== ORDER_MOCK.confirmationCode) {
      showToast("Código inválido. Confirme com o cliente.");
      if (codeInput) codeInput.focus();
      return;
    }
  }

  const rule = FLOW_TRANSITIONS[actionId];
  if (!rule || !rule.from.includes(currentState)) {
    showToast("Ação não permitida no estado atual.");
    return;
  }

  currentState = rule.to;
  renderStateCard();
  showToast(rule.toast);
}

function setupStateCardInteractions() {
  stateCardEl.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    dispatchAction(actionButton.dataset.action);
  });

  stateCardEl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (event.target.id !== "confirmCodeInput") return;
    event.preventDefault();
    dispatchAction("confirm_delivery");
  });
}

function setupSideMenu() {
  const menuToggleEl = document.getElementById("menuToggle");
  const floatingMenuEl = document.getElementById("floatingMenu");
  let isOpen = false;

  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    floatingMenuEl.classList.remove("hidden");
    menuToggleEl.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    floatingMenuEl.classList.add("hidden");
    menuToggleEl.setAttribute("aria-expanded", "false");
  }

  menuToggleEl.setAttribute("aria-haspopup", "true");
  menuToggleEl.setAttribute("aria-expanded", "false");
  menuToggleEl.addEventListener("click", (event) => {
    event.stopPropagation();
    if (isOpen) closeMenu();
    else openMenu();
  });

  floatingMenuEl.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!isOpen) return;
    if (event.target.closest("#floatingMenu")) return;
    if (event.target.closest("#menuToggle")) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

setupStateCardInteractions();
setupSideMenu();
renderStateCard();
