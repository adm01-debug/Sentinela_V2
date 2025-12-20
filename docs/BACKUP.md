# Guia de Backup

## Estratégia

- **Diário**: Backup automático Supabase
- **Semanal**: Export completo
- **Mensal**: Archive cold storage

## Backup Manual

```bash
# Export do banco
pg_dump -h db.xxx.supabase.co -U postgres > backup.sql

# Export do storage
npx supabase storage download
```

## Recuperação

```bash
# Restaurar banco
psql -h db.xxx.supabase.co -U postgres < backup.sql
```

## Retenção

- Backups diários: 7 dias
- Backups semanais: 4 semanas
- Backups mensais: 12 meses

## Verificação

- [ ] Testar restore mensalmente
- [ ] Validar integridade
- [ ] Documentar processo

## Disaster Recovery

1. Identificar falha
2. Notificar stakeholders
3. Restaurar último backup
4. Verificar integridade
5. Retomar operações
