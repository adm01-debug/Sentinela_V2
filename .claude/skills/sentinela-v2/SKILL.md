---
name: sentinela-v2
description: Convenções de código e commit do Sentinela V2 (TypeScript, Conventional Commits). Use ao alterar código, criar testes ou escrever mensagem de commit neste repositório; as regras operacionais ficam em AGENTS.md.
---

# Sentinela V2 — convenções

As regras de trabalho (banco, fluxo Git, PR, comunicação) estão em `AGENTS.md` na raiz — este skill só
resume convenções de código e commit.

## Commits

Padrão Conventional Commits, cobrado pelo hook `commit-msg` (`commitlint.config.cjs`):
`<tipo>(<escopo>): <descrição>` — escopo opcional e minúsculo; assunto até 100 caracteres, sem
start/pascal/upper case; tipos: `feat fix docs style refactor perf test chore revert ci build`
(não há `security` nem `infra`). Mensagem em PT-BR, modo imperativo, primeira linha curta.

Exemplo: `fix(guards): remove liberação de admin por sufixo de e-mail`

## Código

- Linguagem: TypeScript (front Vite + React 19 em `src/`, edge functions Deno em
  `supabase/functions/`, Electron em `desktop-agent/`).
- Funções `camelCase`, classes/componentes `PascalCase`, constantes `SCREAMING_SNAKE_CASE`.
- Exports nomeados; siga o padrão de import do arquivo vizinho.
- **Use só o alias `@/`**: o `tsconfig.json` declara 10 aliases, mas `vite.config.ts` resolve apenas
  `@` — os outros compilam e quebram no bundle.
- Supabase sempre por `import { supabase } from "@/integrations/supabase/client"`.
- Testes ao lado do módulo (`__tests__/`) ou em `src/test/`; `e2e/` é Playwright e fica fora do
  vitest. Rode só o que tocou: `npx vitest run <caminho>`.
- `src/hooks/` tem 479 arquivos planos: procure um hook existente antes de criar outro.
- Lint: `npx eslint <arquivos>` (o CI usa `npx eslint src/ --max-warnings 0`; `npm run lint` está
  quebrado). `any` e `console.log` viram warning e, com `--max-warnings 0`, reprovam.
- Siga os padrões já existentes no módulo; não desvie sem motivo registrado na PR.
