const { chromium } = require('playwright');
const https = require('https');

function postJson(opts, body) {
  return new Promise((resolve, reject) => {
    const b = JSON.stringify(body);
    const req = https.request({ ...opts, headers: { ...opts.headers, 'Content-Length': Buffer.byteLength(b) } }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(d) }));
    });
    req.on('error', reject);
    req.write(b); req.end();
  });
}

async function getSession() {
  const opts = {
    hostname: 'jgnmwvzephsozsqmcpzb.supabase.co',
    path: '/auth/v1/token?grant_type=password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjA0MzYsImV4cCI6MjEwMDczNjQzNn0.eUahiKolJTuP4GWTnduS80wZhMABdRHEuEQ-O9Q8yRU'
    }
  };
  const { data } = await postJson(opts, { email: 'ti@promobrindes.com.br', password: '@Promo2026' });
  return data;
}

async function main() {
  const session = await getSession();
  console.log('Got session, user:', session.user?.email);

  // supabase-js key format: sb-{url-hash}-auth-token
  // URL: jgnmwvzephsozsqmcpzb
  // The key is derived from the anon key's URL ref
  const storageKey = 'sb-jgnmwvzephsozsqmcpzb-auth-token';

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded' });

  await page.evaluate(([key, sess]) => {
    localStorage.setItem(key, JSON.stringify(sess));
  }, [storageKey, {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: Math.floor(Date.now() / 1000) + session.expires_in,
    token_type: 'bearer',
    user: session.user,
  }]);

  console.log('Session set in localStorage key:', storageKey);
  console.log('Value:', JSON.stringify(JSON.parse(await page.evaluate(k => localStorage.getItem(k), storageKey)).access_token?.slice(0, 20) + '...'));

  await page.goto('http://localhost:8081/time-clock', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log('URL:', page.url());
  const body = await page.locator('body').innerText();
  console.log('Body preview:', body.slice(0, 400));

  await browser.close();
}

main().catch(e => console.error('FATAL:', e.message));
