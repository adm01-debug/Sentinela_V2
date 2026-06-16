# Code Review Guidelines — Sentinela

## Princípios

1. **Respeito** — feedback sobre o código, nunca sobre a pessoa
2. **Clareza** — explicar o "porquê" de cada sugestão
3. **Pragmatismo** — perfeição é inimiga do progresso

## SLA de Review

| Tipo           | SLA   |
| -------------- | ----- |
| Hotfix (P1/P2) | < 1h  |
| Feature        | < 24h |
| Refatoração    | < 48h |
| Documentação   | < 48h |

## Checklist do Reviewer

### Segurança

- [ ] Sem secrets/API keys no código
- [ ] RLS atualizado para novas tabelas
- [ ] Input validation no backend (Edge Functions)
- [ ] Sem SQL injection (queries parametrizadas)

### Qualidade

- [ ] TypeScript strict (sem `any`, sem `as` injustificado)
- [ ] Logger estruturado (sem `console.log`)
- [ ] Design tokens semânticos (sem cores hardcoded)
- [ ] Componentes < 300 linhas
- [ ] Funções < 50 linhas

### Performance

- [ ] Sem queries N+1
- [ ] Lazy loading para componentes pesados
- [ ] Paginação server-side em listagens

### Acessibilidade

- [ ] `aria-label` em botões com ícone
- [ ] Navegação por teclado funcional
- [ ] Contraste adequado

### Testes

- [ ] Testes unitários para lógica de negócio
- [ ] Testes de integração para fluxos críticos
- [ ] Sem flaky tests

## Convenções de Comentário

- `nit:` — sugestão menor, não bloqueia merge
- `question:` — pedido de esclarecimento
- `suggestion:` — alternativa proposta
- `blocker:` — deve ser corrigido antes do merge
