Observação importante

Para funcionar em runtime, configure:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_API_BASE_URL
BACKEND_ADMIN_VALIDATION_TOKEN


## Deploy

1. Hospedagem: Digital Ocean.
 * SO:  Ubuntu 24.04 (LTS) x64
 * CPU: 1 Intel vCPU
 * RAM: 2 GB Memory
 * Disk: 70 GB Disk
2. Dominio: name.com.
 * api.roodi.app (frontend-backend) e consumido por: Frontend-rider e Frontend-admin.
 * admin.roodi.app (frontend-admin).

API KEY RESEND: re_g3oXE1Ct_7hJTiDMqiPTgu7vtQm2xormY




 sONHOS2829S

## Planejamento Deploy

### Descrição
Configurar ambiente para deploy do backend e Frontend-admin na Digital Ocean, garantindo acesso remoto, configuração de variáveis de ambiente e domínio.

### Infra

1. Hospedagem: Digital Ocean.
 * SO:  Ubuntu 24.04 (LTS) x64
 * CPU: 1 Intel vCPU
 * RAM: 2 GB Memory
 * Disk: 70 GB Disk
2. Dominio: name.com.
 * roodi.app (Landing Page "Roodi")
 * api.roodi.app (frontend-backend) e consumido por: Frontend-rider e Frontend-admin.
 * admin.roodi.app (frontend-admin).

### Script de Deploy
Configurar scritp de deploy "roodi-deploy.sh" para automatizar:
1. Configurar Nginx para roodi.app, api.roodi.app e admin.roodi.app.
2. Certificado SSL via Let's Encrypt.
3. Configurar PM2 para rodar backend e frontend-admin, Landing Page (Roodi).
4. Configurar variáveis de ambiente (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_API_BASE_URL, BACKEND_ADMIN_VALIDATION_TOKEN).

PRIORIDADE! Analiser, Revisar, Mapear, anslisar o projeto para deploy via Github Actions (CI/CD) para Digital Ocean, com deploy automatizado a cada push na branch main.

1. OBS: Deploy completo via Github Action (CI/CD) para Digital Ocean.
2. OBS: Deploy parcial das atualizações sem Build completo

IP DIGITAL OCEAN: 129.212.198.174



roodi.app = Landing Page "Roodi"
api.roodi.app = Backend
admin.roodi.app = Frontend-admin


teste

# IMPORTANTE

Esses erros de Next (`Failed to find Server Action`, `digest`, `workers`) quase sempre são **build “misturado”**: você rebuildou enquanto o `next start` ainda estava servindo e o `.next` foi sobrescrito no meio (ou você está buildando em um diretório diferente do `cwd` que o PM2 usa).

## Corrigir agora (VPS)
1) Descubra onde o PM2 está rodando:
```bash
pm2 describe roodi-admin | rg -n "exec cwd|pm_exec_path|script args" || pm2 describe roodi-admin | sed -n '1,120p'
pm2 describe roodi-landing | rg -n "exec cwd|pm_exec_path|script args" || pm2 describe roodi-landing | sed -n '1,120p'
```

2) No **mesmo repo/cwd** que aparecer (ex.: `/root/roodi`), rode:
```bash
cd /root/roodi   # troque pelo exec cwd real que apareceu acima
git pull

pm2 stop roodi-admin || true
pm2 stop roodi-landing || true

cd Packages/Frontend-admin
rm -rf .next
npm ci
npm run build

cd ../Roodi
rm -rf .next
npm ci
npm run build

pm2 restart roodi-admin --update-env
pm2 restart roodi-landing --update-env
pm2 save
```

3) Depois faça **hard refresh** no browser (Ctrl+F5) em `admin.roodi.app` e `roodi.app`.

## Para não acontecer de novo
Eu atualizei o `scripts/roodi-rebuild.sh` para **parar os apps Next antes do build** (evita sobrescrever `.next` com o servidor rodando). Então, após `git pull`, prefira:
```bash
sudo bash scripts/roodi-rebuild.sh --admin
sudo bash scripts/roodi-rebuild.sh --landing
```