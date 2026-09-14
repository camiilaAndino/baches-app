import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { loginUsuario, UsuarioAutenticado } from '@/services/api';

const CLAVE_STORAGE = 'alertabaches:usuario';

type AuthContextValue = {
  usuario: UsuarioAutenticado | null;
  cargandoSesion: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CLAVE_STORAGE)
      .then((guardado) => {
        if (guardado) setUsuario(JSON.parse(guardado));
      })
      .finally(() => setCargandoSesion(false));
  }, []);

  async function iniciarSesion(email: string, password: string) {
    const usuarioAutenticado = await loginUsuario(email, password);
    await AsyncStorage.setItem(CLAVE_STORAGE, JSON.stringify(usuarioAutenticado));
    setUsuario(usuarioAutenticado);
  }

  async function cerrarSesion() {
    await AsyncStorage.removeItem(CLAVE_STORAGE);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargandoSesion, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
