# Module: notifications

## Objective
Entregar notificacoes in-app para o usuario autenticado e controlar status de leitura.

## Public contract
1. `GET /v1/notifications`
2. `PATCH /v1/notifications/{notificationId}/read`
3. `POST /v1/notifications/mark-all-read`

## Scope
1. Listagem paginada de notificacoes com filtro por status (`all`, `unread`, `read`).
2. Marcacao de notificacao individual como lida.
3. Marcacao em lote de todas as notificacoes como lidas.

## Persistence
1. `notifications`
2. `audit_logs` (via middleware de auditoria em operacoes de escrita)
