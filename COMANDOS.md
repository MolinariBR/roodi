Comando único para rodar no celular Android (modo debug), sem repetir setup manual:

```bash
npm run mobile:rider
```

Esse comando já faz:
1. sobe o backend (se não estiver rodando);
2. aplica `adb reverse tcp:3333 tcp:3333` automaticamente;
3. executa o app Flutter com `ROODI_API_BASE_URL=http://127.0.0.1:3333`.

Para ver os demais comandos disponíveis:

```bash
# Na raiz do projeto
npm run

# Scripts de um pacote específico
npm --prefix Packages/Backend run
npm --prefix Packages/Frontend-admin run
npm --prefix Packages/Roodi run
```

Para o app Flutter, veja no `pubspec.yaml` e rode manualmente:
```bash
cd Packages/Frontend-rider
flutter pub get
flutter run
```

Para acompanhar observabilidade do backend (logs de request, status, duração):
```bash
cd Packages/Backend
npm run dev
```
Depois faça uma requisição (ex.: `/health`) e veja os logs no terminal.



## flutter

0. Criar build release para Android (APK):
flutter build apk --release

1. Criar build release para Android (APK) apontando para o Backend VPS (Digital Ocean):
flutter build apk --release --dart-define=ROODI_API_BASE_URL=https://api.roodi.app

2. Rodar em modo debug apontado para o Backend VPS (Digital Ocean):
flutter run --dart-define=ROODI_API_BASE_URL=https://api.roodi.app

## VPS (producao) - rebuild incremental + PM2

Objetivo: depois de um `git pull` na VPS, rebuildar e restartar **apenas** o que mudou, sem rodar o deploy completo.

### (A) Script incremental (recomendado)

```bash
cd /opt/roodi/app

# menu interativo (1-4)
sudo bash scripts/roodi-rebuild.sh

# direto por componente
sudo bash scripts/roodi-rebuild.sh --backend
sudo bash scripts/roodi-rebuild.sh --backend --seed
sudo bash scripts/roodi-rebuild.sh --admin
sudo bash scripts/roodi-rebuild.sh --landing
sudo bash scripts/roodi-rebuild.sh --all --seed

# opcional: atualizar codigo antes
sudo bash scripts/roodi-rebuild.sh --all --seed --pull

# opcional: se deps nao mudaram
sudo bash scripts/roodi-rebuild.sh --all --seed --skip-install
```

### (B) Comandos diretos (sem script)

1) Garantir `.env.production` centralizado (symlink do Backend):
```bash
cd /opt/roodi/app
ln -sf /opt/roodi/app/Packages/Backend/.env.production /opt/roodi/app/Packages/Frontend-admin/.env.production
ln -sf /opt/roodi/app/Packages/Backend/.env.production /opt/roodi/app/Packages/Roodi/.env.production
```

2) Backend (migrations + prisma generate + seed opcional + build + restart):
```bash
cd /opt/roodi/app/Packages/Backend
npm ci
ROODI_ENV=production NODE_ENV=production npm run db:migrate
npx prisma generate --schema prisma/schema.prisma

# opcional (dados demo / usuarios seed)
ROODI_ENV=production NODE_ENV=production npm run db:seed

npm run build
pm2 restart roodi-backend --update-env
pm2 save
```

3) Frontend-admin (build + restart):
```bash
cd /opt/roodi/app/Packages/Frontend-admin
pm2 stop roodi-admin || true
npm ci
rm -rf .next
npm run build
pm2 restart roodi-admin --update-env
pm2 save
```

4) Landing (build + restart):
```bash
cd /opt/roodi/app/Packages/Roodi
pm2 stop roodi-landing || true
npm ci
rm -rf .next
npm run build
pm2 restart roodi-landing --update-env
pm2 save
```

### PM2: operacao rapida

```bash
pm2 status
pm2 logs roodi-backend --lines 200
pm2 logs roodi-admin --lines 200
pm2 logs roodi-landing --lines 200

# se algum app nao existir no pm2 (recarrega tudo pelo ecosystem)
pm2 startOrReload /opt/roodi/ecosystem.config.cjs --update-env
pm2 save
```

### Healthcheck

```bash
curl -fsS http://127.0.0.1:3333/health
curl -fsS https://api.roodi.app/health
```
