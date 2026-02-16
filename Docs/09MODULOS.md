# 09MODULOS.md

## Objetivo
Definir o catalogo oficial de modulos do projeto Roodi, com fronteiras claras de responsabilidade para:
1. Backend.
2. Frontend-admin.
3. Frontend-rider.
4. Landing page (Roodi).

## Fontes de verdade
1. `Docs/01PROJETO.md`
2. `Docs/02STACK.md`
3. `Docs/03REGRAS.md`
4. `Docs/04FLUXOS.md`
5. `Docs/07STRUCTURE.md`
6. `Docs/08PAGES.md`

## Premissas obrigatorias
1. O app mobile e unico (`Frontend-rider`) com contextos Rider e Commerce.
2. Nao usar geolocalizacao em tempo real no app.
3. Nao usar mapa offline no fluxo principal.
4. Tracking e por estados/eventos, nao por GPS continuo.
5. Preco e regra `admin_only`.
6. Distancia/tempo de cotacao por matriz de bairros + fallback deterministico.
7. `credits` e `payments` sao dominios distintos (com `credits` em modo legado).

## 1) Fronteira arquitetural: Core x Modules

### 1.1 O que e Core
`Core` contem fundacao tecnica compartilhada de cada pacote (bootstrap, auth base, cliente HTTP, design system, estado global, utilitarios de infraestrutura e observabilidade).

### 1.2 O que e Module
`Modules` contem dominio de negocio e casos de uso. Todo modulo deve seguir:

```text
Modules/<nome-modulo>/
├── domain/
├── application/
├── infra/
├── presentation/
├── tests/
└── README.md
```

### 1.3 Regras de dependencia
1. `Modules -> Core`: permitido.
2. `Modulo A -> Modulo B`: apenas por contrato publico.
3. Acesso direto ao `infra` de outro modulo: proibido.
4. Frontends nao implementam regra de negocio critica; consomem contratos do backend.

## 2) Catalogo oficial por pacote

## 2.1 Backend

Base: `ROODI/Packages/Backend/src/Modules`

| Modulo | Responsabilidade de dominio | Regras/observacoes criticas |
|---|---|---|
| `system` | Parametros globais, feature flags, saude e estados sistemicos | Controla manutencao/update e chaves operacionais do sistema |
| `auth` | Login, cadastro, OTP, reset de senha, sessao JWT/refresh | RBAC por perfil (`admin`, `commerce`, `rider`) e revogacao de sessao |
| `users` | Perfil Rider/Commerce, dados pessoais e de conta | Inclui documentos, banco, veiculo e preferencias de conta |
| `clients` | Cadastro e reutilizacao de clientes do comerciante | Enderecos e dados para acelerar abertura de chamado |
| `products` | Catalogo de produtos do comerciante | CRUD, disponibilidade e organizacao do catalogo |
| `locality` | Resolucao de distancia/tempo por bairro | Ordem: matriz local -> tomtom -> openrouteservice; sem fallback sintetico |
| `pricing` | Formula oficial de cotacao | `admin_only`, zona/urgencia/acrescimos e erros `OUT_OF_COVERAGE`/`DISTANCE_TIME_UNAVAILABLE` |
| `credits` | Carteira de creditos do comerciante (legado) | Saldo, extrato e compatibilidade historica |
| `payments` | Cobranca e conciliacao com gateway | Pagamento por pedido, webhook idempotente, retry, conciliacao e repasse |
| `orders` | Ciclo transacional de pedido/entrega | Criacao, cancelamento, conclusao, historico e auditoria |
| `dispatch` | Alocacao e fila operacional de riders | Elegibilidade, lotes Top3/Top5, cooldown, anti-monopolio e justica operacional |
| `tracking` | Timeline de estados/eventos da entrega | Nao representa rastreio GPS continuo |
| `notifications` | Eventos de notificacao e leitura | In-app/push por contexto operacional |
| `support` | Chamados, FAQ e incidentes | Canal de suporte e tratamento de ocorrencias |

Observacao de status (implementacao atual):
1. `clients` e `products` estao modelados em banco, documentados no OpenAPI e implementados no Backend.

## 2.2 Frontend-admin

Base: `ROODI/Packages/Frontend-admin/src/Modules`

| Modulo | Rotas alvo (planejadas) | Responsabilidade no painel |
|---|---|---|
| `auth` | `/admin/login` | Acesso e sessao administrativa |
| `dashboard` | `/admin/dashboard` | Visao executiva operacional/financeira |
| `users` | `/admin/users` | Gestao de usuarios e perfis |
| `clients` | `/admin/clients` | Consulta e auditoria da base de clientes |
| `orders` | `/admin/orders` | Auditoria e gestao de pedidos/entregas |
| `tracking` | `/admin/tracking` | Linha de eventos da entrega |
| `pricing` | `/admin/pricing` | Gestao de regras de preco (`admin_only`) |
| `credits` | `/admin/credits` | Operacao de carteira e extratos (legado) |
| `payments` | `/admin/payments` | Cobrancas, webhooks, conciliacao e repasses |
| `products` | `/admin/products` | Auditoria/gestao de catalogos |
| `notifications` | `/admin/notifications` | Templates, eventos e politicas de notificacao |
| `support` | `/admin/support` | Operacao de chamados e incidentes |
| `system` | `/admin/system` | Parametros globais, flags e saude |

Observacao:
1. O painel admin nao possui modulo `dispatch` dedicado no frontend.
2. Operacoes de alocacao sao monitoradas por `orders` e `tracking`, com regra executada no backend (`dispatch`).

## 2.3 Frontend-rider (app unico Rider + Commerce)

Base: `ROODI/Packages/Frontend-rider/lib/Modules`

| Modulo | Rotas/paginas alvo | Responsabilidade no app |
|---|---|---|
| `auth` | `/login`, `/register`, `/forgot-password`, `/otp`, `/reset-password` | Acesso, cadastro e recuperacao |
| `session` | `/splash`, `/onboarding/*` | Sessao ativa, contexto de uso, boot do app e estados globais consumidos de `system` |
| `rider-home-flow` | `/rider/home` | Fluxo Rider por estado da entrega |
| `rider-orders-history` | `/rider/orders` | Historico Rider, filtros e detalhe |
| `rider-profile` | `/rider/profile` | Perfil Rider e edicao por bottom sheet |
| `commerce-home` | `/commerce/home` | Painel operacional do comerciante |
| `commerce-create-call` | `/commerce/create-call` | Abertura de chamado com simulacao visual |
| `commerce-tracking` | `/commerce/tracking/:id` | Timeline de eventos da entrega |
| `commerce-history` | `/commerce/history` | Historico de chamados do comerciante |
| `clients` | `/commerce/clients` | Gestao da base de clientes |
| `credits` | `/commerce/credits` | Fluxo legado de carteira |
| `products` | `/commerce/products` | Gestao de produtos do comerciante |
| `notifications` | `/notifications` | Central de notificacoes |
| `support` | `/support` | Ajuda, canais e chamados |

Observacoes:
1. `pricing`, `locality`, `dispatch` e `payments` ficam no backend e sao consumidos pelos modulos de UI.
2. Fluxo Rider deve permanecer orientado por estados (sem criar tela para cada estado).
3. Tracking no app e representacao de estado/evento, nao GPS continuo.

## 2.4 Landing page (Roodi)

Base: `ROODI/Packages/Roodi/src/Modules`

| Modulo | Rotas alvo (planejadas) | Responsabilidade |
|---|---|---|
| `marketing` | `/`, `/como-funciona`, `/para-comerciantes`, `/para-entregadores` | Conteudo institucional e proposta de valor |
| `leads` | `/contato` | Captura de lead e CTA comercial |
| `legal` | `/termos`, `/privacidade`, `/cookies` | Conteudo legal e consentimento |
| `seo-analytics` | suporte as rotas da landing | Metadados, indexacao e medicao |

## 3) Modulos x paginas/fluxos (resumo de rastreabilidade)

1. Acesso e conta: `auth` + `session`.
2. Operacao Rider: `rider-home-flow`, `rider-orders-history`, `rider-profile` consumindo `orders`, `dispatch`, `tracking` do backend.
3. Operacao Commerce: `commerce-home`, `commerce-create-call`, `commerce-tracking`, `commerce-history`, `clients`, `products` e `credits` (legado).
4. Governanca de preco: `pricing` backend + `pricing` admin; nunca controlado por rider/commerce no app.
5. Financeiro: `payments` e o fluxo principal (pagamento por chamado); `credits` permanece para compatibilidade.
6. Suporte e notificacoes: modulos dedicados em backend e frontends.

## 4) Fronteiras criticas de negocio

1. `pricing`:
   - dono funcional: admin.
   - entrada: bairros, urgencia, horario, contexto.
   - saida: valor cotado, ETA, trilha de provider e status de cobertura.

2. `locality`:
   - nao depende de mapa em runtime no app.
   - usa matriz local e fallbacks deterministicos.

3. `dispatch`:
   - regra de justica operacional e elegibilidade.
   - chamada controlada por lotes e cooldown.

4. `tracking`:
   - timeline de estados: da criacao ate entrega concluida.
   - sem rastreio GPS continuo.

5. `credits` x `payments`:
   - `credits`: saldo e ledger interno da carteira (legado).
   - `payments`: transacao com gateway, webhook e conciliacao (fluxo principal).

## 5) Design system e modulos

1. Design system pertence a `Core`, nao a `Modules`.
2. Contrato cross-platform (Flutter x Web) e somente semantica de cores.
3. Widgets Flutter e componentes Web sao independentes por tecnologia.

## 6) Criterios para criar/refatorar modulo

1. Resolver um dominio de negocio claro e independente.
2. Publicar contrato de entrada/saida no `README.md` do modulo.
3. Declarar dependencias explicitas de outros modulos (apenas contrato publico).
4. Mapear quais paginas/rotas e fluxos consomem o modulo.
5. Cobrir regras criticas com testes (unitario + integracao do contrato).
6. Atualizar obrigatoriamente: `07STRUCTURE.md`, `08PAGES.md`, `09MODULOS.md` e `04FLUXOS.md` quando houver mudanca de fronteira.
