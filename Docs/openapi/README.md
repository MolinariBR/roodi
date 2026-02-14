# OpenAPI / Swagger - Roodi

## Arquivo principal
- `Docs/openapi/roodi.openapi.yaml`
- `Docs/openapi/roodi.swagger.json` (mesmo contrato em JSON)

## Como abrir no Swagger Editor (web)
1. Acesse: https://editor.swagger.io/
2. Use `File -> Import File` e selecione `roodi.openapi.yaml` (ou `roodi.swagger.json`).

## Como visualizar local sem Docker
Opcao 1 (Redocly CLI):
```bash
npx -y @redocly/cli preview-docs Docs/openapi/roodi.openapi.yaml --port 8080
```
Depois abra: `http://localhost:8080`

Opcao 2: usar apenas o Swagger Editor web (sem execucao local).

## Escopo do contrato
1. Autenticacao e sessao (`auth`).
2. Fluxo rider por estados de entrega (`rider`).
3. Fluxo commerce de chamada/cotacao/creditos (`commerce`).
4. Operacao administrativa (`admin`).
5. Integracao de pagamento com InfinitePay (`payments`).
6. Endpoints publicos de landing (`public`).

## Premissas refletidas
1. Sem geolocalizacao em tempo real no app.
2. Sem mapa offline no fluxo principal.
3. Tracking por estados/eventos.
4. Preco `admin_only`.
5. Distancia/tempo por matriz de bairros + fallback deterministico.

## Observacao sobre pagamentos
A integracao com InfinitePay foi modelada com base em `Docs/API-INFINITY-PAY.md`:
1. Geracao de link de checkout para compra de creditos.
2. Consulta de status de pagamento.
3. Recebimento de webhook de pagamento aprovado.
