const { chromium } = require('playwright');
const https = require('https');

const BASE = 'http://localhost:8081';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjA0MzYsImV4cCI6MjEwMDczNjQzNn0.eUahiKolJTuP4GWTnduS80wZhMABdRHEuEQ-O9Q8yRU';
const STORAGE_KEY = 'sb-jgnmwvzephsozsqmcpzb-auth-token';

const ROUTES = [
  { path: '/violations', label: 'Violações', phrases: ['Violações', 'política', 'Funcionário'] },
  { path: '/alerts', label: 'Alertas', phrases: ['Alertas', 'crítico', 'alta', 'média'] },
  { path: '/screenshots', label: 'Screenshots', phrases: ['Screenshots', 'Captura', 'Carlos'] },
  { path: '/admin/session-recordings', label: 'Gravações', phrases: ['Gravações', 'Sessão', 'recorded'] },
  { path: '/admin/file-transfers', label: 'Transferências', phrases: ['Transferências', 'Arquivos', 'usb', 'arquivo'] },
  { path: '/internet-access', label: 'Acesso Internet', phrases: ['Acesso', 'Internet', 'site'] },
];

const post = (opts, body) => new Promise((res, rej) => {
  const req = https.request({ ...opts, headers: { ...opts.headers, 'Content-Length': Buffer.byteLength(body) } }, x => { let d=''; x.on('data', c => d += c); x.on('end', () => res(JSON.parse(d))); });
  req.on('error', rej); req.write(body); req.end();
});

async function main() {
  const opts = { hostname: 'jgnmwvzephsozsqmcpzb.supabase.co', path: '/auth/v1/token?grant_type=password', method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': ANON } };
  const session = await post(opts, JSON.stringify({ email: 'ti@promobrindes.com.br', password: '@Promo2026' }));

  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(([key, sess]) => {
    localStorage.setItem(key, JSON.stringify({ access_token: sess.access_token, refresh_token: sess.refresh_token, expires_in: sess.expires_in, expires_at: Math.floor(Date.now() / 1000) + sess.expires_in, token_type: 'bearer', user: sess.user }));
  }, [STORAGE_KEY, session]);

  let passed = 0;
  console.log('=== SMOKE TEST: Módulo Segurança ===');
  for (const r of ROUTES) {
    const errs = [];
    const handler = m => { if (m.type() === 'error') errs.push(m.text()); };
    page.on('console', handler);
    try {
      await page.goto(`${BASE}${r.path}`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(4000);
      const body = await page.locator('body').innerText();
      const matched = r.phrases.filter(p => body.toLowerCase().includes(p.toLowerCase()));
      const ok = body.length > 300 && matched.length >= 1;
      if (ok) passed++;
      const hasIssues = body.includes('Carregando') || body.includes('AUTENTICANDO');
      const icon = ok ? '✅' : (hasIssues ? '⏳' : '⚠️');
      console.log(`${icon} ${r.label} (${r.path}) — body:${body.length} matched:${matched.join(',')} ${errs.length ? '| errs:' + errs.slice(0, 2).join(' | ') : ''}`);
    } catch (e) {
      console.log(`❌ ${r.label} (${r.path}) — ${e.message.slice(0, 100)}`);
    }
    page.off('console', handler);
  }
  console.log(`\n${passed}/${ROUTES.length} páginas OK.`);
  await browser.close();
}

main().catch(e => console.error('FATAL:', e.message));
