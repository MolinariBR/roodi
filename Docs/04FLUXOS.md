# 04FLUXOS.md

## Objetivo
Documentar os fluxos do projeto Roodi, combinando:
1. Fluxos de navegacao das telas prototipadas em `Docs/Prototype`.
2. Fluxos sistemicos de backend definidos em `Docs/01PROJETO.md`, `Docs/02STACK.md` e `Docs/03REGRAS.md`.
3. Regras de transicao de estado, cotacao e financeiro.

## Fontes de verdade deste documento
1. `Docs/01PROJETO.md`
2. `Docs/02STACK.md`
3. `Docs/03REGRAS.md`
4. `Docs/08PAGES.md`
5. Telas e scripts em `Docs/Prototype`

## Premissas transversais
1. O app mobile (`Frontend-rider`) e unico, com contextos Rider e Commerce.
2. Nao usamos geolocalizacao em tempo real no app.
3. Nao usamos mapa offline no fluxo principal.
4. Distancia e tempo usam matriz de bairros + fallback deterministico por politica.
5. Tracking operacional e por estados/eventos da entrega.
6. Regra de preco e `admin_only`.

## Escopo prototipado analisado
1. Total de telas HTML: `25`.
2. Grupos:
   - `Docs/Prototype/Common`: 14
   - `Docs/Prototype/Rider`: 3
   - `Docs/Prototype/Commerce`: 8
3. Scripts de comportamento:
   - `Docs/Prototype/Rider/home-flow.js`
   - `Docs/Prototype/Rider/orders-sheet.js`
   - `Docs/Prototype/Rider/profile-sheet.js`
   - `Docs/Prototype/Rider/profile-menu.js`
   - `Docs/Prototype/Commerce/home-menu.js`
   - `Docs/Prototype/Commerce/create-call-pricing.js`

## 1) Fluxo de acesso e autenticacao (Common)

### Telas
1. `Common/Splash.html`
2. `Common/01Onboarding.html`
3. `Common/02.Onboarding.html`
4. `Common/03Onboarding.html`
5. `Common/Login.html`
6. `Common/Register.html`
7. `Common/ForgotPassword.html`
8. `Common/OTP.html`
9. `Common/ResetPassword.html`

### Fluxo de navegacao
```text
Splash -> Onboarding 01 -> Onboarding 02 -> Onboarding 03 -> Login
Login -> Home Rider (contexto Rider)
Login -> Home Commerce (contexto Commerce)
ForgotPassword -> OTP -> ResetPassword -> Login
```

### Regras
1. Login/cadastro seleciona contexto de uso (`Rider` ou `Empresa`).
2. Autenticacao alvo da arquitetura:
   - Backend com JWT (`access` + `refresh`), OTP e RBAC por perfil.
   - Admin com autenticacao propria via backend.
3. No prototipo atual, OTP e manutencao ainda estao simulados no cliente.

### Gap de integracao
1. Substituir fluxo local de OTP por fluxo real via backend.
2. Substituir gatilho local de manutencao por status de sistema (API/config remota).

## 2) Fluxo operacional Rider

### Telas
1. `Rider/Home.html`
2. `Rider/Orders.html`
3. `Rider/Profile.html`

### Fluxo macro
```text
Home <-> Orders <-> Profile
Home/Orders/Profile -> Notifications
Profile -> Support
```

### Maquina de estados da entrega (`home-flow.js`)
Estados:
1. `offline`
2. `online_idle`
3. `request_incoming`
4. `to_merchant`
5. `at_merchant`
6. `waiting_order`
7. `to_customer`
8. `at_customer`
9. `finishing_delivery`
10. `completed`

Transicoes principais:
1. `offline -> online_idle`
2. `online_idle -> request_incoming`
3. `request_incoming -> to_merchant` (aceite)
4. `to_merchant -> at_merchant`
5. `at_merchant -> waiting_order`
6. `waiting_order -> to_customer`
7. `to_customer -> at_customer`
8. `at_customer -> finishing_delivery`
9. `finishing_delivery -> completed` (confirmacao por codigo)
10. `completed -> online_idle` ou `offline`

### Regras funcionais do Rider
1. Entrega e conduzida por estados, sem criar tela nova para cada etapa.
2. Finalizacao exige codigo de confirmacao.
3. Links externos (Google Maps/WhatsApp) sao acao auxiliar, nao tracking por GPS em tempo real.

### Orders (historico Rider)
1. Lista de corridas.
2. Bottom sheet de detalhes por pedido.
3. Filtros de periodo, status e ordenacao.

### Profile (Rider)
1. Edicao/consulta por bottom sheets (sem abrir varias telas).
2. Seções: dados pessoais, banco, documentos, veiculo e privacidade.

## 3) Fluxo operacional Commerce

### Telas
1. `Commerce/Home.html`
2. `Commerce/CreateCall.html`
3. `Commerce/Tracking.html`
4. `Commerce/History.html`
5. `Commerce/Clients.html`
6. `Commerce/Credits.html`
7. `Commerce/Profile.html`
8. `Commerce/Products.html`

### Fluxo macro
```text
Home -> CreateCall -> Tracking
Home <-> History
Home/Profile -> Clients
Home/Profile -> Payments (status por chamado no Tracking)
Home/Profile -> Products
Profile -> Support
```

### Home Commerce
1. Visualiza chamados e KPIs.
2. Inicia novo chamado (`CreateCall`).
3. Acessa clientes, historico e produtos.

### CreateCall
1. Captura dados de destino e parametros de urgencia.
2. Simula valor e ETA para exibicao.
3. Cria chamado em `created` + `payment_status=pending`, inicia `payment-intent` e segue para `Tracking`.

### Tracking Commerce
1. Exibe timeline de status da entrega.
2. Exibe dados do rider/chamado.
3. Acoes de contato e suporte sao visuais no prototipo.

### History / Clients / Payments / Products / Profile
1. `History`: lista e filtros de chamados.
2. `Clients`: reaproveitamento de cliente na abertura de chamado.
3. `Payments`: pagamento por chamado e conciliacao via gateway.
4. `Products`: gestao de catalogo.
5. `Profile`: configuracoes da operacao e links rapidos.

### Dependencias de API (Commerce)
1. `Clients`: `GET/POST /v1/commerce/clients`, `PATCH /v1/commerce/clients/{clientId}`.
2. `Products`: `GET/POST /v1/commerce/products`, `PATCH /v1/commerce/products/{productId}`, `POST /v1/commerce/products/{productId}/status`.
3. `Status atual`: contratos e implementacao backend ativos em `Packages/Backend/src/Modules/clients` e `Packages/Backend/src/Modules/products`.

## 4) Fluxo de notificacoes, suporte e estados globais

### Telas
1. `Common/Notifications.html`
2. `Common/Support.html`
3. `Common/Error.html`
4. `Common/Update.html`
5. `Common/Mantenance.html`

### Fluxos
1. Notificacoes com retorno contextual por `?from=`.
2. Suporte com canais, FAQ e abertura visual de chamado.
3. Error/Update/Mantenance representam estados globais de operacao.

## 5) Fluxo sistemico de cotacao de frete (backend)

### Entrada obrigatoria
1. `origin_bairro`
2. `destination_bairro`
3. `urgency`
4. `requested_at_iso`

### Pipeline
1. Validar entrada.
2. Resolver distancia/tempo com ordem:
   - `local_bairro_matrix`
   - `tomtom_matrix`
   - `openrouteservice_matrix`
3. Resolver clima com ordem:
   - `openweather`
   - `met_no`
4. Calcular zona por distancia.
5. Calcular preco com formula da plataforma.
6. Persistir auditoria (`provider_trace`, latencias, fallback).
7. Retornar cotacao.

### Resultado de erro relevante
1. Falha total de distancia/tempo: `DISTANCE_TIME_UNAVAILABLE`.
2. Distancia acima de cobertura: `OUT_OF_COVERAGE`.

## 6) Fluxo sistemico de dispatch (backend)

1. Commerce cria pedido (`status=created`, `payment_status=pending`).
2. Pagamento aprovado muda pedido para `searching_rider`.
3. Dispatch abre lote inicial por zona/elegibilidade.
4. Fila justa por zona/bairro.
5. Oferta em lotes (Top 3/Top 5 em pico).
6. Aceite define vencedor por regra objetiva.
7. Recusa/no-response atualiza prioridade/cooldown.
8. Ciclo da entrega segue estados operacionais ate conclusao.

## 7) Fluxo sistemico financeiro (backend)

1. Commerce cria chamado e inicia pagamento por pedido (`order_payment`).
2. Checkout e confirmacao via InfinitePay (`payment-intent` + webhook/check).
3. Pagamento aprovado libera dispatch inicial do pedido.
4. Entrega concluida dispara efeitos financeiros:
   - cobranca da empresa (FP)
   - repasse ao entregador (RE)
   - comissao da plataforma (CP)
5. Regra base: `FP = RE + CP`.
6. Pagamentos e conciliacao via `payments` + integracao InfinitePay.
7. Webhooks processados com idempotencia e retry por fila.
8. `credits` permanece como dominio legado para compatibilidade.

## 8) Cobertura atual e lacunas

### Cobertura atual
1. Fluxos principais de acesso, Rider e Commerce estao prototipados.
2. Estrategia de UX sem multiplicacao de telas (estado + modal/sheet) esta aplicada.

### Lacunas para fechar MVP funcional
1. Integrar OTP e recuperacao de senha ao backend.
2. Integrar manutencao por status real do sistema.
3. Conectar CreateCall ao motor real de cotacao por bairros.
4. Conectar Tracking a eventos reais de estado da entrega.
5. Consolidar fluxo de pagamento por pedido no app (checkout/status) com conciliacao real.

## 9) Conclusao
O prototipo cobre bem os fluxos visuais centrais do produto. Para ficar aderente ao projeto final, o passo seguinte e substituir simulacoes locais pelos fluxos sistemicos descritos em `01PROJETO`, `02STACK` e `03REGRAS`, mantendo a diretriz de simplicidade e sem dependencia de geolocalizacao em tempo real/offline.
