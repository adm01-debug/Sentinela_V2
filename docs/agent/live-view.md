# Live View — Contrato do Agente Desktop

## Visão geral
Transmissão ao vivo da tela do PC monitorado usando WebRTC ponto-a-ponto.
Sinalização via canal Supabase Realtime `live-view:{agent_id}`.

## Fluxo
1. Admin chama `POST /functions/v1/live-view-authorize` com `{ agent_id }`.
2. Backend valida permissão, cria linha em `live_view_sessions` (status `pending`) e devolve:
   ```json
   {
     "session_id": "uuid",
     "channel": "live-view:{agent_id}",
     "ice_servers": [{ "urls": "stun:stun.l.google.com:19302" }],
     "expires_at": "ISO"
   }
   ```
3. Admin abre `RTCPeerConnection`, entra no canal Realtime e envia `broadcast` `offer`:
   ```json
   { "type": "broadcast", "event": "offer",
     "payload": { "session_id": "...", "sdp": <RTCSessionDescriptionInit> } }
   ```
4. Agente (deve estar subscrito ao canal do próprio `agent_id`):
   - Exibe overlay **não fechável** de consentimento ao colaborador com botões "Permitir" / "Negar".
   - Se negado: envia `broadcast` `declined` com `{ reason: "user_denied" }` e atualiza a sessão para `status='denied'`.
   - Se permitido: captura tela via `getDisplayMedia({ video: true, audio: false })`, cria `answer`, envia:
     ```json
     { "type": "broadcast", "event": "answer",
       "payload": { "session_id": "...", "sdp": <RTCSessionDescriptionInit> } }
     ```
   - Atualiza `live_view_sessions.status='active'` e `started_at=now()`.
5. Ambos os lados trocam ICE via `broadcast` `ice` com `{ from: 'agent'|'viewer', candidate }`.
6. Encerramento: qualquer lado envia `bye`, ou o admin marca `status='ended'`; agente para tracks e libera stream.

## Heartbeat de métricas
A cada 5 s o agente envia:
```json
{ "type": "broadcast", "event": "metrics",
  "payload": { "fps": 24, "bitrateKbps": 1200, "cpu": 8, "monitorIndex": 0 } }
```
O admin exibe no HUD e o backend persiste em `live_view_audit`.

## Regras obrigatórias (LGPD)
- Overlay de consentimento **visível durante toda a sessão** com selo "AO VIVO".
- Duração máxima: **30 min** por sessão. Após esse tempo o agente encerra sozinho.
- Sem captura de áudio, teclado ou controle remoto nesta fase.
- Se o colaborador clicar em "Parar compartilhamento" do SO, encerrar imediatamente e reportar `end_reason='os_stopped'`.

## Segurança
- Agente autentica no canal com sua Agent Key.
- Verifica `session_id` recebido consultando `live_view_sessions` (permissão via service token da instalação).
- Ignora `offer` sem `session_id` válido, expirado (>5 min de `created_at`) ou de outra `company_id`.
- Rate-limit: recusar se já houver sessão ativa para o mesmo `agent_id`.
