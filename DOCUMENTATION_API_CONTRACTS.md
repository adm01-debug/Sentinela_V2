# Documentação de Contratos de API - Edge Functions & Webhooks

Esta documentação descreve os contratos de dados (schemas), validações e formatos de resposta para as Edge Functions e Webhooks do sistema.

## Padrão de Resposta de Erro (422 Unprocessable Entity)

Todas as falhas de validação seguem o formato unificado abaixo:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "location.latitude",
        "message": "Number must be less than or equal to 90",
        "code": "too_big"
      }
    ]
  }
}
```

## Versionamento

As APIs suportam versionamento via query string `?v=v1` ou header `X-API-Version: v1`. Atualmente as versões suportadas são `v1` (padrão) e `v2`.

---

## 1. Agent Collector (`/agent-collector`)

Coleta dados de atividade dos agentes desktop.

**Contrato (v1/v2):**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `data_type` | enum | Sim | Tipo de dado (`screenshot`, `activity`, `keystroke`, etc) |
| `data` | object | Sim | Payload específico do tipo de dado |
| `timestamp` | ISO8601 | Não | Data/hora da ocorrência |
| `session_id` | UUID | Não | ID da sessão do agente |

**Exemplo de Payload:**

```json
{
  "data_type": "activity",
  "data": {
    "keystrokes": 150,
    "mouse_clicks": 45,
    "idle_time": 10
  },
  "timestamp": "2024-05-22T15:00:00Z"
}
```

---

## 2. Mobile Collector (`/mobile-collector`)

Coleta dados de geolocalização e uso de apps em dispositivos móveis.

**Contrato (v1/v2):**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `employee_id` | UUID | Sim | ID do funcionário |
| `device_id` | string | Sim | Identificador único do dispositivo |
| `location` | object | Não | Latitude/Longitude/Accuracy |
| `battery_level` | number | Não | Nível da bateria (0-100) |

**Exemplo de Payload:**

```json
{
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "device_id": "iphone-15-pro",
  "location": {
    "latitude": -23.5505,
    "longitude": -46.6333,
    "accuracy": 5.0
  }
}
```

---

## 3. Webhook Sender (`/send-webhook`)

Envia notificações para sistemas externos.

**Contrato (v1/v2):**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `webhook_id` | UUID | Sim | ID da configuração do webhook |
| `event_type` | string | Sim | Nome do evento disparado |
| `payload` | object | Sim | Dados do evento |

**Exemplo de Payload:**

```json
{
  "webhook_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "event_type": "employee.attendance.clock_in",
  "payload": {
    "employee_name": "João Silva",
    "time": "2024-05-22T08:00:00Z"
  }
}
```

---

## Tabelas e Relacionamentos

| Função             | Tabelas Afetadas                                         | Operações              |
| ------------------ | -------------------------------------------------------- | ---------------------- |
| `agent-collector`  | `keystroke_logs`, `screen_captures`, `productivity_logs` | INSERT                 |
| `mobile-collector` | `mobile_devices`, `mobile_activity_logs`                 | UPSERT, INSERT         |
| `send-webhook`     | `webhooks`, `webhook_logs`                               | SELECT, INSERT, UPDATE |
| `check-geofence`   | `geofences`, `geofence_violations`                       | SELECT, INSERT         |
