# Sentinela - Levantamento Completo de Funcionalidades

> Documento gerado a partir de análise exaustiva de todo o histórico do projeto.
> Última atualização: 15/03/2026

---

## 1. AUTENTICAÇÃO & SEGURANÇA DE ACESSO

- [x] Login com email/senha (Supabase Auth)
- [x] Registro de novos usuários
- [x] Recuperação de senha (Forgot Password)
- [x] Verificação de email
- [x] Proteção de rotas (ProtectedRoute)
- [x] Redirecionamento de usuários autenticados (AuthGuard)
- [x] Registro de eventos de segurança de login (`login_security_events`)
- [x] Bloqueio de IPs (`blocked_ips`)
- [x] Bloqueio geográfico (`geo_blocks`, `geo_blocking_settings`)

---

## 2. DASHBOARD

- [x] Visão geral com cards de métricas (Total de Funcionários, Ativos Agora, Alertas de Segurança, Horas Trabalhadas)
- [x] Gráficos de atividade e produtividade
- [x] Top performers
- [x] Filtros de dashboard (`DashboardFilter`)
- [x] Widgets configuráveis (`DashboardWidget`, `WidgetConfig`, `WidgetPosition`)

---

## 3. MONITORAMENTO DE FUNCIONÁRIOS

### 3.1 Gestão de Funcionários
- [x] Lista de funcionários com filtros (departamento, status)
- [x] Criação de funcionários
- [x] Detalhes do funcionário
- [x] Edição de funcionários
- [x] Avatar, email, telefone, departamento, posição, data de contratação
- [x] Notas sobre funcionários
- [x] Vinculação a equipes (`team_id`)
- [x] Vinculação a empresas (`company_id`)

### 3.2 Monitoramento de Atividades
- [x] Página de atividades com lista/timeline
- [x] Detalhes de atividade individual
- [x] Timeline de atividades (`ActivityTimelinePage`)

### 3.3 Capturas de Tela (Screenshots)
- [x] Galeria de screenshots (`ScreenshotsPage`)
- [x] Detalhe de screenshot (`ScreenshotDetailPage`)
- [x] Captura periódica pelo Desktop Agent

### 3.4 Live View & Session Playback
- [x] **Live View**: Screenshots periódicos (5-10s) para supervisão em tempo real
- [x] **Session Playback**: Replay histórico de sessões com screenshots + eventos de ação (cliques, teclas)
- [x] Retenção de dados por 30 dias com limpeza automática

---

## 4. BLOQUEIOS DE SEGURANÇA

- [x] Bloqueio de print screen (captura de tela)
- [x] Bloqueio de acesso a drives USB
- [x] Bloqueio de conexão de armazenamento externo (HDs externos)
- [x] Alertas em tempo real para violações de segurança

---

## 5. REGISTRO DE TECLAS & CLIQUES

### 5.1 Keystroke Logs
- [x] Contagem de teclas por período (`keystroke_logs`)
- [x] Detalhes de teclas pressionadas (`keystroke_details`)
- [x] Tempo ativo vs ocioso
- [x] App/janela associada
- [x] Tabelas particionadas por mês para performance

### 5.2 Click Logs
- [x] Registro de cliques com tipo, posição X/Y
- [x] Elemento alvo, URL, app, janela
- [x] Tabelas particionadas por mês

---

## 6. DISPOSITIVOS

### 6.1 Desktop Agent (Electron)
- [x] Instalação para Windows (.exe), macOS (.dmg), Linux (.deb/.rpm)
- [x] Instalação silenciosa (Enterprise)
- [x] Rastreamento de atividade
- [x] Captura de screenshots
- [x] Detecção de ociosidade
- [x] Análise de teclas
- [x] Auto-update
- [x] Gestão de Agent Keys (`agent_keys`)

### 6.2 Dispositivos Desktop
- [x] Lista de dispositivos (`DevicesPage`)
- [x] Cadastro com tipo, OS, versão, IP, MAC address
- [x] Vinculação a funcionários (`devices`, `employee_devices`)

### 6.3 Dispositivos Móveis
- [x] Registro de dispositivos móveis (`mobile_devices`)
- [x] OS type, model, app version, push token
- [x] Última localização (lat/lng)
- [x] Logs de atividade móvel (`mobile_activity_logs`) com tabelas particionadas

---

## 7. ALERTAS & VIOLAÇÕES

### 7.1 Alertas
- [x] Página de alertas (`AlertsPage`)
- [x] Detalhe de alerta (`AlertDetailPage`)
- [x] Regras de alerta configuráveis (`AlertRulesPage`)
- [x] Níveis de severidade: Critical, High, Medium, Low
- [x] Configurações de notificação de alertas (`alert_notification_settings`)

### 7.2 Violações
- [x] Página de violações (`ViolationsPage`)
- [x] Detalhe de violação (`ViolationDetailPage`)
- [x] Violações de geofence (`geofence_violations`)

### 7.3 Monitoramento
- [x] Página de monitoramento geral (`MonitoringPage`)
- [x] Configurações de monitoramento (`monitoring_settings`)

---

## 8. ANALYTICS & PRODUTIVIDADE

- [x] Dashboard de analytics (`AnalyticsPage`)
- [x] Análise de produtividade (`AnalyticsProductivityPage`)
- [x] Uso de aplicações (`AnalyticsApplicationsPage`)
- [x] Tendências (`AnalyticsTrendsPage`)
- [x] Regras de aplicação (`application_rules`) - categorização produtivo/improdutivo

---

## 9. RELATÓRIOS

- [x] Lista de relatórios (`ReportsPage`)
- [x] Detalhe de relatório (`ReportDetailPage`)
- [x] Relatórios customizados (`CustomReportsPage`)
- [x] Relatórios agendados (`ScheduledReportsPage`)
- [x] Tipos: Diário, Semanal, Produtividade, Uso de Apps, Presença
- [x] Formatos de exportação: PDF, CSV, Excel

---

## 10. ANÁLISE COM IA

- [x] Página de análise IA (`AIAnalysisPage`)
- [x] Relatórios de análise IA (`ai_analysis_reports`)
- [x] Insights, recomendações, score de risco
- [x] Período de análise configurável
- [x] Integração com modelos Lovable AI (sem API key necessária)

---

## 11. GEOFENCING

- [x] Página de geofencing (`GeofencingPage`)
- [x] Cadastro de geofences com lat/lng, raio, endereço
- [x] Vinculação de funcionários a geofences (`employee_geofences`)
- [x] Violações de geofence com distância e ação tomada
- [x] Ativação/desativação de geofences

---

## 12. EQUIPES & DEPARTAMENTOS

- [x] Gestão de equipes (`TeamsPage`, `TeamDetailPage`)
- [x] Gestão de departamentos (`DepartmentsPage`, `DepartmentDetailPage`)
- [x] Vinculação de funcionários

---

## 13. GAMIFICAÇÃO

- [x] Página de gamificação (`GamificationPage`)
- [x] Sistema de badges (`badges`)
- [x] Badges por funcionário (`employee_badges`)
- [x] Sistema de pontos (`employee_points`)
- [x] Níveis, experiência, streaks

---

## 14. AGENDAMENTO & CALENDÁRIO

- [x] Calendário (`CalendarPage`)
- [x] Horários de trabalho (`WorkSchedulesPage`, `work_schedules`)
- [x] Atribuição de schedules a funcionários (`employee_schedules`)

---

## 15. CONTROLE DE ACESSO À INTERNET

- [x] Configurações de acesso por funcionário (`internet_access_settings`)
- [x] Nível de acesso, sites permitidos/bloqueados
- [x] Categorias permitidas/bloqueadas
- [x] Limite de bandwidth
- [x] Horários ativos

---

## 16. INTEGRAÇÕES

- [x] Página de integrações (`IntegrationsPage`)
- [x] Webhooks (`WebhooksPage`)
- [x] WhatsApp (`WhatsAppIntegrationPage`)
- [x] Templates de mensagem (`message_templates`)
- [x] Configurações de integração (`IntegrationSettingsPage`)

---

## 17. CONFIGURAÇÕES

- [x] Configurações gerais (`SettingsPage`)
- [x] Perfil (`ProfileSettingsPage`)
- [x] Segurança (`SecuritySettingsPage`)
- [x] Notificações (`NotificationSettingsPage`)
- [x] Integrações (`IntegrationSettingsPage`)
- [x] Faturamento/Billing (`BillingSettingsPage`)
- [x] Chaves de API (`ApiKeysPage`)

---

## 18. ADMINISTRAÇÃO

- [x] Gestão de usuários (`UsersPage`)
- [x] Gestão de roles/papéis (`RolesPage`)
- [x] Gestão de equipes (`TeamsPage`)
- [x] Gestão de departamentos (`DepartmentsPage`)
- [x] Log de auditoria (`AuditLogPage`)

---

## 19. MULTI-EMPRESA (Multi-Tenant)

- [x] Tabela de empresas (`companies`) com plano, logo, max employees
- [x] Slug único por empresa
- [x] Vinculação de funcionários, dispositivos, geofences a empresas

---

## 20. EXPORTAÇÃO DE DADOS & COMPLIANCE

- [x] Exportação de dados (`DataExportPage`)
- [x] Compliance/conformidade (`CompliancePage`)

---

## 21. PONTO DIGITAL & HORAS (NOVO)

- [x] Ponto Digital com clock-in/clock-out (`TimeClockPage`, `time_entries`)
- [x] Status Board em tempo real (`employee_status` com Realtime)
- [x] Projetos & Tarefas com tracking de tempo (`ProjectsPage`, `projects`, `tasks`)
- [x] Folhas de Ponto automáticas (`TimesheetsPage`, `timesheets`)
- [x] Controle de Assiduidade (`AttendancePage`, `attendance_records`)
- [x] Tracking de Horas com gráficos (`HoursTrackingPage`)

---

## 22. ARQUITETURA TÉCNICA

- [x] React 18 + TypeScript + Vite
- [x] TailwindCSS + shadcn/ui
- [x] Supabase (Lovable Cloud) para backend
- [x] Lazy loading de todas as páginas
- [x] Tabelas particionadas para dados de alto volume
- [x] Sistema de rotas centralizado (`constants/routes.ts`)
- [x] Tipos TypeScript completos (42+ arquivos de tipos)
- [x] Design system com tokens semânticos

---

## RESUMO

| Categoria | Funcionalidades |
|---|---|
| Autenticação | 7 |
| Dashboard | 5 |
| Monitoramento | 12 |
| Segurança | 4 |
| Keystroke/Click | 6 |
| Dispositivos | 9 |
| Alertas/Violações | 7 |
| Analytics | 4 |
| Relatórios | 5 |
| IA | 5 |
| Geofencing | 5 |
| Equipes/Deps | 4 |
| Gamificação | 5 |
| Agendamento | 3 |
| Internet | 5 |
| Integrações | 5 |
| Configurações | 7 |
| Admin | 5 |
| Multi-Tenant | 3 |
| Export/Compliance | 2 |
| Ponto & Horas | 6 |
| **TOTAL** | **~112 funcionalidades** |
