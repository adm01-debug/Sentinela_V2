# Git Flow — Sentinela

## Branches

| Branch | Propósito | Proteção |
|--------|-----------|----------|
| `main` | Produção estável | PR obrigatório, CI passando |
| `feat/*` | Novas funcionalidades | - |
| `fix/*` | Bug fixes | - |
| `hotfix/*` | Correções urgentes em produção | Review prioritário |
| `refactor/*` | Melhorias de código | - |
| `docs/*` | Documentação | - |

## Fluxo Normal

```
1. git checkout -b feat/nome-feature
2. Desenvolver + commitar (conventional commits)
3. Push + abrir PR contra main
4. CI roda automaticamente
5. Code review (SLA: 24h)
6. Merge via Squash & Merge
7. Deploy automático via Lovable
```

## Hotfix

```
1. git checkout -b hotfix/descricao-curta
2. Implementar fix mínimo
3. Push + abrir PR com label "hotfix"
4. Review prioritário (SLA: 1h)
5. Merge + deploy imediato
6. Post-mortem em docs/postmortems/
```

## Conventional Commits

```
feat: nova funcionalidade
fix: correção de bug
refactor: melhoria sem mudança funcional
docs: documentação
test: adição/modificação de testes
chore: manutenção (deps, configs)
perf: melhoria de performance
security: correção de segurança
```
