param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectPath,

  [switch]$DryRun,

  [switch]$Force
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$ResolvedProject = Resolve-Path -LiteralPath $ProjectPath -ErrorAction Stop
$GeneratedRoot = Join-Path $RepoRoot "dist\host-assets\claude"

function Write-Step($Message) {
  Write-Host "[portalup-stack] $Message"
}

if ($ResolvedProject.Path -eq $RepoRoot.Path) {
  throw "Refusing to install Claude project assets into the PortalUP Stack repository root."
}

Write-Step "Installing npm dependencies..."
& npm install --prefix $RepoRoot --silent
if ($LASTEXITCODE -ne 0) {
  throw "npm install failed."
}

Write-Step "Building TypeScript runtime..."
& npx --prefix $RepoRoot tsc --project (Join-Path $RepoRoot "tsconfig.json")
if ($LASTEXITCODE -ne 0) {
  throw "TypeScript build failed."
}

Write-Step "Generating Claude host assets..."
& node (Join-Path $RepoRoot "scripts\generate-host-assets.js") --engine claude --write
if ($LASTEXITCODE -ne 0) {
  throw "Claude host asset generation failed."
}

$Items = @(
  @{ Source = "CLAUDE.md"; Target = "CLAUDE.md" },
  @{ Source = ".claude"; Target = ".claude" },
  @{ Source = "templates"; Target = "templates" }
)

foreach ($Item in $Items) {
  $Source = Join-Path $GeneratedRoot $Item.Source
  $Target = Join-Path $ResolvedProject.Path $Item.Target

  if (-not (Test-Path -LiteralPath $Source)) {
    throw "Missing generated source: $Source"
  }

  if ($DryRun) {
    if (Test-Path -LiteralPath $Target) {
      Write-Step "Would overwrite existing $Target"
    } else {
      Write-Step "Would copy $Source -> $Target"
    }
    continue
  }

  if ((Test-Path -LiteralPath $Target) -and -not $Force) {
    throw "Target already exists: $Target. Re-run with -Force to overwrite."
  }

  if ((Test-Path -LiteralPath $Target) -and $Force) {
    Remove-Item -LiteralPath $Target -Recurse -Force
  }

  Copy-Item -LiteralPath $Source -Destination $Target -Recurse -Force
  Write-Step "Copied $($Item.Target)"
}

Write-Step "Claude project assets installed at $($ResolvedProject.Path)"
Write-Step "Next: open Claude Code in that project and ask: Usa portalup-orchestrator. Necesito revisar esta aplicacion."
