# Module: support

## Objective
Atender FAQ e chamados do usuario autenticado.

## Endpoints
- `GET /v1/support/faqs`
- `GET /v1/support/tickets`
- `POST /v1/support/tickets`
- `GET /v1/support/tickets/{ticketId}`

## Notes
- Escopo de chamados: o usuario enxerga apenas tickets criados por ele.
- Prioridades aceitas: `low`, `medium`, `high`, `urgent`.
