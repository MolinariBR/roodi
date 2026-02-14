# Bairros de Imperatriz-MA

Lista compilada a partir da base de CEP por bairro da cidade de Imperatriz-MA.

- Fonte: https://www.ruacep.com.br/ma/imperatriz/bairros/
- Data da consulta: 2026-02-13
- Total de itens: 123

1. Aeroporto
2. Alto Bonito do Triângulo
3. Alto da Boa Vista
4. Asa Norte
5. Bacuri
6. Beira Rio
7. Boca da Mata
8. Bom Jesus
9. Bom Sucesso
10. Brasil Novo
11. Caema
12. Camaçari
13. Centro
14. Centro Novo
15. Cinco Irmãos
16. Coco Grande
17. Conjunto Habitar Brasil
18. Conjunto Nova Vitória
19. Distrito Industrial
20. Entroncamento
21. Imigrantes
22. Itamar Guará
23. Jardim América
24. Jardim Andrea
25. Jardim Camboriú
26. Jardim Cinco Estrelas
27. Jardim Democrata
28. Jardim Europa
29. Jardim Lagoa
30. Jardim Lopes
31. Jardim Morada do Sol
32. Jardim Oriental
33. Jardim Planalto
34. Jardim Pérola
35. Jardim São Francisco
36. Jardim São Luís
37. Jardim Tropical
38. Jardim Vitória
39. Jardim das Oliveiras
40. João Paulo II
41. Juçara
42. Lagoa Verde
43. Lagoinha
44. Leandra
45. Maranhão Novo
46. Mata Verde
47. Mercadinho
48. Morada do Bosque
49. Mutirão
50. Nova Imperatriz
51. Novo Horizonte
52. Ouro Verde
53. Park Imperial
54. Parque Alvorada
55. Parque Alvorada II
56. Parque Amazonas
57. Parque Anhangüera
58. Parque Avenida
59. Parque Buriti
60. Parque Independência
61. Parque Planalto
62. Parque Sanharol
63. Parque Santa Lúcia
64. Parque Sumaré
65. Parque São José
66. Parque Tocantins
67. Parque da Lagoa
68. Parque das Estrelas
69. Parque das Flores
70. Parque das Mangueiras
71. Parque das Mansões
72. Parque das Palmeiras
73. Parque do Bosque
74. Portal da Amazônia
75. Recanto Universitário
76. Residencial Califórnia
77. Residencial Colina Park
78. Residencial Dom Afonso Felippe Gregory
79. Residencial Kubitschek
80. Residencial Teotônio Vilela
81. Residencial Verona
82. Residencial Verona III
83. Residencial Verona IV
84. Residencial Verona V
85. Santa Inês
86. Santa Luzia
87. Santa Rita
88. Santo Amaro
89. Sol Nascente
90. Super Quadra 602
91. São José do Egito
92. São Salvador
93. Sítio Engenho Velho
94. Três Poderes
95. União
96. Vale do Sol
97. Vila Airton Senna
98. Vila Bandeirantes
99. Vila Brasil
100. Vila Cafeteira
101. Vila Carajás
102. Vila Chico do Rádio
103. Vila Esmeralda
104. Vila Fiquene
105. Vila Independente
106. Vila Ipiranga
107. Vila Jardim
108. Vila João Castelo
109. Vila Lobão
110. Vila Macedo
111. Vila Maderminas
112. Vila Maria
113. Vila Mariana
114. Vila Nova
115. Vila Parati
116. Vila Redenção
117. Vila Santa Luzia
118. Vila São João
119. Vila Verde
120. Vila Vitória
121. Vila Zenira
122. Vilinha
123. Área Rural de Imperatriz


Sim. Hoje (14/02/2026), você tem estas opções com uso gratuito para calcular tempo de rota antes do frete:

TomTom
Free evaluation com cota diária compartilhada de 2.500 requests não-tile/dia (inclui Routing e Matrix).
https://docs.tomtom.com/pricing

openrouteservice
Plano Standard gratuito com limites como Directions 2.000/dia e Matrix 500/dia.
https://staging.openrouteservice.org/plans/
https://staging.openrouteservice.org/restrictions/

Google Maps Routes API
Tem free usage cap por SKU (ex.: 10.000/mês em Routes Essentials), depois cobra.
https://developers.google.cn/maps/billing-and-pricing/pricing?hl=en

GraphHopper
Plano Free com 500 créditos/dia, mas o próprio site indica restrição de uso no plano free.
https://www.graphhopper.com/pricing/

Sem depender de cota de terceiros
Self-host do OSRM (open source, BSD-2), aí o limite é sua infra.
https://project-osrm.org/
https://github.com/Project-OSRM/osrm-backend

Se quiser, eu te digo qual dessas encaixa melhor no seu volume diário de pedidos.


e para Clima

Sim. Para clima (checado em 14/02/2026), estas são boas opções grátis:

MET Norway (api.met.no): grátis, cobertura global e permite uso sob licença aberta; exige User-Agent válido.
https://api.met.no/

OpenWeather (One Call 3.0): 1.000 chamadas/dia grátis no plano “pay as you call”.
https://openweathermap.org/price
https://openweathermap.org/api/one-call-3

WeatherAPI: plano free com 1 milhão de chamadas/mês (com limites de recursos).
https://www.weatherapi.com/pricing.aspx

Open-Meteo: muito bom para protótipo; no free é sem chave, mas para produção comercial eles direcionam para plano pago/licença.
https://open-meteo.com/
https://open-meteo.com/en/pricing

Weatherbit: free bem limitado (50 req/dia) e não comercial no plano gratuito.
https://www.weatherbit.io/pricing

Para seu caso de frete com adicional de chuva, eu iria de MET Norway (mais custo zero real) ou OpenWeather (mais simples de produto/SLA).
Se quiser, eu já te passo a regra pronta de cálculo (chuva + feriado + pico) e o endpoint exato para Imperatriz-MA.


eu preciso para distancia, tempo e clima. se usarmos fallback entre as apis, daria certo ou não

Dá certo sim, e é uma boa estratégia.
Mas precisa ser controlado, não “fallback solto”.

Como fazer funcionar bem:

Separar por domínio
Distância/tempo: um serviço de rota.
Clima: outro serviço de clima.
Não misturar lógica dos dois no mesmo fallback.
Ordem de provedores (exemplo)
Rota: Matriz local (bairros) -> API A -> API B.
Clima: API A -> API B -> regra padrão (sem acréscimo de chuva).
Regra de consistência
Cada cotação usa um único resultado final por domínio.
Salvar no log: provider_usado, tempo_ms, confidence, fallback=true/false.
Cache obrigatório
Distância/tempo: 10-30 min (ou permanente se matriz bairro->bairro).
Clima: 5-10 min por região.
Isso reduz custo e instabilidade.
Timeout + circuit breaker
Timeout curto (ex.: 1.5s por API).
Se API falhar repetidamente, “abre circuito” e pula direto para próxima.
Plano de contingência
Se tudo falhar: usar tabela fixa por zona (sua regra de preços) + flag estimado.
Para seu projeto, o ideal é:

Primário para distância/tempo: matriz local de bairros (mais estável e barato).
Fallback: API de rota só quando não houver par válido.
Clima: API com fallback simples (ex.: OpenWeather -> MET Norway).
Se quiser, eu te monto um fluxo técnico pronto (em YAML/JSON) para plugar no backend.


sim

Vou preparar um fluxo técnico pronto para backend com fallback de distância/tempo/clima, em formato YAML (com estrutura executável) e um JSON equivalente para integração. Primeiro vou mapear a estrutura atual de docs para salvar no lugar certo.

Vou materializar isso em dois artefatos versionáveis: freight-fallback-policy.yaml e freight-fallback-policy.json, com fluxo de fallback controlado, timeouts, cache, circuit breaker e fórmula de preço alinhada às suas regras. Em seguida te explico como usar no backend.

Agora vou gerar a versão JSON espelhando a mesma política, para você poder carregar direto no backend sem parser YAML.

Os arquivos já estão criados. Vou só revisar o diff final para te devolver com instruções objetivas de uso no backend.

Estruturei o fluxo técnico completo com fallback controlado para distancia + tempo + clima em dois formatos:

freight-fallback-policy.yaml
freight-fallback-policy.json
O que já está definido nesses arquivos:

Ordem de providers por domínio (distance_time e climate).
Cache, timeout, retry e circuit breaker por provider.
Regra explícita de não usar fallback sintético para distância/tempo.
Política quando todos falham:
distância/tempo: rejeita cotação (DISTANCE_TIME_UNAVAILABLE)
clima: aplica padrão is_raining=false com confidence=low
Regras de preço completas:
urgência (padrao/urgente/agendado)
zonas 1 a 15
adicionais (domingo, feriado, chuva, pico)
Fluxo de execução ponta a ponta (validate_input -> resolve_distance_time -> resolve_climate -> calculate_price -> return_quote)
Contrato de resposta e campos de observabilidade/auditoria.
Se quiser, o próximo passo é eu te entregar um service em Node/TypeScript que lê esse JSON e já retorna a cotação final (total_brl) com provider_trace.