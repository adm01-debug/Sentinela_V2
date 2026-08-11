const https = require('https');
const KEY = 'sbp_a576999ea4507eac987c9f117090c4a5c7a7179f';
const REF = 'jgnmwvzephsozsqmcpzb';
const Q = `SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('slack_integrations','slack_notification_dlq','whatsapp_integrations','fcm_tokens') AND table_schema='public' ORDER BY table_name, ordinal_position;`;
const data = JSON.stringify({ query: Q });
const opts = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${REF}/database/query`,
  method: 'POST',
  headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
};
const req = https.request(opts, res => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => console.log(res.statusCode, d));
});
req.on('error', e => console.error(e));
req.write(data); req.end();
