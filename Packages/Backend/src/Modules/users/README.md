# Module: users

## Objective
Gerenciar perfil do usuario autenticado (`/v1/me`) e preferencias de notificacao (`/v1/me/settings/notifications`).

## Public contract
1. `GET /v1/me`
2. `PATCH /v1/me`
3. `GET /v1/me/settings/notifications`
4. `PATCH /v1/me/settings/notifications`

## Scope
1. Leitura e atualizacao de dados pessoais.
2. Leitura e atualizacao de enderecos base/residencial.
3. Leitura e atualizacao de conta bancaria principal.
4. Leitura e atualizacao de veiculo principal do rider.
5. Leitura e atualizacao de preferencias de notificacao.

## Persistence
1. `users`
2. `user_addresses`
3. `user_bank_accounts`
4. `rider_vehicles`
5. `rider_profiles`
6. `commerce_profiles`
7. `user_notification_settings`
8. `audit_logs` (via middleware de auditoria em operacoes de escrita)
