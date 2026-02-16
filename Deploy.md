## Deploy

## 1. Objetivo
Padronizar o deploy manual em producao para:
1. `Packages/Backend` (API).
2. `Packages/Frontend-admin` (painel admin).
3. `Packages/Roodi` (landing page).

Sem Docker no fluxo de producao. Sem CI/CD neste primeiro momento.

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

## 6. Variaveis de ambiente
Arquivos de referencia no repo:
1. `Packages/Backend/.env.example`
2. `Packages/Frontend-admin/.env.example`
3. `Packages/Roodi/.env.example`

Arquivos de producao esperados:
1. `Packages/Backend/.env.production`
2. `Packages/Frontend-admin/.env.production`
3. `Packages/Roodi/.env.production`

Minimo para subir em producao:
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

## 8. Setup inicial do servidor (uma vez)
1. Criar usuario de deploy (sem usar root para app).
2. Configurar chave SSH.
3. Ativar firewall:
   - liberar `22`, `80`, `443`.
4. Instalar stack base (item 4).
5. Clonar repositorio em `/opt/roodi/app`.
6. Instalar dependencias:
   - `npm install` na raiz.
   - `npm install` em `Packages/Backend`.
   - `npm install` em `Packages/Frontend-admin`.
   - `npm install` em `Packages/Roodi`.
7. Preparar banco:
   - `npm --prefix Packages/Backend run db:migrate`
   - `npm --prefix Packages/Backend run db:seed` (opcional em producao, usar com criterio).

## 9. Build e processos (PM2)
Build:
1. `npm --prefix Packages/Backend run build`
2. `npm --prefix Packages/Frontend-admin run build`
3. `npm --prefix Packages/Roodi run build`

Exemplo de `ecosystem.config.cjs`:
```js
module.exports = {
  apps: [
    {
      name: "roodi-backend",
      cwd: "/opt/roodi/app/Packages/Backend",
      script: "dist/src/main.js",
      interpreter: "node",
      env: { NODE_ENV: "production" },
    },
    {
      name: "roodi-admin",
      cwd: "/opt/roodi/app/Packages/Frontend-admin",
      script: "npm",
      args: "run start",
      env: { NODE_ENV: "production", PORT: 3001 },
    },
    {
      name: "roodi-landing",
      cwd: "/opt/roodi/app/Packages/Roodi",
      script: "npm",
      args: "run start",
      env: { NODE_ENV: "production", PORT: 3002 },
    },
  ],
};
```

Comandos:
1. `pm2 start /opt/roodi/ecosystem.config.cjs`
2. `pm2 save`
3. `pm2 startup`

## 10. Nginx e SSL
Configurar 3 virtual hosts com proxy reverso:
1. `api.roodi.app` -> `http://127.0.0.1:3333`
2. `admin.roodi.app` -> `http://127.0.0.1:3001`
3. `roodi.app` + `www.roodi.app` -> `http://127.0.0.1:3002`

Aplicar SSL:
1. `sudo certbot --nginx -d api.roodi.app -d admin.roodi.app -d roodi.app -d www.roodi.app`

Validar renovacao automatica:
1. `sudo systemctl status certbot.timer`

## 11. Fluxo de deploy manual via GitHub (sem CI/CD)
Branch sugerida:
1. `main` = producao.

Passos por release:
1. `git fetch --all --prune`
2. `git checkout main`
3. `git pull origin main`
4. `npm install` (raiz e pacotes alterados)
5. `npm --prefix Packages/Backend run db:migrate`
6. Builds dos 3 pacotes
7. `pm2 reload all`
8. Validacao rapida:
   - `curl https://api.roodi.app/health`
   - abrir `https://admin.roodi.app`
   - abrir `https://roodi.app`

## 12. Script alvo `roodi-deploy.sh`
O script deve automatizar:
1. Pull da branch `main`.
2. Install de dependencias.
3. Migracoes.
4. Build backend/admin/landing.
5. Reload do PM2.
6. Healthcheck final.

## 13. Rollback
Em caso de erro de release:
1. Voltar para commit/tag anterior (`git checkout <tag-ou-commit>`).
2. Rebuild dos pacotes.
3. `pm2 reload all`.
4. Se migracao nao for retrocompativel, aplicar plano de rollback de schema antes da troca.

## 14. Backup e operacao
1. Backup diario do PostgreSQL (`pg_dump`) para `/opt/roodi/shared/backups`.
2. Politica de retencao (ex.: 7 diarios, 4 semanais).
3. Log rotation do PM2 (`pm2 install pm2-logrotate`).
4. Monitorar uso de CPU/RAM/disco e latencia dos endpoints criticos.

## 15. Checklist de Go Live
1. DNS propagado para os 4 registros.
2. SSL valido nos 3 dominios.
3. Backend responde `200` no healthcheck.
4. Frontend-admin autenticando e consumindo `https://api.roodi.app`.
5. Landing publicada em `https://roodi.app`.
6. PostgreSQL e Redis estaveis.
7. Backup e restauracao testados.
