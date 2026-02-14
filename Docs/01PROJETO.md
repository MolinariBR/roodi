# PROJETO DE APP DE ENTREGA ROODI

## DESCRIÇÃO
Roodi é um app focado na entrega. Onde comerciante que recebe pedidos online em seu estabelecimento, usa o app roodi para chamar o Rider "Entregador" para realizar a entrega do seu pedido. O comerciante compra creditos para pagar o serviço de entrega.
Cada 1 real de crédito comprado, equivale a 1 real, ou seja, pareado em 1:1. O valor do crédito é usado para pagar o serviço de entrega: plataforma e entregadores. O valor do serviço de entrega é calculado a partir de uma fórmula que leva em consideração a distancia, tempo e clima. O valor do serviço de entrega é cobrado do comerciante, e o valor pago ao entregador é calculado a partir do valor do serviço de entrega, descontando a taxa da plataforma que é de 1 real por entrega. O valor do serviço de entrega é cobrado dos creditos do comerciante, e o valor pago ao entregador é creditado na conta do entregador, descontando a taxa da plataforma.
Nao usamos geolocalizacao em tempo real e nao usamos mapa offline no fluxo principal; a cotacao usa matriz de bairros + politica de fallback controlada.

## ESTRUTURA MACRO DO PROJETO

ROODI
 * Docs
  - Prototype
   - Rider; Telas de prototipação para o entregador (Rider).
   - Commerce: Telas de prototipação para o comerciante.
   - Common: Telas de prototipação compartilhadas entre Rider e Commerce.
   - README.md: Documentação geral da pasta de prototipação, explicando a estrutura e organização.
  - config: politicas de fallback e contratos de cotacao.
  - data: matriz local de bairros e cache de geocodificacao.
  - scripts: scripts de geracao/atualizacao da matriz de distancia e tempo.
 * Packages
  - Backend: API RESTful com Node.js/Express e Websockets com Socket.io para comunicação em tempo real.
  - Frontend-admin: Dashboard web de gestão da plataforma.
  - Frontend-rider: App Flutter unico para operacao mobile (contextos Rider e Commerce).
  - Roodi: Landing page do projeto para acesso público de usuarios.
 * README.md


## ESTRUTURA MODULAR
Backend, Frontend-admin, Frontend-rider e Roodi devem seguir arquitetura modular com baixa dependencia entre dominios. Cada modulo precisa ter responsabilidade clara, contratos definidos e independencia de evolucao.

### Principios obrigatorios
1. Cada modulo resolve um dominio especifico de negocio.
2. Comunicacao entre modulos ocorre por interfaces/contratos.
3. Regras de negocio ficam no modulo de dominio, nao em controller/UI.
4. `Core` contem fundacoes reutilizaveis; `Modules` contem casos de negocio.
5. Todo modulo deve ter codigo, testes e README tecnico.

### Estrutura padrao de pastas
```text
ROODI/
└── Packages/
    ├── Backend/
    │   └── src/
    │       ├── Core/
    │       └── Modules/
    ├── Frontend-admin/
    │   └── src/
    │       ├── Core/
    │       └── Modules/
    ├── Frontend-rider/
    │   └── lib/
    │       ├── Core/
    │       └── Modules/
    └── Roodi/
        └── src/
            ├── Core/
            └── Modules/

```

### O que entra em Core
`ROODI/Packages/Backend/src/Core`
1. Bootstrap do servidor, middlewares globais e error handling.
2. Base de autenticacao (JWT/refresh), guards e autorizacao.
3. Base de dados (Prisma), conexao, migracoes e repositorios compartilhados.
4. Configuracao/env, logger, observabilidade e utilitarios de infraestrutura.
5. Integracoes tecnicas compartilhadas (push, email, pagamentos).

`ROODI/Packages/Frontend-admin/src/Core`
1. App shell web, roteamento (App Router) e estado global do painel.
2. Cliente HTTP, sessao de admin, interceptors e tratamento global de erro.
3. Design system web e componentes administrativos reutilizaveis.
4. Utilitarios comuns (moeda, data, filtros, tabelas e status operacionais).
5. Servicos compartilhados (storage, feature flags, auditoria e notificacoes).

`ROODI/Packages/Frontend-rider/lib/Core`
1. App shell mobile, navegacao e estado global do app.
2. Cliente HTTP, sessao de usuario, interceptors e tratamento global de erro.
3. Design system mobile e componentes base reutilizaveis.
4. Utilitarios comuns (moeda, data, distancia, tempo e status de entrega).
5. Servicos compartilhados (storage local, feature flags, notificacoes locais e permissoes).

`ROODI/Packages/Roodi/src/Core`
1. App shell web da landing, roteamento e layout base.
2. Design system institucional e componentes de marketing.
3. SEO tecnico, metadados, sitemap e analytics.
4. Integracoes de captura de lead e contato.
5. Servicos comuns de conteudo, privacidade e consentimento.

### Distincao clara por pacote
1. `Backend`: regra de negocio, estado transacional e integracoes externas.
2. `Frontend-admin`: operacao, monitoramento e gestao administrativa.
3. `Frontend-rider`: app mobile unico com contexto de uso Rider e Commerce.
4. `Roodi`: aquisicao de usuarios, comunicacao institucional e conversao de leads.

### Estrutura minima de cada modulo
Dentro de `src/Modules` (Backend/Web) ou `lib/Modules` (Flutter):

```text
Modules/<nome-modulo>/
├── domain/
├── application/
├── infra/
├── presentation/
├── tests/
└── README.md
```

### Catalogo de modulos do projeto
1. `auth`: login, cadastro, OTP, recuperacao de senha e sessao.
2. `users`: dados de Rider/Commerce, documentos e configuracoes.
3. `clients`: base de clientes do comerciante (cadastro, enderecos e reutilizacao em chamados).
4. `products`: catalogo de produtos do comerciante (cadastro, edicao, disponibilidade e organizacao).
5. `orders`: ciclo de pedido/entrega, historico e cancelamentos.
6. `dispatch`: alocacao de rider, fila e transicoes operacionais.
7. `tracking`: acompanhamento operacional por estados/eventos (sem geolocalizacao em tempo real).
8. `pricing`: regras de taxa por zona, urgencia e acrescimos.
9. `locality`: resolucao de distancia/tempo por matriz de bairros e provedores matriciais.
10. `credits`: carteira de creditos do comerciante (saldo, extrato, compra, reserva e debito por entrega).
11. `payments`: meios de pagamento, cobranca, conciliacao, webhooks e repasse.
12. `notifications`: eventos operacionais in-app/push e status de leitura.
13. `support`: chamados, FAQ e tratamento de incidentes.
14. `system`: feature flags, parametros globais e saude da plataforma.

### Regras de dependencia
1. `Modules -> Core`: permitido.
2. `Modulo A -> Modulo B`: apenas via contrato publico.
3. Acesso direto ao `infra` de outro modulo: proibido.

### Diretriz de localizacao e rastreio
1. Nao usar geolocalizacao em tempo real no app.
2. Nao usar mapa offline no app.
3. Distancia e tempo sao resolvidos por matriz local de bairros + fallback deterministico de provedores.
4. Tracking para usuario e operacao deve ser por estados/eventos da entrega.
5. Em falha total de distancia/tempo, a cotacao e rejeitada (sem fallback sintetico).

## ARQUIVOS .ENV
O projeto deve usar apenas dois tipos de arquivos .env: ".env.development" para desenvolvimento local e ".env.production" para produção. Esses arquivos devem conter as variáveis de ambiente necessárias para a configuração do projeto, como chaves de API, URLs de serviços, e outras configurações sensíveis. O uso desses arquivos ajuda a manter as informações confidenciais seguras e facilita a configuração do ambiente de desenvolvimento e produção.

Os arquivos .env ficam centralizados em Backend, ou seja, na pasta "ROODI/Packages/Backend/.env.development" e "ROODI/Packages/Backend/.env.production". Frontend-admin e Frontend-rider devem consumir o Backend por API e usar apenas variaveis de ambiente proprias para configuracoes publicas do cliente.

## DOCUMENTAÇÃO DE USO NO DESENVOLVIMENTO

01PROJETO.md: Documento geral do projeto, contendo a descrição, propósito, estrutura macro e fluxo de ação.
02STACK.md: Documento detalhando a stack tecnologica utilizada no projeto.
03REGRAS.md: Documento detalhando as regras de negocio e comportamento do sistema e usuarios.
04FLUXOS.md: Documento detalhando os fluxos de usuario, a partir de cada tela/pagina do app.
05USER-STORIES.md: Documento detalhando as user stories do projeto, organizadas por tipo de usuario.
06TASKS.md: Documento detalhando as tasks de desenvolvimento.
07STRUCTURE.md: Documento que detalha a estrutura de diretórios e arquivos do projeto.
08PAGES.md: Documento detalhando as páginas do app, suas funcionalidades.
09MODULOS.md: Documento detalhando os módulos e fronteiras de dominio.
10DATABASE.md: Documento detalhando o contrato de banco de dados (entidades, relacoes, constraints, indices e trilhas de auditoria).
API-INFINITY-PAY.md: Documento de referencia da integracao de pagamento (checkout, webhook e consulta).
README.md: Documento geral do projeto, contendo a descrição, propósito, estrutura macro e fluxo de ação. Deve ser atualizado com as informações mais relevantes para o público geral, enquanto os outros documentos podem conter detalhes mais técnicos e específicos para a equipe de desenvolvimento.

## REGRAS DE QUALIDADE DE CODIGO

1. Padrões de Codificação: Definir e seguir padrões de codificação consistentes.
2. Revisao de Código: Implementar revisões de código regulares.
3. Seguir as Melhores Práticas: Adotar as melhores práticas de desenvolvimento.
4. Testes Anti-Mock: Criar testes realistas usando testcontainers, supertest, etc.
5. Validação de codigo: Criar scripts para validação realista da implementação, para reforçar Testes Anti-Mock e garantir a qualidade do código.
6. Antes de implementar/refatorar, SEMPRE! Analise, Revise, Mapeie, Confronte, Pesquise: Banco de Dados, API, Endpoint, Payload, Documentação da API.

## POLITICA DE DOCKER
1. Docker nao faz parte do fluxo padrao de desenvolvimento, execucao local ou deploy do projeto.
2. A unica excecao permitida e em testes de integracao com `testcontainers`.
3. Qualquer guia operacional deve priorizar comandos locais (`node`, `pnpm/npm`, `psql`, `flutter`) sem dependencia de `docker compose`.

## ESTADOS DA ENTREGA

Estados da Entrega visto pelo Entregador:
1. Comerciante aciona entregador.
2. Entregador aceita/recusa a solicitação.
3. Entregador a caminho do comercio.
4. Entregador chega no comercio.
5. Entregador aguardando o pedido.
6. Entregador a caminho do cliente.
7. Entregador chega no cliente.
8. Entregador solicita o codigo de entrega ao cliente.
9. Entregador finaliza a entrega.

Estados da Entrega visto pelo Comerciante:
1. Entregador aceita/recusa a solicitação.
2. Gerado o codigo de confirmação do cliente.
3. Comerciante envia o codigo para o cliente, fora do sistema (WhatsApp, SMS, etc).
4. Entregador a caminho do comercio.
5. Entregador chegou no comercio.
6. Entregador aguardando o pedido.
7. Entregador a caminho do cliente.
8. Entregador chegou no cliente.
9. Entregador finalizou a entrega.

## PRECIFICAÇÃO DO FRETE
A precificacao segue a politica em:
1. `Docs/config/freight-fallback-policy.yaml`
2. `Docs/config/freight-fallback-policy.json`

### Entradas obrigatorias da cotacao
1. `origin_bairro`
2. `destination_bairro`
3. `urgency`
4. `requested_at_iso`

### Distancia e tempo (sem geolocalizacao em tempo real)
1. Fonte primaria: `Docs/data/imperatriz_bairros_matriz.json` (`local_bairro_matrix`).
2. Fallback 1: `tomtom_matrix`.
3. Fallback 2: `openrouteservice_matrix`.
4. Falha total: rejeitar com `DISTANCE_TIME_UNAVAILABLE`.

### Clima
1. Fonte primaria: `openweather`.
2. Fallback: `met_no`.
3. Falha total: aplicar `is_raining=false` com confianca baixa.

### Regras de preco
1. Dono da regra: `admin_only`.
2. Formula: `base_zone + urgency + sunday + holiday + rain + peak`.
3. Valor minimo: `R$ 7,00`.
4. Cobertura maxima por zona: `12,7 km`; acima disso rejeitar com `OUT_OF_COVERAGE`.
5. Acrescimos: domingo, feriado, chuva e pico (11-14 e 18-22).

### Auditoria da cotacao
1. Registrar trilha de provedores (`provider_trace`).
2. Registrar latencias e se houve fallback.
3. Nao aplicar fallback sintetico para distancia/tempo.
