(function () {
  const overlayEl = document.getElementById("profileSheetOverlay");
  const sheetEl = document.getElementById("profileSheet");
  const closeEl = document.getElementById("profileSheetClose");
  const titleEl = document.getElementById("profileSheetTitle");
  const bodyEl = document.getElementById("profileSheetBody");
  const triggerEls = document.querySelectorAll("[data-sheet]");

  if (!overlayEl || !sheetEl || !closeEl || !titleEl || !bodyEl || triggerEls.length === 0) return;

  const SHEETS = {
    personal: {
      title: "Dados Pessoais",
      groups: [
        {
          title: "Contato",
          items: [
            { key: "Nome Completo", value: "Matheus Oliveira" },
            { key: "Email", value: "matheus.rider@roodi.app" },
            { key: "Whatsapp", value: "+55 11 99888-5522" },
          ],
        },
        {
          title: "Endereço de Residência",
          items: [
            { key: "Estado", value: "SP" },
            { key: "Cidade", value: "São Paulo" },
            { key: "Bairro", value: "Vila Mariana" },
            { key: "Rua", value: "Domingos de Moraes" },
            { key: "Número", value: "240" },
            { key: "CEP", value: "04010-100" },
            { key: "Complemento", value: "Apto 1204" },
          ],
        },
        {
          title: "Endereço do Ponto",
          items: [
            { key: "Estado", value: "SP" },
            { key: "Cidade", value: "São Paulo" },
            { key: "Bairro", value: "Bela Vista" },
            { key: "Rua", value: "Paulista" },
            { key: "Número", value: "1578" },
            { key: "CEP", value: "01310-200" },
            { key: "Complemento", value: "Loja 3" },
          ],
        },
      ],
    },
    bank: {
      title: "Conta Bancária",
      groups: [
        {
          title: "Dados Financeiros",
          items: [
            { key: "Banco", value: "Banco XPTO" },
            { key: "Agência", value: "4581" },
            { key: "Conta", value: "002345-9" },
            { key: "Tipo de Conta", value: "Corrente" },
            { key: "Número do Pix", value: "11998885522" },
          ],
        },
      ],
    },
    documents: {
      title: "Documentos",
      groups: [
        {
          title: "Identificação",
          items: [
            { key: "RG", value: "Validado" },
            { key: "CNH", value: "Validada" },
            { key: "CPF", value: "Regular" },
          ],
        },
        {
          title: "Comprovantes",
          items: [
            { key: "Residência", value: "Enviado" },
            { key: "Veículo", value: "Enviado" },
          ],
        },
      ],
    },
    vehicle: {
      title: "Veículos",
      groups: [
        {
          title: "Veículo Principal",
          items: [
            { key: "Tipo de Veículo", value: "Moto" },
            { key: "Marca", value: "Honda" },
            { key: "Modelo", value: "CG 160" },
            { key: "Ano", value: "2022" },
            { key: "Placa", value: "ABC-1D23" },
          ],
        },
      ],
    },
    privacy: {
      title: "Privacidade e Segurança",
      groups: [
        {
          title: "Acesso",
          items: [
            { key: "Senha", value: "Atualizada há 18 dias" },
            { key: "Autenticação 2FA", value: "Ativa" },
            { key: "PIN de Segurança", value: "Ativo" },
          ],
        },
        {
          title: "Permissões",
          items: [
            { key: "Localização", value: "Sempre durante entrega" },
            { key: "Compartilhamento de Dados", value: "Somente operacional" },
            { key: "Sessões Ativas", value: "2 dispositivos" },
          ],
        },
      ],
    },
  };

  let isOpen = false;
  let hideTimer;

  function renderGroup(group) {
    const itemsMarkup = group.items
      .map(
        (item) => `
          <li class="ds-sheet-item">
            <p class="ds-sheet-item-key">${item.key}</p>
            <p class="ds-sheet-item-value">${item.value}</p>
          </li>
        `,
      )
      .join("");

    return `
      <section class="ds-sheet-group">
        <h3 class="ds-sheet-group-title">${group.title}</h3>
        <ul class="ds-sheet-list">${itemsMarkup}</ul>
      </section>
    `;
  }

  function openSheet(sheetKey) {
    const config = SHEETS[sheetKey];
    if (!config) return;

    window.clearTimeout(hideTimer);
    titleEl.textContent = config.title;
    bodyEl.innerHTML = config.groups.map(renderGroup).join("");
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

  triggerEls.forEach((triggerEl) => {
    triggerEl.addEventListener("click", (event) => {
      event.preventDefault();
      openSheet(triggerEl.dataset.sheet);
    });
  });

  overlayEl.addEventListener("click", closeSheet);
  closeEl.addEventListener("click", closeSheet);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSheet();
  });
})();
