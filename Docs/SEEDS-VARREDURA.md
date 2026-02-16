# Varredura de Seeds (Backend)

## Escopo da varredura
- Pasta analisada: `Packages/Backend/prisma/seeds`
- Contrato comparado: `Packages/Backend/prisma/schema.prisma`
- Objetivo: mapear seeds existentes e lacunas para maior completude de integracao `Frontend-rider` + `Frontend-admin` + backend.

## Seeds existentes
Arquivos atuais:
1. `010_system.seed.ts`
2. `020_locality.seed.ts`
3. `030_pricing.seed.ts`
4. `040_users.seed.ts`
5. `050_profiles.seed.ts`
6. `060_commerce_data.seed.ts`
7. `070_orders_tracking.seed.ts`
8. `080_finance.seed.ts`
9. `090_notifications_support.seed.ts`
10. `100_dispatch_quotes.seed.ts`
11. `110_orders_completion.seed.ts`
12. `120_legal_leads.seed.ts`
13. `130_runtime_observability.seed.ts`
14. `140_rider_ledger.seed.ts`

## Cobertura atual (schema x seeds)
- Modelos no schema: `50`
- Modelos tocados por seeds (via Prisma): `49`
- Modelo adicional seedado via SQL bruto: `1` (`locality_bairro_matrix`)
- Cobertura efetiva: `50/50` (`100%`)

## Modelos cobertos hoje
- `audit_logs`
- `auth_otp_attempts`
- `auth_otp_challenges`
- `auth_refresh_tokens`
- `commerce_clients`
- `commerce_products`
- `commerce_profiles`
- `credits_ledger`
- `credits_wallets`
- `dispatch_batches`
- `dispatch_offers`
- `legal_documents`
- `locality_bairros`
- `locality_bairro_matrix` (via `executeRawUnsafe`)
- `notification_templates`
- `notifications`
- `order_confirmation_codes`
- `order_events`
- `order_financials`
- `order_product_snapshots`
- `order_status_transitions`
- `orders`
- `payment_intents`
- `payment_transactions`
- `payment_webhook_events`
- `pricing_conditional_rules`
- `pricing_holidays`
- `pricing_peak_windows`
- `pricing_rule_versions`
- `pricing_urgency_rules`
- `pricing_zone_rules`
- `public_leads`
- `quote_provider_attempts`
- `quotes`
- `rider_documents`
- `rider_ledger`
- `rider_profiles`
- `rider_vehicles`
- `rider_wallets`
- `support_faqs`
- `support_ticket_messages`
- `support_tickets`
- `system_flags`
- `system_runtime_history`
- `system_runtime_state`
- `user_addresses`
- `user_bank_accounts`
- `user_identities`
- `user_notification_settings`
- `users`

## Lacunas de modelos sem seed
- Nenhuma lacuna de modelo no contrato atual.

## Lacunas de volume/cobertura funcional (mesmo em modelos seedados)
1. `payments`: ainda prioriza fluxo `approved`; cenarios `failed`/`canceled` podem ser ampliados.
2. `dispatch_offers`: pode receber mais variacoes de tentativa por rider para carga de estresse.
3. `support_tickets`: pode receber maior volume para validar paginação pesada no admin.

## Impacto por frontend

### Impacto direto no Frontend-rider
1. `dispatch_batches`/`dispatch_offers`: melhora validacao de telas e acoes de oferta do rider.
2. `quotes`/`quote_provider_attempts`: permite validar historico e rastreabilidade de cotacao.
3. `order_confirmation_codes`: habilita teste real do fechamento por codigo.
4. `notifications`: alimenta central de notificacoes com dados reais.
5. `support_faqs`/`support_tickets`/`support_ticket_messages`: evita telas vazias em Suporte.

### Impacto direto no Frontend-admin
1. `notification_templates`: pagina admin de notificacoes com dados reais.
2. `support_tickets` e mensagens: fila/admin de suporte validavel.
3. `legal_documents`: validacao de documentos legais via APIs publicas/admin.
4. `public_leads`: leitura de leads (landing) com dados reais de desenvolvimento.

## Status de implementacao
- Seeds novos implementados e conectados no `prisma/seed.ts`.
- `020_locality.seed.ts` ampliado para carregar todos os `123` bairros de Imperatriz e preencher a matriz completa (`n * (n - 1)`) com:
  - valores diretos do dataset quando presentes;
  - estimativa deterministica por geodesia + calibracao da propria matriz quando houver `0/0`.
- Carga validada com sucesso via `npm run db:seed` em `Packages/Backend`.
- `eslint` do backend: sem erros.
- `typecheck` do backend: permanece com erro preexistente em `tests/contract/_helpers/contract-runtime.ts` (tipagem Redis), sem relacao com os seeds.
