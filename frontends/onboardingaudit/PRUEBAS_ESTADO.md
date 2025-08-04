# 📋 Estado de Pruebas - OnboardingAudit

## 🎯 **Objetivo**
Implementar flujo completo de formulario: `receiveForm` → `generateDocument` → `uploadAsset` sin usar Firestore.

## ✅ **Lo que funciona**
- ✅ **OAuth Login**: Login exitoso con Google
- ✅ **OAuth Callback**: Redirección correcta al dashboard
- ✅ **Dashboard**: Carga de submissions desde admin
- ✅ **Carpeta Drive**: Se crea `OnboardingAudit_email` correctamente
- ✅ **Backend Deploy**: Funciones desplegadas en `https://api-fu54nvsqfa-uc.a.run.app`
- ✅ **Frontend Deploy**: Aplicación desplegada en `https://uaylabs.web.app/onboardingaudit/`

## ❌ **Errores actuales**

### 1. **Error de Formulario**
- **Síntoma**: "An error occurred. Please try again." al enviar formulario
- **Frontend**: `https://uaylabs.web.app/onboardingaudit/`
- **Backend**: `https://api-fu54nvsqfa-uc.a.run.app`
- **Estado**: ❌ **NO FUNCIONA**

### 2. **Secret Manager Error**
```
❌ SecretManager: Error accessing Secret Manager: Error: 7      
PERMISSION_DENIED: Permission 'secretmanager.versions.access' denied for resource
'projects/falconcore-v2/secrets/GOOGLE_CLIENT_ID/versions/latest'
```
- **Impacto**: Puede estar afectando la autenticación OAuth
- **Workaround**: Credenciales hardcodeadas en `config.ts`

### 3. **Firestore Index Error**
```
Error: 7 PERMISSION_DENIED: Permission 'datastore.indexes.create' denied
```
- **Impacto**: Puede estar afectando operaciones de base de datos
- **Estado**: ❌ **PENDIENTE**

## 🔍 **Análisis del problema**

### **Flujo actual del frontend:**
1. Usuario llena formulario en `/onboardingaudit/`
2. Frontend llama a `https://api-fu54nvsqfa-uc.a.run.app/api/public/receiveForm`
3. Backend debería crear carpeta y retornar `folderId`
4. Frontend debería llamar a `generateDocument` y `uploadAsset`
5. **RESULTADO**: Error genérico sin detalles

### **Posibles causas:**
1. **CORS**: Problemas de CORS entre frontend y backend
2. **OAuth**: Usuario no autenticado para Drive operations
3. **Payload**: Formato incorrecto del request
4. **Timeout**: Request muy grande (10MB limit)
5. **Network**: Problemas de conectividad

## 🧪 **Pruebas realizadas**

### **Test 1: Ping endpoint**
```bash
curl -X GET https://api-fu54nvsqfa-uc.a.run.app/ping
```
- **Resultado**: ✅ Funciona

### **Test 2: OAuth credentials**
```bash
curl -X POST https://api-fu54nvsqfa-uc.a.run.app/api/public/receiveForm \
  -H "Content-Type: application/json" \
  -d '{"formData":{"email":"test@test.com","productName":"Test"}}'
```
- **Resultado**: ❌ "OAuth authentication required"

### **Test 3: Logs del backend**
```bash
firebase functions:log --only api | Select-String -Pattern "receiveForm|Form submission"
```
- **Resultado**: ❌ No se ven logs del formulario

## 🚀 **Siguientes pasos**

### **Paso 1: Debug del frontend**
- [ ] Revisar Network tab en DevTools
- [ ] Verificar si el request llega al backend
- [ ] Capturar error específico del frontend

### **Paso 2: Debug del backend**
- [ ] Agregar más logs en `receiveForm.ts`
- [ ] Verificar si el request llega al endpoint
- [ ] Probar endpoint directamente con Postman/curl

### **Paso 3: Verificar OAuth**
- [ ] Confirmar que el usuario está autenticado
- [ ] Verificar tokens de OAuth en Firestore
- [ ] Probar con usuario ya logueado

### **Paso 4: Simplificar flujo**
- [ ] Crear endpoint de prueba simple
- [ ] Probar sin OAuth primero
- [ ] Agregar OAuth paso a paso

### **Paso 5: Fix Secret Manager**
- [ ] Configurar permisos de IAM
- [ ] Migrar de hardcoded a Secret Manager
- [ ] Testear configuración

## 📊 **Métricas de estado**

| Componente | Estado | URL | Notas |
|------------|--------|-----|-------|
| Frontend | ✅ Funciona | `uaylabs.web.app/onboardingaudit/` | Deploy correcto |
| Backend API | ✅ Funciona | `api-fu54nvsqfa-uc.a.run.app` | Ping OK |
| OAuth Login | ✅ Funciona | `/api/oauth/login` | Login exitoso |
| OAuth Callback | ✅ Funciona | `/oauth/callback` | Redirección OK |
| Dashboard | ✅ Funciona | `/onboardingaudit/admin` | Carga submissions |
| receiveForm | ❌ **FALLA** | `/api/public/receiveForm` | Error genérico |
| generateDocument | ❓ **NO PROBADO** | `/api/public/generateDocument` | Depende de receiveForm |
| uploadAsset | ❓ **NO PROBADO** | `/api/public/uploadAsset` | Depende de receiveForm |

## 🔧 **Comandos útiles**

### **Ver logs en tiempo real:**
```bash
firebase functions:log --only api --follow
```

### **Probar endpoint directamente:**
```bash
curl -X POST https://api-fu54nvsqfa-uc.a.run.app/api/public/receiveForm \
  -H "Content-Type: application/json" \
  -d '{"formData":{"email":"test@test.com","productName":"Test"}}'
```

### **Deploy rápido:**
```bash
cd functions && npm run build && cd .. && firebase deploy --only functions
```

## 📝 **Notas importantes**

1. **OAuth está funcionando** - El problema no es OAuth
2. **Frontend está desplegado** - El problema no es el frontend
3. **Backend responde** - El problema está en el endpoint específico
4. **Flujo nuevo implementado** - Sin Firestore, solo Drive operations
5. **Workaround activo** - Credenciales hardcodeadas funcionando

## 🎯 **Prioridad actual**
**ALTA**: Debug del endpoint `receiveForm` para identificar el error específico.

---
*Última actualización: 2025-08-04*
*Estado: En progreso - Error en receiveForm* 