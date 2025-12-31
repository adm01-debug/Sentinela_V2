# 📋 Inventário Completo: Funcionalidades e Ferramentas do Sentinela

> Documento de referência para replicação de padrões em novos projetos.
> **Versão**: 13.0.0 | **Última atualização**: 2025-12-31

---

## 🏗️ Stack Tecnológica Principal

| Categoria | Ferramenta | Versão | Uso |
|-----------|------------|--------|-----|
| **Framework Frontend** | React | ^18.3.1 | Biblioteca UI principal |
| **Build Tool** | Vite | ^5.4.19 | Bundler e dev server |
| **Linguagem** | TypeScript | ^5.8.3 | Tipagem estática |
| **Estilização** | Tailwind CSS | ^3.4.17 | Utility-first CSS |
| **Backend** | Supabase | ^2.88.0 | BaaS (Auth, DB, Storage, Edge Functions) |
| **State Management** | TanStack Query | ^5.83.0 | Server state management |
| **State Local** | Zustand | 5.0.9 | Client state management |
| **Roteamento** | React Router DOM | ^6.30.1 | SPA routing |
| **Animações** | Framer Motion | 12.23.26 | Animações declarativas |
| **Internacionalização** | i18next | 25.7.3 | Multi-idioma |
| **Validação** | Zod | ^3.25.76 | Schema validation |
| **Formulários** | React Hook Form | ^7.61.1 | Gerenciamento de forms |
| **Gráficos** | Recharts | ^2.15.4 | Visualização de dados |
| **Mapas** | Mapbox GL | ^3.17.0 | Geolocalização |
| **PDF** | jsPDF + AutoTable | ^3.0.4 | Exportação PDF |
| **Excel** | xlsx | ^0.18.5 | Exportação/Importação Excel |
| **Monitoramento** | Sentry | ^8.0.0 | Error tracking |
| **PWA** | vite-plugin-pwa | 1.2.0 | Progressive Web App |

---

## 🔐 MÓDULO: AUTENTICAÇÃO E SEGURANÇA

### 1. Autenticação de Usuários
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Login/Registro | Supabase Auth | `src/pages/Login.tsx`, `src/pages/Register.tsx` |
| Recuperação de Senha | Supabase Auth | `src/pages/ForgotPassword.tsx`, `src/pages/ResetPassword.tsx` |
| Verificação de Email | Supabase Auth + Edge Function | `src/pages/VerifyEmail.tsx`, `supabase/functions/verify-email/` |
| Hook de Auth | React Context | `src/hooks/useAuth.tsx` |
| Rota Protegida | React Router | `src/components/ProtectedRoute.tsx` |
| SSO Callback | Supabase Auth | `src/pages/SSOCallback.tsx` |

### 2. Autenticação Multi-Fator (MFA)
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Configuração MFA | Supabase Auth MFA | `src/pages/TwoFactorAuth.tsx` |
| Enrollment TOTP | Supabase Auth | `src/components/MFAEnroll.tsx` |
| Verificação MFA | Supabase Auth | `src/components/MFAVerify.tsx` |
| Configurações MFA | Custom Hook | `src/components/MFASettings.tsx`, `src/hooks/useMFA.ts` |

### 3. Controle de Acesso (RBAC)
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Gestão de Roles | Supabase + RLS | `src/pages/Roles.tsx`, `src/pages/RoleCreate.tsx` |
| Permissões | Custom System | `src/pages/Permissions.tsx` |
| Permission Gate | React Component | `src/components/PermissionGate.tsx` |
| Hook de Permissões | Custom Hook | `src/hooks/usePermissions.ts`, `src/hooks/useRole.ts` |
| Matriz de Permissões | UI Component | `src/components/PermissionMatrix/` |

### 4. Rate Limiting e Proteção
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Rate Limit Dashboard | Recharts + Supabase | `src/pages/RateLimitDashboard.tsx` |
| Bloqueio de IP | Supabase + Edge Function | `src/components/BlockedIPsPanel.tsx`, `supabase/functions/send-rate-limit-alert/` |
| Whitelist de IP | Supabase | `src/components/IPWhitelistPanel/` |
| Logs de Rate Limit | Supabase | `src/hooks/useRateLimitLogs.ts` |
| Limpeza Automática | Edge Function | `supabase/functions/cleanup-rate-limit-logs/` |
| Alertas em Tempo Real | Supabase Realtime | `src/components/RateLimitRealtimeAlerts.tsx` |

---

## 👥 MÓDULO: GESTÃO DE FUNCIONÁRIOS

### 5. CRUD de Funcionários
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Lista de Funcionários | DataTable + Supabase | `src/pages/Employees.tsx` |
| Criar Funcionário | React Hook Form + Zod | `src/pages/EmployeeCreate.tsx` |
| Editar Funcionário | React Hook Form | `src/pages/EmployeeEdit.tsx` |
| Detalhe Funcionário | Supabase Query | `src/pages/EmployeeDetail.tsx` |
| Importação em Massa | xlsx + Edge Function | `src/pages/EmployeeImport.tsx`, `supabase/functions/import-employees/` |
| Exportação | jsPDF + xlsx | `src/pages/EmployeeExport.tsx` |
| Filtros Avançados | Custom Components | `src/components/EmployeeFilters/` |

### 6. Gestão de Equipes
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Lista de Equipes | Supabase | `src/pages/Teams.tsx` |
| Criar Equipe | React Hook Form | `src/pages/TeamCreate.tsx` |
| Editar Equipe | React Hook Form | `src/pages/TeamEdit.tsx` |
| Membros da Equipe | Supabase Relations | `src/components/TeamMemberList/` |
| Sincronização | Edge Function | `supabase/functions/sync-teams/` |

### 7. Dispositivos
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Lista de Dispositivos | Supabase | `src/pages/Devices.tsx` |
| Estatísticas | Recharts | `src/components/DeviceStats/` |
| Atribuição | Dialog Component | `src/components/DeviceAssignDialog/` |
| Hook de Devices | TanStack Query | `src/hooks/useDevicesPage.ts` |

---

## 📊 MÓDULO: MONITORAMENTO E ATIVIDADES

### 8. Dashboard Principal
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Dashboard | Recharts + Cards | `src/pages/Dashboard.tsx` |
| Widgets Personalizáveis | Drag & Drop | `src/components/DashboardCustomizer.tsx` |
| Stats em Tempo Real | Supabase Realtime | `src/components/DashboardStats/`, `src/components/RealtimeStats/` |
| Layout Customizável | LocalStorage | `src/hooks/useDashboardLayout.ts` |

### 9. Monitoramento de Atividades
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Página de Monitoramento | Supabase + Recharts | `src/pages/Monitoring.tsx` |
| Timeline de Atividades | Custom Component | `src/components/ActivityTimeline/`, `src/pages/Timeline.tsx` |
| Heatmap de Atividade | Recharts | `src/components/ActivityHeatmap/`, `src/components/HeatmapCalendar.tsx` |
| Live View | Supabase Realtime | `src/pages/LiveView.tsx`, `src/components/LiveViewPanel/` |
| Keystrokes | Supabase | `src/components/KeystrokeActivityCard.tsx`, `src/components/RealtimeKeystrokesCard.tsx` |
| Clicks | Supabase | `src/components/RealtimeClicksCard.tsx` |
| Atividade em Tempo Real | Custom Hook | `src/hooks/useRealtimeActivity.ts` |

### 10. Screenshots e Capturas
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Galeria de Screenshots | Supabase Storage | `src/pages/Screenshots.tsx` |
| Visualizador | Modal Component | `src/components/ScreenshotViewer/` |
| OCR de Screenshots | Edge Function | `supabase/functions/ocr-screenshot/` |
| Compressão | Edge Function | `supabase/functions/compress-screenshots/` |
| Processamento | Edge Function | `supabase/functions/process-screenshot/` |

### 11. Produtividade
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Score de Produtividade | Recharts | `src/components/ProductivityScore/` |
| Gráficos | Recharts | `src/components/ProductivityChart/`, `src/components/ProductivityChart.tsx` |
| Comparação | Supabase | `src/pages/ProductivityComparison.tsx` |
| Cálculo | Edge Function | `supabase/functions/calculate-productivity/` |
| Top Apps | Recharts | `src/components/TopAppsChart/` |

---

## 🛡️ MÓDULO: VIOLAÇÕES E POLÍTICAS

### 12. Gestão de Violações
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Lista de Violações | DataTable + Supabase | `src/pages/Violations.tsx` |
| Detalhe da Violação | Supabase | `src/pages/ViolationDetail.tsx` |
| Comentários | Supabase Realtime | `src/components/ViolationCommentsPanel.tsx` |
| Gráficos de Violações | Recharts | `src/components/ViolationChart/`, `src/components/ViolationsByTypeChart.tsx` |
| Alertas em Tempo Real | Supabase Realtime | `src/components/ViolationsRealtimeTable.tsx` |
| Processamento de Alertas | Edge Function | `supabase/functions/process-violation-alert/` |
| Simulação | Test Component | `src/components/SimulateViolationButton.tsx` |

### 13. Regras de Violação
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Lista de Regras | Supabase | `src/pages/ViolationRules.tsx` |
| Criar Regra | React Hook Form | `src/pages/ViolationRuleCreate.tsx` |
| Hook de Regras | TanStack Query | `src/hooks/useViolationRules.ts`, `src/hooks/useViolationRulesPage.ts` |

### 14. Políticas de Segurança
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Lista de Políticas | Supabase | `src/pages/Policies.tsx` |
| Criar/Editar Política | React Hook Form | `src/pages/PolicyCreate.tsx`, `src/pages/PolicyEdit.tsx` |
| Acknowledgments | Supabase | `src/pages/PolicyAcknowledgments.tsx` |
| Get Policies | Edge Function | `supabase/functions/get-policies/` |

### 15. Palavras Sensíveis
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Gestão de Keywords | Supabase | `src/pages/SensitiveKeywords.tsx` |
| Hook | TanStack Query | `src/hooks/useSensitiveKeywordsPage.ts` |

### 16. Controle de Internet
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Regras de Acesso | Supabase | `src/pages/InternetAccess.tsx` |
| Hook | TanStack Query | `src/hooks/useInternetAccess.ts`, `src/hooks/useInternetAccessPage.ts` |

---

## 🗺️ MÓDULO: GEOLOCALIZAÇÃO E GEOFENCING

### 17. Geofences
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Mapa de Geofences | Mapbox GL | `src/pages/Geofences.tsx`, `src/pages/GeofenceMap.tsx` |
| Criar/Editar Geofence | Mapbox + Form | `src/pages/GeofenceCreate.tsx`, `src/pages/GeofenceEdit.tsx` |
| Verificação de Geofence | Edge Function | `supabase/functions/check-geofence/` |
| Hook Mapbox | Custom Hook | `src/hooks/useMapbox.ts` |
| Componentes de Mapa | Mapbox Components | `src/components/GeofenceMap/`, `src/components/geofencing/` |

### 18. Monitoramento Mobile
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Dashboard Mobile | Mapbox + Supabase | `src/pages/MobileMonitoring.tsx` |
| Mapa de Dispositivos | Mapbox | `src/components/MobileDevicesMap.tsx` |
| Coletor Mobile | Edge Function | `supabase/functions/mobile-collector/` |
| Hook | TanStack Query | `src/hooks/useMobileDevices.ts`, `src/hooks/useMobileMonitoringPage.ts` |

### 19. Token Mapbox
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Obtenção de Token | Edge Function | `supabase/functions/get-mapbox-token/` |
| Service | Custom Service | `src/services/mapbox.ts` |

---

## 📅 MÓDULO: AGENDAMENTOS E HORÁRIOS

### 20. Horários de Trabalho
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Gestão de Schedules | Supabase | `src/pages/WorkSchedules.tsx` |
| Schedule Builder | Custom Component | `src/components/ScheduleBuilder/` |
| Hook | TanStack Query | `src/hooks/useWorkSchedules.ts`, `src/hooks/useWorkSchedulesPage.ts` |
| Get Schedule | Edge Function | `supabase/functions/get-employee-schedule/` |

### 21. Horas Extras
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Solicitação de Overtime | Edge Function | `supabase/functions/request-overtime/` |
| Notificações | Custom Hook | `src/hooks/useOvertimeNotifications.ts` |

### 22. Calendário
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Visualização | react-day-picker | `src/pages/Calendar.tsx` |
| Date Range Picker | Custom Component | `src/components/DateRangePicker.tsx` |

---

## 📧 MÓDULO: NOTIFICAÇÕES E COMUNICAÇÃO

### 23. Sistema de Notificações
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Centro de Notificações | Supabase Realtime | `src/components/NotificationCenter.tsx` |
| Dropdown | UI Component | `src/components/NotificationsDropdown.tsx` |
| Bell Icon | UI Component | `src/components/NotificationBell/` |
| Settings | Supabase | `src/pages/NotificationSettings.tsx` |
| Toast | Sonner | `src/hooks/use-toast.ts`, `src/hooks/useToast.ts` |
| Push Notifications | Edge Function | `supabase/functions/send-push-notification/` |

### 24. Email
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Envio de Email | Edge Function (Resend) | `supabase/functions/send-email-notification/` |
| Service | Custom Service | `src/services/email.ts` |

### 25. WhatsApp
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Integração WhatsApp | Edge Function | `supabase/functions/send-whatsapp/` |
| Dashboard WhatsApp | Supabase | `src/pages/WhatsAppIntegration.tsx` |
| Hook | TanStack Query | `src/hooks/useWhatsAppSettings.ts`, `src/hooks/useWhatsAppIntegrationPage.ts` |
| Componentes | UI Components | `src/components/whatsapp/` |

### 26. Webhooks
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Gestão de Webhooks | Supabase | `src/pages/Webhooks.tsx` |
| Envio de Webhook | Edge Function | `supabase/functions/send-webhook/` |
| Hook | TanStack Query | `src/hooks/useWebhooks.ts`, `src/hooks/useWebhooksPage.ts` |

### 27. Slack
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Notificação Slack | Edge Function | `supabase/functions/send-slack-notification/` |

### 28. Templates de Mensagem
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Gestão de Templates | Supabase | `src/pages/MessageTemplates.tsx` |
| Hook | TanStack Query | `src/hooks/useMessageTemplates.ts`, `src/hooks/useMessageTemplatesPage.ts` |
| Componentes | UI Components | `src/components/templates/` |

---

## 📈 MÓDULO: RELATÓRIOS E ANALYTICS

### 29. Relatórios
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Dashboard de Reports | Recharts | `src/pages/Reports.tsx` |
| Report Builder | Custom Component | `src/pages/ReportBuilder.tsx`, `src/components/ReportBuilder/` |
| Exportação | jsPDF + xlsx | `src/pages/ReportExport.tsx` |
| Agendamento | Supabase | `src/pages/ReportSchedule.tsx`, `src/pages/ScheduledReports.tsx` |
| Geração | Edge Function | `supabase/functions/generate-report/` |
| Envio Agendado | Edge Function | `supabase/functions/send-scheduled-report/` |
| Relatório Semanal | Edge Function | `supabase/functions/weekly-report/` |
| Resumo Diário | Edge Function | `supabase/functions/daily-summary/` |

### 30. Analytics
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Dashboard Analytics | Recharts | `src/pages/Analytics.tsx` |
| Métricas | Supabase | `src/pages/Metrics.tsx` |
| Hook | TanStack Query | `src/hooks/useAnalytics.ts` |
| Service | Custom Service | `src/services/analytics.ts` |

### 31. Exportação de Dados
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Export Page | jsPDF + xlsx | `src/pages/DataExport.tsx` |
| Edge Function | Edge Function | `supabase/functions/export-data/` |
| Audit Export | Edge Function | `supabase/functions/audit-export/` |
| Hook | Custom Hook | `src/hooks/useDataExportPage.ts`, `src/hooks/useExport.ts` |
| Componentes | UI Components | `src/components/export/` |

### 32. Análise com IA
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Dashboard IA | Supabase | `src/pages/AIAnalysis.tsx` |
| Análise de Atividade | Edge Function | `supabase/functions/analyze-activity/` |
| Hook | TanStack Query | `src/hooks/useAIAnalysisPage.ts` |
| Stats Cards | UI Components | `src/components/AIStatsCards/` |
| Componentes IA | UI Components | `src/components/ai/` |

---

## 🎮 MÓDULO: GAMIFICAÇÃO

### 33. Sistema de Gamificação
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Dashboard Gamification | Recharts | `src/pages/Gamification.tsx` |
| Badges | Supabase | `src/components/gamification/` |
| Points/Streaks | Supabase | `src/hooks/useGamification.ts`, `src/hooks/useGamificationPage.ts` |
| Leaderboard | Supabase | Query Keys em `queryClient.ts` |

---

## ⚙️ MÓDULO: CONFIGURAÇÕES

### 34. Configurações Gerais
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Settings Page | Tabs + Forms | `src/pages/Settings.tsx` |
| General Settings | React Hook Form | `src/pages/GeneralSettings.tsx` |
| Preferences | LocalStorage | `src/pages/Preferences.tsx` |
| Hook | TanStack Query | `src/hooks/useSettings.ts` |

### 35. Monitoramento Settings
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Políticas de Monitoramento | Supabase | `src/pages/MonitoringPolicies.tsx` |
| Hook | TanStack Query | `src/hooks/useMonitoringSettings.ts`, `src/hooks/useMonitoringPoliciesPage.ts` |

### 36. Alert Settings
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Painel de Alertas | Supabase | `src/components/AlertSettingsPanel.tsx` |
| Hook | TanStack Query | `src/hooks/useAlertSettings.ts` |

### 37. Rate Limit Settings
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Configuração | Supabase | `src/components/RateLimitSettingsPanel.tsx` |
| Hook | TanStack Query | `src/hooks/useRateLimitSettings.ts` |

### 38. Integrações
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Lista de Integrações | UI Components | `src/pages/Integrations.tsx` |
| Setup | Wizard Component | `src/pages/IntegrationSetup.tsx` |
| Settings | Forms | `src/pages/IntegrationSettings.tsx` |

---

## 🔑 MÓDULO: AGENT KEYS

### 39. Gestão de Agent Keys
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Lista de Keys | Supabase | `src/pages/AgentKeys.tsx` |
| Geração de API Key | Edge Function | `supabase/functions/generate-api-key/` |
| Validação de Key | Edge Function | `supabase/functions/validate-agent-key/` |
| Rotação de Keys | Edge Function | `supabase/functions/rotate-api-keys/` |
| Hook | TanStack Query | `src/hooks/useAgentKeysPage.ts` |
| Componentes | UI Components | `src/components/agent-keys/` |

### 40. API Keys (Admin)
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Gestão de API Keys | Supabase | `src/pages/ApiKeys.tsx` |

---

## 🔄 MÓDULO: SINCRONIZAÇÃO E DADOS

### 41. Collector (Desktop Agent)
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Coleta de Dados | Edge Function | `supabase/functions/agent-collector/` |
| Sincronização | Edge Function | `supabase/functions/sync-employee/` |
| Desktop Agent | Electron | `desktop-agent/` |

### 42. Backup e Restore
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Página de Backup | Supabase | `src/pages/Backup.tsx` |
| Backup de Dados | Edge Function | `supabase/functions/backup-data/` |
| Arquivamento | Edge Function | `supabase/functions/archive-data/` |

### 43. Particionamento
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Partições Mensais | Edge Function | `supabase/functions/create-monthly-partitions/` |

### 44. Importação em Massa
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Processamento Bulk | Edge Function | `supabase/functions/process-bulk-import/` |
| Bulk Update | Edge Function | `supabase/functions/bulk-update/` |

---

## 🏢 MÓDULO: ORGANIZAÇÃO

### 45. Gestão de Organização
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Página de Org | Supabase | `src/pages/Organization.tsx` |
| Stats | UI Components | `src/components/OrganizationStats/` |
| Service | Custom Service | `src/services/organization.ts` |

### 46. Billing
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Dashboard Billing | Supabase | `src/pages/Billing.tsx` |
| Settings | Forms | `src/pages/BillingSettings.tsx` |

---

## 👤 MÓDULO: USUÁRIOS (ADMIN)

### 47. Gestão de Usuários
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| User Management | Supabase Auth Admin | `src/pages/UserManagement.tsx` |
| Criar/Editar User | Forms | `src/pages/UserCreate.tsx`, `src/pages/UserEdit.tsx` |
| Convite | Edge Function | `supabase/functions/invite-user/` |
| Reset Password | Edge Function | `supabase/functions/reset-password/` |
| Delete User Data | Edge Function | `supabase/functions/delete-user-data/` |
| Hook | TanStack Query | `src/hooks/useUserManagementPage.ts` |

### 48. Perfil
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Visualização | Supabase | `src/pages/Profile.tsx` |
| Edição | React Hook Form | `src/pages/ProfileEdit.tsx` |
| Hook | Custom Hook | `src/hooks/useUser.ts` |

---

## 📝 MÓDULO: AUDIT LOG

### 49. Logs de Auditoria
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Visualização | DataTable | `src/pages/AuditLog.tsx` |
| Settings Audit | Supabase | `src/components/SettingsAuditLog.tsx` |
| Hook | TanStack Query | `src/hooks/useAuditLog.ts`, `src/hooks/useAuditLogs.ts` |

### 50. Logs Gerais
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Visualização | DataTable | `src/pages/Logs.tsx` |

---

## 🛠️ MÓDULO: SISTEMA

### 51. Health Check
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| System Health | Supabase | `src/pages/SystemHealth.tsx` |
| Health Endpoint | Edge Function | `supabase/functions/health/`, `supabase/functions/health-check/` |

### 52. Manutenção
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Página de Manutenção | UI Component | `src/pages/Maintenance.tsx` |
| Recálculo de Métricas | Edge Function | `supabase/functions/recalculate-metrics/` |
| Cleanup Sessions | Edge Function | `supabase/functions/cleanup-sessions/` |
| Refresh Tokens | Edge Function | `supabase/functions/refresh-tokens/` |

### 53. Feature Flags
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Gestão | Custom System | `src/pages/FeatureFlags.tsx` |
| Hook | React Context | `src/lib/featureFlags.tsx` |

### 54. Licenciamento
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Validação de Licença | Edge Function | `supabase/functions/validate-license/` |

---

## 🎨 MÓDULO: UI/UX

### 55. Componentes UI Base (Shadcn/ui)
| Componente | Biblioteca | Path |
|------------|------------|------|
| Accordion | Radix UI | `src/components/ui/accordion.tsx` |
| Alert Dialog | Radix UI | `src/components/ui/alert-dialog.tsx` |
| Avatar | Radix UI | `src/components/ui/avatar.tsx` |
| Badge | Custom | `src/components/ui/badge.tsx` |
| Button | Custom + CVA | `src/components/ui/button.tsx` |
| Calendar | react-day-picker | `src/components/ui/calendar.tsx` |
| Card | Custom | `src/components/ui/card.tsx` |
| Checkbox | Radix UI | `src/components/ui/checkbox.tsx` |
| Command | cmdk | `src/components/ui/command.tsx` |
| Dialog | Radix UI | `src/components/ui/dialog.tsx` |
| Dropdown Menu | Radix UI | `src/components/ui/dropdown-menu.tsx` |
| Form | React Hook Form | `src/components/ui/form.tsx` |
| Input | Custom | `src/components/ui/input.tsx` |
| Popover | Radix UI | `src/components/ui/popover.tsx` |
| Progress | Radix UI | `src/components/ui/progress.tsx` |
| Select | Radix UI | `src/components/ui/select.tsx` |
| Separator | Radix UI | `src/components/ui/separator.tsx` |
| Sheet | Radix UI | `src/components/ui/sheet.tsx` |
| Skeleton | Custom | `src/components/ui/skeleton.tsx` |
| Slider | Radix UI | `src/components/ui/slider.tsx` |
| Switch | Radix UI | `src/components/ui/switch.tsx` |
| Table | Custom | `src/components/ui/table.tsx` |
| Tabs | Radix UI | `src/components/ui/tabs.tsx` |
| Textarea | Custom | `src/components/ui/textarea.tsx` |
| Toast | Radix UI | `src/components/ui/toast.tsx` |
| Tooltip | Radix UI | `src/components/ui/tooltip.tsx` |

### 56. Temas
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Theme Provider | next-themes | `src/components/ThemeProvider.tsx` |
| Theme Toggle | UI Component | `src/components/ThemeToggle.tsx` |
| Temas Page | Settings | `src/pages/Themes.tsx` |

### 57. Layout
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Main Layout | React Router | `src/components/MainLayout/` |
| Sidebar | Custom | `src/components/Sidebar/`, `src/components/AppSidebar.tsx` |
| Header | Custom | `src/components/Header.tsx`, `src/components/Header/` |
| Breadcrumbs | Custom | `src/components/Breadcrumbs.tsx` |
| Page Header | Custom | `src/components/PageHeader.tsx` |

### 58. Navegação
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Main Nav | React Router | `src/components/MainNav/` |
| Mobile Nav | Responsive | `src/components/MobileNav/` |
| NavLink | React Router | `src/components/NavLink.tsx` |
| Command Palette | cmdk | `src/components/CommandPalette.tsx` |

### 59. Animações
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Animações | Framer Motion | `src/components/animations/` |
| Hook | Custom Hook | `src/hooks/useAnimation.ts` |

### 60. Acessibilidade
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| A11y Components | Custom | `src/components/a11y/`, `src/components/accessibility/` |
| Hook | Custom Hook | `src/hooks/useA11y.ts` |

---

## 🔧 MÓDULO: UTILITÁRIOS E HELPERS

### 61. Formatação
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Format Utils | Custom | `src/lib/formatUtils.ts` |
| Date Utils | date-fns | `src/services/date.ts` |
| Format Service | Custom | `src/services/format.ts` |

### 62. Validação
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Validation Utils | Zod | `src/lib/validationUtils.ts` |
| Validations | Zod Schemas | `src/lib/validations/` |
| Validator Service | Custom | `src/services/validator.ts` |
| Hook | Custom Hook | `src/hooks/useValidation.ts` |

### 63. Caching
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Cache Service | Custom | `src/services/cache.ts` |
| IndexedDB | IndexedDB API | `src/services/indexed-db.ts` |
| LocalStorage | Custom | `src/services/local-storage.ts` |
| Hook | Custom Hook | `src/hooks/useCache.ts`, `src/hooks/useIndexedDB.ts` |

### 64. Criptografia
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Crypto Service | Web Crypto API | `src/services/crypto.ts` |
| Encryption | Custom | `src/services/encryption.ts` |

### 65. HTTP/API
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| API Service | Fetch | `src/services/api.ts` |
| HTTP Service | Custom | `src/services/http.ts` |
| Fetch Wrapper | Custom | `src/services/fetch-wrapper.ts` |
| Axios Instance | Axios-like | `src/services/axios-instance.ts` |

### 66. WebSocket
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| WebSocket Service | Native WebSocket | `src/services/websocket.ts` |
| Hook | Custom Hook | `src/hooks/useWebSocket.ts` |

### 67. Realtime
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Realtime Service | Supabase Realtime | `src/services/realtime.ts` |
| Hook | Custom Hook | `src/hooks/useRealtimeActivity.ts` |

---

## 🧪 MÓDULO: TESTES

### 68. Testes Unitários
| Ferramenta | Config |
|------------|--------|
| Vitest | `vitest.config.ts` |
| Testing Library | `@testing-library/react` |
| Coverage | `@vitest/coverage-v8` |
| UI | `@vitest/ui` |

### 69. Diretórios de Teste
| Tipo | Path |
|------|------|
| Integration Tests | `src/__tests__/integration/` |
| Component Tests | `src/components/__tests__/` |
| Hook Tests | `src/hooks/__tests__/` (via hooks) |
| Service Tests | `src/services/__tests__/` |
| Lib Tests | `src/lib/__tests__/` |
| Utils Tests | `src/utils/__tests__/` |

---

## 📦 MÓDULO: BUILD E DEPLOY

### 70. Scripts de Build
| Script | Descrição |
|--------|-----------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run test` | Run tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

### 71. PWA
| Funcionalidade | Ferramentas | Arquivos Principais |
|----------------|-------------|---------------------|
| Service Worker | vite-plugin-pwa | `src/lib/serviceWorker.ts` |
| Install Prompt | Custom | `src/components/PWAInstallPrompt.tsx` |
| PWA Components | Custom | `src/components/pwa/` |

---

## 📊 RESUMO ESTATÍSTICO

| Categoria | Quantidade |
|-----------|------------|
| **Páginas** | 115+ |
| **Componentes** | 180+ |
| **Hooks** | 170+ |
| **Edge Functions** | 53 |
| **Types** | 100+ |
| **Services** | 30+ |
| **UI Components (Shadcn)** | 30+ |

---

## 🔗 PADRÕES DE CÓDIGO UTILIZADOS

### Estrutura de Hooks
```typescript
// Padrão: useXxxPage.ts - para lógica de página
// Padrão: useXxx.ts - para lógica reutilizável
// Usa: TanStack Query + Supabase Client
```

### Estrutura de Edge Functions
```typescript
// Padrão: supabase/functions/{nome}/index.ts
// Usa: Deno + Supabase Client + Zod validation
// CORS Headers padrão
// Rate limiting via _shared/rateLimiting.ts
```

### Estrutura de Componentes
```typescript
// Padrão: src/components/{NomeComponente}/ (pasta) ou .tsx (arquivo único)
// Usa: React + TypeScript + Tailwind + Framer Motion
```

### Query Keys
```typescript
// Centralizadas em: src/lib/queryClient.ts
// Padrão: queryKeys.{modulo}.{action}()
```

---

*Este documento serve como referência completa para replicar padrões e funcionalidades em novos projetos Lovable.*
