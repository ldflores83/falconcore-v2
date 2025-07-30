# Build all products for single hosting deployment
# Each product builds directly to uaylabs/out/ subdirectories using symlinks

Write-Host "🚀 Building all products..." -ForegroundColor Green

# Set working directory to frontends
Set-Location "frontends"

# Create uaylabs/out/ structure first
Write-Host "📁 Creating uaylabs/out/ structure..." -ForegroundColor Yellow
Remove-Item -Path "uaylabs/out/ignium" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "uaylabs/out/jobpulse" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "uaylabs/out/pulziohq" -Recurse -Force -ErrorAction SilentlyContinue

New-Item -ItemType Directory -Path "uaylabs/out/ignium" -Force
New-Item -ItemType Directory -Path "uaylabs/out/jobpulse" -Force
New-Item -ItemType Directory -Path "uaylabs/out/pulziohq" -Force

# Create symlinks for each product
Write-Host "🔗 Creating symlinks..." -ForegroundColor Yellow
New-Item -ItemType SymbolicLink -Path "ignium/out" -Target "uaylabs/out/ignium" -Force
New-Item -ItemType SymbolicLink -Path "jobpulse/out" -Target "uaylabs/out/jobpulse" -Force
New-Item -ItemType SymbolicLink -Path "pulziohq/out" -Target "uaylabs/out/pulziohq" -Force

# Build Ignium
Write-Host "📦 Building Ignium..." -ForegroundColor Yellow
Set-Location "ignium"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ignium build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ".."

# Build JobPulse
Write-Host "📦 Building JobPulse..." -ForegroundColor Yellow
Set-Location "jobpulse"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ JobPulse build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ".."

# Build PulzioHQ
Write-Host "📦 Building PulzioHQ..." -ForegroundColor Yellow
Set-Location "pulziohq"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ PulzioHQ build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ".."

# Build UayLabs (main landing)
Write-Host "📦 Building UayLabs..." -ForegroundColor Yellow
Set-Location "uaylabs"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ UayLabs build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ".."

# Clean up symlinks
Write-Host "🧹 Cleaning up symlinks..." -ForegroundColor Yellow
Remove-Item -Path "ignium/out" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "jobpulse/out" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "pulziohq/out" -Force -ErrorAction SilentlyContinue

Write-Host "✅ All products built successfully!" -ForegroundColor Green
Write-Host "🌐 Ready for deployment to uaylabs.web.app" -ForegroundColor Green

# Return to root
Set-Location ".." 