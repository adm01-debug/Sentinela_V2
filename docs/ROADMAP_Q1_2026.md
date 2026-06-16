# Q1 2026 — Breakdown de User Stories

Detalhamento dos épicos do Q1 2026 (Foundation P0). Cada user story segue formato INVEST com critérios de aceitação.

---

## Épico DLP F2 — OCR Local + Redação Automática

### US-F2-01 — Integração Tesseract.js no agente

**Como** agente desktop, **quero** extrair texto de screenshots localmente, **para** detectar dados sensíveis sem enviar imagem ao servidor.

- [ ] Worker pool de 2 instâncias `tesseract.js` (por/eng)
- [ ] API `ocrService.extract(buffer): {text, words: [{bbox, confidence}]}`
- [ ] Latência P95 <800ms para 1920×1080
- [ ] Telemetria de latência reportada ao backend

### US-F2-02 — Pipeline OCR → DLP Engine

**Como** sistema, **quero** rodar `dlpEngine.scan()` no texto extraído, **para** identificar matches antes do upload.

- [ ] Integração com `ScreenshotService` existente
- [ ] Retorno de matches com bounding boxes
- [ ] Logs estruturados para debug

### US-F2-03 — Redação automática (blur)

**Como** sistema, **quero** aplicar blur nos retângulos sensíveis via `sharp`, **para** evidência subir já redatada.

- [ ] Módulo `screenshotRedactor.ts` usa `sharp.blur(20)` nas bbox
- [ ] Hash da imagem original mantido em metadata (não enviado)
- [ ] Imagem redatada substitui original na fila de upload

### US-F2-04 — Configuração e fail-open

**Como** admin, **quero** configurar `OCR_MAX_IMAGE_MP` e modo fail-open, **para** controlar performance.

- [ ] `CONFIG.DLP_ENABLED`, `CONFIG.OCR_MAX_IMAGE_MP`
- [ ] Flag `dlp_unverified=true` em screenshots quando OCR falha
- [ ] Documentação em `docs/DESKTOP_AGENT.md`

---

## Épico DLP F3 — Fingerprinting + Cloud OCR Fallback

### US-F3-01 — Upload de documento sigiloso

**Como** admin, **quero** enviar PDF/DOCX confidencial, **para** o sistema gerar hashes SHA-256 chunked.

- [ ] Página `/admin/dlp/fingerprints` com upload
- [ ] Edge function `dlp-fingerprint-upload` extrai texto e gera chunks de 256B
- [ ] Hashes gravados em `dlp_fingerprints` (já existe)

### US-F3-02 — Matcher de fingerprints no agente

**Como** agente, **quero** comparar conteúdo de clipboard/OCR contra fingerprints, **para** detectar vazamento de docs registrados.

- [ ] Módulo `fingerprintMatcher.ts` com rolling hash
- [ ] Cache local de fingerprints sincronizado via `policySync`
- [ ] Match → incidente severity=critical

### US-F3-03 — Cloud OCR fallback (Gemini Vision)

**Como** sistema, **quero** acionar `ocr-screenshot` (Gemini) quando local falha, **para** garantir cobertura.

- [ ] Acionado se `confidence < 60` ou imagem >2MP
- [ ] Reuso da edge function existente `ocr-screenshot`
- [ ] Métrica de % de fallbacks reportada

---

## Épico DLP F4 — Dashboard Analytics + Incidentes

### US-F4-01 — Widget DLP no dashboard

**Como** admin, **quero** ver KPIs DLP no dashboard principal, **para** monitorar saúde do programa.

- [ ] Top 5 classifiers acionados (7d)
- [ ] Total bloqueios vs. alertas
- [ ] Trend de incidentes (sparkline)

### US-F4-02 — Integração com `alert-engine`

**Como** sistema, **quero** que incidentes DLP gerem alertas via canais existentes (email, push, WhatsApp).

- [ ] Trigger em `dlp_incidents` invoca `process-violation-alert`
- [ ] Templates específicos pt-BR/en-US/es para DLP
- [ ] Severity → canal (critical → todos, low → só dashboard)

---

## Épico macOS Agent

### US-MAC-01 — Build Electron universal

- [ ] Targets `darwin-x64` + `darwin-arm64` no `electron-builder`
- [ ] Notarization via Apple Developer ID
- [ ] DMG + .pkg distributables

### US-MAC-02 — Permissões macOS

- [ ] Solicitar Screen Recording (TCC)
- [ ] Solicitar Accessibility (clicks/keystrokes)
- [ ] UI guiada de onboarding com instruções por permissão

### US-MAC-03 — QA em hardware real

- [ ] Testes em ≥1 Intel Mac e ≥1 Apple Silicon
- [ ] Validação de captura, clipboard, idle detection
- [ ] Documentação de troubleshooting

---

## Épico Linux Agent

### US-LIN-01 — Pacotes .deb / .rpm / AppImage

- [ ] `electron-builder` config para Ubuntu/Debian, RHEL/Fedora
- [ ] AppImage portátil para distros não suportadas
- [ ] Repositório APT/YUM (opcional Q1, obrigatório Q2)

### US-LIN-02 — Suporte Wayland + X11

- [ ] Detecção automática de display server
- [ ] Captura via `xdg-desktop-portal` (Wayland) ou `xrandr` (X11)
- [ ] Fallback documentado

### US-LIN-03 — Auto-start systemd

- [ ] Unit file `sentinela-agent.service`
- [ ] Instalação automática no postinst do .deb/.rpm
- [ ] Logs em `journalctl`

---

## Cronograma Q1

| Semana | Foco                                     |
| ------ | ---------------------------------------- |
| 1-2    | DLP F2 (OCR + redação)                   |
| 3-4    | DLP F3 (fingerprinting + cloud fallback) |
| 5-6    | DLP F4 (dashboard + alertas)             |
| 7-9    | macOS Agent                              |
| 10-12  | Linux Agent + QA cruzado                 |
| 13     | Demo Q1 + retrospectiva                  |

---

## Definition of Done (por US)

- ✅ Código revisado (PR aprovado)
- ✅ Testes unitários ≥80% cobertura
- ✅ Testes E2E para fluxos críticos
- ✅ Documentação atualizada
- ✅ i18n completa (pt-BR, en-US, es)
- ✅ Acessibilidade WCAG AA validada
- ✅ Logs estruturados + telemetria
