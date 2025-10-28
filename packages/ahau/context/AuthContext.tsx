import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getAuthClient } from '../lib/firebase';
import { apiPost } from '../lib/auth-api';
import { Role } from '../types/ahau';

type Session = {
  uid: string;
  email: string | null;
  displayName: string | null;
  tenantId: string | null;
  role: Role | null;
};

type Ctx = {
  user: User | null;
  session: Session | null;
  refreshSession: () => Promise<void>;
  getActiveTenantId: () => string | null;
  getIdToken: () => Promise<string | null>;
  isLoading: boolean;
};

const AuthCtx = createContext<Ctx>({ 
  user: null, 
  session: null, 
  refreshSession: async () => {},
  getActiveTenantId: () => null,
  getIdToken: async () => null,
  isLoading: true
});
export const useAuthCtx = () => useContext(AuthCtx);

// Claves para localStorage
const SESSION_STORAGE_KEY = 'ahau_session';
const USER_STORAGE_KEY = 'ahau_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para guardar sesión en localStorage
  const saveSessionToStorage = (sessionData: Session | null) => {
    try {
      if (sessionData) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('No se pudo guardar la sesión en localStorage:', error);
    }
  };

  // Función para cargar sesión desde localStorage
  const loadSessionFromStorage = (): Session | null => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('No se pudo cargar la sesión desde localStorage:', error);
      return null;
    }
  };

  // Función para limpiar datos de sesión
  const clearSessionData = () => {
    setSession(null);
    setUser(null);
    saveSessionToStorage(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.warn('No se pudo limpiar localStorage:', error);
    }
  };

  async function refreshSession() {
    try {
      const auth = await getAuthClient();
      if (!auth.currentUser) { 
        clearSessionData();
        return; 
      }
      
      const data = await apiPost<Session>('/session/verify');
      if (data && data.uid) {
        setSession(data);
        saveSessionToStorage(data);
      } else {
        clearSessionData();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      // Si hay error de API pero el usuario está autenticado, mantener sesión local
      const storedSession = loadSessionFromStorage();
      if (storedSession) {
        setSession(storedSession);
      } else {
        clearSessionData();
      }
    }
  }

  function getActiveTenantId() {
    return session?.tenantId || null;
  }

  async function getIdToken() {
    const auth = await getAuthClient();
    return auth.currentUser ? await auth.currentUser.getIdToken() : null;
  }

  useEffect(() => {
    let unsub = () => {};
    
    (async () => {
      try {
        // Intentar cargar sesión desde localStorage primero
        const storedSession = loadSessionFromStorage();
        if (storedSession) {
          setSession(storedSession);
        }

        const auth = await getAuthClient();
        unsub = onAuthStateChanged(auth, async (u) => {
          setUser(u);
          
          if (u) {
            // Usuario autenticado, verificar sesión
            await refreshSession();
          } else {
            // Usuario no autenticado, limpiar sesión
            clearSessionData();
          }
          
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error in auth state change:', error);
        setIsLoading(false);
      }
    })();
    
    return () => unsub && unsub();
  }, []);

  return (
    <AuthCtx.Provider value={{ 
      user, 
      session, 
      refreshSession, 
      getActiveTenantId, 
      getIdToken,
      isLoading 
    }}>
      {children}
    </AuthCtx.Provider>
  );
}
