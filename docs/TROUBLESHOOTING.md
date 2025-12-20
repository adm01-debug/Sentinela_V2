# Troubleshooting Guide

Este guia ajuda a resolver problemas comuns do sistema Sentinela.

## Índice

- [Problemas de Autenticação](#problemas-de-autenticação)
- [Desktop Agent](#desktop-agent)
- [Mobile App](#mobile-app)
- [Monitoramento](#monitoramento)
- [Performance](#performance)
- [Erros Comuns](#erros-comuns)

---

## Problemas de Autenticação

### Token expirado

**Sintoma:** Usuário é deslogado automaticamente ou recebe erro 401.

**Solução:**
1. Limpe o localStorage do navegador
2. Faça login novamente
3. Se persistir, verifique as configurações de sessão no Supabase

### MFA não funciona

**Sintoma:** Código MFA sempre inválido.

**Solução:**
1. Verifique se o horário do dispositivo está sincronizado
2. Regenere o código QR nas configurações
3. Use um app autenticador confiável (Google Authenticator, Authy)

### Senha esquecida

**Sintoma:** Email de recuperação não chega.

**Solução:**
1. Verifique a pasta de spam
2. Confirme que o email está correto no sistema
3. Verifique configurações SMTP no Supabase

---

## Desktop Agent

### Agent não conecta

**Sintoma:** Status "Offline" mesmo com agent rodando.

**Solução:**
1. Verifique a chave de API nas configurações
2. Confirme conectividade com a internet
3. Verifique se o firewall não está bloqueando
4. Reinicie o agent

```bash
# Windows
taskkill /f /im sentinela-agent.exe
sentinela-agent.exe

# Linux/Mac
pkill sentinela-agent
./sentinela-agent
```

### Screenshots não capturadas

**Sintoma:** Galeria de screenshots vazia.

**Solução:**
1. Verifique permissões de captura de tela
2. No macOS, conceda permissão em Preferências > Segurança > Gravação de Tela
3. No Windows, execute como administrador

### Alto uso de CPU

**Sintoma:** Agent consumindo muita CPU.

**Solução:**
1. Aumente o intervalo de captura nas configurações
2. Reduza a qualidade das screenshots
3. Verifique se há loops de reconexão (logs)

---

## Mobile App

### GPS não funciona

**Sintoma:** Localização não é registrada.

**Solução:**
1. Conceda permissão de localização "Sempre"
2. Desative o modo de economia de bateria
3. Verifique se GPS está ativado

### Push notifications não chegam

**Sintoma:** Notificações não aparecem.

**Solução:**
1. Verifique permissões de notificação
2. Confirme token FCM no backend
3. Verifique se o app não está sendo otimizado (Doze mode)

### App trava

**Sintoma:** App fecha inesperadamente.

**Solução:**
1. Atualize para a versão mais recente
2. Limpe cache do app
3. Reinstale o app

---

## Monitoramento

### Violações não detectadas

**Sintoma:** Comportamentos que deveriam gerar violação não geram.

**Solução:**
1. Verifique as regras de violação configuradas
2. Confirme que o funcionário está atribuído a uma política
3. Verifique se a política está ativa

### Dados de atividade faltando

**Sintoma:** Gaps nos dados de atividade.

**Solução:**
1. Verifique se o agent estava online no período
2. Confirme sincronização de horário
3. Verifique logs do edge function

---

## Performance

### Dashboard lento

**Sintoma:** Dashboard demora para carregar.

**Solução:**
1. Reduza o período de dados exibido
2. Limpe cache do navegador
3. Verifique índices do banco de dados

### Relatórios timeout

**Sintoma:** Geração de relatório falha por timeout.

**Solução:**
1. Reduza o período do relatório
2. Filtre por menos funcionários
3. Use exportação em lote (background)

---

## Erros Comuns

### Erro 429 - Rate Limit

**Causa:** Muitas requisições em pouco tempo.

**Solução:** Aguarde 1 minuto e tente novamente.

### Erro 500 - Internal Server Error

**Causa:** Erro no servidor.

**Solução:**
1. Tente novamente em alguns minutos
2. Se persistir, verifique logs do Supabase
3. Contate o suporte

### Erro de CORS

**Causa:** Requisição de origem não permitida.

**Solução:**
1. Verifique configuração de CORS no Supabase
2. Confirme que está usando a URL correta

---

## Contato

Se o problema persistir:

- **Email:** suporte@sentinela.com
- **Documentação:** https://docs.sentinela.com
- **Status:** https://status.sentinela.com
