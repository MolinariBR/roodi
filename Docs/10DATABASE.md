# 10DATABASE.md

## Objetivo
Definir o contrato oficial de banco de dados do Roodi (PostgreSQL + Prisma), cobrindo:
1. Modelo de dados por dominio.
2. Relacoes, constraints e indices obrigatorios.
3. Regras de integridade alinhadas com fluxos, modulos e API.
4. Base fisica de referencia para implementacao.

## Fontes de verdade
1. `Docs/01PROJETO.md`
2. `Docs/02STACK.md`
3. `Docs/03REGRAS.md`
4. `Docs/04FLUXOS.md`
5. `Docs/05USER-STORIES.md`
6. `Docs/07STRUCTURE.md`
7. `Docs/08PAGES.md`
8. `Docs/09MODULOS.md`
9. `Docs/openapi/roodi.openapi.yaml`
10. `Docs/API-INFINITY-PAY.md`
11. `Docs/config/freight-fallback-policy.yaml`

## Premissas obrigatorias refletidas no banco
1. O app nao usa geolocalizacao em tempo real.
2. O app nao usa mapa offline no fluxo principal.
3. Tracking e por estados/eventos da entrega.
4. Precificacao e controlada pelo admin (`admin_only`).
5. Distancia/tempo vem de matriz local de bairros + fallback deterministico.
6. `credits` e `payments` sao dominios separados.
7. Regra financeira estrutural: `FP = RE + CP`.

## Artefatos deste contrato
1. Contrato logico: `Docs/10DATABASE.md`.
2. Contrato fisico SQL: `Docs/database/roodi_schema.sql`.
3. Contrato Prisma: `Docs/database/schema.prisma`.
4. Guia rapido: `Docs/database/README.md`.

## Padroes tecnicos de modelagem
1. Banco: PostgreSQL.
2. Identificador primario padrao: `UUID` (`gen_random_uuid()`).
3. Datas padrao: `created_at`, `updated_at` (`TIMESTAMPTZ`).
4. Valores monetarios: `NUMERIC(12,2)` (BRL).
5. Campos de auditoria e payload flexivel: `JSONB`.
6. Enums para estados criticos (auth, orders, tracking, payments, support).

## Dominios e tabelas

### 1) Auth
1. `users`
2. `user_identities`
3. `auth_refresh_tokens`
4. `auth_otp_challenges`
5. `auth_otp_attempts`

Responsabilidade:
- Cadastro/login/sessao e recuperacao por OTP.
- Identidades locais e sociais (Google/Facebook/Apple).

### 2) Users (perfil)
1. `rider_profiles`
2. `commerce_profiles`
3. `user_addresses`
4. `user_bank_accounts`
5. `rider_documents`
6. `rider_vehicles`

Responsabilidade:
- Dados operacionais por tipo de usuario.
- Documentos, veiculos, enderecos e conta bancaria.

### 3) System
1. `system_flags`
2. `system_runtime_state`
3. `system_runtime_history`

Responsabilidade:
- Feature flags, manutencao, update forcado e estado global da plataforma.

### 4) Locality + Pricing
1. `locality_bairros`
2. `locality_bairro_matrix`
3. `pricing_rule_versions`
4. `pricing_zone_rules`
5. `pricing_urgency_rules`
6. `pricing_conditional_rules`
7. `pricing_peak_windows`
8. `pricing_holidays`
9. `quotes`
10. `quote_provider_attempts`

Responsabilidade:
- Matriz local de distancia/tempo.
- Regras versionadas de precificacao (admin).
- Cotacao com trilha de provedores e fallback.

### 5) Commerce
1. `commerce_clients`
2. `commerce_products`

Responsabilidade:
- Base de clientes reutilizaveis.
- Catalogo de produtos da loja.

### 6) Orders + Dispatch + Tracking
1. `orders`
2. `order_product_snapshots`
3. `order_status_transitions`
4. `order_events`
5. `dispatch_batches`
6. `dispatch_offers`
7. `order_confirmation_codes`

Responsabilidade:
- Ciclo completo da entrega por estados.
- Alocacao por lotes (dispatch) com justificativa.
- Timeline de eventos sem GPS continuo.
- Confirmacao de entrega por codigo.

### 7) Credits + Payments
1. `credits_wallets`
2. `credits_ledger`
3. `payment_intents`
4. `payment_transactions`
5. `payment_webhook_events`
6. `order_financials`
7. `rider_wallets`
8. `rider_ledger`

Responsabilidade:
- Pagamento por chamado (fluxo recomendado) e conciliacao.
- Carteira de creditos (legado) para transicao controlada.
- Integracao financeira (InfinitePay) e conciliacao.
- Repasse do rider e comissao da plataforma.

### 8) Notifications
1. `notification_templates`
2. `user_notification_settings`
3. `notifications`

Responsabilidade:
- Templates por evento/canal.
- Configuracao individual por usuario.
- Notificacao in-app/push e leitura.

### 9) Support
1. `support_faqs`
2. `support_tickets`
3. `support_ticket_messages`

Responsabilidade:
- FAQ, abertura de chamados, fila de atendimento e historico de interacoes.

### 10) Public (Landing)
1. `public_leads`
2. `legal_documents`

Responsabilidade:
- Captura de leads e versionamento de documentos legais publicos.

### 11) Auditoria
1. `audit_logs`

Responsabilidade:
- Rastreabilidade de alteracoes criticas e acoes de alto impacto.

## Relacionamentos criticos
1. `users` e a raiz de identidade para Rider, Commerce e Admin.
2. `commerce_profiles.user_id -> users.id` e `rider_profiles.user_id -> users.id`.
3. `orders.commerce_user_id -> users.id` e `orders.rider_user_id -> users.id`.
4. `orders.quote_id -> quotes.id`.
5. `order_events.order_id -> orders.id`.
6. `dispatch_batches.order_id -> orders.id`.
7. `dispatch_offers.batch_id -> dispatch_batches.id`.
8. `credits_wallets.commerce_user_id -> users.id`.
9. `credits_ledger` referencia comercio + pedido quando aplicavel.
10. `payment_intents` e `payment_transactions` formam trilha financeira com webhook idempotente.
11. `payment_intents.order_id -> orders.id` vincula pagamento diretamente ao chamado.
12. `order_financials.order_id` consolida `FP`, `RE`, `CP`.

## Regras de integridade obrigatorias
1. `users.email` unico e normalizado em lowercase.
2. `auth_refresh_tokens.jti` unico.
3. `pricing_rule_versions` com no maximo 1 versao ativa por vez.
4. `locality_bairro_matrix` unico por par origem/destino.
5. `orders.order_code` unico.
6. `order_confirmation_codes.order_id` unico.
7. `payment_intents.order_nsu` unico.
8. `payment_webhook_events.idempotency_key` unico.
9. `credits_wallets.reserved_brl <= balance_brl`.
10. `order_financials`: `freight_platform_brl = rider_repass_brl + platform_commission_brl`.

## Regras de estado (order lifecycle)
Estados persistidos em `orders.status`:
1. `created`
2. `searching_rider`
3. `rider_assigned`
4. `to_merchant`
5. `at_merchant`
6. `waiting_order`
7. `to_customer`
8. `at_customer`
9. `finishing_delivery`
10. `completed`
11. `canceled`

Regras:
1. Toda transicao valida gera linha em `order_events`.
2. Conclusao exige validacao em `order_confirmation_codes` quando `confirmation_code_required=true`.
3. Cancelamentos precisam registrar `cancel_reason` e evento correspondente.

## Politica de cotacao no banco
1. `quotes` registra resultado final da cotacao (sucesso/falha).
2. `quote_provider_attempts` registra tentativa por provider e latencia.
3. Em falha total de distancia/tempo, `quotes.success=false` com `error_code=DISTANCE_TIME_UNAVAILABLE`.
4. Em distancia acima da cobertura, `error_code=OUT_OF_COVERAGE`.

## Politica financeira no banco
1. Pagamento por chamado (fluxo recomendado):
   - `payment_intents` (intencao + checkout)
   - `payment_transactions` (status e conciliacao)
   - `payment_webhook_events` (recepcao e idempotencia)
   - vinculo com `orders` por `payment_intents.order_id`
   - atualizacao de `orders.payment_status` e `orders.payment_confirmed_at`
2. Compra de creditos (legado):
   - `credits_ledger` (credito efetivo)
3. Entrega concluida:
   - movimentacao em `credits_ledger` (debito/reserva/liberacao)
   - consolidacao em `order_financials`
   - repasse em `rider_ledger`.

## Indices obrigatorios (visao operacional)
1. Auth: tokens ativos por usuario e expiracao.
2. Orders: por `commerce_user_id + status`, `rider_user_id + status`, `status + created_at`.
3. Tracking: `order_events(order_id, occurred_at)`.
4. Dispatch: ofertas por pedido e por rider.
5. Credits: extrato por comercio em ordem temporal.
6. Payments: transacoes por status e webhooks por `order_nsu`.
7. Notifications: por usuario e leitura.
8. Support: chamados por status/prioridade.
9. Auditoria: por entidade e por ator.

## Seguranca e LGPD
1. Dados sensiveis (senha, OTP, codigos) sao armazenados como hash.
2. Nunca armazenar OTP ou codigo de confirmacao em texto puro.
3. Logs de auditoria nao devem expor dados sensiveis completos.
4. Minimizar dados pessoais em payloads e respostas de API.
5. Controle de acesso por perfil (`admin`, `commerce`, `rider`) no backend.

## Versionamento de schema
1. Toda alteracao estrutural deve gerar migration versionada (Prisma migrations).
2. Mudancas de contrato devem sincronizar:
   - `Docs/openapi/roodi.openapi.yaml`
   - `Docs/09MODULOS.md`
   - `Docs/04FLUXOS.md`
   - `Docs/05USER-STORIES.md`
3. Manter backward compatibility quando possivel; quando nao for possivel, versionar endpoint e migration de forma coordenada.

## Proximos passos de implementacao
1. Materializar este contrato em `Packages/Backend/prisma/schema.prisma`.
2. Gerar migrations iniciais por modulo (auth, users, orders, credits/payments, support, notifications, system).
3. Criar seeds para:
   - flags de sistema
   - regras de precificacao ativas
   - FAQ inicial
   - documentos legais ativos
4. Criar testes de integracao de contrato para fluxos criticos:
   - cotacao
   - transicao de pedido
   - compra de creditos
   - webhook InfinitePay
