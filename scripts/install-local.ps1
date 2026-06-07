param(
  [string]$Destination = ""
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$Source = Join-Path $RepoRoot ".agents\skills"

if (-not (Test-Path $Source)) {
  throw "Skills source not found: $Source"
}

if (-not $Destination) {
  if ($env:CODEX_HOME) {
    $Destination = Join-Path $env:CODEX_HOME "skills"
  } else {
    $Destination = Join-Path $env:USERPROFILE ".codex\skills"
  }
}

New-Item -ItemType Directory -Force $Destination | Out-Null

node (Join-Path $RepoRoot "scripts\validate-skills.js")
node (Join-Path $RepoRoot "scripts\validate-fixtures.js")
node (Join-Path $RepoRoot "scripts\validate-actual-outputs.js")
node (Join-Path $RepoRoot "scripts\validate-continuity.js")
node (Join-Path $RepoRoot "scripts\validate-cli.js")

Get-ChildItem $Source -Directory | ForEach-Object {
  $Target = Join-Path $Destination $_.Name
  if (Test-Path $Target) {
    Remove-Item -LiteralPath $Target -Recurse -Force
  }
  Copy-Item -LiteralPath $_.FullName -Destination $Target -Recurse -Force
  Write-Host "Installed $($_.Name) -> $Target"
}

Write-Host "PortalUP Stack Codex skills installed in $Destination"
node (Join-Path $RepoRoot "scripts\doctor.js")
