# 06TASKS.md

## Objetivo
Definir o backlog executavel do projeto Roodi com checklist de tarefas e subtarefas, baseado em:
1. `Docs/01PROJETO.md`
2. `Docs/02STACK.md`
3. `Docs/03REGRAS.md`
4. `Docs/04FLUXOS.md`
5. `Docs/05USER-STORIES.md`
6. `Docs/07STRUCTURE.md`
7. `Docs/08PAGES.md`
8. `Docs/09MODULOS.md`
9. `Docs/API-INFINITY-PAY.md`
10. `Docs/openapi/roodi.openapi.yaml`
11. `Docs/10DATABASE.md`

## Regras de execucao deste backlog
1. Ordem obrigatoria: ambiente e estrutura primeiro.
2. Sem Docker no fluxo padrao de dev/operacao; excecao apenas para testes com `testcontainers`.
3. Todo endpoint implementado deve seguir o contrato OpenAPI.
4. Banco deve seguir `Docs/database/roodi_schema.sql` e `Docs/database/schema.prisma`.
5. Cada task deve ser marcada manualmente com checkbox quando concluida.

## Legenda
1. Task concluida: marcar checkbox da task.
2. Task nao concluida: manter checkbox desmarcado.
3. Subtarefas: marcar individualmente para rastrear progresso real.

---

## Fase 0 - Preparacao de Ambiente e Estrutura

### TASK-001: Criar estrutura diretorios e arquivos do monorepo
- [x] `TASK-001` concluida
- **Instrucao:** Criar a estrutura alvo de `Packages` e pastas internas conforme `07STRUCTURE`.
- **Local fisico:** `Packages/Backend`, `Packages/Frontend-admin`, `Packages/Frontend-rider`, `Packages/Roodi`.
- **Motivo:** Padronizar organizacao modular antes de qualquer codigo.
- **Fluxo:** `04FLUXOS` (transversal a todos os fluxos).
- **Pagina/Tela:** Todas de `08PAGES` (base transversal).
- **Subtarefas:**
  - [x] Criar `Packages/Backend/src/Core` e `Packages/Backend/src/Modules`.
  - [x] Criar `Packages/Frontend-admin/src/Core` e `Packages/Frontend-admin/src/Modules`.
  - [x] Criar `Packages/Frontend-rider/lib/Core` e `Packages/Frontend-rider/lib/Modules`.
  - [x] Criar `Packages/Roodi/src/Core` e `Packages/Roodi/src/Modules`.

### TASK-002: Inicializar pacote Backend com TypeScript e estrutura de execucao
- [x] `TASK-002` concluida
- **Instrucao:** Inicializar `package.json`, `tsconfig`, scripts e base Express.
- **Local fisico:** `Packages/Backend/package.json`, `Packages/Backend/tsconfig.json`, `Packages/Backend/src/*`.
- **Motivo:** Habilitar implementacao da API e modulos de dominio.
- **Fluxo:** `04FLUXOS` secoes 5, 6 e 7.
- **Pagina/Tela:** APIs que sustentam `CreateCall`, `Tracking`, `Credits`, `Rider/Home`.
- **Subtarefas:**
  - [x] Criar scripts `dev`, `build`, `start`, `test`, `lint`.
  - [x] Configurar path aliases para `Core` e `Modules`.
  - [x] Criar bootstrap HTTP inicial com healthcheck.

### TASK-003: Inicializar pacote Frontend-admin (Next.js App Router)
- [x] `TASK-003` concluida
- **Instrucao:** Criar app Next.js com TypeScript, Tailwind e estrutura modular.
- **Local fisico:** `Packages/Frontend-admin/*`.
- **Motivo:** Base para painel de gestao admin.
- **Fluxo:** `04FLUXOS` (operacao administrativa sobre fluxos 5, 6 e 7).
- **Pagina/Tela:** Rotas admin planejadas em `08PAGES` secao Frontend-admin.
- **Subtarefas:**
  - [x] Criar `app/(auth)` e `app/(admin)` com layouts separados.
  - [x] Configurar `tailwind.config.ts` com tokens do design system web.
  - [x] Criar shell inicial `/admin/login` e `/admin/dashboard`.

### TASK-004: Inicializar pacote Frontend-rider (Flutter)
- [x] `TASK-004` concluida
- **Instrucao:** Criar projeto Flutter com arquitetura modular e rotas iniciais.
- **Local fisico:** `Packages/Frontend-rider/*`.
- **Motivo:** Base do app unico (contextos Rider e Commerce).
- **Fluxo:** `04FLUXOS` secoes 1, 2, 3 e 4.
- **Pagina/Tela:** Todas as telas prototipadas em `Docs/Prototype/Common`, `Docs/Prototype/Rider`, `Docs/Prototype/Commerce`.
- **Subtarefas:**
  - [x] Configurar `GoRouter` com rotas de autenticacao e home por contexto.
  - [x] Configurar `Riverpod` para sessao e estado global.
  - [x] Criar estrutura `Core/design-system` conforme `07STRUCTURE`.

### TASK-005: Inicializar pacote Landing (Roodi)
- [x] `TASK-005` concluida
- **Instrucao:** Criar projeto Next.js institucional com estrutura de modulos.
- **Local fisico:** `Packages/Roodi/*`.
- **Motivo:** Captacao de leads e paginas legais.
- **Fluxo:** `04FLUXOS` (suporte institucional ao produto).
- **Pagina/Tela:** Rotas planejadas de landing em `08PAGES`.
- **Subtarefas:**
  - [x] Criar rotas `/`, `/como-funciona`, `/contato`.
  - [x] Criar rotas legais `/termos`, `/privacidade`, `/cookies`.
  - [x] Configurar SEO base e sitemap.

### TASK-006: Configurar variaveis de ambiente e politica de segredos
- [x] `TASK-006` concluida
- **Instrucao:** Criar templates `.env` e mapear chaves necessarias.
- **Local fisico:** `Packages/Backend/.env.development`, `Packages/Backend/.env.production`, `Packages/*/.env.example`.
- **Motivo:** Padronizar configuracao local e producao.
- **Fluxo:** `04FLUXOS` (transversal).
- **Pagina/Tela:** Todas.
- **Subtarefas:**
  - [x] Mapear chaves `INFINITEPAY_*`, `OPENWEATHER_*`, `TOMTOM_*`, `OPENROUTESERVICE_*`.
  - [x] Mapear segredos de auth (`JWT_*`, hash rounds, OTP).
  - [x] Documentar politicas de rotacao de chaves.

### TASK-007: Instalar dependencias e bibliotecas oficiais da stack
- [x] `TASK-007` concluida
- **Instrucao:** Instalar apenas dependencias previstas em `02STACK`.
- **Local fisico:** `Packages/Backend/package.json`, `Packages/Frontend-admin/package.json`, `Packages/Frontend-rider/pubspec.yaml`, `Packages/Roodi/package.json`.
- **Motivo:** Evitar inflacao de stack e manter aderencia documental.
- **Fluxo:** `04FLUXOS` (transversal).
- **Pagina/Tela:** Todas.
- **Subtarefas:**
  - [x] Backend: Express, Prisma, Zod, JWT, Redis, BullMQ, Pino, Socket.IO.
  - [x] Frontend-admin: Next, TanStack Query/Table, RHF, Zod, Clerk.
  - [x] Frontend-rider: Dio, Riverpod, GoRouter, Freezed/Json Serializable, storage seguro.
  - [x] Landing: Next, Tailwind, Zod para formulario de lead.

### TASK-008: Preparar ambiente local sem Docker + qualidade baseline
- [x] `TASK-008` concluida
- **Instrucao:** Configurar execucao local usando instalacoes nativas e padrao de qualidade.
- **Local fisico:** scripts em `Packages/*` + docs de setup.
- **Motivo:** Alinhar com politica "sem Docker" e garantir padrao de engenharia.
- **Fluxo:** `04FLUXOS` (transversal).
- **Pagina/Tela:** Todas.
- **Subtarefas:**
  - [x] Validar PostgreSQL e Redis locais.
  - [x] Configurar lint/format pre-commit.
  - [x] Definir pipeline CI com build + testes + lint.

---

## Fase 1 - Banco, Migrations e Seed

### TASK-009: Materializar schema Prisma no Backend
- [x] `TASK-009` concluida
- **Instrucao:** Copiar e ajustar `schema.prisma` oficial para `Packages/Backend/prisma`.
- **Local fisico:** `Packages/Backend/prisma/schema.prisma`.
- **Motivo:** Sincronizar implementacao real com contrato de banco.
- **Fluxo:** `04FLUXOS` secoes 5, 6 e 7.
- **Pagina/Tela:** `CreateCall`, `Tracking`, `Credits`, `Rider/Home`, `Admin/*`.
- **Subtarefas:**
  - [x] Replicar enums e models de `Docs/database/schema.prisma`.
  - [x] Revisar relacoes obrigatorias (`orders`, `credits`, `payments`, `tracking`).
  - [x] Validar schema com Prisma CLI.

### TASK-010: Criar migracao baseline do banco
- [x] `TASK-010` concluida
- **Instrucao:** Gerar migracao inicial compativel com `roodi_schema.sql`.
- **Local fisico:** `Packages/Backend/prisma/migrations/*`.
- **Motivo:** Versionar estrutura de banco de forma rastreavel.
- **Fluxo:** `04FLUXOS` (transversal).
- **Pagina/Tela:** Todas.
- **Subtarefas:**
  - [x] Gerar migracao inicial.
  - [x] Aplicar migracao em ambiente local.
  - [x] Validar indices e constraints criticos.

### TASK-011: Estruturar seeds e comandos de carga de dados
- [x] `TASK-011` concluida
- **Instrucao:** Criar infraestrutura de seed idempotente.
- **Local fisico:** `Packages/Backend/prisma/seed.ts`, `Packages/Backend/prisma/seeds/*`.
- **Motivo:** Habilitar ambiente de desenvolvimento e testes reproduzivel.
- **Fluxo:** `04FLUXOS` (transversal).
- **Pagina/Tela:** Todas.
- **Subtarefas:**
  - [x] Criar comando `prisma db seed`.
  - [x] Separar seed por dominio (`system`, `pricing`, `users`, etc.).
  - [x] Garantir idempotencia por chaves unicas.

### TASK-012: Seed de sistema, localidade e precificacao oficial
- [x] `TASK-012` concluida
- **Instrucao:** Popular dados minimos operacionais para cotacao.
- **Local fisico:** `Packages/Backend/prisma/seeds/010_system.seed.ts`, `020_locality.seed.ts`, `030_pricing.seed.ts`.
- **Motivo:** Permitir simulacao real de cotacao no `CreateCall`.
- **Fluxo:** `04FLUXOS` secao 5 (cotacao).
- **Pagina/Tela:** `Commerce/CreateCall`, `Admin/Pricing`.
- **Subtarefas:**
  - [x] Inserir `system_flags` e `system_runtime_state`.
  - [x] Inserir bairros e matriz minima de distancia/tempo.
  - [x] Inserir versao de regra ativa de precificacao com zonas/urgencia/acrescimos.

### TASK-013: Seed de usuarios exemplo para Frontend-admin e App Rider
- [x] `TASK-013` concluida
- **Instrucao:** Criar usuarios reais de desenvolvimento (admin, commerce, rider) com perfis completos.
- **Local fisico:** `Packages/Backend/prisma/seeds/040_users.seed.ts`, `050_profiles.seed.ts`.
- **Motivo:** Permitir login e testes manuais em todos os frontends.
- **Fluxo:** `04FLUXOS` secao 1 (acesso), secao 2 (Rider), secao 3 (Commerce).
- **Pagina/Tela:** `Login`, `/admin/login`, `Rider/Home`, `Commerce/Home`.
- **Subtarefas:**
  - [x] Criar 1 usuario admin.
  - [x] Criar 2 usuarios commerce com wallet de credito.
  - [x] Criar 3 usuarios rider com veiculo/documento/banco.
  - [x] Criar settings de notificacao por usuario.

### TASK-014: Seed de dados operacionais de Commerce e Rider
- [x] `TASK-014` concluida
- **Instrucao:** Popular clientes, produtos, pedidos e eventos de tracking de exemplo.
- **Local fisico:** `Packages/Backend/prisma/seeds/060_commerce_data.seed.ts`, `070_orders_tracking.seed.ts`.
- **Motivo:** Validar telas e fluxos do app sem mock artificial.
- **Fluxo:** `04FLUXOS` secao 2 e 3.
- **Pagina/Tela:** `Commerce/Clients`, `Commerce/Products`, `Commerce/History`, `Rider/Orders`, `Tracking`.
- **Subtarefas:**
  - [x] Inserir clientes por comerciante.
  - [x] Inserir catalogo de produtos por comerciante.
  - [x] Inserir pedidos em estados distintos.
  - [x] Inserir timeline de eventos por pedido.

### TASK-015: Seed de dados financeiros e webhook de pagamento
- [x] `TASK-015` concluida
- **Instrucao:** Popular ledger, intents, transactions e webhook events de exemplo.
- **Local fisico:** `Packages/Backend/prisma/seeds/080_finance.seed.ts`.
- **Motivo:** Validar modulos `credits` e `payments` com cenarios reais.
- **Fluxo:** `04FLUXOS` secao 7 (financeiro).
- **Pagina/Tela:** `Commerce/Credits`, `Admin/Payments`, `Admin/Credits`.
- **Subtarefas:**
  - [x] Inserir `credits_wallets` e `credits_ledger`.
  - [x] Inserir `payment_intents` e `payment_transactions`.
  - [x] Inserir `payment_webhook_events` com idempotencia.
  - [x] Inserir `order_financials` respeitando `FP = RE + CP`.

### TASK-016: Scripts de reset de banco e carga de dados
- [x] `TASK-016` concluida
- **Instrucao:** Criar scripts para resetar banco e carregar seeds por ambiente.
- **Local fisico:** `Packages/Backend/package.json` scripts + `Packages/Backend/scripts/*`.
- **Motivo:** Agilizar setup de equipe e CI.
- **Fluxo:** `04FLUXOS` (transversal).
- **Pagina/Tela:** Todas.
- **Subtarefas:**
  - [x] Criar script `db:reset`.
  - [x] Criar script `db:migrate`.
  - [x] Criar script `db:seed`.
  - [x] Criar script `db:rebuild` (migrate + seed).

---

## Fase 2 - Backend (OpenAPI + Modulos de Dominio)

### TASK-017: Implementar Core backend (bootstrap, middleware, erro, auditoria)
- [x] `TASK-017` concluida
- **Instrucao:** Criar base de app com middlewares globais e auditoria.
- **Local fisico:** `Packages/Backend/src/Core/bootstrap`, `Packages/Backend/src/Core/http`, `Packages/Backend/src/Core/observability`.
- **Motivo:** Base tecnica consistente para todos os modulos.
- **Fluxo:** `04FLUXOS` (transversal).
- **Pagina/Tela:** Todas.
- **Subtarefas:**
  - [x] Middleware de `request_id` e logs estruturados.
  - [x] Tratamento padrao de erros (`ErrorResponse` OpenAPI).
  - [x] Middleware de auditoria para acoes criticas.

### TASK-018: Implementar modulo `auth` (register/login/refresh/logout)
- [x] `TASK-018` concluida
- **Instrucao:** Implementar endpoints de autenticacao e sessao JWT/refresh.
- **Local fisico:** `Packages/Backend/src/Modules/auth/*`.
- **Motivo:** Habilitar acesso seguro para rider, commerce e admin.
- **Fluxo:** `04FLUXOS` secao 1.
- **Pagina/Tela:** `Login`, `Register`, `/admin/login`.
- **Subtarefas:**
  - [x] `POST /v1/auth/register`.
  - [x] `POST /v1/auth/login`.
  - [x] `POST /v1/auth/refresh`.
  - [x] `POST /v1/auth/logout`.

### TASK-019: Implementar OTP e reset de senha
- [x] `TASK-019` concluida
- **Instrucao:** Implementar fluxo de recuperacao por OTP com limite e expiracao.
- **Local fisico:** `Packages/Backend/src/Modules/auth/*`.
- **Motivo:** Recuperacao segura de acesso.
- **Fluxo:** `04FLUXOS` secao 1 (ForgotPassword -> OTP -> ResetPassword).
- **Pagina/Tela:** `ForgotPassword`, `OTP`, `ResetPassword`.
- **Subtarefas:**
  - [x] `POST /v1/auth/password/forgot`.
  - [x] `POST /v1/auth/password/otp/verify`.
  - [x] `POST /v1/auth/password/reset`.
  - [x] Persistir tentativas em `auth_otp_attempts`.

### TASK-020: Implementar `me`, preferencias e notificacoes de usuario
- [x] `TASK-020` concluida
- **Instrucao:** Expor perfil autenticado e configuracoes de notificacao.
- **Local fisico:** `Packages/Backend/src/Modules/users/*`, `Packages/Backend/src/Modules/notifications/*`.
- **Motivo:** Base para perfil e central de notificacoes no app.
- **Fluxo:** `04FLUXOS` secao 2, 3 e 4.
- **Pagina/Tela:** `Profile Rider`, `Profile Commerce`, `Notifications`.
- **Subtarefas:**
  - [x] `GET/PATCH /v1/me`.
  - [x] `GET/PATCH /v1/me/settings/notifications`.
  - [x] `GET /v1/notifications`.
  - [x] `PATCH /v1/notifications/{notificationId}/read` e `POST /mark-all-read`.

### TASK-021: Implementar modulo `support` e `system`
- [x] `TASK-021` concluida
- **Instrucao:** Implementar FAQ/chamados e status global do sistema.
- **Local fisico:** `Packages/Backend/src/Modules/support/*`, `Packages/Backend/src/Modules/system/*`.
- **Motivo:** Atendimento e estados globais (erro/manutencao/update).
- **Fluxo:** `04FLUXOS` secao 4.
- **Pagina/Tela:** `Support`, `Error`, `Mantenance`, `Update`.
- **Subtarefas:**
  - [x] `GET /v1/support/faqs`.
  - [x] `GET/POST /v1/support/tickets` e `GET /v1/support/tickets/{ticketId}`.
  - [x] `GET /v1/system/status`.
  - [x] Integrar flags e estado global em `system_runtime_state`.

### TASK-022: Implementar `locality` + `pricing` (motor de cotacao)
- [x] `TASK-022` concluida
- **Instrucao:** Implementar pipeline de cotacao por matriz + fallback deterministico.
- **Local fisico:** `Packages/Backend/src/Modules/locality/*`, `Packages/Backend/src/Modules/pricing/*`.
- **Motivo:** Base do valor de frete e ETA com rastreabilidade.
- **Fluxo:** `04FLUXOS` secao 5.
- **Pagina/Tela:** `Commerce/CreateCall`, `Rider/Home` (valor da oferta), `Admin/Pricing`.
- **Subtarefas:**
  - [x] `POST /v1/commerce/quotes`.
  - [x] Aplicar ordem de provider definida em `freight-fallback-policy`.
  - [x] Persistir `quotes` e `quote_provider_attempts`.
  - [x] Retornar erros `DISTANCE_TIME_UNAVAILABLE` e `OUT_OF_COVERAGE`.

### TASK-023: Implementar `orders`, `dispatch` e `tracking`
- [x] `TASK-023` concluida
- **Instrucao:** Implementar criacao de pedido, alocacao em lotes e timeline de estados.
- **Local fisico:** `Packages/Backend/src/Modules/orders/*`, `Packages/Backend/src/Modules/dispatch/*`, `Packages/Backend/src/Modules/tracking/*`.
- **Motivo:** Nucleo operacional da plataforma.
- **Fluxo:** `04FLUXOS` secao 2, 3 e 6.
- **Pagina/Tela:** `Rider/Home`, `Rider/Orders`, `Commerce/Home`, `Tracking`, `History`.
- **Subtarefas:**
  - [x] `GET/POST /v1/commerce/orders`.
  - [x] `GET /v1/commerce/orders/{orderId}`.
  - [x] `POST /v1/commerce/orders/{orderId}/cancel`.
  - [x] `GET /v1/commerce/orders/{orderId}/tracking`.
  - [x] `GET /v1/commerce/orders/{orderId}/confirmation-code`.
  - [x] `GET /v1/rider/offers/current`, `POST /accept`, `POST /reject`.
  - [x] `GET /v1/rider/orders/active`, `GET /history`, `GET /{orderId}`.
  - [x] `POST /v1/rider/orders/{orderId}/events`.

### TASK-024: Implementar `credits` + `payments` + webhook InfinitePay
- [x] `TASK-024` concluida
- **Instrucao:** Implementar carteira de creditos, compra via InfinitePay e conciliacao. API-INFINITY-PAY.md
https://www.infinitepay.io/checkout
- **Local fisico:** `Packages/Backend/src/Modules/credits/*`, `Packages/Backend/src/Modules/payments/*`.
- **Motivo:** Sustentar modelo financeiro da plataforma.
- **Fluxo:** `04FLUXOS` secao 7.
- **Pagina/Tela:** `Commerce/Credits`, `Admin/Payments`, `Admin/Credits`.
- **Subtarefas:**
  - [x] `GET /v1/commerce/credits/balance`.
  - [x] `GET /v1/commerce/credits/ledger`.
  - [x] `POST /v1/commerce/credits/purchase-intents`.
  - [x] `POST /v1/commerce/payments/{paymentId}/check`.
  - [x] `POST /v1/payments/infinitepay/webhook` com idempotencia e retry.
  - [x] Consolidar `order_financials` no fechamento (`FP = RE + CP`).

### TASK-025: Implementar modulo `public` (landing)
- [x] `TASK-025` concluida
- **Instrucao:** Implementar endpoints publicos de lead e documentos legais.
- **Local fisico:** `Packages/Backend/src/Modules/system/*` e/ou `Packages/Backend/src/Modules/public/*`.
- **Motivo:** Dar suporte a landing e compliance legal.
- **Fluxo:** `04FLUXOS` (apoio institucional).
- **Pagina/Tela:** Rotas landing em `08PAGES` secao 5.
- **Subtarefas:**
  - [x] `POST /v1/public/leads`.
  - [x] `GET /v1/public/legal/{documentType}`.
  - [x] Validar versao ativa de documentos legais.

### TASK-026: Implementar endpoints administrativos completos
- [x] `TASK-026` concluida
- **Instrucao:** Implementar APIs admin com RBAC e auditoria.
- **Local fisico:** `Packages/Backend/src/Modules/*` (faixada admin).
- **Motivo:** Operacao e governanca centralizada da plataforma.
- **Fluxo:** `04FLUXOS` secoes 5, 6 e 7 (visao de controle).
- **Pagina/Tela:** Rotas `/admin/*` planejadas em `08PAGES`.
- **Subtarefas:**
  - [x] Dashboard, users/status, orders e tracking.
  - [x] Pricing rules (get/put, admin_only).
  - [x] Credits ledger + adjustments.
  - [x] Payments transactions (lista e detalhe).
  - [x] Support tickets (lista e update).
  - [x] Notification templates.
  - [x] System flags e maintenance mode.

---

## Fase 3 - Frontend-admin

### TASK-027: Implementar base do Frontend-admin (auth, layout, design system)
- [x] `TASK-027` concluida
- **Instrucao:** Criar shell admin com autenticacao, guards e tema.
- **Local fisico:** `Packages/Frontend-admin/src/Core/*`, `app/(auth)/*`, `app/(admin)/*`.
- **Motivo:** Estruturar painel antes das paginas de negocio.
- **Fluxo:** `04FLUXOS` (monitoramento dos fluxos de negocio).
- **Pagina/Tela:** `/admin/login`, layout `/admin/*`.
- **Subtarefas:**
  - [x] Integrar Clerk + validação de perfil admin no backend.
  - [x] Criar layout com navegacao lateral.
  - [x] Implementar tema claro/escuro por tokens web.

### TASK-028: Implementar paginas admin de operacao (dashboard/users/orders/tracking)
- [x] `TASK-028` concluida
- **Instrucao:** Construir paginas principais de monitoramento e auditoria.
- **Local fisico:** `Packages/Frontend-admin/src/Modules/dashboard`, `Packages/Frontend-admin/src/Modules/users`, `Packages/Frontend-admin/src/Modules/orders`, `Packages/Frontend-admin/src/Modules/tracking`.
- **Motivo:** Controle operacional fim a fim.
- **Fluxo:** `04FLUXOS` secao 2, 3 e 6.
- **Pagina/Tela:** `/admin/dashboard`, `/admin/users`, `/admin/orders`, `/admin/tracking`.
- **Subtarefas:**
  - [x] Tabela de usuarios com filtro por role/status.
  - [x] Lista e detalhe de pedidos.
  - [x] Timeline de tracking por pedido.

### TASK-029: Implementar paginas admin de preco, creditos e pagamentos
- [x] `TASK-029` concluida
- **Instrucao:** Construir gestao financeira e de regras comerciais.
- **Local fisico:** `Packages/Frontend-admin/src/Modules/pricing`, `Packages/Frontend-admin/src/Modules/credits`, `Packages/Frontend-admin/src/Modules/payments`.
- **Motivo:** Governanca financeira e de precificacao admin_only.
- **Fluxo:** `04FLUXOS` secao 5 e 7.
- **Pagina/Tela:** `/admin/pricing`, `/admin/credits`, `/admin/payments`.
- **Subtarefas:**
  - [x] Edicao versionada de regras de preco.
  - [x] Extrato global e ajuste manual de creditos.
  - [x] Lista/detalhe de transacoes e status de webhook.

### TASK-030: Implementar paginas admin de suporte, notificacoes e sistema
- [x] `TASK-030` concluida
- **Instrucao:** Construir operacao de chamados e parametros globais.
- **Local fisico:** `Packages/Frontend-admin/src/Modules/support`, `Packages/Frontend-admin/src/Modules/notifications`, `Packages/Frontend-admin/src/Modules/system`.
- **Motivo:** Garantir operacao e contingencia da plataforma.
- **Fluxo:** `04FLUXOS` secao 4.
- **Pagina/Tela:** `/admin/support`, `/admin/notifications`, `/admin/system`.
- **Subtarefas:**
  - [x] Fila de tickets com update de status/responsavel.
  - [x] Edicao de templates de notificacao.
  - [x] Controle de flags e manutencao.

---

## Fase 4 - Frontend-rider (App unico Rider + Commerce)

### TASK-031: Implementar base do app (theme, navegacao, sessao)
- [x] `TASK-031` concluida
- **Instrucao:** Implementar app shell, `ThemeMode.system`, rotas e sessao.
- **Local fisico:** `Packages/Frontend-rider/lib/Core/*`.
- **Motivo:** Fundacao para todos os fluxos mobile.
- **Fluxo:** `04FLUXOS` secao 1.
- **Pagina/Tela:** `Splash`, `Onboarding`, `Login`.
- **Subtarefas:**
  - [x] Configurar `App_Theme.dart`, light/dark e resolver de tema.
  - [x] Configurar interceptors de auth e refresh.
  - [x] Resolver redirecionamento por contexto Rider/Commerce.

### TASK-032: Implementar telas comuns (auth, notificacoes, suporte, estados globais)
- [x] `TASK-032` concluida
- **Instrucao:** Implementar telas comuns conectadas ao backend real.
- **Local fisico:** `Packages/Frontend-rider/lib/Modules/auth`, `Packages/Frontend-rider/lib/Modules/notifications`, `Packages/Frontend-rider/lib/Modules/support`, `Packages/Frontend-rider/lib/Modules/session`.
- **Motivo:** Cobrir acesso, ajuda e mensagens globais.
- **Fluxo:** `04FLUXOS` secao 1 e 4.
- **Pagina/Tela:** `Login`, `Register`, `ForgotPassword`, `OTP`, `ResetPassword`, `Notifications`, `Support`, `Error`, `Mantenance`, `Update`.
- **Subtarefas:**
  - [x] Fluxo de OTP completo.
  - [x] Lista/marcar notificacoes como lidas.
  - [x] Abertura e consulta de chamados.
  - [x] Tratamento de status global da plataforma.

### TASK-033: Implementar fluxo Rider completo
- [x] `TASK-033` concluida
- **Instrucao:** Implementar home stateful, historico e perfil do rider.
- **Local fisico:** `Packages/Frontend-rider/lib/Modules/rider-home-flow`, `Packages/Frontend-rider/lib/Modules/rider-orders-history`, `Packages/Frontend-rider/lib/Modules/rider-profile`.
- **Motivo:** Entrega de valor central para o entregador.
- **Fluxo:** `04FLUXOS` secao 2.
- **Pagina/Tela:** `Rider/Home`, `Rider/Orders`, `Rider/Profile`.
- **Subtarefas:**
  - [x] Online/offline e consulta de oferta atual.
  - [x] Aceitar/recusar oferta e transicoes por eventos.
  - [x] Finalizacao com codigo de confirmacao (`/complete`).
  - [x] Historico com filtros e detalhe.
  - [x] Perfil com edicao em bottom sheets.

### TASK-034: Implementar fluxo Commerce completo no app
- [x] `TASK-034` concluida
- **Instrucao:** Implementar operacao do comerciante no app unico.
- **Local fisico:** `Packages/Frontend-rider/lib/Modules/commerce-*`, `Packages/Frontend-rider/lib/Modules/clients`, `Packages/Frontend-rider/lib/Modules/products`, `Packages/Frontend-rider/lib/Modules/credits`.
- **Motivo:** Cobrir abertura de chamado ate fechamento operacional.
- **Fluxo:** `04FLUXOS` secao 3.
- **Pagina/Tela:** `Commerce/Home`, `CreateCall`, `Tracking`, `History`, `Clients`, `Products`, `Credits`, `Profile`.
- **Subtarefas:**
  - [x] Dashboard commerce.
  - [x] Simulacao e criacao de chamado via quote real.
  - [x] Timeline de tracking e cancelamento.
  - [x] Gestao de clientes e produtos.
  - [x] Saldo/extrato/compra de creditos.

### TASK-035: Integrar app e painel com usuarios/dados seed de exemplo
- [ ] `TASK-035` concluida
- **Instrucao:** Validar os fluxos principais usando contas seed.
- **Local fisico:** `Packages/Backend/prisma/seeds/*`, configs de ambiente nos frontends.
- **Motivo:** Garantir navegacao e acoes reais sem mock local.
- **Fluxo:** `04FLUXOS` secoes 1, 2, 3 e 7.
- **Pagina/Tela:** `/admin/*`, `Rider/*`, `Commerce/*`, `Common/*`.
- **Subtarefas:**
  - [ ] Login admin com usuario seed.
  - [ ] Login rider com usuario seed.
  - [ ] Login commerce com usuario seed.
  - [ ] Validar corrida completa e reflexo financeiro.

---

## Fase 5 - Testes, Qualidade e Fechamento

### TASK-036: Implementar testes unitarios e de integracao backend
- [ ] `TASK-036` concluida
- **Instrucao:** Cobrir regras criticas dos modulos backend com testes reais.
- **Local fisico:** `Packages/Backend/src/Modules/*/tests`, `Packages/Backend/tests/integration/*`.
- **Motivo:** Reduzir regressao e garantir regra de negocio.
- **Fluxo:** `04FLUXOS` secao 5, 6 e 7.
- **Pagina/Tela:** Impacta todas as telas operacionais.
- **Subtarefas:**
  - [ ] Testar cotacao (sucesso, `DISTANCE_TIME_UNAVAILABLE`, `OUT_OF_COVERAGE`).
  - [ ] Testar transicoes de estado da entrega.
  - [ ] Testar compra de creditos e webhook.
  - [ ] Testar regra financeira `FP = RE + CP`.

### TASK-037: Implementar testes com Testcontainers (excecao de Docker permitida)
- [ ] `TASK-037` concluida
- **Instrucao:** Criar testes de contrato com PostgreSQL/Redis efemeros via testcontainers.
- **Local fisico:** `Packages/Backend/tests/contract/*`.
- **Motivo:** Validar integrações reais sem mock excessivo.
- **Fluxo:** `04FLUXOS` secao 5, 6 e 7.
- **Pagina/Tela:** Impacta backend de todas as telas.
- **Subtarefas:**
  - [ ] Subir banco efemero por suite.
  - [ ] Rodar migrations + seed de teste.
  - [ ] Executar cenarios criticos de API fim a fim.

### TASK-038: Implementar testes frontend-admin
- [ ] `TASK-038` concluida
- **Instrucao:** Criar testes unitarios de componentes e E2E das rotas admin.
- **Local fisico:** `Packages/Frontend-admin/tests/*`.
- **Motivo:** Garantir confiabilidade da operacao administrativa.
- **Fluxo:** `04FLUXOS` (governanca dos fluxos operacionais).
- **Pagina/Tela:** `/admin/login`, `/admin/dashboard`, `/admin/orders`, `/admin/pricing`, `/admin/payments`.
- **Subtarefas:**
  - [ ] Testar guards de autenticacao.
  - [ ] Testar listagens/tabelas com filtros.
  - [ ] Testar update de regras de preco.

### TASK-039: Implementar testes frontend-rider (widget + integracao)
- [ ] `TASK-039` concluida
- **Instrucao:** Cobrir fluxos Rider e Commerce no app Flutter.
- **Local fisico:** `Packages/Frontend-rider/test/*`, `integration_test/*`.
- **Motivo:** Garantir integridade dos fluxos mobile.
- **Fluxo:** `04FLUXOS` secao 1, 2, 3 e 4.
- **Pagina/Tela:** `Common/*`, `Rider/*`, `Commerce/*`.
- **Subtarefas:**
  - [ ] Testar navegacao de autenticacao.
  - [ ] Testar fluxo Rider ate `completed`.
  - [ ] Testar fluxo Commerce de quote/chamado/tracking.

### TASK-040: Hardening de seguranca, observabilidade e performance
- [ ] `TASK-040` concluida
- **Instrucao:** Finalizar controles de seguranca e rastreabilidade operacional.
- **Local fisico:** Backend `Core/auth-base`, `Core/observability`, `Core/http`; frontends em camadas de API.
- **Motivo:** Preparar projeto para operacao real.
- **Fluxo:** `04FLUXOS` (transversal).
- **Pagina/Tela:** Todas.
- **Subtarefas:**
  - [ ] Rate limit e validacao de payload em endpoints publicos.
  - [ ] Auditoria de acoes administrativas.
  - [ ] Correlacao por `request_id` nos logs.
  - [ ] Alertas para falhas de webhook e quote providers.

### TASK-041: Fechar documentacao e checklist de release
- [ ] `TASK-041` concluida
- **Instrucao:** Sincronizar docs de arquitetura, API, banco, fluxos e tasks.
- **Local fisico:** `Docs/01..10`, `Docs/openapi/*`, `Docs/database/*`.
- **Motivo:** Manter fonte de verdade unica e consistente.
- **Fluxo:** `04FLUXOS` (todos).
- **Pagina/Tela:** Todas de `08PAGES`.
- **Subtarefas:**
  - [ ] Atualizar changelog de rotas/endpoints.
  - [ ] Confirmar rastreabilidade task -> modulo -> fluxo -> pagina.
  - [ ] Executar checklist final de aceite MVP.

---

## Catalogo de usuarios e dados de exemplo (Seed + Migrations)

## Usuarios de exemplo (desenvolvimento)

| Perfil | Nome | Email | Senha dev | Uso principal |
|---|---|---|---|---|
| admin | Admin Roodi | admin@roodi.app | Admin@123456 | Login no `Frontend-admin` |
| commerce | Mercado Centro | comercio.centro@roodi.app | Commerce@123456 | Fluxo Commerce no app |
| commerce | Farmacia Imperial | comercio.farmacia@roodi.app | Commerce@123456 | Fluxo Commerce no app |
| rider | Joao Rider | rider.joao@roodi.app | Rider@123456 | Fluxo Rider no app |
| rider | Maria Rider | rider.maria@roodi.app | Rider@123456 | Fluxo Rider no app |
| rider | Pedro Rider | rider.pedro@roodi.app | Rider@123456 | Fluxo Rider no app |

## Dados operacionais de exemplo (minimo MVP)
1. Bairros seed: `Centro`, `Vila Lobao`, `Sao Jose`, `Bacuri`.
2. Matriz seed: pares de distancia/tempo entre os bairros acima.
3. Regra de preco ativa:
   - `version_code`: `PRC-2026-01`
   - `minimum_charge_brl`: `7.00`
   - `max_distance_km`: `12.70`
4. Clientes por comercio: minimo 3 por conta commerce.
5. Produtos por comercio: minimo 5 por conta commerce.
6. Pedidos seed:
   - 1 `completed`
   - 1 `to_customer`
   - 1 `searching_rider`
7. Financeiro seed:
   - Wallet commerce com saldo inicial `R$ 300.00`
   - 1 compra aprovada por InfinitePay
   - 1 evento de webhook idempotente registrado

## Estrutura recomendada de arquivos de seed
1. `Packages/Backend/prisma/seeds/010_system.seed.ts`
2. `Packages/Backend/prisma/seeds/020_locality.seed.ts`
3. `Packages/Backend/prisma/seeds/030_pricing.seed.ts`
4. `Packages/Backend/prisma/seeds/040_users.seed.ts`
5. `Packages/Backend/prisma/seeds/050_profiles.seed.ts`
6. `Packages/Backend/prisma/seeds/060_commerce_data.seed.ts`
7. `Packages/Backend/prisma/seeds/070_orders_tracking.seed.ts`
8. `Packages/Backend/prisma/seeds/080_finance.seed.ts`
9. `Packages/Backend/prisma/seed.ts` (orquestrador)

## Ordem recomendada de migrations
1. `20260214_001_init_core_auth_users`
2. `20260214_002_init_system_locality_pricing`
3. `20260214_003_init_commerce_orders_dispatch_tracking`
4. `20260214_004_init_credits_payments`
5. `20260214_005_init_notifications_support_public_audit`

## Checklist final de validacao com dados seed
- [ ] Login admin funcional em `/admin/login`.
- [ ] Login commerce funcional no app (`/commerce/home`).
- [ ] Login rider funcional no app (`/rider/home`).
- [ ] Simulacao de cotacao funcional em `CreateCall`.
- [ ] Criacao de chamado e tracking funcionando.
- [ ] Finalizacao da entrega por codigo funcionando.
- [ ] Compra de creditos e conciliacao de pagamento funcionando.
- [ ] Regras admin-only de precificacao funcionando.
