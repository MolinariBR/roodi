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
```bashr
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

