# Processo de Release

## Versionamento

Usamos [Semantic Versioning](https://semver.org/):
- MAJOR: breaking changes
- MINOR: novas features
- PATCH: bug fixes

## Checklist de Release

1. [ ] Todos os testes passando
2. [ ] Documentação atualizada
3. [ ] CHANGELOG atualizado
4. [ ] Build de produção OK
5. [ ] Review aprovado

## Criando uma Release

```bash
# Atualizar versão
npm version minor

# Push com tags
git push origin main --tags
```

## Deploy Automático

O CI/CD faz deploy automático:
- `main` → Produção
- `develop` → Staging

## Rollback

```bash
# Reverter para versão anterior
git revert HEAD
git push origin main
```
