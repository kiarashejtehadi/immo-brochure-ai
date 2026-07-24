# Connect this folder to GitHub: kiarashejtehadi/immo-brochure-ai
# Run in PowerShell AFTER installing Git: https://git-scm.com/download/win

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $repoRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git is not installed. Install from https://git-scm.com/download/win then run this script again."
  exit 1
}

$remote = "https://github.com/kiarashejtehadi/immo-brochure-ai.git"

if (-not (Test-Path ".git")) {
  git init
  git branch -M main
}

$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
  git remote add origin $remote
} elseif ($existing -ne $remote) {
  git remote set-url origin $remote
}

Write-Host "Checking that .env.local is ignored..."
$statusEnv = git check-ignore -v .env.local 2>$null
if (-not $statusEnv) {
  Write-Warning ".env.local is NOT ignored. Do not commit secrets."
} else {
  Write-Host "OK: .env.local is ignored."
}

git add .
git status

Write-Host ""
Write-Host "Next: review 'git status' above, then run:"
Write-Host '  git commit -m "Initial ImmoCaption AI app"'
Write-Host "  git push -u origin main"
Write-Host ""
Write-Host "If the GitHub repo already has a README, use instead:"
Write-Host "  git pull origin main --rebase"
Write-Host "  git push -u origin main"
