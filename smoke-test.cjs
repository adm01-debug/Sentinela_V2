const { chromium } = require('playwright');
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://jgnmwvzephsozsqmcpzb.supabase.co';
const SERVICE_ROLE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ';

const OUT_DIR = path.join('d:', 'tmp', 'screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function apiLogin() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ email: 'ti@promobrindes.com.br', password: '@Promo2026' });
    const opts = {
      hostname: 'jgnmwvzephsozsqmcpzb.supabase.co',
      path: '/auth/v1/token?grant_type=password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_TOKEN,
        'Authorization': `Bearer ${SERVICE_ROLE_TOKEN}`,
        'Content-Length': Buffer.byteLength(body),
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('Invalid JSON: ' + data)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Logging in...');
  const loginResult = await apiLogin();
  if (!loginResult.access_token) { console.error('Login failed:', loginResult); return; }

  const sessionData = {
    access_token: loginResult.access_token,
    refresh_token: loginResult.refresh_token,
    expires_in: loginResult.expires_in,
    expires_at: Math.floor(Date.now() / 1000) + loginResult.expires_in,
    user: loginResult.user,
  };

  const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  console.log('Launching Edge...');
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();

  await page.goto('http://localhost:8081/auth', { waitUntil: 'domcontentloaded', timeout: 30000 });

  const storageKey = 'sb-jgnmwvzephsozsqmcpzb-auth-token';
  await page.evaluate(([key, value]) => {
    localStorage.setItem(key, value);
  }, [storageKey, JSON.stringify(sessionData)]);

  console.log('Session injected');

  const pages = [
    { path: '/admin/file-transfers', name: 'file-transfers' },
  ];

  for (const p of pages) {
    console.log(`\nNavigating to ${p.path}...`);
    const errors = [];
    const onConsole = (msg) => {
      const t = msg.text();
      if (t.includes('[AuthProvider]') || t.includes('resolveUser') || t.includes('[SupervisorGuard]') || msg.type() === 'error') console.log('  >>', msg.type().toUpperCase(), t.substring(0, 200));
    };
    page.on('console', onConsole);

    await page.goto(`http://localhost:8081${p.path}`, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('  nav warn:', e.message));
    await page.waitForTimeout(15000);

    const outPath = path.join(OUT_DIR, `${p.name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    const url = page.url();
    const title = await page.title();
    const heading = await page.evaluate(() => document.querySelector('h1')?.textContent || document.querySelector('h2')?.textContent || '(no h1/h2)');
    console.log(`Screenshot: ${outPath}`);
    console.log(`  URL: ${url}`);
    console.log(`  Title: ${title}`);
    console.log(`  Heading: ${heading}`);
    if (errors.length) {
      console.log('  Console errors:');
      errors.slice(0, 5).forEach(e => console.log('    -', e.substring(0, 200)));
    } else {
      console.log('  No console errors');
    }

    page.removeListener('console', onConsole);
  }

  await browser.close();
  console.log('\nDone!');
}

main().catch(e => { console.error(e); process.exit(1); });