# POLITICAS E REGRAS DE NEGOCIO DO PROJETO ROODI

Aqui temos os 10 princípios fundamentais que regem a operação da guilda de entregadores do Roodi. Essas regras garantem transparência, justiça e eficiência para todos os membros, sejam eles comerciantes ou entregadores. O objetivo é criar um ambiente onde a meritocracia e a responsabilidade sejam valorizadas, promovendo uma comunidade forte e confiável.

## 10 regras fundamentais de uma Guilda que funciona

1. **Membro é quem cumpre requisitos mínimos verificáveis**
   Para entrar e permanecer: identidade validada, veículo/documentos válidos (quando aplicável), contato ativo e aceite do regulamento. Sem “exceção por amizade”.

2. **Hierarquia simples e objetiva**
   Níveis fixos (ex.: Iniciante → Regular → Veterano → Elite) sobem e descem **apenas por métricas**: número de serviços concluídos, taxa de cancelamento, faltas, e tempo mínimo de casa. Nada de avaliação subjetiva.

3. **Direitos e deveres são iguais para todos do mesmo nível**
   Mesmo nível = mesmo acesso a tipos de trabalho, mesmas taxas, mesmas punições, mesmas prioridades. Se mudar regra, muda para todos.

4. **Regras públicas, registro público**
   Tudo que importa tem log: pedidos postados, quem aceitou, quem entregou, cancelamentos, punições e justificativas. Sem log = não existe.

5. **Alocação por rodízio + aptidão**
   A guilda distribui trabalho por um rodízio objetivo (fila/turno/região) **com travas de aptidão**:

   * Só recebe quem está disponível e apto (distância máxima / capacidade).
   * Se recusar, vai pro fim do rodízio daquele tipo de serviço.
     Isso impede “dedo rápido” e impede “panelinha”.

6. **Recusa é direito; abuso de recusa tem custo**
   Recusar não é punido por si só. Mas recusar demais em sequência dentro do turno reduz prioridade naquele turno (para não travar a operação). Regra numérica e transparente.

7. **Punição proporcional, escalonada e automática**
   Quatro faltas universais e objetivas:

   * aceitar e não ir (no-show),
   * cancelar após confirmar,
   * atraso acima do limite sem justificativa,
   * má conduta (definida por itens claros).
     Cada uma tem: advertência → suspensão curta → suspensão longa → expulsão. Sem “pena inventada na hora”.

8. **Qualidade é obrigação mínima, não “bônus”**
   Padrões claros: confirmação, coleta, entrega, evidência (quando necessário), comunicação. Se não cumpre padrão, perde acesso a serviços melhores até regularizar.

9. **Economia simples e estável**
   A guilda define: taxa fixa/extra por condições (chuva/feriado/pico), taxas administrativas (se houver), e prazos de repasse. Mudança só com regra de antecedência (ex.: vale na próxima semana), para ninguém dizer que foi “surpresa”.

10. **Mudança de regra só por processo definido**
    Toda evolução passa por um ritual objetivo:

* proposta registrada,
* período de teste (ex.: 2 semanas),
* critérios de sucesso (taxa de entrega, tempo médio, reclamações),
* decisão por regra (ex.: votação por maioria ou decisão do conselho eleito).
  Assim a guilda melhora sem virar bagunça.

## REGRAS SISTEMA DE ENTREGAS

As entregas seguem um sistema de regras claras para garantir justiça e eficiência. Cada entrega é classificada por tipo (Simples, Média, Premium) com requisitos específicos de elegibilidade e alocação. O sistema de rodízio por região e a chamada controlada garantem que os entregadores tenham oportunidades justas, enquanto as regras de recusa e punição mantêm a operação fluida e confiável. A transparência em cada etapa do processo é fundamental para evitar disputas e promover um ambiente de confiança entre comerciantes e entregadores.

## Diretriz técnica de localizacao e cotacao

1. O produto nao usa geolocalizacao em tempo real no app.
2. O produto nao usa mapa offline no fluxo principal.
3. Distancia e tempo sao resolvidos por matriz local de bairros e fallback deterministico de provedores.
4. Tracking para usuarios e operacao e por estados/eventos da entrega, nao por GPS continuo.
5. A politica oficial de cotacao e fallback esta em:
   - `Docs/config/freight-fallback-policy.yaml`
   - `Docs/config/freight-fallback-policy.json`
6. Em falha total de distancia/tempo, a cotacao deve ser rejeitada (sem fallback sintetico).

# Sistema de Entregas da Guilda

## 1) Papéis

* **Empresa (comércio)**: cria pedido e confirma preparo/coleta.
* **Entregador (membro)**: recebe ofertas, aceita/recusa, executa, comprova.
* **Guilda (admin/operador)**: define regras, resolve disputa e aplica punições *sempre via log*.

---

## 2) Tipos de serviço e requisitos

Cada entrega nasce com um **Tipo** (isso organiza tudo e evita briga):

* **S (Simples)**: curta, baixo risco/valor.
* **M (Média)**: distância maior ou horário crítico.
* **P (Premium)**: empresa exigente, alto valor, horários delicados.

Cada tipo define:

* **Janela de elegibilidade por zona/bairro** (definida pela politica operacional).
* **Nível mínimo** (ex.: S=Iniciante+, M=Regular+, P=Veterano+).
* **SLA** (tempo máximo para aceitar / chegar na coleta / concluir).

> Isso substitui “achismo”: corrida melhor não é “preferência”, é **categoria**.

---

## 3) Presença e aptidão (quem pode concorrer)

Um entregador só entra como elegível se:

* está **online**
* está dentro da **zona/bairro elegível**
* não está em **cooldown/suspensão**
* está no **nível mínimo** do tipo
* não excedeu limites do turno (ex.: 2 premium seguidas)

---

## 4) Justiça base: rodízio por região

Divida a cidade em **zonas** (bairros/áreas). Cada zona tem sua **fila justa**.

### Como a fila é ordenada (objetivo e histórico)

A ordenação é sempre por:

1. **Último serviço concluído** (quem está há mais tempo sem concluir vem primeiro)
2. **Recusas/no-response no turno** (desempate: quem travou menos vem antes)
3. **Proximidade operacional por matriz de bairros** (apenas como desempate dentro de limite)

> O principal é “tempo desde a última conclusão” (rodízio real). Proximidade usa distancia/tempo de matriz para desempate e limite operacional.

---

## 5) Modo de oferta: “chamada controlada” (sem dedo rápido)

Ao criar um pedido, o sistema faz uma **oferta em lotes**:

* Seleciona o **Topo da Fila** na zona (por justiça).
* Envia a oferta para um lote pequeno: **Top 3** (ou Top 5 em pico).
* Abre uma janela de **12–15 segundos**.

### Regras de decisão no lote

* Se **1 aceitar**, ele leva.
* Se **mais de 1 aceitar**, vence quem está **mais à frente na fila**.
* Se ninguém aceitar, o lote é marcado como **no-response** e o sistema chama o próximo lote.

> Entregador não precisa “ser rápido”. Basta estar disponível e aceitar no tempo.

---

## 6) Recusa é direito, mas travar o sistema tem consequência numérica

* **Recusar**: o entregador vai para o fim da fila **daquele tipo de serviço** (S/M/P) *naquela zona*.
* **Não responder (no-response)**: conta como **1 travamento** e também vai pro fim.
* **Limite do turno**: após X no-response (ex.: 3), entra em **cooldown curto** (ex.: 10 min sem receber ofertas) para não ficar segurando a fila.

Isso mantém liberdade sem deixar um membro “paralisar” a operação.

---

## 7) Cancelamentos e faltas (punição automática e proporcional)

Definições objetivas:

* **Cancelar antes de sair**: penalidade leve.
* **Cancelar depois de confirmar saída**: penalidade média + cooldown.
* **No-show** (aceitou e não foi / sumiu): penalidade alta + suspensão curta.
* **Atraso acima do SLA sem justificativa registrada**: penalidade média.

Escalonamento:

* 1ª: advertência
* 2ª: suspensão curta
* 3ª: suspensão longa
* 4ª: expulsão

Tudo automático, com log.

---

## 8) Anti-monopólio (para manter justiça real)

* **Máximo de 2 vitórias seguidas em Premium** na mesma janela de pico.
* Ao atingir o máximo: o entregador continua recebendo **Simples/Média**, mas entra em cooldown para Premium por X minutos.

Isso evita “os mesmos sempre pegam as melhores”.

---

## 9) Preço e adicionais (padronizados)

Cada pedido calcula valor automaticamente por tabela:

* base por zona (R$ 7,00 a R$ 25,00)
* adicionais objetivos (urgencia, domingo, feriado, chuva e pico)
* regra fixa de formula da plataforma (admin_only)

O entregador vê o valor **antes de aceitar**.

---

## 10) Transparência: motivo de cada escolha

Em toda entrega o app registra e exibe (sem expor dados sensíveis dos outros):

* **Zona**
* **Tipo (S/M/P)**
* **Status/etapa da entrega**
* **Quem aceitou dentro da janela**
* **Por que o vencedor venceu**: “posição na fila + elegibilidade + SLA”

Isso é o que faz o sistema “parar de dar discussão”.


# O que você ganha com esse sistema

* **Mais justo que WhatsApp** (sem dedo rápido, sem plantão).
* **Menos “algoritmo secreto”** (fila e regras visíveis).
* **Eficiência controlada** (zona, SLA, lotes).
* **Evolução natural** (níveis, tipos de serviço, anti-monopólio).

## SISTEMA FINANCEIRO, COBRANÇA E AFINS

* **Usuário final paga a empresa** (produto + o que a empresa decidir de frete).
* **Empresa aciona a plataforma** para executar a entrega.
* **Plataforma cobra da empresa** um valor de frete (ex.: R$ 9).
* **Após entrega concluída**, a plataforma **paga o entregador** (ex.: R$ 8).
* A plataforma **retém a comissão** (ex.: R$ 1).

---

# Sistema Financeiro da Guilda

## 1) Quem paga quem

### Usuário final → Empresa

* O usuário final paga **somente a empresa**.
* A empresa pode:

  * embutir frete no preço,
  * cobrar frete separado,
  * ou dar “frete grátis”.
    **Isso não muda o nosso sistema.**

### Empresa → Plataforma (custo da entrega)

* A empresa paga o **Frete da Plataforma** por entrega.

### Plataforma → Entregador (repasse)

* A plataforma paga o **Repasse do Entregador** após a entrega concluída.

### Plataforma → Lucro (comissão)

* A plataforma retém a **Comissão da Plataforma**.

---

## 2) Estrutura de preço (3 números que ficam claros para todos)

Para cada entrega, existem três valores:

1. **Frete da Plataforma (FP)** = o que a empresa paga
2. **Repasse do Entregador (RE)** = o que o entregador recebe
3. **Comissão (CP)** = lucro da plataforma

**Regra matemática obrigatória:**
**FP = RE + CP**

### Exemplo (seu caso)

* FP = R$ 9
* RE = R$ 8
* CP = R$ 1

---

## 3) Tabela pública (base + adicionais)

A guilda define uma tabela única, pública e estável:

### Base (exemplo)

* **R$ 7,00 a R$ 25,00** por entrega (dependendo da zona/distância)

### Adicionais (exemplos)

* Urgente: +R$ 2
* Agendado: +R$ 1
* Domingo: +R$ 1
* Feriado: +R$ 2
* Chuva: +R$ 2
* Pico (11–14 / 18–22): +R$ 1

**Importante:** adicionais são **objetivos** (calendário/horário/clima/regra), não “no grito”.
**Importante:** comerciante e entregador não definem preço; a regra é da plataforma/admin.

---

## 4) Quando a plataforma cobra e quando repassa

### Regra central (sem confusão)

* **Só existe cobrança e repasse quando a entrega estiver “CONCLUÍDA”.**

#### Estados e efeito financeiro

1. **Criada / Procurando entregador**

   * Sem cobrança
   * Sem repasse

2. **Aceita (entregador confirmado)**

   * Pode gerar “reserva”/autorização (opcional)
   * Ainda sem repasse

3. **Coletada**

   * A entrega está em execução

4. **Concluída** ✅

   * Plataforma cobra FP da empresa
   * Plataforma paga RE ao entregador
   * Plataforma retém CP

---

## 5) Cancelamentos e quem paga o quê (regras objetivas)

Você precisa de regras fixas para evitar briga. Aqui vai um conjunto simples:

### A) Cancelamento pela empresa **antes de aceitar**

* **Cobra:** R$ 0
* **Repasse:** R$ 0

### B) Cancelamento pela empresa **depois de aceitar**, mas **antes da coleta**

* **Cobra:** “Taxa de Deslocamento” fixa (ex.: R$ 2)
* **Repasse ao entregador:** R$ 2
* **Comissão:** R$ 0
  *(a ideia é indenizar tempo do entregador e não lucrar em cima)*

### C) Cancelamento pela empresa **depois da coleta**

* **Cobra:** FP integral (ou FP parcial alto, ex.: 70–100%)
* **Repasse ao entregador:** RE integral (ou alto)
* **Comissão:** CP reduzida ou normal (você decide, mas escreva)

### D) Cancelamento pelo entregador

* **Antes da coleta:** sem cobrança; punição do entregador (guilda)
* **Depois da coleta:** caso raro/gravíssimo; punição maior + regra de indenização

### E) No-show (aceitou e sumiu)

* **Cobra da empresa:** R$ 0
* **Repasse:** R$ 0
* **Punição do entregador:** automática (suspensão/cooldown)
  *(a empresa não pode pagar pela falha do entregador)*

---

## 6) Como a empresa paga (fatura simples)

Fluxo oficial atual: pagamento por pedido (sem dependencia de carteira).

### Opção 1 — Pagamento por pedido (oficial)

* Empresa cria o chamado.
* Sistema gera checkout de pagamento para aquele pedido.
* Com pagamento aprovado, o dispatch e liberado.
* Se pagamento falhar/expirar, pedido nao entra em alocacao.

**Prós:** simples para autonomos, sem recarga previa e com cobranca objetiva por entrega.

### Opção 2 — Pré-pago (carteira, legado/compatibilidade)

* Empresa coloca saldo (Pix) na plataforma.
* Cada entrega concluída debita FP do saldo.
* Se saldo insuficiente, não cria novos pedidos.

**Prós:** reduz inadimplencia em operacoes recorrentes.

### Opção 3 — Pós-pago (fatura semanal, opcional B2B)

* Você soma FP de todas as entregas concluídas.
* Envia fatura semanal.
* Se atrasar, bloqueia novos pedidos.

**Prós:** mais facil para empresas maiores com recorrencia alta.

---

## 7) Repasse ao entregador (claríssimo)

* Repasse via Pix/transferência **após status “Concluída”**.
* Repasse pode ser:

  * **instantâneo** (melhor percepção)
  * ou **diário** (menos operações bancárias)

Entregador vê:

* lista de entregas
* valores RE
* adicionais aplicados
* data/hora do pagamento

---

## 8) Termos curtos (para comunicar)

### Para a empresa

> “Você paga R$ 9 por entrega concluída. Nós selecionamos o entregador e registramos tudo. Do valor, R$ 8 vai para o entregador e R$ 1 é a taxa da plataforma.”

### Para o entregador

> “Você recebe R$ 8 por entrega concluída, pago pela plataforma. A empresa paga a plataforma; você não paga para trabalhar.”

---

## 9) O que é “lucro” no seu modelo

**Lucro por entrega = CP** (ex.: R$ 1).
Seu crescimento vem de:

* mais empresas ativas
* mais entregas concluídas
* e planos B2B opcionais (relatórios, múltiplas lojas, integrações)

---

## 10) Checklist do que precisa existir no app (financeiro)

* tabela de FP/RE/CP pública
* status de entrega (aceita/coletada/concluída)
* saldo da empresa (se pré-pago) ou fatura (se pós-pago)
* extrato do entregador
* logs de cancelamento com motivo
* regras de cobrança exibidas na criação do pedido

---

Se você quiser, eu posso te devolver isso também em **2 páginas de termos**:

1. “Termos do Comércio”
2. “Termos do Entregador”

bem curtas e com linguagem de rua, sem juridiquês, pra você colar no app e mandar no WhatsApp.

## REGRAS DE PREÇOS

1. Urgencia
 - Padrão = R$ 0,00
 - Urgente: + R$ 2,00
 - Agendado: + R$ 1,00

2. Distancia/Zona
 - Zona 1 (0-1.5 km) = R$ 7,00
 - Zona 2 (1.6-2.3 km) = R$ 8,00
 - Zona 3 (2.4-3.1 km) = R$ 9,00
 - Zona 4 (3.2-3.9 km) = R$ 10,00
 - Zona 5 (4.0-4.7 km) = R$ 11,00
 - Zona 6 (4.8-5.5 km) = R$ 12,00
 - Zona 7 (5.6-6.3 km) = R$ 13,00
 - Zona 8 (6.4-7.1 km) = R$ 14,00
 - Zona 9 (7.2-7.9 km) = R$ 15,00
 - Zona 10 (8.0-8.7 km) = R$ 16,00
 - Zona 11 (8.8-9.5 km) = R$ 17,00
 - Zona 12 (9.6-10.3 km) = R$ 18,00
 - Zona 13 (10.4-11.1 km) = R$ 19,00
 - Zona 14 (11.2-11.9 km) = R$ 20,00
 - Zona 15 (12.0-12.7 km) = R$ 25,00

3. Acrescimos:
 - Domingos: + R$ 1,00.
 - Feriados: + R$ 2,00.
 - Chuva: + R$ 2,00.
 - Pico (11-14 e 18-22): + R$ 1,00.


Fonte de verdade para regras e fallback: `Docs/config/freight-fallback-policy.yaml` e `Docs/config/freight-fallback-policy.json`.

## POLITICA DE SEGREDOS E ROTACAO DE CHAVES

1. Segredos reais nunca podem ser commitados em repositorio.
2. Arquivos validos de runtime no backend: `Packages/Backend/.env.development` e `Packages/Backend/.env.production`.
3. Arquivos `Packages/*/.env.example` sao apenas templates sem segredo real.
4. Frontend-admin, Frontend-rider e Roodi devem conter somente configuracoes publicas de cliente ou placeholders.
5. Segredos obrigatorios do backend:
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
   - `INFINITEPAY_API_KEY`, `INFINITEPAY_WEBHOOK_SECRET`.
   - Chaves de provedores externos (`TOMTOM_API_KEY`, `OPENROUTESERVICE_API_KEY`, `OPENWEATHER_API_KEY`) quando habilitados.
6. Parametros de autenticacao (`AUTH_PASSWORD_HASH_*`, `OTP_*`) devem ser controlados por ambiente e auditados em mudancas.
7. Politica minima de rotacao:
   - Segredos JWT: a cada 90 dias.
   - Segredos de pagamento/webhook: a cada 90 dias ou imediatamente em incidente.
   - Chaves de provedores de distancia/clima: a cada 180 dias ou imediatamente em incidente.
8. Em suspeita de vazamento, executar imediatamente:
   - revogacao no provedor.
   - emissao de nova chave.
   - atualizacao de ambiente.
   - registro de incidente e validacao pos-rotacao.
9. Toda alteracao de segredo deve ter dono responsavel, data de mudanca e motivo documentado.
10. Desenvolvimento local usa apenas valores de teste e nunca replica segredo de producao.
