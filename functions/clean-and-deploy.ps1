# clean-and-deploy.ps1

Write-Host "`n🧹 Limpiando build previo..."
Remove-Item -Recurse -Force .\lib -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\dist -ErrorAction SilentlyContinue

Write-Host "`n🛠️ Compilando TypeScript..."
npm run build

Write-Host "`n🚀 Desplegando funciones Firebase..."
firebase deploy --only functions

Write-Host "`n✅ Listo. Puedes revisar el log con:"
Write-Host "firebase functions:log --only api"
