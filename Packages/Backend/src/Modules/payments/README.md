# Module: payments

## Objective
Gerenciar compra de creditos via InfinitePay, conciliacao de pagamento e processamento idempotente de webhook.

## Endpoints
1. `POST /v1/commerce/credits/purchase-intents`
2. `POST /v1/commerce/payments/{paymentId}/check`
3. `POST /v1/payments/infinitepay/webhook`

## Notes
1. Webhook com idempotencia persistida em `payment_webhook_events`.
2. Credito em carteira ocorre uma unica vez por `payment_intent`.
3. Fechamento financeiro do pedido consolida `FP = RE + CP`.
