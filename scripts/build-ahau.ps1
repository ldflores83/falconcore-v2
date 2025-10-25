# Build script for AHAU frontend
# This script builds AHAU and deploys it to Firebase Hosting

Write-Host "🚀 Building AHAU frontend..." -ForegroundColor Green

# Navigate to the project root
Set-Location $PSScriptRoot\..

# Build AHAU
Write-Host "📦 Building AHAU..." -ForegroundColor Yellow
Set-Location "frontends\ahau"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ AHAU build completed successfully!" -ForegroundColor Green

# Navigate back to root
Set-Location $PSScriptRoot\..

# Verify and copy config.json to output
Write-Host "📋 Verifying config.json..." -ForegroundColor Yellow
$configSource = "frontends\ahau\public\ahau\config.json"
$configDest = "frontends\uaylabs\out\ahau\ahau\config.json"

if (Test-Path $configSource) {
    # Ensure destination directory exists
    $destDir = Split-Path $configDest -Parent
    if (!(Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    Copy-Item -Path $configSource -Destination $configDest -Force
    Write-Host "✅ config.json copied to output successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: config.json not found at $configSource" -ForegroundColor Yellow
    Write-Host "   Please ensure the file exists with proper Firebase configuration." -ForegroundColor Yellow
}

# Deploy to Firebase
Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting:uaylabs

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deploy failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ AHAU deployed successfully!" -ForegroundColor Green
Write-Host "🌐 URL: https://uaylabs.web.app/ahau" -ForegroundColor Cyan
