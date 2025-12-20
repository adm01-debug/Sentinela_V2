# Guia de Migração

## Migrações de Banco de Dados

### Criar Nova Migração

```bash
npx supabase migration new nome_da_migracao
```

### Aplicar Migrações

```bash
npx supabase db push
```

### Reverter Migração

```bash
npx supabase db reset
```

## Migrações de Versão

### v1.x → v2.x

1. Backup do banco de dados
2. Atualizar dependências
3. Executar migrations
4. Testar funcionalidades

### Breaking Changes

- v2.0: Nova estrutura de autenticação
- v1.5: Mudança no schema de violations

## Checklist de Migração

- [ ] Backup completo
- [ ] Testar em staging
- [ ] Comunicar usuários
- [ ] Monitorar após deploy
