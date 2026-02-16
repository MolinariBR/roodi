# STACK TECNOLÓGICO DO ROODI

## Premissas técnicas
1. Sem geolocalizacao em tempo real no app.
2. Sem mapa offline no fluxo principal.
3. Distancia e tempo por matriz de bairros + fallback deterministico de provedores.
4. Tracking operacional por estados e eventos.
5. Stack enxuta: cada tecnologia precisa ter responsabilidade clara.
6. Sem Docker no fluxo padrao de dev/operacao; excecao exclusiva para `testcontainers` em testes.

## 1. Backend (`ROODI/Packages/Backend`)

### Núcleo
1. Linguagem: TypeScript
2. Runtime: Node.js
3. Framework API: Express.js
4. Banco: PostgreSQL
5. ORM: Prisma
6. Tempo real operacional: Socket.IO

### Autenticacao e autorizacao
1. Credenciais proprias: email/senha com hash (`bcrypt` ou `argon2`).
2. Sessao: JWT (`access token` curto + `refresh token` com rotacao).
3. Recuperacao de acesso: OTP para reset de senha (com expiracao e limite de tentativas) enviado por Resend.
4. Social login: Google, Facebook e Apple (validacao no backend).
5. Autorizacao: RBAC por perfil (`admin`, `commerce`, `rider`) e guards por modulo/rota.
6. Revogacao de sessao: denylist/versionamento de token em Redis para logout e bloqueio.

### Dependências de aplicação (justificadas)
1. Validacao de payload: Zod (schemas unicos para request/response).
2. Autenticacao: JWT (access/refresh) + hash de senha (`bcrypt` ou `argon2`).
3. Seguranca HTTP: `helmet`, `cors` e rate limit por IP/chave.
4. Cache operacional: Redis (cotacao, clima e dados de alta leitura).
5. Jobs assincronos: BullMQ (webhooks, retries, notificacoes e conciliacao).
6. Cliente HTTP externo: `axios` ou `undici` para APIs de distancia/clima/pagamento.
7. Logs: `pino` com correlacao por `request_id`/`quote_id`.
8. Documentacao de API: OpenAPI/Swagger para contrato interno.

### Cotacao de frete (metodo oficial)
1. Politica: `Docs/config/freight-fallback-policy.yaml` e `Docs/config/freight-fallback-policy.json`.
2. Distancia/tempo (ordem): `local_bairro_matrix` -> `tomtom_matrix` -> `openrouteservice_matrix`.
3. Clima (ordem): `openweather` -> `met_no`.
4. Regra critica: sem fallback sintetico para distancia/tempo; falha total rejeita cotacao.

### Dados e pipeline de localidade
1. Matriz local: `Docs/data/imperatriz_bairros_matriz.json`.
2. Cache de geocoding da geracao: `Docs/data/imperatriz_bairros_geocode_cache.json`.
3. Script de geracao: `Docs/scripts/generate_imperatriz_bairro_matrix.py`.
4. Observacao: script e pipeline de dados, nao runtime de rastreio do app.

### Pagamentos
1. Gateway: InfinitePay.
2. Requisitos tecnicos: idempotencia de webhook, retry com fila e conciliacao.

### Testes de backend
1. Unitario: Vitest ou Jest.
2. Integracao HTTP: Supertest.
3. Integracao real de infraestrutura: Testcontainers.

## 2. Frontend-admin (`ROODI/Packages/Frontend-admin`)

### Núcleo
1. Framework: Next.js (App Router)
2. Linguagem: TypeScript
3. UI: Tailwind CSS + shadcn/ui

### Design System e tema
1. Base em `src/Core/design-system` com tokens semanticos (cores, espacos, tipografia, raio e sombras).
2. Tema claro/escuro com modo automatico por `prefers-color-scheme`.
3. Override manual de tema do usuario persiste preferencia local.
4. Componentes devem consumir tokens; nao usar valores visuais hardcoded em pagina.
5. Contrato com Flutter: apenas semantica de cores.

### Dependências de aplicação (justificadas)
1. Fetch server/client: `fetch` nativo + wrapper interno (ou `axios`, padrao unico).
2. Estado assíncrono: TanStack Query (cache, invalidação e re-fetch).
3. Formulario e schema: React Hook Form + Zod.
4. Tabelas operacionais: TanStack Table (historico, pedidos, creditos).
5. Autenticacao admin: propria via backend (`/v1/auth/login`, `access/refresh`, cookies httpOnly).
6. Telemetria de erro: Sentry (painel e alertas).

### Autenticacao no painel admin
1. Login e sessao gerenciados pelo backend de autenticacao do Roodi.
2. Guard de rota valida token admin em endpoint protegido antes de liberar rotas sensiveis.
3. Acoes de alto impacto exigem permissao explicita (RBAC).

### Testes de frontend-admin
1. Unitario e componente: Vitest + React Testing Library.
2. E2E: Playwright.

## 3. Frontend-rider (`ROODI/Packages/Frontend-rider`)

### Núcleo
1. Framework: Flutter
2. Linguagem: Dart
3. Estado: Riverpod
4. Navegacao: GoRouter

### Design System e tema
1. Arquivo central de tema: `lib/Core/design-system/App_Theme.dart`.
2. Tokens mobile em `lib/Core/design-system/tokens/*.dart`.
3. Temas em `lib/Core/design-system/themes/app_light_theme.dart` e `app_dark_theme.dart`.
4. Modo automatico nativo obrigatorio com `ThemeMode.system`.
5. Resolucao de preferencia de tema em `lib/Core/design-system/theme-mode/theme_mode_resolver.dart`.
6. Widgets de tela nao podem fixar cor/tipografia fora dos tokens.
7. Contrato com Web: apenas semantica de cores; widgets e tokens nao visuais sao independentes.

### Dependências de aplicação (justificadas)
1. HTTP: Dio (interceptors, retry controlado, cancelamento).
2. Serializacao/modelos: `json_serializable` + `freezed`.
3. Sessao segura: `flutter_secure_storage`.
4. Persistencia leve: `shared_preferences`.
5. Tempo real de estados: `socket_io_client`.
6. Notificacao push/local: FCM + `flutter_local_notifications`.
7. Observabilidade de erro no app: Crashlytics ou Sentry (escolher 1).

### Autenticacao no app mobile
1. Login/cadastro no backend com emissao de `access` e `refresh`.
2. Tokens armazenados com seguranca em `flutter_secure_storage`.
3. Renovacao silenciosa de sessao por interceptor HTTP.
4. Logout invalida sessao no backend e remove credenciais locais.

### Regra de escopo mobile
1. Nao incluir SDK de mapa como dependencia obrigatoria de runtime.
2. Tracking exibido por eventos de estado, nao por GPS em tempo real.

### Testes do app mobile
1. Unitario e widget: `flutter_test`.
2. Integracao: `integration_test`.

## 4. Landing Page (`ROODI/Packages/Roodi`)

### Núcleo
1. Framework: Next.js
2. Linguagem: TypeScript
3. UI: Tailwind CSS

### Design System e tema
1. Base em `src/Core/design-system` compartilhando fundacao de tokens com o `Frontend-admin`.
2. Tema claro/escuro automatico por `prefers-color-scheme`.
3. Componentes de marketing podem variar composicao, mantendo tokens base.
4. Contrato com Flutter: apenas semantica de cores.

### Dependências de aplicação (justificadas)
1. SEO tecnico: metadata API, sitemap e robots.
2. Captacao de leads: formulario validado (Zod) + endpoint backend.
3. Analytics: GA4 ou Plausible (escolher 1).

## 5. Infraestrutura e operação

### Serviços
1. PostgreSQL (principal).
2. Redis (cache + fila BullMQ).
3. Hostinger/VPS para deploy dos pacotes web e API.

### Entrega e qualidade
1. CI/CD com build, testes e deploy automatizados.
2. Migrations de banco versionadas no pipeline.
3. Logs estruturados e monitoramento de erros em producao.

## 6. Chaves e configuração
1. `TOMTOM_API_KEY`
2. `OPENROUTESERVICE_API_KEY`
3. `OPENWEATHER_API_KEY`
4. `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO`
5. `INFINITEPAY_*`
6. `GOOGLE_MAPS_API_KEY` (somente pipeline de geracao de matriz, quando usado)

## 7. Resumo de escolha arquitetural
1. Backend forte em regras e auditoria.
2. Frontends focados em operacao e UX, sem dependencias de mapa desnecessarias.
3. Cotacao robusta por matriz local com fallback controlado.
4. Stack profissional, sem inflacao de ferramenta sem funcao de negocio.
