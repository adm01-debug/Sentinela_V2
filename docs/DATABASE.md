# Database Documentation

Documentação completa do schema do banco de dados Sentinela.

## Visão Geral

O Sentinela usa **Supabase** (PostgreSQL) como banco de dados principal.

- **Total de tabelas:** 40+
- **Total de migrations:** 46
- **RLS:** Habilitado em todas as tabelas

---

## Diagrama ER (Simplificado)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  companies  │────<│  employees  │────<│  devices    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   teams     │     │ violations  │     │ activities  │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Tabelas Principais

### companies

Empresas cadastradas no sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| name | varchar(255) | Nome da empresa |
| slug | varchar(100) | Slug único |
| plan | varchar(50) | Plano atual |
| is_active | boolean | Status ativo |
| settings | jsonb | Configurações |
| created_at | timestamp | Data criação |

### employees

Funcionários monitorados.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| company_id | uuid | FK companies |
| name | varchar(255) | Nome completo |
| email | varchar(255) | Email único |
| department | varchar(100) | Departamento |
| position | varchar(100) | Cargo |
| is_active | boolean | Status ativo |
| hire_date | date | Data contratação |
| created_at | timestamp | Data criação |

### devices

Dispositivos com agent instalado.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| employee_id | uuid | FK employees |
| name | varchar(255) | Nome do device |
| type | varchar(50) | desktop/mobile/tablet |
| os | varchar(100) | Sistema operacional |
| os_version | varchar(50) | Versão do SO |
| agent_version | varchar(20) | Versão do agent |
| ip_address | inet | Último IP |
| last_seen | timestamp | Último contato |
| is_active | boolean | Status ativo |

### violations

Violações de políticas detectadas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| employee_id | uuid | FK employees |
| policy_id | uuid | FK policies |
| type | varchar(50) | Tipo de violação |
| severity | varchar(20) | low/medium/high/critical |
| description | text | Descrição |
| evidence_url | text | URL da evidência |
| resolved | boolean | Foi resolvida |
| resolved_by | uuid | FK profiles |
| resolved_at | timestamp | Data resolução |
| created_at | timestamp | Data detecção |

### activities

Log de atividades dos funcionários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| employee_id | uuid | FK employees |
| device_id | uuid | FK devices |
| type | varchar(50) | Tipo de atividade |
| app_name | varchar(255) | Nome do app |
| window_title | text | Título da janela |
| url | text | URL (se navegador) |
| duration_seconds | integer | Duração em segundos |
| is_productive | boolean | É produtiva |
| created_at | timestamp | Data/hora |

### teams

Equipes/grupos de funcionários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| company_id | uuid | FK companies |
| name | varchar(255) | Nome da equipe |
| description | text | Descrição |
| manager_id | uuid | FK employees |
| created_at | timestamp | Data criação |

### policies

Políticas de monitoramento.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| company_id | uuid | FK companies |
| name | varchar(255) | Nome da política |
| description | text | Descrição |
| rules | jsonb | Regras configuradas |
| is_active | boolean | Status ativo |
| created_at | timestamp | Data criação |

---

## Tabelas de Suporte

### profiles

Perfis de usuários do sistema (auth).

### agent_keys

Chaves de API para autenticação do agent.

### rate_limit_logs

Logs de rate limiting das Edge Functions.

### blocked_ips

IPs bloqueados por excesso de requisições.

### export_jobs

Jobs de exportação de dados.

### security_events

Eventos de segurança (login, MFA, etc).

### gamification_leaderboard

Ranking de gamificação.

### achievements

Conquistas disponíveis.

---

## Índices

```sql
-- Índices principais para performance
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_violations_employee ON violations(employee_id);
CREATE INDEX idx_violations_created ON violations(created_at);
CREATE INDEX idx_activities_employee_date ON activities(employee_id, created_at);
CREATE INDEX idx_devices_employee ON devices(employee_id);
CREATE INDEX idx_devices_last_seen ON devices(last_seen);
```

---

## RLS Policies

Todas as tabelas têm Row Level Security habilitado:

```sql
-- Exemplo: employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view employees from their company"
ON employees FOR SELECT
USING (company_id = auth.jwt() -> 'company_id');

CREATE POLICY "Admins can manage employees"
ON employees FOR ALL
USING (auth.jwt() -> 'role' = 'admin');
```

---

## Migrations

As migrations estão em `supabase/migrations/`.

Para aplicar:
```bash
supabase db push
```

Para criar nova:
```bash
supabase migration new nome_da_migration
```

---

## Backup

Backups automáticos diários via Supabase.

Para backup manual:
```bash
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```
