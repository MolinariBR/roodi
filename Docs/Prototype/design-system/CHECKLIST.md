# CHECKLIST DE CONFORMIDADE - DESIGN SYSTEM (PROTOTYPE)

Use este checklist sempre que criar ou alterar telas em `Docs/Prototype`.

## 1. Imports obrigatórios no `<head>`
Toda tela HTML não-vazia deve conter:

```html
<link href="../design-system/tokens.css" rel="stylesheet" />
<link href="../design-system/design.css" rel="stylesheet" />
<script src="../design-system/tailwind-theme.js"></script>
```

## 2. Regras obrigatórias
- Não usar `<style>` dentro das telas.
- Não usar `style="..."` inline.
- Não usar classes Tailwind arbitrárias `[...]`.
- Não usar cor hardcoded em classes (`bg-[#...]`, `ring-[#...]`, `shadow-[...rgba(...)]`, etc.).
- Não usar cor hardcoded em SVG/HTML (`fill="#..."`, `stroke="#..."`, `stop-color="#..."`).
- Reutilizar classes centrais de `design.css` quando já existir equivalente.

## 3. Fonte de verdade visual
- Tokens CSS: `Docs/Prototype/design-system/tokens.css`
- Tema Tailwind: `Docs/Prototype/design-system/tailwind-theme.js`
- Primitivas e componentes CSS: `Docs/Prototype/design-system/design.css`

## 4. Auditoria automática
Execute na raiz do projeto:

```bash
./Docs/Prototype/design-system/check-design-system.sh
```

Para auditar outro diretório HTML:

```bash
./Docs/Prototype/design-system/check-design-system.sh Docs/Prototype
```

## 5. Critério de aprovação
- Status final deve ser: `[RESULT] APROVADO`
- Qualquer `[FAIL]` bloqueia merge/entrega até correção.

## 6. Observações
- Arquivos HTML vazios são listados como `[WARN]` e ignorados na auditoria.
- O lint detecta padrões de regressão visual comuns; se surgir um novo padrão, atualize o script de checagem.
