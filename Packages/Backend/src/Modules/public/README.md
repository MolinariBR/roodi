# Module: public

## Objective
Expor endpoints publicos para landing page: captura de leads e consulta de documentos legais ativos.

## Endpoints
1. `POST /v1/public/leads`
2. `GET /v1/public/legal/{documentType}`

## Notes
1. Documentos legais retornam sempre a versao ativa mais recente por `documentType`.
2. Endpoints publicos nao exigem token.
