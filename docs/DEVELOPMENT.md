# Guia de Desenvolvimento

## Estrutura do Projeto

```
sentinela/
├── src/              # Frontend React
├── desktop-agent/    # Electron Agent
├── mobile-app/       # React Native App
├── supabase/         # Edge Functions
├── e2e/              # Testes E2E
└── docs/             # Documentação
```

## Scripts Principais

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run test         # Testes unitários
npm run test:e2e     # Testes E2E
npm run lint         # Linting
npm run storybook    # Storybook
```

## Padrões de Código

- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- Testes obrigatórios

## Fluxo de Trabalho

1. Crie uma branch: `git checkout -b feature/nome`
2. Desenvolva com TDD
3. Commit: `git commit -m "feat: descrição"`
4. Push: `git push origin feature/nome`
5. Abra um Pull Request

## Debugging

```bash
DEBUG=sentinela:* npm run dev
```
