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