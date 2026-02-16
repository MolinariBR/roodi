# 08PAGES.md

## Objetivo
Documentar o mapa oficial de paginas e rotas do Roodi, organizado por:
1. Frontend.
2. Tipo de usuario.
3. Funcionalidades.

Este documento consolida o que ja esta prototipado e o que esta planejado para implementacao.

## Fontes de verdade
1. `Docs/01PROJETO.md`
2. `Docs/02STACK.md`
3. `Docs/03REGRAS.md`
4. `Docs/04FLUXOS.md`
5. `Docs/07STRUCTURE.md`
6. `Docs/Prototype/*`

## Premissas obrigatorias
1. O app mobile e unico: `Frontend-rider` com contexto Rider e Commerce.
2. Nao usamos geolocalizacao em tempo real no app.
3. Nao usamos mapa offline no fluxo principal.
4. Tracking de entrega e por estados/eventos operacionais.
5. Regra de preco pertence ao admin (`admin_only`).
6. Distancia e tempo de cotacao usam matriz de bairros + fallback deterministico.

## 1) Mapa de frontends e cobertura

| Frontend | Pacote alvo | Status de prototipo | Cobertura atual |
|---|---|---|---|
| Frontend-rider (mobile) | `Packages/Frontend-rider` | Prototipado em `Docs/Prototype` | 25 paginas HTML |
| Frontend-admin (web) | `Packages/Frontend-admin` | Ainda sem prototipo HTML | Rotas planejadas por modulos |
| Landing page (web) | `Packages/Roodi` | Ainda sem prototipo HTML | Rotas institucionais planejadas |

## 2) Frontend-rider: paginas prototipadas (25)

### 2.1 Comum (Rider + Commerce) - 14 paginas

| Pagina | Caminho | Rota logica sugerida | Usuario | Funcionalidade principal | Modulos de dominio |
|---|---|---|---|---|---|
| Splash | `Docs/Prototype/Common/Splash.html` | `/splash` | Comum | Entrada inicial e redirecionamento | `system` |
| Onboarding 01 | `Docs/Prototype/Common/01Onboarding.html` | `/onboarding/1` | Comum | Introducao do produto | `system` |
| Onboarding 02 | `Docs/Prototype/Common/02.Onboarding.html` | `/onboarding/2` | Comum | Valor operacional do app | `system` |
| Onboarding 03 | `Docs/Prototype/Common/03Onboarding.html` | `/onboarding/3` | Comum | Fechamento do onboarding | `system` |
| Login | `Docs/Prototype/Common/Login.html` | `/login` | Comum | Acesso com selecao de contexto | `auth` |
| Register | `Docs/Prototype/Common/Register.html` | `/register` | Comum | Cadastro com selecao de contexto | `auth` |
| ForgotPassword | `Docs/Prototype/Common/ForgotPassword.html` | `/forgot-password` | Comum | Inicio da recuperacao de acesso | `auth` |
| OTP | `Docs/Prototype/Common/OTP.html` | `/otp` | Comum | Validacao do codigo de recuperacao | `auth` |
| ResetPassword | `Docs/Prototype/Common/ResetPassword.html` | `/reset-password` | Comum | Definicao de nova senha | `auth` |
| Notifications | `Docs/Prototype/Common/Notifications.html` | `/notifications` | Comum | Central de notificacoes | `notifications` |
| Support | `Docs/Prototype/Common/Support.html` | `/support` | Comum | Central de ajuda e canais | `support` |
| Error | `Docs/Prototype/Common/Error.html` | `/error` | Comum | Estado de erro operacional | `system` |
| Mantenance | `Docs/Prototype/Common/Mantenance.html` | `/maintenance` | Comum | Estado de manutencao | `system` |
| Update | `Docs/Prototype/Common/Update.html` | `/update` | Comum | Estado de atualizacao obrigatoria/opcional | `system` |

### 2.2 Rider (Entregador) - 3 paginas

| Pagina | Caminho | Rota logica sugerida | Usuario | Funcionalidade principal | Modulos de dominio |
|---|---|---|---|---|---|
| Home Rider | `Docs/Prototype/Rider/Home.html` | `/rider/home` | Rider | Fluxo operacional da entrega por estados | `session`, `dispatch`, `tracking`, `orders` |
| Orders Rider | `Docs/Prototype/Rider/Orders.html` | `/rider/orders` | Rider | Historico de corridas e filtros | `orders`, `tracking` |
| Profile Rider | `Docs/Prototype/Rider/Profile.html` | `/rider/profile` | Rider | Perfil e dados de conta em sheets | `users`, `support` |

### 2.3 Commerce (Comerciante) - 8 paginas

| Pagina | Caminho | Rota logica sugerida | Usuario | Funcionalidade principal | Modulos de dominio |
|---|---|---|---|---|---|
| Home Commerce | `Docs/Prototype/Commerce/Home.html` | `/commerce/home` | Commerce | Painel de chamados e operacao diaria | `orders`, `dispatch`, `tracking` |
| CreateCall | `Docs/Prototype/Commerce/CreateCall.html` | `/commerce/create-call` | Commerce | Abertura de chamado, simulacao e inicio do pagamento por pedido | `orders`, `pricing`, `locality`, `payments`, `clients` |
| Tracking Commerce | `Docs/Prototype/Commerce/Tracking.html` | `/commerce/tracking/:id` | Commerce | Timeline de estados + status de pagamento do chamado | `tracking`, `orders`, `payments`, `support` |
| History Commerce | `Docs/Prototype/Commerce/History.html` | `/commerce/history` | Commerce | Historico de chamados com filtros | `orders`, `tracking` |
| Clients | `Docs/Prototype/Commerce/Clients.html` | `/commerce/clients` | Commerce | Cadastro e reutilizacao de clientes | `clients` |
| Credits | `Docs/Prototype/Commerce/Credits.html` | `/commerce/credits` | Commerce | Fluxo legado de carteira (compatibilidade) | `credits`, `payments` |
| Products | `Docs/Prototype/Commerce/Products.html` | `/commerce/products` | Commerce | Gestao de catalogo de produtos | `products` |
| Profile Commerce | `Docs/Prototype/Commerce/Profile.html` | `/commerce/profile` | Commerce | Perfil operacional da loja | `users`, `support`, `notifications` |

### 2.4 Scripts de comportamento ligados as paginas

1. `Docs/Prototype/Rider/home-flow.js`: maquina de estados do fluxo Rider (offline ate entrega concluida).
2. `Docs/Prototype/Rider/orders-sheet.js`: filtros e detalhes da lista de corridas.
3. `Docs/Prototype/Rider/profile-sheet.js`: modais inferiores de dados do Rider.
4. `Docs/Prototype/Rider/profile-menu.js`: menu flutuante do Rider.
5. `Docs/Prototype/Commerce/home-menu.js`: menu flutuante do Commerce.
6. `Docs/Prototype/Commerce/create-call-pricing.js`: simulacao visual de preco/ETA em CreateCall.

## 3) Fluxos de navegacao do mobile

### 3.1 Fluxo de acesso comum

```text
Splash -> Onboarding 1 -> Onboarding 2 -> Onboarding 3 -> Login
Login -> Rider/Home (contexto Rider)
Login -> Commerce/Home (contexto Commerce)
ForgotPassword -> OTP -> ResetPassword -> Login
```

### 3.2 Fluxo Rider

```text
Rider/Home <-> Rider/Orders <-> Rider/Profile
Rider/Home|Orders|Profile -> Notifications
Rider/Profile -> Support
```

### 3.3 Fluxo Commerce

```text
Commerce/Home -> CreateCall -> Tracking
Commerce/Home <-> History
Commerce/Home|Profile -> Clients
Commerce/Home|Profile -> Payments (status por pedido em Tracking)
Commerce/Home|Profile -> Products
Commerce/Profile -> Support
```

## 4) Frontend-admin: rotas planejadas (sem prototipo HTML)

Baseado em `01PROJETO`, `07STRUCTURE` e modulos de `Frontend-admin`.

| Rota planejada | Usuario | Funcionalidade principal | Modulos |
|---|---|---|---|
| `/admin/login` | Admin | Autenticacao do painel | `auth` |
| `/admin/dashboard` | Admin | Visao executiva operacional e financeira | `dashboard`, `system` |
| `/admin/users` | Admin | Gestao de usuarios (rider/commerce) | `users` |
| `/admin/clients` | Admin | Consulta e auditoria de clientes | `clients` |
| `/admin/orders` | Admin | Gestao e auditoria de pedidos/entregas | `orders` |
| `/admin/tracking` | Admin | Timeline de eventos por entrega | `tracking` |
| `/admin/pricing` | Admin | Regras de preco e acrescimos (admin_only) | `pricing` |
| `/admin/credits` | Admin | Operacao de carteira e extratos | `credits` |
| `/admin/payments` | Admin | Cobranca, conciliacao e repasses | `payments` |
| `/admin/products` | Admin | Auditoria/gestao de catalogos | `products` |
| `/admin/notifications` | Admin | Templates e eventos de notificacao | `notifications` |
| `/admin/support` | Admin | Gestao de chamados e incidentes | `support` |
| `/admin/system` | Admin | Feature flags, parametros e saude | `system` |

## 5) Landing page (Roodi): rotas planejadas (sem prototipo HTML)

Baseado em modulos `marketing`, `leads`, `legal` e `seo-analytics`.

| Rota planejada | Publico | Funcionalidade principal | Modulos |
|---|---|---|---|
| `/` | Publico | Home institucional e proposta de valor | `marketing` |
| `/como-funciona` | Publico | Explicacao do fluxo da plataforma | `marketing` |
| `/para-comerciantes` | Publico | Beneficios para comercio | `marketing`, `leads` |
| `/para-entregadores` | Publico | Beneficios para rider | `marketing`, `leads` |
| `/contato` | Publico | Captura de lead e contato comercial | `leads` |
| `/termos` | Publico | Termos de uso | `legal` |
| `/privacidade` | Publico | Politica de privacidade | `legal` |
| `/cookies` | Publico | Politica de cookies/consentimento | `legal`, `seo-analytics` |

## 6) Regras funcionais que impactam paginas

1. `CreateCall` apenas simula cotacao no prototipo; producao usa politica em `Docs/config/freight-fallback-policy.*`.
2. Tela de tracking nao representa GPS continuo; representa estados/eventos da entrega.
3. Comerciante e Rider nao definem regras de preco; isso pertence ao admin.
4. Fluxo Rider deve permanecer orientado por estado no card principal, sem multiplicacao de telas.
5. Profile Rider e Profile Commerce priorizam bottom sheet/modal para edicao de secoes.
6. Fluxo financeiro principal do commerce e pagamento por chamado (`orders/{id}/payment-intent`).
7. `Credits` e `Payments` sao dominios distintos: carteira legada x cobranca/conciliacao atual.

## 7) Regras de manutencao do documento

1. Toda nova tela em `Docs/Prototype` deve entrar neste documento no mesmo commit.
2. Toda remocao/renomeacao de tela deve atualizar caminho, rota logica e modulo.
3. Toda mudanca de fluxo em JS deve refletir nas secoes de navegacao.
4. Toda nova rota planejada de admin/landing deve manter vinculo com modulo oficial em `Docs/07STRUCTURE.md`.
5. Este documento e a fonte de verdade de paginas e rotas de produto.
