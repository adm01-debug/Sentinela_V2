# Documentação Técnica: Edge Functions

Este documento detalha o mapeamento das Edge Functions, tabelas acessadas e contratos de dados.

## Padrões de Implementação
- **Autenticação**: Via `x-agent-key` (para agentes) ou JWT (para usuários).
- **Logs**: Todas as funções utilizam a tabela `edge_function_logs` via o logger compartilhado em `_shared/logger.ts`.
- **Validação**: Esquemas Zod definidos em `_shared/validation.ts`.
- **Segurança**: RLS habilitado em todas as tabelas; filtragem explícita por `company_id` em operações via service role.

## Mapa Função → Tabelas

| Função | Tabelas Acessadas | Objetivo |
| :--- | :--- | :--- |
| `agent-collector` | `agent_keys`, `employees`, `screen_captures`, `keystroke_logs`, `productivity_logs`, `click_logs` | Coleta de telemetria do agente Desktop/Mobile. |
| `validate-agent-key` | `agent_keys` | Validação de chaves e retorno de configuração. |
| `check-geofence` | `geofences`, `geofence_events`, `geofence_states` | Monitoramento de perímetros geográficos. |
| `analyze-activity` | `click_logs`, `keystroke_logs`, `productivity_logs` | Agregação de dados para insights de produtividade. |
| `generate-insights` | `employees`, `security_violations`, `activities` | Geração de insights via IA baseada em comportamento. |

## Contratos de Dados (Exemplos)

### `agent-collector` (POST)
**Headers:**
- `x-agent-key`: `uuid-key`

**Payload:**
```json
{
  "data_type": "activity",
  "data": {
    "keystrokes": 150,
    "idle_time": 10
  },
  "timestamp": "2023-10-01T12:00:00Z"
}
```

### `validate-agent-key` (POST)
**Payload:**
```json
{
  "agentKey": "string-key",
  "deviceInfo": { "os": "windows" }
}
```

## Monitoramento
O dashboard de monitoramento está disponível em `/admin/edge-functions` na aplicação frontend.
- **Métricas principais**: Taxa de erro, latência média, volume de eventos por função.
