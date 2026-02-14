# ROODI

Plataforma de entregas para Comerciantes e Entregadores (Riders), com app mobile único, painel administrativo e backend modular.

## Descrição
O Roodi permite que comércios acionem entregadores para corridas de entrega com controle operacional por estados, rastreabilidade por eventos e regras financeiras claras.

Princípios obrigatórios do projeto:
1. Sem geolocalização em tempo real no app.
2. Sem mapa offline no fluxo principal.
3. Tracking por estados/eventos de entrega.
4. Precificação centralizada no admin (`admin_only`).
5. Cotação por matriz de bairros + fallback determinístico.
6. Separação explícita entre `credits` e `payments`.

## Arquitetura
Pacotes principais:
1. `Packages/Backend`: API e regras de negócio.
2. `Packages/Frontend-admin`: painel de gestão.
3. `Packages/Frontend-rider`: app Flutter (contextos Rider e Commerce).
4. `Packages/Roodi`: landing page.

Estrutura macro do repositório:
```text
ROODI/
├── Docs/
│   ├── Prototype/
│   ├── openapi/
│   ├── database/
│   ├── config/
│   ├── data/
│   └── scripts/
└── Packages/
    ├── Backend/
    ├── Frontend-admin/
    ├── Frontend-rider/
    └── Roodi/
```

Referência detalhada: `Docs/07STRUCTURE.md`.

## Stack Tecnológica
1. Backend: TypeScript, Node.js, Express, Prisma, PostgreSQL, Redis, BullMQ, Socket.IO.
2. Frontend-admin: Next.js (App Router), TypeScript, Tailwind, shadcn/ui.
3. Frontend-rider: Flutter, Dart, Riverpod, GoRouter, Dio.
4. Landing: Next.js, TypeScript, Tailwind.

Stack completa e justificativas: `Docs/02STACK.md`.

## Pré-requisitos
1. Node.js 20+
2. npm 10+ (ou pnpm/yarn, se padronizado pelo time)
3. Flutter SDK estável + Dart
4. PostgreSQL 16+
5. Redis 7+
6. Git

## Configuração de Ambiente
Política de variáveis:
1. Backend usa `.env.development` e `.env.production`.
2. Frontends consomem backend por API e usam apenas variáveis públicas necessárias.

Chaves principais esperadas:
1. `INFINITEPAY_*`
2. `OPENWEATHER_API_KEY`
3. `TOMTOM_API_KEY`
4. `OPENROUTESERVICE_API_KEY`
5. `JWT_*`

Detalhes: `Docs/01PROJETO.md` e `Docs/02STACK.md`.

## Instruções de Desenvolvimento e Implementação
Status atual do repositório: documentação e protótipos já consolidados.  
Backlog oficial de implementação: `Docs/06TASKS.md`.

Ordem recomendada:
1. Executar `TASK-001` a `TASK-008` (estrutura + setup de ambiente).
2. Executar `TASK-009` a `TASK-016` (banco, migrations e seed).
3. Implementar backend (`TASK-017` a `TASK-026`).
4. Implementar frontend-admin e frontend-rider (`TASK-027` a `TASK-035`).
5. Fechar testes e hardening (`TASK-036` a `TASK-041`).

Bootstrap local recomendado (sem Docker):
```bash
# 1) Backend
cd Packages/Backend
npm install
npm run env:check

# 2) Frontend-admin
cd ../Frontend-admin
npm install

# 3) Frontend-rider
cd ../Frontend-rider
flutter pub get

# 4) Landing
cd ../Roodi
npm install
```

Baseline de qualidade (pre-commit):
```bash
# raiz do repositorio
npm install
npm run prepare
# em repositorio Git real:
# git config core.hooksPath .husky
```

Executar validações manuais:
```bash
npm --prefix Packages/Backend run lint
npm --prefix Packages/Backend run typecheck
npm --prefix Packages/Backend run test
npm --prefix Packages/Backend run build

npm --prefix Packages/Frontend-admin run lint
npm --prefix Packages/Frontend-admin run typecheck
npm --prefix Packages/Frontend-admin run build

cd Packages/Frontend-rider && flutter analyze && flutter test && cd ../..

npm --prefix Packages/Roodi run lint
npm --prefix Packages/Roodi run typecheck
npm --prefix Packages/Roodi run build
```

### Backend (após criação de `Packages/Backend`)
```bash
cd Packages/Backend
npm install
# configurar .env.development
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend-admin (após criação de `Packages/Frontend-admin`)
```bash
cd Packages/Frontend-admin
npm install
npm run dev
```

### Frontend-rider (após criação de `Packages/Frontend-rider`)
```bash
cd Packages/Frontend-rider
flutter pub get
flutter run
```

### Landing (após criação de `Packages/Roodi`)
```bash
cd Packages/Roodi
npm install
npm run dev
```

## Banco de Dados
Contratos oficiais:
1. Lógico: `Docs/10DATABASE.md`
2. Físico SQL: `Docs/database/roodi_schema.sql`
3. Prisma: `Docs/database/schema.prisma`

Guia rápido: `Docs/database/README.md`.

## API
Contrato HTTP oficial:
1. OpenAPI: `Docs/openapi/roodi.openapi.yaml`
2. Swagger JSON: `Docs/openapi/roodi.swagger.json`

Visualização:
1. Web: `https://editor.swagger.io/`
2. Local: `npx -y @redocly/cli preview-docs Docs/openapi/roodi.openapi.yaml --port 8080`

Guia: `Docs/openapi/README.md`.

## Seed e Dados de Exemplo
Usuários de desenvolvimento, seeds e ordem de migrations estão definidos em:
1. `Docs/06TASKS.md` (seções de seed e validação final)
2. `Docs/10DATABASE.md` (regras de dados e integridade)

## Fluxos e Páginas
1. Fluxos de produto: `Docs/04FLUXOS.md`
2. Páginas/rotas: `Docs/08PAGES.md`
3. Módulos e fronteiras: `Docs/09MODULOS.md`
4. User stories: `Docs/05USER-STORIES.md`

## Política de Docker
1. Docker não faz parte do fluxo padrão de desenvolvimento, execução local ou deploy.
2. Exceção permitida: somente `testcontainers` em testes de integração.

## Documentação Oficial
1. Projeto: `Docs/01PROJETO.md`
2. Stack: `Docs/02STACK.md`
3. Regras: `Docs/03REGRAS.md`
4. Fluxos: `Docs/04FLUXOS.md`
5. User stories: `Docs/05USER-STORIES.md`
6. Tasks: `Docs/06TASKS.md`
7. Estrutura: `Docs/07STRUCTURE.md`
8. Páginas: `Docs/08PAGES.md`
9. Módulos: `Docs/09MODULOS.md`
10. Banco: `Docs/10DATABASE.md`
11. Integração InfinitePay: `Docs/API-INFINITY-PAY.md`
