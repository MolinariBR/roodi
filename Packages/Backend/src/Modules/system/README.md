# Module: system

## Objective
Expor status global da plataforma e estado de manutencao.

## Endpoints
- `GET /v1/system/status` (publico)
- `GET /v1/admin/system/maintenance` (admin)
- `PUT /v1/admin/system/maintenance` (admin)
- `GET /v1/admin/system/flags` (admin)
- `PUT /v1/admin/system/flags/{flagKey}` (admin)
- `GET /v1/admin/dashboard` (admin)

## Runtime data
- `system_runtime_state`: estado global (maintenance, force update, versao minima).
- `system_flags`: flags operacionais usadas para compor status `ok/degraded`.
