# CURSOR PROMPT — Ahau · Milestone A (Login + Dashboard Shell + Create Tenant)

## 🎯 Objetivo
Implementar **login** (Google + Email/Password) con **Firebase Auth**, verificación en backend con `verifyIdToken`, **creación de tenant** post-auth y **Dashboard** inicial.  
**No tocar** el carril OAuth de OnboardingAudit que usa Drive.

## 🔒 Invariantes
- No modificar `/functions/src/oauth/**` (OnboardingAudit).
- Ahau usa **Firebase Auth** (sin scopes de Drive).
- `clientId == auth.uid` (documento `users/{uid}`).
- Backend expone `/api/ahau/*` en el **mismo** Express app ya existente.

---

## 1) Estructura de archivos (crear o actualizar)

### Backend (Functions, TypeScript)
```
functions/
  src/
    index.ts                         // montar router si no está
    routes/
      ahau.ts                        // NUEVO: router Ahau
    middleware/
      verifyFirebaseIdToken.ts       // NUEVO
    products/
      ahau/
        helpers/
          makeTenantId.ts            // NUEVO
```

### Frontend (Vite + React + TS)
```
frontends/ahau/
  src/
    main.tsx
    App.tsx
    lib/
      firebase.ts                    // init SDK
      api.ts                         // helper fetch con bearer
    context/
      AuthContext.tsx
    components/
      Navbar.tsx
      AuthTabs.tsx
      SignupEmailForm.tsx
      CreateTenantForm.tsx
    pages/
      Login.tsx
      Dashboard.tsx
    router/
      ProtectedRoute.tsx
```

---

## 2) Backend — Código

### 2.1 `functions/src/middleware/verifyFirebaseIdToken.ts`
```ts
import { auth } from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

export async function verifyFirebaseIdToken(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || '';
  const m = hdr.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ code: 'auth/missing-bearer' });

  try {
    const decoded = await auth().verifyIdToken(m[1], true); // checkRevoked=true (opcional)
    (req as any).auth = { uid: decoded.uid, email: decoded.email ?? null, claims: decoded };
    return next();
  } catch (err) {
    return res.status(401).json({ code: 'auth/invalid-token' });
  }
}
```

### 2.2 `functions/src/products/ahau/helpers/makeTenantId.ts`
```ts
export function makeTenantId(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `ahau_${slug || 'workspace'}_${suffix}`;
}
```

### 2.3 `functions/src/routes/ahau.ts`
```ts
import * as admin from 'firebase-admin';
import { Router } from 'express';
import { verifyFirebaseIdToken } from '../middleware/verifyFirebaseIdToken';
import { makeTenantId } from '../products/ahau/helpers/makeTenantId';

const db = admin.firestore();
export const ahuaRouter = Router();

ahauRouter.use(verifyFirebaseIdToken);
ahauRouter.use((req, _res, next) => {
  // asegurar JSON
  if (!req.is('application/json')) {
    // permitir vacíos en /session/verify
  }
  next();
});

// POST /api/ahau/session/verify
ahauRouter.post('/session/verify', async (req, res) => {
  const { uid, email } = (req as any).auth;
  const userSnap = await db.doc(`users/${uid}`).get();
  const data = userSnap.exists ? userSnap.data() as any : null;

  return res.json({
    uid,
    email,
    displayName: data?.displayName ?? null,
    tenantId: data?.tenantId ?? null,
    role: data?.role ?? null,
  });
});

// POST /api/ahau/tenants.create
ahauRouter.post('/tenants.create', async (req, res) => {
  const { uid, email } = (req as any).auth;
  const { name } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    return res.status(400).json({ code: 'invalid/name' });
  }

  const userRef = db.doc(`users/${uid}`);
  const userSnap = await userRef.get();
  const currentTenant = userSnap.exists ? (userSnap.data() as any).tenantId : null;
  if (currentTenant) {
    return res.status(409).json({ code: 'tenant/already-assigned', tenantId: currentTenant });
  }

  // idempotencia: si ya creó uno
  const existing = await db.collection('accounts').where('createdBy', '==', uid).limit(1).get();
  if (!existing.empty) {
    const acc = existing.docs[0];
    await userRef.set(
      { authUid: uid, email: email ?? null, tenantId: acc.id, role: 'admin' },
      { merge: true }
    );
    return res.json({ tenantId: acc.id });
  }

  const tenantId = makeTenantId(name);
  await db.doc(`accounts/${tenantId}`).set({
    name: name.trim(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: uid,
    status: 'active',
  });

  await userRef.set(
    { authUid: uid, email: email ?? null, tenantId, role: 'admin' },
    { merge: true }
  );

  return res.json({ tenantId });
});
```

### 2.4 Montar router en `functions/src/index.ts`
> Si ya tienes un `Express` app llamado `app` o `api`, **solo agrega** la importación y el `use`.  
> **No borres** nada de `/oauth/**`.

```ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import { ahauRouter } from './routes/ahau';

admin.initializeApp();

const app = express();

// ... (rutas existentes, ej. /oauth, /storage, etc.)
app.use(express.json());
app.use('/api/ahau', ahauRouter);

export const api = functions.https.onRequest(app);
```

---

## 3) Frontend — Código

### 3.1 Instalar dependencias
```bash
cd frontends/ahau
npm i firebase react-router-dom
```

### 3.2 `src/lib/firebase.ts`
```ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// RELLENAR con config real de Ahau (no de OnboardingAudit)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

### 3.3 `src/lib/api.ts`
```ts
import { auth } from './firebase';

export async function apiPost<T = any>(path: string, body?: any): Promise<T> {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  const res = await fetch(`/api/ahau${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${text}`);
  }
  return res.json();
}
```

### 3.4 `src/context/AuthContext.tsx`
```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { apiPost } from '../lib/api';

type Session = {
  uid: string;
  email: string | null;
  displayName: string | null;
  tenantId: string | null;
  role: string | null;
};

type Ctx = {
  user: User | null;
  session: Session | null;
  refreshSession: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({ user: null, session: null, refreshSession: async () => {} });
export const useAuthCtx = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  async function refreshSession() {
    if (!auth.currentUser) { setSession(null); return; }
    const data = await apiPost<Session>('/session/verify');
    setSession(data);
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await refreshSession();
      else setSession(null);
    });
  }, []);

  return <AuthCtx.Provider value={{ user, session, refreshSession }}>{children}</AuthCtx.Provider>;
}
```

### 3.5 `src/components/Navbar.tsx`
```tsx
export default function Navbar({ tenantName }: { tenantName?: string | null }) {
  return (
    <div className="w-full border-b bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">Ahau {tenantName ? `· ${tenantName}` : ''}</div>
      </div>
    </div>
  );
}
```

### 3.6 `src/components/AuthTabs.tsx`
```tsx
import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import SignupEmailForm from './SignupEmailForm';

export default function AuthTabs({ onGoogleDone }: { onGoogleDone: () => Promise<void> }) {
  const [tab, setTab] = useState<'signin'|'create'>('signin');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');

  return (
    <div className="max-w-md w-full space-y-4">
      <div className="flex gap-4">
        <button className={tab==='signin'?'font-bold':''} onClick={()=>setTab('signin')}>Sign in</button>
        <button className={tab==='create'?'font-bold':''} onClick={()=>setTab('create')}>Create your workspace</button>
      </div>

      {tab==='signin' ? (
        <div className="space-y-3">
          <button className="w-full border p-2" onClick={async ()=>{ await signInWithPopup(auth, googleProvider); await onGoogleDone(); }}>
            Continue with Google
          </button>
          <div className="space-y-2">
            <input className="w-full border p-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="w-full border p-2" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="w-full border p-2" onClick={async ()=>{
              await signInWithEmailAndPassword(auth, email, password);
              await onGoogleDone(); // mismo flujo: verify → si falta tenant abrir modal en page
            }}>Sign in</button>
          </div>
        </div>
      ) : (
        <SignupEmailForm />
      )}
    </div>
  );
}
```

### 3.7 `src/components/SignupEmailForm.tsx`
```tsx
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { apiPost } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function SignupEmailForm() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  return (
    <form className="space-y-2" onSubmit={async (e)=> {
      e.preventDefault(); setLoading(true);
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) await updateProfile(cred.user, { displayName });
        await apiPost('/tenants.create', { name: companyName });
        nav('/dashboard');
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    }}>
      <input className="w-full border p-2" placeholder="Company name" value={companyName} onChange={e=>setCompanyName(e.target.value)} required />
      <input className="w-full border p-2" placeholder="Your name (optional)" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
      <input className="w-full border p-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input className="w-full border p-2" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <button disabled={loading} className="w-full border p-2">{loading?'Creating...':'Create workspace'}</button>
    </form>
  );
}
```

### 3.8 `src/components/CreateTenantForm.tsx` (modal simple)
```tsx
import { useState } from 'react';
import { apiPost } from '../lib/api';

export default function CreateTenantForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-4 rounded-xl w-full max-w-md space-y-3">
        <div className="text-lg font-semibold">Name your workspace</div>
        <input className="w-full border p-2" placeholder="Company name" value={name} onChange={e=>setName(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button className="border px-3 py-2" disabled={loading} onClick={async ()=>{
            setLoading(true);
            try {
              await apiPost('/tenants.create', { name });
              onCreated();
            } finally { setLoading(false); }
          }}>Create</button>
        </div>
      </div>
    </div>
  );
}
```

### 3.9 `src/pages/Login.tsx`
```tsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AuthTabs from '../components/AuthTabs';
import { useAuthCtx } from '../context/AuthContext';
import { apiPost } from '../lib/api';
import CreateTenantForm from '../components/CreateTenantForm';

export default function Login() {
  const nav = useNavigate();
  const { session, refreshSession } = useAuthCtx();
  const [showCreateTenant, setShowCreateTenant] = useState(false);

  async function afterSignIn() {
    await refreshSession();
    const data = await apiPost('/session/verify'); // asegurar estado actualizado
    if (data.tenantId) nav('/dashboard');
    else setShowCreateTenant(true);
  }

  useEffect(() => {
    if (session?.tenantId) nav('/dashboard');
  }, [session]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthTabs onGoogleDone={afterSignIn} />
      {showCreateTenant && (
        <CreateTenantForm onCreated={()=> nav('/dashboard')} />
      )}
    </div>
  );
}
```

### 3.10 `src/pages/Dashboard.tsx`
```tsx
import Navbar from '../components/Navbar';
import { useAuthCtx } from '../context/AuthContext';

export default function Dashboard() {
  const { session } = useAuthCtx();
  return (
    <div className="min-h-screen">
      <Navbar tenantName={session?.tenantId ?? null} />
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-xl font-semibold">Hola{session?.displayName ? `, ${session.displayName}` : ''} 👋</h1>
        <p className="text-gray-600 mt-2">Aquí irá tu dashboard.</p>
      </div>
    </div>
  );
}
```

### 3.11 `src/router/ProtectedRoute.tsx`
```tsx
import { Navigate } from 'react-router-dom';
import { useAuthCtx } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuthCtx();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
```

### 3.12 `src/main.tsx` y `src/App.tsx`
```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './router/ProtectedRoute';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

```tsx
// App.tsx (si se usa)
export default function App(){ return null; }
```

---

## 4) Reglas Firestore (mínimas para este milestone)
> Si el backend escribe con **Admin SDK**, las reglas no aplican a esos writes, pero protege lecturas desde cliente.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }

    match /accounts/{tenantId} {
      allow read: if isSignedIn(); // opcional: restringir después por tenant
      allow write: if false;       // sólo backend
    }

    match /users/{uid} {
      allow read: if isSignedIn() && request.auth.uid == uid;
      allow write: if false; // write de perfil lo hace backend por ahora
    }
  }
}
```

---

## 5) Pruebas (DoD de Milestone A)
1. **Sign in con Google** → si el usuario no tiene tenant:
   - Aparece **modal** “Name your workspace”.
   - `POST /tenants.create` responde `{ tenantId }`.
   - Redirige a `/dashboard`.
2. **Sign up con Email/Pass** en pestaña **Create your workspace**:
   - Crea usuario y tenant en una pasada.
   - Redirige a `/dashboard`.
3. **Sign in con Email/Pass** cuando ya existe tenant:
   - Va directo a `/dashboard`.
4. **`/session/verify`** devuelve `{ uid, email, tenantId }` correcto.
5. `/functions` compila sin errores. Rutas de **OnboardingAudit (`/oauth/**`) siguen funcionando**.

---

## 6) Notas de integración
- Montar `ahauRouter` bajo `/api/ahau` en el mismo `Express` de `index.ts`.  
- No referenciar `GoogleDriveProvider` en ningún archivo nuevo.  
- `tenantId` mostrado en Navbar es suficiente como validación visual por ahora; el **nombre** del tenant puede agregarse en Milestone B.

---

## 7) Commit sugerido
```
git checkout -b feat/ahau-milestone-a
git add functions/src/middleware/verifyFirebaseIdToken.ts \
        functions/src/products/ahau/helpers/makeTenantId.ts \
        functions/src/routes/ahau.ts \
        functions/src/index.ts \
        frontends/ahau/src/lib/firebase.ts \
        frontends/ahau/src/lib/api.ts \
        frontends/ahau/src/context/AuthContext.tsx \
        frontends/ahau/src/components/Navbar.tsx \
        frontends/ahau/src/components/AuthTabs.tsx \
        frontends/ahau/src/components/SignupEmailForm.tsx \
        frontends/ahau/src/components/CreateTenantForm.tsx \
        frontends/ahau/src/pages/Login.tsx \
        frontends/ahau/src/pages/Dashboard.tsx \
        frontends/ahau/src/router/ProtectedRoute.tsx \
        frontends/ahau/src/main.tsx
git commit -m "Ahau Milestone A: Firebase Auth login + tenants.create + dashboard shell (sin tocar OAuth de OnboardingAudit)"
```

---

## 8) Checklist final para Cursor
- [ ] Código creado/actualizado según estructura.
- [ ] Build Functions OK (`npm run build` en `functions`).
- [ ] Frontend levanta (`npm run dev`) y flujos funcionan.
- [ ] `/oauth/**` intacto (OnboardingAudit).
- [ ] PR abierto con descripción de pruebas y screenshots.