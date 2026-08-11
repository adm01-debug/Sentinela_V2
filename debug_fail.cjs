const { chromium } = require('playwright');

const BASE = 'http://localhost:8081';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjA0MzYsImV4cCI6MjEwMDczNjQzNn0.eUahiKolJTuP4GWTnduS80wZhMABdRHEuEQ-O9Q8yRU';
const STORAGE_KEY = 'sb-jgnmwvzephsozsqmcpzb-auth-token';

const https = require('https');
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

async function getSession() {
  const opts = { hostname: 'jgnmwvzephsozsqmcpzb.supabase.co', path: '/auth/v1/token?grant_type=password', method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY } };
  return postJson(opts, { email: 'ti@promobrindes.com.br', password: '@Promo2026' });
}

async function main() {
  const session = await getSession();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(([key, sess]) => {
    localStorage.setItem(key, JSON.stringify({ access_token: sess.access_token, refresh_token: sess.refresh_token, expires_in: sess.expires_in, expires_at: Math.floor(Date.now() / 1000) + sess.expires_in, token_type: 'bearer', user: sess.user }));
  }, [STORAGE_KEY, session]);

  for (const path of ['/projects', '/hours-tracking']) {
    const consoleLogs = [];
    const handler = msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    page.on('console', handler);

    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    console.log(`\n=== ${path} ===`);
    console.log('Body preview:', body.slice(0, 600));
    console.log('Console logs:', consoleLogs.slice(0, 10));

    page.off('console', handler);
  }

  await browser.close();
}

main().catch(e => console.error('FATAL:', e.message));
