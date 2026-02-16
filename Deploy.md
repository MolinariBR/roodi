## Deploy

## 1. Objetivo
Padronizar o deploy em producao para:
1. `Packages/Backend` (API).
2. `Packages/Frontend-admin` (painel admin).
3. `Packages/Roodi` (landing page).

Sem Docker no fluxo de producao. Sem CI/CD neste primeiro momento.

Este deploy deve ser feito por **um unico script**:
1. `scripts/roodi-vps.sh`

## 2. Topologia e dominios
Repositorio: `https://github.com/MolinariBR/roodi.git`

IP atual (DigitalOcean): `129.212.198.174`

Dominios:
1. `api.roodi.app` -> Backend (Node/Express, porta interna `3333`).
2. `admin.roodi.app` -> Frontend-admin (Next.js, porta interna `3001`).
3. `roodi.app` + `www.roodi.app` -> Landing (Next.js, porta interna `3002`).

Observacao importante:
1. `api.roodi.app` nao hospeda frontend.
2. App mobile (`Frontend-rider`) consome `api.roodi.app` e nao precisa de deploy web no servidor.

## 3. Infra
Atual:
1. Provedor: DigitalOcean.
2. SO: Ubuntu 24.04 LTS x64.
3. CPU: 1 vCPU.
4. RAM: 2 GB.
5. Disco: 70 GB.

Recomendacao para estabilidade de producao:
1. Minimo recomendado: 2 vCPU, 4 GB RAM.
2. Com 1 vCPU/2 GB, usar monitoramento de memoria e swap.
3. Banco e cache podem ficar no mesmo host no inicio, mas o ideal e migrar PostgreSQL/Redis para servicos gerenciados conforme crescimento.

## 4. Dependencias obrigatorias no servidor
1. `git`
2. `curl`
3. `nginx`
4. `certbot` + `python3-certbot-nginx`
5. `node` 20 LTS + `npm`
6. `pm2`
7. `postgresql` (ou instancia externa)
8. `redis-server` (ou instancia externa)

## 5. Estrutura sugerida no host
```text
/opt/roodi/
  ├── app/                      # clone do repositorio
  ├── shared/
  │   ├── logs/
  │   └── backups/
  └── ecosystem.config.cjs
```

## 6. Variaveis de ambiente (centralizadas no Backend)
Fonte unica de verdade:
1. `Packages/Backend/.env.development`
2. `Packages/Backend/.env.production`

Templates de referencia no repo (para saber quais variaveis cada app precisa):
1. `Packages/Backend/.env.example`
2. `Packages/Frontend-admin/.env.example`
3. `Packages/Roodi/.env.example`

Como os outros pacotes consomem as variaveis:
1. `Packages/Frontend-admin/.env.production` deve ser um symlink para `Packages/Backend/.env.production`.
2. `Packages/Roodi/.env.production` deve ser um symlink para `Packages/Backend/.env.production`.
3. (Opcional) fazer o mesmo para `.env.development`.

Minimo para subir em producao (dentro do `.env.production` do Backend):
1. Backend:
   - `NODE_ENV=production`
   - `PORT=3333`
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CORS_ALLOWED_ORIGINS=https://admin.roodi.app,https://roodi.app`
   - `ADMIN_WEB_URL=https://admin.roodi.app`
   - `LANDING_WEB_URL=https://roodi.app`
2. Frontend-admin:
   - `NEXT_PUBLIC_APP_ENV=production`
   - `NEXT_PUBLIC_WEB_URL=https://admin.roodi.app`
   - `NEXT_PUBLIC_API_BASE_URL=https://api.roodi.app`
3. Landing:
   - `NEXT_PUBLIC_APP_ENV=production`
   - `NEXT_PUBLIC_SITE_URL=https://roodi.app`
   - `NEXT_PUBLIC_API_BASE_URL=https://api.roodi.app`

## 7. DNS
No provedor de dominio (`name.com`), criar/validar:
1. `A api.roodi.app -> 129.212.198.174`
2. `A admin.roodi.app -> 129.212.198.174`
3. `A roodi.app -> 129.212.198.174`
4. `A www.roodi.app -> 129.212.198.174`

## 8. Deploy (script unico)
Pre-requisitos antes de rodar:
1. DNS apontando para o IP da VPS (secao 7).
2. Portas liberadas: `22`, `80`, `443`.
3. `Packages/Backend/.env.production` presente (fonte unica de verdade).

Passo a passo (primeira vez ou redeploy):
1. `cd /opt/roodi`
2. (se ainda nao existir) `git clone https://github.com/MolinariBR/roodi.git app`
3. `cd /opt/roodi/app`
4. `git checkout main && git pull`
5. Rodar o deploy completo (inclui: apt, swap, ufw, postgres local, migrations, build, PM2, Nginx e SSL):
   - `sudo bash scripts/roodi-vps.sh --email SEU_EMAIL`

Rerun economico (quando a VPS ja esta preparada e voce so quer atualizar codigo/migrations/build):
1. `cd /opt/roodi/app && git pull`
2. `sudo bash scripts/roodi-vps.sh --email SEU_EMAIL --skip-apt --skip-swap --skip-ufw`

Observacoes:
1. O script cria symlink de `Packages/Frontend-admin/.env.production` e `Packages/Roodi/.env.production` apontando para `Packages/Backend/.env.production`.
2. Se `DATABASE_URL` apontar para Postgres remoto (host diferente de `localhost`/`127.0.0.1`), o script nao tenta criar role/db.
3. O script escreve/atualiza:
   - `/opt/roodi/ecosystem.config.cjs` (PM2)
   - `/etc/nginx/sites-available/*.conf` + symlinks em `sites-enabled`
   - SSL via `certbot --nginx` (LetsEncrypt)

Validacao rapida depois do deploy:
1. `pm2 status`
2. `curl -fsS http://127.0.0.1:3333/health`
3. Abrir:
   - `https://api.roodi.app/health`
   - `https://admin.roodi.app`
   - `https://roodi.app`

## 9. Rollback
Em caso de erro de release:
1. Voltar para commit/tag anterior (`git checkout <tag-ou-commit>`).
2. Rodar novamente o script (build/migrations/PM2/Nginx):
   - `sudo bash scripts/roodi-vps.sh --email SEU_EMAIL --skip-apt --skip-swap --skip-ufw`
4. Se migracao nao for retrocompativel, aplicar plano de rollback de schema antes da troca.

## 10. Backup e operacao
1. Backup diario do PostgreSQL (`pg_dump`) para `/opt/roodi/shared/backups`.
2. Politica de retencao (ex.: 7 diarios, 4 semanais).
3. Log rotation do PM2 (`pm2 install pm2-logrotate`).
4. Monitorar uso de CPU/RAM/disco e latencia dos endpoints criticos.

## 11. Checklist de Go Live
1. DNS propagado para os 4 registros.
2. SSL valido nos 3 dominios.
3. Backend responde `200` no healthcheck.
4. Frontend-admin autenticando e consumindo `https://api.roodi.app`.
5. Landing publicada em `https://roodi.app`.
6. PostgreSQL e Redis estaveis.
7. Backup e restauracao testados.
