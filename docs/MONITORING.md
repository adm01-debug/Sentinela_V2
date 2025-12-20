# Guia de Monitoramento

## Ferramentas

- **Sentry**: Error tracking
- **Supabase Dashboard**: Métricas do banco
- **Vercel Analytics**: Performance do frontend

## Alertas Configurados

### Críticos
- Error rate > 5%
- Response time > 5s
- Database down

### Warning
- Error rate > 1%
- Response time > 2s
- Memory usage > 80%

## Dashboards

### Supabase
- Queries por segundo
- Conexões ativas
- Storage usage

### Aplicação
- Usuários ativos
- Tempo de resposta
- Taxa de erros

## Logs

```bash
# Ver logs do Supabase
npx supabase functions logs

# Ver logs do frontend
npm run dev -- --debug
```

## Runbook

### Alta latência
1. Verificar queries lentas
2. Verificar índices
3. Escalar recursos

### Erros em massa
1. Verificar Sentry
2. Rollback se necessário
3. Investigar causa raiz
