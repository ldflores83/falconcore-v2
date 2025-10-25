# Script de ayuda para mostrar todas las opciones de build
Write-Host "Build y Deploy - Opciones Disponibles" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Scripts disponibles:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  .\scripts\quick-build.ps1" -ForegroundColor White
Write-Host "    → Build y deploy de TODOS los productos" -ForegroundColor Gray
Write-Host ""
Write-Host "  .\scripts\build-onboardingaudit.ps1" -ForegroundColor White
Write-Host "    → Solo onboardingaudit" -ForegroundColor Gray
Write-Host ""
Write-Host "  .\scripts\build-ignium.ps1" -ForegroundColor White
Write-Host "    → Solo ignium" -ForegroundColor Gray
Write-Host ""
Write-Host "  .\scripts\build-jobpulse.ps1" -ForegroundColor White
Write-Host "    → Solo jobpulse" -ForegroundColor Gray
Write-Host ""
Write-Host "  .\scripts\build-pulziohq.ps1" -ForegroundColor White
Write-Host "    → Solo pulziohq" -ForegroundColor Gray
Write-Host ""
Write-Host "  .\scripts\build-ahau.ps1" -ForegroundColor White
Write-Host "    → Solo ahau" -ForegroundColor Gray
Write-Host ""
Write-Host "URLs de los productos:" -ForegroundColor Yellow
Write-Host "  - UayLabs: https://uaylabs.web.app" -ForegroundColor White
Write-Host "  - Ignium: https://uaylabs.web.app/ignium" -ForegroundColor White
Write-Host "  - JobPulse: https://uaylabs.web.app/jobpulse" -ForegroundColor White
Write-Host "  - PulzioHQ: https://uaylabs.web.app/pulziohq" -ForegroundColor White
Write-Host "  - OnboardingAudit: https://uaylabs.web.app/onboardingaudit" -ForegroundColor White
Write-Host "  - AHAU: https://uaylabs.web.app/ahau" -ForegroundColor White
Write-Host ""
Write-Host "Ejemplo de uso:" -ForegroundColor Yellow
Write-Host "  .\scripts\build-onboardingaudit.ps1" -ForegroundColor White 