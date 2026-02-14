# 05USER-STORIES.md

## Objetivo
Definir as user stories oficiais do Roodi com rastreabilidade para:
1. Fluxos (`Docs/04FLUXOS.md`).
2. Modulos (`Docs/09MODULOS.md`).
3. Paginas e rotas (`Docs/08PAGES.md`).
4. Regras de negocio (`Docs/03REGRAS.md`).

## Premissas obrigatorias
1. O app mobile e unico (`Frontend-rider`) com contexto Rider e Commerce.
2. Nao usar geolocalizacao em tempo real no app.
3. Nao usar mapa offline no fluxo principal.
4. Tracking e por estados/eventos de entrega.
5. Preco de frete e `admin_only`.
6. Distancia/tempo vem de matriz de bairros + fallback deterministico.
7. `credits` e `payments` sao dominios separados.

## Convencoes
1. Prioridade:
   - `P0`: obrigatorio para MVP.
   - `P1`: importante na primeira evolucao.
   - `P2`: evolucao posterior.
2. Formato de historia:
   - Como `<ator>`, quero `<objetivo>`, para `<resultado de negocio>`.
3. Cada historia inclui modulos e paginas/rotas para rastreabilidade.

## 1) Historias Comuns (Acesso, Conta, Suporte)

### US-CMN-001 - Onboarding inicial do app
Como usuario novo, quero ver o onboarding em 3 passos, para entender rapidamente o valor do produto antes de entrar.

1. Prioridade: `P1`.
2. Frontend: `Frontend-rider`.
3. Modulos: `session`, `system`.
4. Paginas/rotas: `Splash`, `01Onboarding`, `02.Onboarding`, `03Onboarding`.
5. Criterios de aceitacao:
   1. O fluxo segue `Splash -> Onboarding 1 -> 2 -> 3 -> Login`.
   2. O usuario pode pular o onboarding e ir para login.
   3. O onboarding nao depende de autenticacao.

### US-CMN-002 - Login com selecao de contexto
Como usuario, quero entrar como Rider ou Commerce, para acessar a experiencia correta no mesmo app.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider`.
3. Modulos: `auth`, `session`.
4. Paginas/rotas: `Login`, `/rider/home`, `/commerce/home`.
5. Criterios de aceitacao:
   1. O login exige credenciais validas e perfil (`rider` ou `commerce`).
   2. O backend devolve sessao JWT/refresh conforme perfil.
   3. O app redireciona para home do contexto selecionado.

### US-CMN-003 - Cadastro com perfil operacional
Como usuario, quero me cadastrar com perfil Rider ou Commerce, para iniciar operacao no contexto correto.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider`.
3. Modulos: `auth`, `users`.
4. Paginas/rotas: `Register`.
5. Criterios de aceitacao:
   1. O cadastro valida campos obrigatorios e perfil.
   2. O backend cria conta vinculada ao perfil selecionado.
   3. O usuario autenticado segue para fluxo inicial do contexto.

### US-CMN-004 - Recuperacao de senha por OTP
Como usuario, quero recuperar minha senha com OTP, para restaurar acesso com seguranca.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider`.
3. Modulos: `auth`.
4. Paginas/rotas: `ForgotPassword`, `OTP`, `ResetPassword`.
5. Criterios de aceitacao:
   1. O OTP tem expiracao e limite de tentativas.
   2. O reset so e permitido com OTP valido.
   3. A nova senha invalida sessoes anteriores quando aplicavel.

### US-CMN-005 - Central de notificacoes
Como usuario autenticado, quero ver notificacoes operacionais, para acompanhar eventos importantes do meu fluxo.

1. Prioridade: `P1`.
2. Frontend: `Frontend-rider`.
3. Modulos: `notifications`.
4. Paginas/rotas: `Notifications`.
5. Criterios de aceitacao:
   1. A tela lista notificacoes por periodo (`Hoje` e `Anteriormente`).
   2. O usuario pode marcar como lida e limpar itens visuais.
   3. O retorno para tela de origem usa contexto (`?from=`).

### US-CMN-006 - Central de suporte
Como usuario, quero abrir ajuda e consultar FAQ, para resolver problemas operacionais sem sair do app.

1. Prioridade: `P1`.
2. Frontend: `Frontend-rider`.
3. Modulos: `support`.
4. Paginas/rotas: `Support`.
5. Criterios de aceitacao:
   1. A tela mostra canais de suporte e FAQ.
   2. O usuario pode iniciar abertura de chamado.
   3. O suporte preserva retorno para o contexto de origem.

### US-CMN-007 - Estados globais do sistema
Como usuario, quero receber estados globais de erro/manutencao/atualizacao, para saber o motivo de indisponibilidade e acao esperada.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider`.
3. Modulos: `system`.
4. Paginas/rotas: `Error`, `Mantenance`, `Update`.
5. Criterios de aceitacao:
   1. O estado e controlado por sinalizacao de sistema, nao por regra local fixa.
   2. Cada estado apresenta acao clara de continuidade (`tentar novamente`, `atualizar`, `aguardar`).
   3. Eventos de indisponibilidade ficam auditaveis no backend.

## 2) Historias Rider

### US-RID-001 - Alternar disponibilidade online/offline
Como rider, quero alternar meu estado de disponibilidade, para controlar quando posso receber chamadas.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider`.
3. Modulos: `session`, `dispatch`.
4. Paginas/rotas: `Rider/Home`.
5. Criterios de aceitacao:
   1. Em `offline`, o rider nao entra em elegibilidade de oferta.
   2. Em `online`, o rider fica apto conforme regras de dispatch.
   3. A alteracao de status e registrada no historico operacional.

### US-RID-002 - Receber e decidir sobre solicitacao
Como rider online, quero receber proposta de entrega e aceitar/recusar, para operar de forma controlada.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider`.
3. Modulos: `rider-home-flow`, `dispatch`, `orders`, `tracking`.
4. Paginas/rotas: `Rider/Home`.
5. Criterios de aceitacao:
   1. A proposta mostra coleta, rota, distancia e valor antes do aceite.
   2. Aceite move estado para `to_merchant`.
   3. Recusa/no-response aplica regra de prioridade/cooldown definida no backend.

### US-RID-003 - Executar etapa de coleta
Como rider, quero registrar progresso ate o comercio, para manter o fluxo operacional correto.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider`.
3. Modulos: `rider-home-flow`, `tracking`.
4. Paginas/rotas: `Rider/Home`.
5. Criterios de aceitacao:
   1. Estados seguem sequencia valida (`to_merchant -> at_merchant -> waiting_order`).
   2. O app nao permite salto invalido entre estados.
   3. Cada transicao gera evento de tracking.

### US-RID-004 - Executar entrega ao cliente
Como rider, quero seguir o fluxo ate o cliente, para concluir a entrega com rastreabilidade por eventos.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider`.
3. Modulos: `rider-home-flow`, `tracking`.
4. Paginas/rotas: `Rider/Home`.
5. Criterios de aceitacao:
   1. Estados seguem sequencia valida (`to_customer -> at_customer -> finishing_delivery -> completed`).
   2. O tracking e por status/evento, sem GPS continuo.
   3. O rider ve contexto operacional necessario em cada etapa.

### US-RID-005 - Finalizar com codigo de confirmacao
Como rider, quero validar o codigo do cliente na entrega, para garantir confirmacao segura da conclusao.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider`.
3. Modulos: `rider-home-flow`, `orders`, `tracking`.
4. Paginas/rotas: `Rider/Home`.
5. Criterios de aceitacao:
   1. A conclusao so ocorre com codigo valido.
   2. Codigo invalido nao conclui entrega e gera feedback claro.
   3. Conclusao dispara evento financeiro de fechamento da corrida.

### US-RID-006 - Consultar historico de corridas
Como rider, quero ver meu historico com filtros, para acompanhar desempenho e operacao.

1. Prioridade: `P1`.
2. Frontend: `Frontend-rider`.
3. Modulos: `rider-orders-history`, `orders`, `tracking`.
4. Paginas/rotas: `Rider/Orders`.
5. Criterios de aceitacao:
   1. A lista permite filtros por periodo/status/ordenacao.
   2. Cada corrida abre detalhe em bottom sheet.
   3. Filtros aplicados refletem nos chips visuais da tela.

### US-RID-007 - Gerenciar perfil em modais inferiores
Como rider, quero atualizar dados de perfil em sheets, para reduzir navegacao e manter fluxo rapido.

1. Prioridade: `P1`.
2. Frontend: `Frontend-rider`.
3. Modulos: `rider-profile`, `users`.
4. Paginas/rotas: `Rider/Profile`.
5. Criterios de aceitacao:
   1. Edicoes ocorrem via bottom sheet por secao.
   2. Secoes incluem dados pessoais, banco, documentos, veiculo e privacidade.
   3. Alteracoes validas persistem no backend.

### US-RID-008 - Receber visibilidade de valor antes do aceite
Como rider, quero visualizar o valor da corrida antes de aceitar, para tomar decisao informada.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider`.
3. Modulos: `rider-home-flow`, `pricing`, `orders`.
4. Paginas/rotas: `Rider/Home`.
5. Criterios de aceitacao:
   1. O valor exibido vem da cotacao oficial ja calculada.
   2. O rider nao altera regra de preco.
   3. Em erro de cotacao, nao deve haver oferta elegivel de corrida.

## 3) Historias Commerce

### US-COM-001 - Abrir chamado de entrega
Como comerciante, quero criar um chamado com dados de destino, para acionar um rider.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider` (contexto Commerce).
3. Modulos: `commerce-create-call`, `orders`, `clients`.
4. Paginas/rotas: `Commerce/CreateCall`.
5. Criterios de aceitacao:
   1. Campos obrigatorios de destinatario e endereco sao validados.
   2. O chamado nao e criado com dados incompletos.
   3. Chamado criado entra no fluxo de dispatch.

### US-COM-002 - Simular cotacao antes de confirmar
Como comerciante, quero ver valor e ETA estimados, para decidir se confirmo o chamado.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider` (contexto Commerce).
3. Modulos: `commerce-create-call`, `pricing`, `locality`.
4. Paginas/rotas: `Commerce/CreateCall`.
5. Criterios de aceitacao:
   1. Simulacao usa politica oficial de cotacao.
   2. Falha total de distancia/tempo bloqueia confirmacao (`DISTANCE_TIME_UNAVAILABLE`).
   3. Distancia fora da cobertura retorna `OUT_OF_COVERAGE`.

### US-COM-003 - Confirmar chamado com debito por creditos
Como comerciante, quero confirmar um chamado com saldo de creditos, para operar sem pagamento manual por corrida.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider` (contexto Commerce).
3. Modulos: `orders`, `credits`.
4. Paginas/rotas: `Commerce/CreateCall`, `Commerce/Home`.
5. Criterios de aceitacao:
   1. Confirmacao exige saldo suficiente.
   2. O sistema registra reserva/debito conforme estado da entrega.
   3. Saldo insuficiente impede criacao e orienta recarga.

### US-COM-004 - Acompanhar entrega por timeline de eventos
Como comerciante, quero acompanhar o status da entrega por eventos, para saber em que etapa o pedido esta.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider` (contexto Commerce).
3. Modulos: `commerce-tracking`, `tracking`, `orders`.
4. Paginas/rotas: `Commerce/Tracking`.
5. Criterios de aceitacao:
   1. A timeline mostra estados oficiais do fluxo de entrega.
   2. O tracking nao depende de GPS continuo.
   3. Eventos sao exibidos em ordem temporal consistente.

### US-COM-005 - Cancelar chamado com regra por etapa
Como comerciante, quero cancelar chamada quando permitido, para corrigir erros operacionais sem quebrar a regra financeira.

1. Prioridade: `P1`.
2. Frontend: `Frontend-rider` (contexto Commerce).
3. Modulos: `orders`, `credits`, `payments`.
4. Paginas/rotas: `Commerce/Home`, `Commerce/Tracking`.
5. Criterios de aceitacao:
   1. Cancelamento aplica politica de cobranca por etapa da entrega.
   2. O sistema registra motivo e momento do cancelamento.
   3. Efeitos financeiros ficam auditaveis.

### US-COM-006 - Receber codigo de confirmacao da entrega
Como comerciante, quero receber o codigo de confirmacao vinculado ao pedido, para habilitar finalizacao segura da entrega.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider` (contexto Commerce).
3. Modulos: `orders`, `tracking`, `notifications`.
4. Paginas/rotas: `Commerce/Home`, `Commerce/Tracking`.
5. Criterios de aceitacao:
   1. O sistema gera codigo unico por pedido conforme regra operacional.
   2. O comerciante visualiza o codigo no contexto do pedido correto.
   3. O codigo fica disponivel ate conclusao ou cancelamento do pedido.

### US-COM-007 - Compartilhar codigo com cliente fora do sistema
Como comerciante, quero enviar o codigo ao cliente por canal externo, para que o rider valide a entrega no destino.

1. Prioridade: `P1`.
2. Frontend: `Frontend-rider` (contexto Commerce).
3. Modulos: `orders`, `support`.
4. Paginas/rotas: `Commerce/Tracking`.
5. Criterios de aceitacao:
   1. O app orienta que o envio e externo ao sistema (ex.: WhatsApp/SMS).
   2. O fluxo nao depende de API de terceiros para completar entrega.
   3. A finalizacao da entrega continua condicionada ao codigo validado pelo rider.

### US-COM-008 - Gerenciar base de clientes
Como comerciante, quero cadastrar e reutilizar clientes, para reduzir tempo na abertura de chamados.

1. Prioridade: `P1`.
2. Frontend: `Frontend-rider` (contexto Commerce).
3. Modulos: `clients`.
4. Paginas/rotas: `Commerce/Clients`.
5. Criterios de aceitacao:
   1. O cadastro armazena nome, contato e endereco.
   2. A busca retorna clientes por nome/telefone.
   3. O cliente pode ser reaproveitado no `CreateCall`.

### US-COM-009 - Gerenciar produtos do catalogo
Como comerciante, quero cadastrar e atualizar produtos, para manter meu catalogo operacional.

1. Prioridade: `P1`.
2. Frontend: `Frontend-rider` (contexto Commerce).
3. Modulos: `products`.
4. Paginas/rotas: `Commerce/Products`.
5. Criterios de aceitacao:
   1. O comerciante consegue criar, editar e pausar produto.
   2. Alteracoes de disponibilidade impactam exibicao do item.
   3. Acoes ficam registradas para auditoria administrativa.

### US-COM-010 - Comprar creditos para operacao
Como comerciante, quero comprar creditos, para manter disponibilidade de chamada de riders.

1. Prioridade: `P0`.
2. Frontend: `Frontend-rider` (contexto Commerce).
3. Modulos: `credits`, `payments`.
4. Paginas/rotas: `Commerce/Credits`.
5. Criterios de aceitacao:
   1. O comerciante seleciona pacote/metodo e inicia compra.
   2. Confirmacao de pagamento atualiza saldo da carteira.
   3. Falha de pagamento nao credita saldo indevidamente.

### US-COM-011 - Consultar extrato e autonomia de saldo
Como comerciante, quero visualizar saldo e historico de movimentacoes, para controlar custo operacional.

1. Prioridade: `P1`.
2. Frontend: `Frontend-rider` (contexto Commerce).
3. Modulos: `credits`.
4. Paginas/rotas: `Commerce/Credits`.
5. Criterios de aceitacao:
   1. O extrato mostra creditos, debitos e saldo atual.
   2. A origem de cada movimento e identificavel.
   3. O saldo mostrado bate com o ledger do backend.

### US-COM-012 - Gerenciar perfil operacional da loja
Como comerciante, quero ajustar dados da loja e preferencias, para manter meu contexto operacional atualizado.

1. Prioridade: `P1`.
2. Frontend: `Frontend-rider` (contexto Commerce).
3. Modulos: `users`, `notifications`, `support`.
4. Paginas/rotas: `Commerce/Profile`.
5. Criterios de aceitacao:
   1. Dados da loja e preferencias sao editaveis com validacao.
   2. Ajustes refletem no comportamento operacional permitido.
   3. O perfil oferece acesso rapido a suporte e notificacoes.

## 4) Historias Admin

### US-ADM-001 - Acesso seguro ao painel
Como admin, quero autenticar no painel com autorizacao adequada, para operar apenas funcoes permitidas.

1. Prioridade: `P0`.
2. Frontend: `Frontend-admin`.
3. Modulos: `auth`, `system`.
4. Rotas: `/admin/login`.
5. Criterios de aceitacao:
   1. O login usa identidade administrativa valida.
   2. Rotas sensiveis exigem perfil administrativo.
   3. Tentativas nao autorizadas sao bloqueadas e auditadas.

### US-ADM-002 - Configurar regras de precificacao
Como admin, quero gerenciar regras de preco de frete, para manter politica comercial centralizada.

1. Prioridade: `P0`.
2. Frontend: `Frontend-admin`.
3. Modulos: `pricing`.
4. Rotas: `/admin/pricing`.
5. Criterios de aceitacao:
   1. Somente admin altera zonas, urgencia e acrescimos.
   2. Versoes de regra ficam rastreaveis por data/autor.
   3. Novas regras aplicam para cotacoes futuras conforme politica.

### US-ADM-003 - Monitorar pedidos e tracking
Como admin, quero auditar pedidos e timeline de eventos, para controlar a operacao de ponta a ponta.

1. Prioridade: `P0`.
2. Frontend: `Frontend-admin`.
3. Modulos: `orders`, `tracking`.
4. Rotas: `/admin/orders`, `/admin/tracking`.
5. Criterios de aceitacao:
   1. O painel lista pedidos por status e periodo.
   2. Cada pedido exibe timeline completa de eventos.
   3. O tracking segue estados oficiais do fluxo, sem GPS continuo.

### US-ADM-004 - Gerenciar usuarios e conformidade
Como admin, quero gerir contas Rider/Commerce e seus dados de conformidade, para manter base segura e valida.

1. Prioridade: `P1`.
2. Frontend: `Frontend-admin`.
3. Modulos: `users`.
4. Rotas: `/admin/users`.
5. Criterios de aceitacao:
   1. O admin consulta perfil, status e historico essencial.
   2. Bloqueio/suspensao de conta segue politica de negocio.
   3. Alteracoes de status ficam auditadas.

### US-ADM-005 - Operar carteira de creditos
Como admin, quero auditar e ajustar movimentos de creditos quando necessario, para garantir integridade do saldo dos comerciantes.

1. Prioridade: `P1`.
2. Frontend: `Frontend-admin`.
3. Modulos: `credits`.
4. Rotas: `/admin/credits`.
5. Criterios de aceitacao:
   1. O painel exibe extrato detalhado por comerciante.
   2. Ajustes manuais exigem motivo e trilha de auditoria.
   3. Saldo final e consistente com ledger.

### US-ADM-006 - Conciliar pagamentos e webhooks
Como admin, quero monitorar cobrancas e repasses, para garantir fechamento financeiro correto.

1. Prioridade: `P0`.
2. Frontend: `Frontend-admin`.
3. Modulos: `payments`.
4. Rotas: `/admin/payments`.
5. Criterios de aceitacao:
   1. Eventos de webhook sao idempotentes.
   2. Falhas entram em fila de retry controlada.
   3. Conciliacao evidencia relacao entre cobranca, repasse e comissao.

### US-ADM-007 - Administrar notificacoes operacionais
Como admin, quero gerenciar regras e templates de notificacao, para padronizar comunicacao por evento.

1. Prioridade: `P1`.
2. Frontend: `Frontend-admin`.
3. Modulos: `notifications`.
4. Rotas: `/admin/notifications`.
5. Criterios de aceitacao:
   1. Templates sao versionados e ativados por evento.
   2. Canais habilitados respeitam perfil/contexto.
   3. O status de entrega/leitura fica rastreavel.

### US-ADM-008 - Operar suporte e estados de sistema
Como admin, quero controlar suporte e estados globais do sistema, para reduzir impacto de incidentes.

1. Prioridade: `P1`.
2. Frontend: `Frontend-admin`.
3. Modulos: `support`, `system`.
4. Rotas: `/admin/support`, `/admin/system`.
5. Criterios de aceitacao:
   1. O admin classifica e acompanha chamados.
   2. O admin pode ativar status de manutencao/update quando necessario.
   3. Mudancas criticas geram log de auditoria.

## 5) Historias Landing (Roodi)

### US-LND-001 - Apresentar proposta de valor
Como visitante, quero entender o que e o Roodi e para quem ele serve, para decidir se vale iniciar contato.

1. Prioridade: `P1`.
2. Frontend: `Roodi`.
3. Modulos: `marketing`.
4. Rotas: `/`, `/como-funciona`, `/para-comerciantes`, `/para-entregadores`.
5. Criterios de aceitacao:
   1. A landing comunica claramente valor para comercio e rider.
   2. As secoes possuem CTA objetivo para contato.
   3. Conteudo e consistente com regras reais do produto.

### US-LND-002 - Captura de leads
Como visitante interessado, quero enviar meus dados de contato, para receber retorno comercial.

1. Prioridade: `P1`.
2. Frontend: `Roodi`.
3. Modulos: `leads`.
4. Rotas: `/contato`.
5. Criterios de aceitacao:
   1. Formulario valida campos obrigatorios.
   2. O lead e registrado com data/origem.
   3. O visitante recebe feedback de envio com sucesso/erro.

### US-LND-003 - Acesso a documentos legais
Como visitante, quero consultar termos e privacidade, para entender condicoes de uso e dados.

1. Prioridade: `P0`.
2. Frontend: `Roodi`.
3. Modulos: `legal`.
4. Rotas: `/termos`, `/privacidade`, `/cookies`.
5. Criterios de aceitacao:
   1. Paginas legais estao acessiveis no rodape e rotas diretas.
   2. Conteudo possui versao e data de atualizacao.
   3. Politica de cookies e consentimento e clara.

### US-LND-004 - Medicao de aquisicao e SEO
Como time de negocio, quero medir aquisicao e desempenho organico, para otimizar conversao da landing.

1. Prioridade: `P2`.
2. Frontend: `Roodi`.
3. Modulos: `seo-analytics`.
4. Rotas: todas da landing.
5. Criterios de aceitacao:
   1. Metadados, sitemap e indexacao estao corretos.
   2. Eventos basicos de conversao sao coletados.
   3. A medicao respeita politicas de privacidade/consentimento.

## 6) Historias de Plataforma (Regra sistemica)

### US-PLT-001 - Cotar frete com trilha de provedores
Como plataforma, quero calcular cotacao com rastreabilidade de provedores, para garantir consistencia e auditoria.

1. Prioridade: `P0`.
2. Frontend: `Backend`.
3. Modulos: `locality`, `pricing`.
4. Fluxos relacionados: `04FLUXOS` secao de cotacao.
5. Criterios de aceitacao:
   1. Ordem de consulta segue politica oficial (matriz local -> fallback 1 -> fallback 2).
   2. Falha total de distancia/tempo rejeita cotacao.
   3. O retorno inclui `provider_trace` e latencias.

### US-PLT-002 - Alocar rider com justiça operacional
Como plataforma, quero aplicar dispatch por elegibilidade e lotes, para evitar distribuicao injusta de corridas.

1. Prioridade: `P0`.
2. Frontend: `Backend`.
3. Modulos: `dispatch`, `orders`, `tracking`.
4. Fluxos relacionados: `04FLUXOS` secao de dispatch.
5. Criterios de aceitacao:
   1. Oferta respeita fila objetiva por zona e regras de aptidao.
   2. Recusa/no-response aplicam penalidade operacional prevista.
   3. Vencedor da oferta e justificavel por regra registrada.

### US-PLT-003 - Fechamento financeiro na conclusao
Como plataforma, quero executar cobranca e repasse ao concluir entrega, para manter modelo financeiro correto.

1. Prioridade: `P0`.
2. Frontend: `Backend`.
3. Modulos: `orders`, `credits`, `payments`.
4. Fluxos relacionados: `04FLUXOS` secao financeira.
5. Criterios de aceitacao:
   1. Evento financeiro principal ocorre apenas em `completed`.
   2. Regra `FP = RE + CP` e preservada.
   3. Movimentos em carteira e pagamento ficam conciliaveis.

### US-PLT-004 - Tratar webhooks de pagamento com seguranca
Como plataforma, quero tratar webhooks com idempotencia e retry, para evitar inconsistencias financeiras.

1. Prioridade: `P0`.
2. Frontend: `Backend`.
3. Modulos: `payments`.
4. Fluxos relacionados: conciliacao.
5. Criterios de aceitacao:
   1. Evento repetido nao duplica efeito financeiro.
   2. Falhas transientes entram em fila de retry.
   3. Todas as tentativas ficam registradas para auditoria.

### US-PLT-005 - Manter trilha de auditoria operacional
Como plataforma, quero registrar eventos criticos de operacao, para investigacao e conformidade.

1. Prioridade: `P1`.
2. Frontend: `Backend`.
3. Modulos: `system`, `orders`, `dispatch`, `tracking`, `payments`.
4. Fluxos relacionados: todos os fluxos transacionais.
5. Criterios de aceitacao:
   1. Cada evento critico possui `request_id`/identificador correlacionavel.
   2. Logs de negocio e tecnicos permitem rastrear origem e impacto.
   3. Auditoria cobre alteracoes manuais administrativas.

### US-PLT-006 - Notificar usuarios por evento relevante
Como plataforma, quero enviar notificacoes por eventos de entrega e financeiro, para manter usuarios informados no momento certo.

1. Prioridade: `P1`.
2. Frontend: `Backend` + `Frontend-rider` + `Frontend-admin`.
3. Modulos: `notifications`, `orders`, `tracking`, `credits`, `payments`.
4. Fluxos relacionados: operacao de entrega e financeiro.
5. Criterios de aceitacao:
   1. Cada notificacao esta vinculada a um evento de negocio.
   2. O usuario consegue diferenciar notificacoes novas e lidas.
   3. Falhas de entrega de notificacao sao registradas e tratadas.

### US-PLT-007 - Gerar e validar codigo de confirmacao por pedido
Como plataforma, quero gerar e validar codigo de confirmacao da entrega, para reduzir fraude e garantir encerramento correto.

1. Prioridade: `P0`.
2. Frontend: `Backend`.
3. Modulos: `orders`, `tracking`, `notifications`.
4. Fluxos relacionados: estados finais de entrega.
5. Criterios de aceitacao:
   1. O codigo e unico por pedido e associado ao estado da entrega.
   2. A validacao ocorre no fechamento e impede conclusao com codigo invalido.
   3. Tentativas invalidas ficam registradas para auditoria.

## 7) Definicao de pronto (DoR) para implementar historia
1. Historia possui ator, objetivo e resultado de negocio claros.
2. Modulos e rotas impactados estao mapeados.
3. Regras de negocio aplicaveis estao referenciadas.
4. Dependencias externas e riscos estao identificados.

## 8) Definicao de concluido (DoD) para aceitar historia
1. Criterios de aceitacao atendidos e validados.
2. Cobertura de testes adequada ao risco (unitario/integracao/e2e).
3. Logs e metricas minimas de observabilidade implementados quando aplicavel.
4. Documentacao sincronizada: `04FLUXOS.md`, `08PAGES.md`, `09MODULOS.md`, `06TASKS.md`.
