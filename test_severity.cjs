const SUPABASE_URL = 'https://jgnmwvzephsozsqmcpzb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ';
const H = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };

(async () => {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/slack_integrations?select=id,name,is_active`, { headers: H });
  const data = await r.json();
  console.log('Slack integrations:', JSON.stringify(data, null, 2));
})();
