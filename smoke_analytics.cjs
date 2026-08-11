const { chromium } = require('playwright');
const https = require('https');

const BASE = 'http://localhost:8081';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjA0MzYsImV4cCI6MjEwMDczNjQzNn0.eUahiKolJTuP4GWTnduS80wZhMABdRHEuEQ-O9Q8yRU';
const STORAGE_KEY = 'sb-jgnmwvzephsozsqmcpzb-auth-token';

function postJson(opts, body) {
  return new Promise((resolve, reject) => {
    const b = JSON.stringify(body);
    const req = https.request({ ...opts, headers: { ...opts.headers, 'Content-Length': Buffer.byteLength(b) } }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(b); req.end();
  });
}

const ROUTES = [
  { path: '/analytics', label: 'Analytics' },
  { path: '/reports', label: 'Relatórios' },
  { path: '/ai-analysis', label: 'Análise IA' },
];

async function main() {
  const opts = { hostname: 'jgnmwvzephsozsqmcpzb.supabase.co', path: '/auth/v1/token?grant_type=password', method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY } };
  const session = await postJson(opts, { email: 'ti@promobrindes.com.br', password: '@Promo2026' });

  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(([key, sess]) => {
    localStorage.setItem(key, JSON.stringify({ access_token: sess.access_token, refresh_token: sess.refresh_token, expires_in: sess.expires_in, expires_at: Math.floor(Date.now() / 1000) + sess.expires_in, token_type: 'bearer', user: sess.user }));
  }, [STORAGE_KEY, session]);

  console.log('=== SMOKE TEST: Módulo Análises ===');
  for (const route of ROUTES) {
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(4000);
    const body = await page.locator('body').innerText();
    const keyPhrases = {
      '/analytics': ['Analytics', 'Produtividade', 'Horas'],
      '/reports': ['Relatórios', 'Relatório', 'Concluído'],
      '/ai-analysis': ['Análise', 'Score', 'Insights', 'Carlos', 'Mariana', 'Roberto', 'Juliana'],
    };
    const matches = (keyPhrases[route.path] || []).filter(p => body.includes(p));
    const ok = body.length > 200 && matches.length >= 1;
    console.log(`${ok ? '✅' : '⚠️'} ${route.label} (${route.path}) — "${body.slice(0, 80).replace(/\n/g,' ')}" | matched: ${matches.join(', ')}`);
  }

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });