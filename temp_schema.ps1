$headers = @{
  "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ"
  "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ"
}

$vals = @("low","medium","high","critical","null","warning","info","error","1","2","3","4","5")
foreach ($v in $vals) {
  $body = @{
    name = "test_$v"
    webhook_url = "https://hooks.slack.com/test"
    event_types = @("violation_created")
    min_severity = if ($v -eq "null") { $null } else { $v }
    is_active = $true
    last_success_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    failure_count = 0
    created_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    updated_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
  } | ConvertTo-Json -Depth 5

  try {
    $r = Invoke-WebRequest -Uri "https://jgnmwvzephsozsqmcpzb.supabase.co/rest/v1/slack_integrations" -Method POST -Headers $headers -Body $body -TimeoutSec 8
    Write-Host "OK  min_severity=$v : $($r.StatusCode)"
  } catch {
    Write-Host "ERR min_severity=$v : $($_.Exception.Message.Substring(0,100))"
  }
}
