# Module: auth

## Objective
Implementar autenticacao por credenciais locais com sessao JWT + refresh token, seguindo o contrato OpenAPI.

## Public contract
1. `POST /v1/auth/register`
2. `POST /v1/auth/login`
3. `POST /v1/auth/refresh`
4. `POST /v1/auth/logout`
5. `POST /v1/auth/password/forgot`
6. `POST /v1/auth/password/otp/verify`
7. `POST /v1/auth/password/reset`

## Scope
1. Cadastro de `rider` e `commerce`.
2. Login por `email + password + role`.
3. Rotacao de refresh token com revogacao do token anterior.
4. Logout por revogacao de refresh token.
5. Recuperacao de senha via OTP com expiracao e limite de tentativas.
6. Reset de senha com `reset_token` de curta duracao.

## Persistence
1. `users`
2. `user_identities`
3. `user_notification_settings`
4. `auth_refresh_tokens`
5. `auth_otp_challenges`
6. `auth_otp_attempts`
7. `audit_logs` (via middleware de auditoria para acoes criticas)
