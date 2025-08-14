# Onboarding Audit - Estado Actual y Arquitectura

## 📋 Estado Actual del Sistema

### ✅ **Funcionalidades Implementadas y Funcionando:**

1. **Formulario Multi-paso**
   - 5 pasos: Product Basics → Current Onboarding Flow → Analytics & Access → Goal & Metrics → Delivery
   - Validación en tiempo real
   - Navegación entre pasos
   - Checkboxes en 2 columnas para mejor UX

2. **Sistema de Submissions**
   - Guardado en Firestore (`onboardingaudit_submissions`)
   - Validación de campos requeridos
   - Generación de IDs únicos
   - Estado de submissions (pending → synced → completed)

3. **Sincronización con Google Drive**
   - Creación automática de carpetas por submission
   - Generación de documentos MD con estructura completa
   - Subida de archivos adjuntos
   - Limpieza automática de Cloud Storage

4. **Panel de Administración**
   - Autenticación OAuth con Google
   - Dashboard con analytics básicos
   - Gestión de submissions
   - Procesamiento manual de submissions

5. **Sistema de Waitlist**
   - Formulario de waitlist cuando hay muchas submissions pendientes
   - Gestión de lista de espera
   - Notificaciones automáticas

## 🏗️ Arquitectura del Sistema

### **Frontend (Next.js + TypeScript)**
```
frontends/onboardingaudit/
├── components/
│   ├── AuditForm.tsx          # Formulario principal multi-paso
│   ├── SuccessMessage.tsx     # Mensaje de éxito
│   ├── WaitlistForm.tsx       # Formulario de waitlist
│   ├── WaitlistDashboard.tsx  # Dashboard de waitlist
│   └── AnalyticsDashboard.tsx # Dashboard de analytics
├── lib/
│   ├── api.ts                 # Cliente API para backend
│   └── analytics.ts           # Tracking de analytics
├── pages/
│   ├── index.tsx              # Página principal con formulario
│   ├── admin.tsx              # Panel de administración
│   ├── login.tsx              # Login OAuth
│   └── waitlist.tsx           # Página de waitlist
├── types/
│   └── form.ts                # Tipos TypeScript del formulario
└── public/
    └── worker.js              # Web Worker para procesamiento de archivos
```

### **Backend (Firebase Functions + TypeScript)**
```
functions/src/api/
├── public/
│   ├── receiveForm.ts         # Endpoint para recibir submissions
│   ├── uploadAsset.ts         # Subida de archivos
│   ├── waitlist.ts            # Gestión de waitlist
│   └── trackVisit.ts          # Tracking de visitas
├── admin/
│   ├── processSubmissions.ts  # Procesamiento y sincronización
│   ├── submissions.ts         # Gestión de submissions
│   ├── analytics.ts           # Analytics del admin
│   └── waitlist.ts            # Gestión de waitlist
└── auth/
    ├── check.ts               # Verificación de autenticación
    └── logout.ts              # Logout
```

### **Base de Datos (Firestore)**
```
Collections:
├── onboardingaudit_submissions
│   ├── submissionId
│   ├── product_name
│   ├── report_email
│   ├── status (pending/synced/completed)
│   ├── createdAt
│   └── [todos los campos del formulario]
└── onboardingaudit_waitlist
    ├── email
    ├── productName
    ├── website
    └── timestamp
```

### **Almacenamiento (Cloud Storage)**
```
falconcore-onboardingaudit-uploads/
├── submissions/
│   └── {submissionId}/
│       ├── Onboarding_Audit_{Product}_{Email}_{Date}.md
│       └── [archivos adjuntos]
```

## 📝 Estructura del Formulario Actual

### **Step 1: Product Basics**
- `product_name` (string, required)
- `signup_link` (string, required)
- `target_user` (select, required)
- `value_prop` (string, required)
- `icp_company_size` (select, required)
- `icp_industry` (select, required)
- `icp_primary_role` (select, required)
- `day1_jtbd` (textarea, required)
- `pricing_tier` (select, required)
- `main_competitor` (string, optional)

### **Step 2: Current Onboarding Flow**
- `signup_methods` (multiselect, required)
- `first_screen` (select, required)
- `track_dropoffs` (select, required)
- `activation_definition` (string, required)
- `aha_moment` (string, optional)
- `time_to_aha_minutes` (number, optional)
- `blocking_steps` (multiselect, optional)
- `platforms` (multiselect, optional)
- `compliance_constraints` (multiselect, optional)

### **Step 2.5: Analytics & Access**
- `analytics_tool` (select, required)
- `key_events` (array, optional)
- `signups_per_week` (number, optional)
- `mau` (number, optional)
- `mobile_percent` (number, optional)
- `readonly_access` (radio, optional)
- `access_instructions` (textarea, optional)

### **Step 3: Goal & Metrics**
- `main_goal` (select, required)
- `know_churn_rate` (select, optional)
- `churn_when` (select, optional)
- `target_improvement_percent` (number, optional)
- `time_horizon` (select, optional)
- `main_segments` (multiselect, optional)
- `constraints` (textarea, optional)

### **Step 4: Delivery**
- `report_email` (email, required)
- `include_benchmarks` (checkbox, optional)
- `want_ab_plan` (checkbox, optional)
- `screenshots` (file upload, optional)
- `walkthrough_url` (url, optional)
- `demo_account` (string, optional)

### **Step 5: Optional Evidence**
- `feature_flags` (select, optional)
- `ab_tool` (string, optional)
- `languages` (multiselect, optional)
- `empty_states_urls` (textarea, optional)
- `notifications_provider` (string, optional)

## 🔧 Guías para Actualizaciones Futuras

### **1. Agregar Nuevos Campos al Formulario**

#### **Frontend:**
1. **Actualizar tipos** en `types/form.ts`:
```typescript
export interface OnboardingAuditForm {
  // ... campos existentes
  new_field: string; // nuevo campo
}
```

2. **Actualizar estado inicial** en `components/AuditForm.tsx`:
```typescript
const [formData, setFormData] = useState<OnboardingAuditForm>({
  // ... campos existentes
  new_field: '', // valor inicial
});
```

3. **Agregar campo en el paso correspondiente**:
```tsx
<div>
  <label className="block text-white text-sm font-medium mb-2">
    Nuevo Campo
  </label>
  <input
    type="text"
    className="form-input"
    value={formData.new_field}
    onChange={(e) => handleInputChange('new_field', e.target.value)}
    placeholder="Descripción del campo"
  />
</div>
```

#### **Backend:**
1. **Actualizar interfaz** en `functions/src/api/public/receiveForm.ts`:
```typescript
interface OnboardingAuditForm {
  // ... campos existentes
  new_field: string;
}
```

2. **Actualizar función generateFormDocument** en ambos archivos:
   - `functions/src/api/public/receiveForm.ts`
   - `functions/src/api/admin/processSubmissions.ts`

```typescript
function generateFormDocument(formData: OnboardingAuditForm): string {
  return `# Onboarding Audit Request
  // ... contenido existente
  - **Nuevo Campo:** ${formData.new_field || 'Not specified'}
  // ... resto del contenido
  `;
}
```

### **2. Agregar Nuevos Pasos**

1. **Actualizar navegación** en `components/AuditForm.tsx`:
```typescript
const nextStep = useCallback(() => {
  setCurrentStep(prev => {
    if (prev === 2) return 2.5;
    if (prev === 2.5) return 3;
    if (prev === 3) return 3.5; // nuevo paso
    if (prev === 3.5) return 4; // ajustar numeración
    return Math.min(prev + 1, 6); // actualizar total de pasos
  });
}, []);
```

2. **Agregar el nuevo paso**:
```tsx
{/* Step 3.5: Nuevo Paso */}
{currentStep === 3.5 && (
  <div className="card">
    <h3 className="text-xl font-semibold text-white mb-4">Nuevo Paso</h3>
    {/* Campos del nuevo paso */}
  </div>
)}
```

### **3. Modificar Validaciones**

1. **Frontend** - Agregar validación en `components/AuditForm.tsx`:
```typescript
const validateStep = (step: number) => {
  switch (step) {
    case 1:
      return formData.product_name && formData.signup_link;
    // ... otros casos
    case 3.5: // nuevo paso
      return formData.new_field; // validación del nuevo campo
  }
};
```

2. **Backend** - Actualizar validación en `functions/src/api/public/receiveForm.ts`:
```typescript
if (!formData.report_email || !formData.product_name || !formData.new_field) {
  return res.status(400).json({
    success: false,
    message: "Missing required form fields: report_email, product_name, and new_field"
  });
}
```

### **4. Actualizar Convención de Nombres**

Si necesitas cambiar la convención de nombres de carpetas/archivos:

1. **Carpetas** en `functions/src/api/admin/processSubmissions.ts`:
```typescript
const submissionFolderName = `${safeProductName}_${submission.report_email}_${projectId}_${newSuffix}`;
```

2. **Archivos MD** en ambos archivos:
```typescript
const documentFilename = `Onboarding_Audit_${safeProductName}_${submission.report_email}_${newDate}_${newSuffix}.md`;
```

### **5. Agregar Nuevos Tipos de Campos**

#### **Para campos de selección múltiple:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
  {options.map(option => (
    <label key={option.value} className="flex items-center">
      <input
        type="checkbox"
        className="mr-2"
        checked={formData.new_field.includes(option.value)}
        onChange={(e) => {
          const newValues = e.target.checked
            ? [...formData.new_field, option.value]
            : formData.new_field.filter(v => v !== option.value);
          handleInputChange('new_field', newValues);
        }}
      />
      <span className="text-white text-sm">{option.label}</span>
    </label>
  ))}
</div>
```

#### **Para campos de selección única:**
```tsx
<select
  className="form-select"
  value={formData.new_field}
  onChange={(e) => handleInputChange('new_field', e.target.value)}
>
  <option value="">Select...</option>
  {options.map(option => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))}
</select>
```

## 🚀 Deployment y Mantenimiento

### **Build y Deploy:**
```bash
# Frontend
cd frontends/onboardingaudit
npm run build

# Backend
cd functions
npm run build
cd ..
firebase deploy --only functions
firebase deploy --only hosting
```

### **Scripts Disponibles:**
- `frontends/onboardingaudit/build-and-deploy.ps1` - Build y deploy completo
- `scripts/build-onboardingaudit.ps1` - Build específico

### **Monitoreo:**
- Logs en Firebase Functions
- Analytics en panel de admin
- Estado de submissions en Firestore

## 🔍 Puntos de Mejora Identificados

### **UX/UI:**
1. **Validación visual** más clara para campos requeridos
2. **Indicadores de progreso** más detallados
3. **Tooltips** para campos complejos
4. **Responsive design** mejorado para móviles

### **Funcionalidad:**
1. **Auto-guardado** de formulario en progreso
2. **Previsualización** del documento generado
3. **Templates** de respuestas rápidas
4. **Integración** con CRM/email marketing

### **Técnico:**
1. **Caching** de respuestas de API
2. **Optimización** de imágenes más avanzada
3. **Rate limiting** más sofisticado
4. **Métricas** más detalladas

## 📞 Contacto y Soporte

Para cambios o mejoras:
1. Revisar este documento
2. Seguir las guías de actualización
3. Probar en desarrollo antes de deploy
4. Verificar que las funciones de sincronización sigan funcionando

---

**Última actualización:** $(date)
**Versión del sistema:** 1.0.0
**Estado:** ✅ Funcionando en producción
