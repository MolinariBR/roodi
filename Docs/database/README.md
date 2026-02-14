# Database Contract - Roodi

## Arquivos
1. `Docs/10DATABASE.md`: contrato logico oficial do banco.
2. `Docs/database/roodi_schema.sql`: contrato fisico SQL (PostgreSQL).
3. `Docs/database/schema.prisma`: representacao Prisma equivalente ao contrato SQL.

## Como validar sintaxe SQL (opcional)
Se tiver `psql` e um banco local:
```bash
psql "$DATABASE_URL" -f Docs/database/roodi_schema.sql
```

## Validacao rapida sem Docker (PostgreSQL local)
```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f Docs/database/roodi_schema.sql
```

## Testes automatizados (excecao permitida)
Para cenarios de integracao que exigem infraestrutura efemera, usar apenas `testcontainers`.

## Observacoes
1. O schema foi modelado para PostgreSQL e stack com Prisma.
2. `schema.prisma` foi gerado por introspecao (`prisma db pull`) a partir de `roodi_schema.sql` aplicado em PostgreSQL 16.
3. Algumas regras SQL avancadas (ex.: `CHECK`, indices parciais) nao sao 100% expressas pelo Prisma e permanecem no SQL como fonte estrutural.
4. Alteracoes nesse contrato devem sincronizar OpenAPI e documentos de modulo/fluxo.
