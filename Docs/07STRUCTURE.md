# ESTRUTURA DE DIRETORIOS E ARQUIVOS DO PROJETO ROODI

## Objetivo
Definir a estrutura oficial do repositorio em dois niveis:
1. Estrutura atual de documentacao e prototipo (ja existente).
2. Estrutura alvo de implementacao dos pacotes (`Packages`) alinhada a `01PROJETO`, `02STACK`, `03REGRAS` e `04FLUXOS`.

## 1) Estrutura Atual (Documentacao e Prototipo)

```text
ROODI/
├── Docs/
│   ├── 01PROJETO.md
│   ├── 02STACK.md
│   ├── 03REGRAS.md
│   ├── 04FLUXOS.md
│   ├── 05USER-STORIES.md
│   ├── 06TASKS.md
│   ├── 07STRUCTURE.md
│   ├── 08PAGES.md
│   ├── 09MODULOS.md
│   ├── 10DATABASE.md
│   ├── API-INFINITY-PAY.md
│   ├── database/
│   │   ├── README.md
│   │   ├── schema.prisma
│   │   └── roodi_schema.sql
│   ├── openapi/
│   │   ├── README.md
│   │   ├── roodi.openapi.yaml
│   │   └── roodi.swagger.json
│   ├── config/
│   │   ├── freight-fallback-policy.yaml
│   │   └── freight-fallback-policy.json
│   ├── data/
│   │   ├── imperatriz_bairros_matriz.json
│   │   └── imperatriz_bairros_geocode_cache.json
│   ├── scripts/
│   │   └── generate_imperatriz_bairro_matrix.py
│   └── Prototype/
│       ├── README.md
│       ├── Common/
│       │   ├── Splash.html
│       │   ├── 01Onboarding.html
│       │   ├── 02.Onboarding.html
│       │   ├── 03Onboarding.html
│       │   ├── Login.html
│       │   ├── Register.html
│       │   ├── ForgotPassword.html
│       │   ├── OTP.html
│       │   ├── ResetPassword.html
│       │   ├── Notifications.html
│       │   ├── Support.html
│       │   ├── Error.html
│       │   ├── Mantenance.html
│       │   └── Update.html
│       ├── Rider/
│       │   ├── Home.html
│       │   ├── Orders.html
│       │   ├── Profile.html
│       │   ├── home-flow.js
│       │   ├── orders-sheet.js
│       │   ├── profile-sheet.js
│       │   └── profile-menu.js
│       ├── Commerce/
│       │   ├── Home.html
│       │   ├── CreateCall.html
│       │   ├── Tracking.html
│       │   ├── History.html
│       │   ├── Clients.html
│       │   ├── Credits.html
│       │   ├── Products.html
│       │   ├── Profile.html
│       │   ├── create-call-pricing.js
│       │   └── home-menu.js
│       └── design-system/
│           ├── tokens.css
│           ├── design.css
│           ├── tailwind-theme.js
│           ├── check-design-system.sh
│           └── CHECKLIST.md
├── IDEIAS.md
├── README.md
└── bairro.md
```

## 2) Estrutura Alvo de Implementacao (Packages)

```text
ROODI/
└── Packages/
    ├── Backend/
    │   ├── .env.development
    │   ├── .env.production
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── migrations/
    │   └── src/
    │       ├── Core/
    │       │   ├── bootstrap/
    │       │   ├── config/
    │       │   ├── database/
    │       │   ├── auth-base/
    │       │   ├── http/
    │       │   ├── observability/
    │       │   ├── integrations/
    │       │   └── shared/
    │       └── Modules/
    │           ├── system/
    │           ├── auth/
    │           ├── users/
    │           ├── clients/
    │           ├── products/
    │           ├── locality/
    │           ├── pricing/
    │           ├── credits/
    │           ├── payments/
    │           ├── orders/
    │           ├── dispatch/
    │           ├── tracking/
    │           ├── notifications/
    │           └── support/
    ├── Frontend-admin/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── next.config.ts
    │   ├── postcss.config.js
    │   ├── tailwind.config.ts
    │   └── src/
    │       ├── Core/
    │       │   ├── app-shell/
    │       │   ├── routing/
    │       │   ├── api-client/
    │       │   ├── auth/
    │       │   ├── design-system/
    │       │   │   ├── README.md
    │       │   │   ├── tokens/
    │       │   │   │   ├── color.tokens.css
    │       │   │   │   ├── spacing.tokens.css
    │       │   │   │   ├── typography.tokens.css
    │       │   │   │   ├── radius.tokens.css
    │       │   │   │   ├── shadow.tokens.css
    │       │   │   │   └── motion.tokens.css
    │       │   │   ├── themes/
    │       │   │   │   ├── light.css
    │       │   │   │   ├── dark.css
    │       │   │   │   └── theme-mode.ts
    │       │   │   ├── components/
    │       │   │   │   ├── primitives/
    │       │   │   │   ├── composites/
    │       │   │   │   └── feedback/
    │       │   │   └── index.ts
    │       │   ├── state/
    │       │   └── shared/
    │       └── Modules/
    │           ├── auth/
    │           ├── dashboard/
    │           ├── users/
    │           ├── clients/
    │           ├── orders/
    │           ├── tracking/
    │           ├── pricing/
    │           ├── credits/
    │           ├── payments/
    │           ├── products/
    │           ├── notifications/
    │           ├── support/
    │           └── system/
    ├── Frontend-rider/
    │   ├── pubspec.yaml
    │   ├── analysis_options.yaml
    │   └── lib/
    │       ├── main.dart
    │       ├── Core/
    │       │   ├── app-shell/
    │       │   ├── navigation/
    │       │   ├── api-client/
    │       │   ├── auth/
    │       │   ├── state/
    │       │   ├── design-system/
    │       │   │   ├── README.md
    │       │   │   ├── App_Theme.dart
    │       │   │   ├── tokens/
    │       │   │   │   ├── color_tokens.dart
    │       │   │   │   ├── spacing_tokens.dart
    │       │   │   │   ├── typography_tokens.dart
    │       │   │   │   ├── radius_tokens.dart
    │       │   │   │   ├── elevation_tokens.dart
    │       │   │   │   └── motion_tokens.dart
    │       │   │   ├── themes/
    │       │   │   │   ├── app_light_theme.dart
    │       │   │   │   ├── app_dark_theme.dart
    │       │   │   │   └── theme_extensions.dart
    │       │   │   ├── theme-mode/
    │       │   │   │   ├── theme_mode_controller.dart
    │       │   │   │   ├── theme_mode_storage.dart
    │       │   │   │   └── theme_mode_resolver.dart
    │       │   │   ├── widgets/
    │       │   │   │   ├── primitives/
    │       │   │   │   ├── composites/
    │       │   │   │   └── feedback/
    │       │   │   └── app_theme_provider.dart
    │       │   └── shared/
    │       └── Modules/
    │           ├── auth/
    │           ├── session/
    │           ├── rider-home-flow/
    │           ├── rider-orders-history/
    │           ├── rider-profile/
    │           ├── commerce-home/
    │           ├── commerce-create-call/
    │           ├── commerce-tracking/
    │           ├── commerce-history/
    │           ├── clients/
    │           ├── credits/
    │           ├── products/
    │           ├── notifications/
    │           └── support/
    └── Roodi/
        ├── package.json
        ├── tsconfig.json
        ├── next.config.ts
        ├── postcss.config.js
        ├── tailwind.config.ts
        └── src/
            ├── Core/
            │   ├── app-shell/
            │   ├── design-system/
            │   │   ├── README.md
            │   │   ├── tokens/
            │   │   │   ├── color.tokens.css
            │   │   │   ├── spacing.tokens.css
            │   │   │   ├── typography.tokens.css
            │   │   │   ├── radius.tokens.css
            │   │   │   ├── shadow.tokens.css
            │   │   │   └── motion.tokens.css
            │   │   ├── themes/
            │   │   │   ├── light.css
            │   │   │   ├── dark.css
            │   │   │   └── theme-mode.ts
            │   │   ├── components/
            │   │   │   ├── primitives/
            │   │   │   ├── composites/
            │   │   │   └── feedback/
            │   │   └── index.ts
            │   ├── seo/
            │   └── shared/
            └── Modules/
                ├── marketing/
                ├── leads/
                ├── legal/
                └── seo-analytics/
```

## 3) Estrutura Interna Padrao de Modulo

Todo modulo em `Packages/Backend/src/Modules/*`, `Packages/Frontend-admin/src/Modules/*`, `Packages/Frontend-rider/lib/Modules/*` e `Packages/Roodi/src/Modules/*` segue este formato:

```text
Modules/<nome-modulo>/
├── domain/
├── application/
├── infra/
├── presentation/
├── tests/
└── README.md
```

## 4) Arquivos de Configuracao e Dados (Regra de Frete)

```text
Docs/config/
├── freight-fallback-policy.yaml
└── freight-fallback-policy.json

Docs/data/
├── imperatriz_bairros_matriz.json
└── imperatriz_bairros_geocode_cache.json

Docs/scripts/
└── generate_imperatriz_bairro_matrix.py
```

## 5) Regras Estruturais Obrigatorias

1. `Frontend-rider` e app unico para Rider e Commerce (contextos de uso).
2. Nao incluir dependencia obrigatoria de mapa em runtime do app.
3. Distancia/tempo de frete vem de matriz por bairros + fallback deterministico.
4. `tracking` representa estado/evento operacional, nao rastreio GPS continuo.
5. `credits` e separado de `payments`:
   - `credits`: saldo/extrato/reserva/debito.
   - `payments`: cobranca, webhook, conciliacao e repasse.
6. Dependencia entre modulos somente por contrato publico.
7. O unico contrato visual obrigatorio entre Flutter e Web e a paleta de cores semanticas.
8. Rider, Admin e Landing devem suportar tema claro/escuro com selecao automatica pelo sistema.

## 6) Design System Multi-Frontend (Obrigatorio)

### 6.1 Fonte canonica de cores (unico contrato cross-platform)

1. Base inicial da paleta: `Docs/Prototype/design-system/tokens.css`.
2. Regras visuais base: `Docs/Prototype/design-system/design.css`.
3. Mapeamento Tailwind inicial: `Docs/Prototype/design-system/tailwind-theme.js`.
4. Qualquer ajuste de cor semantica precisa ser refletido nos 3 pacotes: Rider, Frontend-admin e Roodi.
5. Espacamento, tipografia, raio, sombras e componentes NAO sao compartilhados entre Flutter e Web.

### 6.2 Rider (Flutter)

Arquivos obrigatorios no Design System do app mobile:
1. `Packages/Frontend-rider/lib/Core/design-system/App_Theme.dart`.
2. `Packages/Frontend-rider/lib/Core/design-system/tokens/color_tokens.dart`.
3. `Packages/Frontend-rider/lib/Core/design-system/themes/app_light_theme.dart`.
4. `Packages/Frontend-rider/lib/Core/design-system/themes/app_dark_theme.dart`.
5. `Packages/Frontend-rider/lib/Core/design-system/theme-mode/theme_mode_controller.dart`.
6. `Packages/Frontend-rider/lib/Core/design-system/theme-mode/theme_mode_resolver.dart`.

Regras de tema do Rider:
1. `App_Theme.dart` expoe `lightTheme`, `darkTheme` e `themeMode`.
2. Tema padrao deve usar `ThemeMode.system` (modo automatico nativo).
3. `theme_mode_resolver.dart` resolve preferencia do usuario x preferencia do sistema.
4. Tokens nao podem ser hardcoded nos widgets de tela.
5. So `color_tokens.dart` precisa manter equivalencia semantica com Admin/Landing.
6. Tipografia, dimensoes e composicao de widgets seguem padrao Flutter nativo.

### 6.3 Frontend-admin (Web)

Arquivos obrigatorios:
1. `Packages/Frontend-admin/src/Core/design-system/tokens/color.tokens.css`.
2. `Packages/Frontend-admin/src/Core/design-system/themes/light.css`.
3. `Packages/Frontend-admin/src/Core/design-system/themes/dark.css`.
4. `Packages/Frontend-admin/src/Core/design-system/themes/theme-mode.ts`.

Regras:
1. Tema automatico por `prefers-color-scheme`, com opcao de override do usuario.
2. Componentes de tela consomem apenas tokens sem valores hex diretos.
3. `tailwind.config.ts` deve mapear para tokens sem duplicacao de paleta.
4. O contrato com Flutter e somente de cor semantica; restante e independente.

### 6.4 Landing page (Roodi)

Arquivos obrigatorios:
1. `Packages/Roodi/src/Core/design-system/tokens/color.tokens.css`.
2. `Packages/Roodi/src/Core/design-system/themes/light.css`.
3. `Packages/Roodi/src/Core/design-system/themes/dark.css`.
4. `Packages/Roodi/src/Core/design-system/themes/theme-mode.ts`.

Regras:
1. Landing compartilha fundacao de tokens com Frontend-admin.
2. Pode ter componentes de marketing proprios, sem quebrar tokens base.
3. Modo claro/escuro automatico tambem obrigatorio.
4. Com Flutter, somente a paleta de cores e comum.

## 7) Componentes por Plataforma (Sem compartilhamento Flutter x Web)

### 7.1 Flutter (Frontend-rider)

1. Widgets vivem em `Packages/Frontend-rider/lib/Core/design-system/widgets`.
2. O catalogo de widgets mobile e exclusivo do Flutter.
3. Estrutura, composicao e comportamento seguem Material/Flutter.

### 7.2 Web (Frontend-admin e Roodi)

1. Componentes vivem em `Packages/Frontend-admin/src/Core/design-system/components` e `Packages/Roodi/src/Core/design-system/components`.
2. Admin e Landing podem compartilhar base web (mesma tecnologia), com variacao por contexto.
3. Estrutura, composicao e comportamento seguem padrao React/Next + Tailwind/shadcn.

### 7.3 Regra de fronteira

1. Nao existe biblioteca de componente unica entre Flutter e Web.
2. O unico contrato comum entre plataformas e semantica de cores.
3. Nomes de componente/widget entre plataformas nao sao obrigatorios.

## 8) Auditoria de Design System (Prototipo)

Comando de verificacao:

```bash
./Docs/Prototype/design-system/check-design-system.sh
```

Checklist de referencia:

- `Docs/Prototype/design-system/CHECKLIST.md`
