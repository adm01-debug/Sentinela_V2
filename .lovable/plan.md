## Contexto

O sistema já cobre a Fase 1 de paridade com o Teramind (gravação de sessão, retenção, custo por empresa) e possui DLP de clipboard, bloqueio de USB no agente (`desktop-agent/src/services/usbBlocker.ts`), políticas DLP e incidentes (`DLPPoliciesPage`, `DLPIncidentsPage`).

Verificado no código: **não existe hoje nenhuma tabela, hook, página ou Edge Function de rastreamento de transferência de arquivos**. A única menção a `file_transfers` no projeto é como valor de enum de política de retenção (`data_retention_policies`), sem tabela correspondente. Esse é o principal gap frente ao demo do Teramind.

## O que será construído — Fase 2: File Transfer Tracking

### 1. Modelo de dados
Nova tabela `public.file_transfers` registrando cada movimentação de arquivo detectada pelo agente:
- identificação: empresa, colaborador, dispositivo
- arquivo: nome, extensão, tamanho, hash SHA-256, caminho de origem/destino
- canal: `usb`, `browser_upload`, `browser_download`, `cloud_sync`, `email_attach`, `network_share`, `print`
- direção (`in`/`out`), aplicação/processo responsável, domínio de destino quando aplicável
- resultado: `allowed`, `blocked`, `flagged` + política DLP que disparou
- classificação de sensibilidade e vínculo opcional com `security_violations` e com a sessão de gravação do momento

Índices por empresa+data, por colaborador, por canal e por hash. RLS multi-tenant por `company_id` com leitura para admin/supervisor, escrita apenas via service role. GRANTs explícitos.

### 2. Ingestão
Edge Function `ingest-file-transfer`: autenticação por `x-agent-key` (mesmo padrão de `upload-recording-chunk`), validação Zod do payload, deduplicação por hash+timestamp, avaliação contra as políticas DLP ativas e criação automática de incidente DLP + violação quando a regra determinar bloqueio.

### 3. Agente desktop
Novo serviço `desktop-agent/src/services/fileTransferWatcher.ts`:
- monitora inserção de mídia removível e escrita de arquivos nela
- monitora a pasta de downloads e diretórios de sincronização em nuvem
- calcula hash e metadados, aplica veredito local quando a política é de bloqueio, e envia em lote com retry resiliente (reaproveitando `dataSender`)

### 4. Interface
Página `/admin/file-transfers` com:
- cartões de resumo (volume transferido, transferências bloqueadas, arquivos sensíveis, dispositivos USB distintos)
- gráficos Recharts: volume por canal ao longo do tempo e top colaboradores por volume de saída
- tabela filtrável (colaborador, canal, veredito, período, extensão) com estado persistido em URL
- painel de detalhe do evento com hash, política acionada, evidência e link para o trecho de gravação correspondente

Rota protegida por `SupervisorGuard`, entrada na sidebar e integração com os `saved_filters` já existentes.

### 5. Retenção
A política `file_transfers` já prevista em `data_retention_policies` passa a ser efetivamente aplicada pela função de expurgo agendada.

## Detalhes técnicos

- Todos os textos em pt-BR e registrados em `src/i18n/locales`, sem strings hardcoded
- Tokens semânticos Tailwind; gráficos via `useChartColors`
- TanStack Query com `staleTime`, `.maybeSingle()` nas leituras unitárias
- TypeScript estrito, zero `any`, validação Zod em `src/lib/schemas.ts`
- Arquivos abaixo de 500 linhas; hooks separados dos componentes de apresentação
- Migração com `CREATE TABLE` → `GRANT` → `ENABLE RLS` → `CREATE POLICY`, nessa ordem

## Ordem de execução

1. Migração de banco + RLS + índices
2. Edge Function de ingestão + testes de smoke
3. Hooks de consulta e agregação
4. Página, gráficos e filtros
5. Serviço do agente desktop
6. Aplicação da retenção e validação ponta a ponta
