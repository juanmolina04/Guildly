import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { syncUser } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase avisa automáticamente cuando alguien inicia o cierra sesión,
    // incluso al volver a abrir la app (gracias a la persistencia en AsyncStorage).
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      // Guarda (o confirma) el perfil del usuario en Firestore a través del back.
      if (firebaseUser) syncUser().catch(() => {});
    });

    return unsubscribe; // limpieza al desmontar
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
