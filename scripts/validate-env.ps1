param(
  [ValidateSet("development", "staging", "production")]
  [string] $Environment = "development"
)

$ErrorActionPreference = "Stop"

$criticalProductionKeys = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "RESEND_API_KEY",
  "QR_HMAC_SECRET",
  "NEXT_PUBLIC_APP_URL"
)

$missing = New-Object System.Collections.Generic.List[string]

foreach ($key in $criticalProductionKeys) {
  $value = [Environment]::GetEnvironmentVariable($key)
  if ($Environment -eq "production" -and [string]::IsNullOrWhiteSpace($value)) {
    $missing.Add($key)
  }
}

if ($missing.Count -gt 0) {
  Write-Host "HOTMESS environment validation failed for ${Environment}:" -ForegroundColor Red
  foreach ($key in $missing) {
    Write-Host " - missing $key" -ForegroundColor Red
  }
  exit 1
}

Write-Host "HOTMESS environment validation passed for $Environment." -ForegroundColor Green

if ($Environment -ne "production") {
  Write-Host "Development/Staging may use mock or provider-missing fallbacks where explicitly implemented."
}
