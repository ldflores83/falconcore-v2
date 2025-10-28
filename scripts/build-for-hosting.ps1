Write-Host "🔨 Building all packages for Firebase Hosting..." -ForegroundColor Cyan

# Build packages
pnpm build:landing
pnpm build:ahau

# Clear public folder
if (Test-Path public) {
    Remove-Item -Path public\* -Recurse -Force
} else {
    New-Item -ItemType Directory -Path public -Force
}

# Copy builds to public/
Write-Host "📦 Copying landing to public/..." -ForegroundColor Yellow
Copy-Item -Path packages\landing\out\* -Destination public\ -Recurse -Force

Write-Host "📦 Copying ahau to public/ahau/..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path public\ahau -Force
Copy-Item -Path packages\ahau\out\* -Destination public\ahau\ -Recurse -Force

Write-Host "✅ Hosting build complete" -ForegroundColor Green
