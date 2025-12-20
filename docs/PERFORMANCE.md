# Guia de Performance

## Métricas Alvo

- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- TTI < 3.5s

## Otimizações Implementadas

### Frontend

- React.lazy para code splitting
- Suspense para loading states
- useMemo/useCallback para memoização
- Virtual scrolling para listas grandes

### Backend

- Connection pooling
- Query optimization
- Índices no banco
- Cache em Edge Functions

### Assets

- Lazy loading de imagens
- WebP format
- Compressão gzip/brotli

## Monitoramento

```bash
npm run lighthouse
```

## Ferramentas

- Lighthouse CI
- React DevTools Profiler
- Chrome Performance tab
