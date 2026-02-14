# Module: locality

## Objective
Resolver distancia e tempo entre bairros usando ordem deterministica de providers.

## Responsibilities
- Normalizar bairro de origem/destino.
- Resolver par na matriz local (`locality_bairro_matrix`).
- Aplicar fallback ordenado de providers externos quando necessario.
- Produzir trilha de tentativas para auditoria de cotacao.
