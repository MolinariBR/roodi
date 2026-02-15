Perfeito. Para ver os comandos disponíveis:

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