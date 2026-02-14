# Module: pricing

## Objective
Implementar motor de cotacao oficial do frete com base em regras ativas do admin.

## Endpoint implemented
- `POST /v1/commerce/quotes`

## Responsibilities
- Carregar regra de preco ativa no banco.
- Calcular zona por distancia e addons por urgencia/condicoes.
- Resolver clima com fallback deterministico.
- Persistir `quotes` e `quote_provider_attempts`.
- Retornar erros de negocio: `DISTANCE_TIME_UNAVAILABLE`, `OUT_OF_COVERAGE`.
