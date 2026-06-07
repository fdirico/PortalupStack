param(
  [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
if (-not $OutDir) {
  $OutDir = Join-Path $RepoRoot "dist"
}

node (Join-Path $RepoRoot "scripts\validate-all.js")

New-Item -ItemType Directory -Force $OutDir | Out-Null
$Archive = Join-Path $OutDir "portalup-stack-codex-skills.zip"
if (Test-Path $Archive) {
  Remove-Item -LiteralPath $Archive -Force
}

$Items = @(
  ".agents",
  "templates",
  "docs",
  "outputs",
  "scripts",
  "README.md",
  "AGENTS.md",
  "VERSION"
)

$Paths = $Items | ForEach-Object { Join-Path $RepoRoot $_ }
Compress-Archive -Path $Paths -DestinationPath $Archive -Force
Write-Host "Exported $Archive"
