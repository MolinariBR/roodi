# Module: credits

## Objective
Gerenciar carteira e extrato de creditos para usuarios do tipo `commerce`.

## Endpoints
1. `GET /v1/commerce/credits/balance`
2. `GET /v1/commerce/credits/ledger`

## Notes
1. A carteira e criada automaticamente quando nao existe.
2. Saldo e extrato seguem as tabelas `credits_wallets` e `credits_ledger`.
