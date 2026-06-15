param(
  [string] $MigrationPath = "supabase/migrations"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $MigrationPath)) {
  throw "Migration directory not found: $MigrationPath"
}

$files = Get-ChildItem -Path $MigrationPath -Filter "*.sql" | Sort-Object Name

if ($files.Count -eq 0) {
  throw "No SQL migration files found in $MigrationPath"
}

$expectedNumber = 1
$errors = New-Object System.Collections.Generic.List[string]
$createdTables = @{}

foreach ($file in $files) {
  if ($file.Name -notmatch "^(\d{3})_[a-z0-9_]+\.sql$") {
    $errors.Add("Invalid migration filename: $($file.Name)")
    continue
  }

  $number = [int] $Matches[1]
  if ($number -ne $expectedNumber) {
    $errors.Add("Expected migration number $($expectedNumber.ToString('000')) but found $($file.Name)")
    $expectedNumber = $number
  }

  $content = Get-Content -Raw -Path $file.FullName

  if ([string]::IsNullOrWhiteSpace($content)) {
    $errors.Add("Migration is empty: $($file.Name)")
  }

  if ($content -match "(?i)\bdrop\s+database\b|\btruncate\s+table\b") {
    $errors.Add("Dangerous statement found in $($file.Name)")
  }

  $matches = [regex]::Matches($content, "(?im)create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)")
  foreach ($match in $matches) {
    $table = $match.Groups[1].Value
    if ($createdTables.ContainsKey($table)) {
      $errors.Add("Table public.$table is created in both $($createdTables[$table]) and $($file.Name)")
    } else {
      $createdTables[$table] = $file.Name
    }
  }

  $expectedNumber++
}

$requiredTables = @(
  "profiles",
  "user_sessions",
  "account_audit",
  "venues",
  "events",
  "event_gender_config",
  "ticket_types",
  "tickets",
  "waitlist",
  "orders",
  "order_split_payments",
  "discount_codes",
  "event_tables",
  "table_bookings",
  "drink_packages",
  "drink_package_bookings",
  "birthday_packages",
  "hotel_partners",
  "hotel_codes",
  "follows",
  "follow_requests",
  "blocks",
  "posts",
  "likes",
  "comments",
  "event_attendees",
  "friend_activity",
  "activity_privacy_settings",
  "stories",
  "story_views",
  "story_highlights",
  "saved_posts",
  "conversations",
  "conversation_members",
  "messages",
  "message_requests",
  "notifications",
  "notification_settings",
  "scanner_access",
  "user_badges",
  "user_milestones",
  "profile_visits",
  "dating_profiles",
  "dating_swipes",
  "dating_matches",
  "dating_boosts",
  "dating_subscriptions",
  "dating_top_picks",
  "event_dating_pool",
  "event_match_meetups",
  "business_profiles",
  "business_swipes",
  "business_matches",
  "coffee_chats",
  "business_groups",
  "business_group_members",
  "business_recommendations",
  "job_listings",
  "job_applications",
  "job_alerts"
)

foreach ($table in $requiredTables) {
  if (-not $createdTables.ContainsKey($table)) {
    $errors.Add("Required table public.$table is missing from migrations")
  }
}

if ($errors.Count -gt 0) {
  Write-Host "HOTMESS Supabase migration validation failed:" -ForegroundColor Red
  foreach ($errorItem in $errors) {
    Write-Host " - $errorItem" -ForegroundColor Red
  }
  exit 1
}

Write-Host "HOTMESS Supabase migration validation passed." -ForegroundColor Green
Write-Host "Checked $($files.Count) migrations and $($createdTables.Count) table definitions."
