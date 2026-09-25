import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { actualizarPushToken, loginUsuario, UsuarioAutenticado } from '@/services/api';
import { registrarParaNotificaciones } from '@/services/notificaciones-push';

const CLAVE_STORAGE = 'alertabaches:usuario';
const CLAVE_RECORDADA = 'alertabaches:cuenta-recordada';
const CLAVE_BIOMETRIA = 'alertabaches:biometria';

type AuthContextValue = {
  usuario: UsuarioAutenticado | null;
  cargandoSesion: boolean;
  bloqueado: boolean;
  biometriaActivada: boolean;
  /** Última cuenta con la que se inició sesión en este dispositivo. A diferencia
   *  de `usuario`, sobrevive a `cerrarSesion`, para poder ofrecer "ingresar con
   *  biometría" desde la pantalla de login sin volver a pedir la contraseña. */
  cuentaRecordada: UsuarioAutenticado | null;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  iniciarSesionConBiometria: () => Promise<boolean>;
  cerrarSesion: () => Promise<void>;
  olvidarCuentaRecordada: () => Promise<void>;
  actualizarUsuario: (usuario: UsuarioAutenticado) => Promise<void>;
  activarBiometria: () => Promise<boolean>;
  desactivarBiometria: () => Promise<void>;
  desbloquear: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [biometriaActivada, setBiometriaActivada] = useState(false);
  const [cuentaRecordada, setCuentaRecordada] = useState<UsuarioAutenticado | null>(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(CLAVE_STORAGE),
      AsyncStorage.getItem(CLAVE_RECORDADA),
      AsyncStorage.getItem(CLAVE_BIOMETRIA),
    ])
      .then(([usuarioGuardado, recordadaGuardada, biometriaGuardada]) => {
        const activada = biometriaGuardada === 'true';
        setBiometriaActivada(activada);
        if (recordadaGuardada) setCuentaRecordada(JSON.parse(recordadaGuardada));

        if (usuarioGuardado) {
          setUsuario(JSON.parse(usuarioGuardado));
          if (activada) setBloqueado(true);
        }
      })
      .finally(() => setCargandoSesion(false));
  }, []);

  useEffect(() => {
    if (!usuario) return;

    registrarParaNotificaciones()
      .then((token) => {
        if (token) return actualizarPushToken(usuario.id, token);
      })
      .catch(() => {
        // no es crítico: si falla, el usuario simplemente no recibe push por ahora
      });
  }, [usuario?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function iniciarSesion(email: string, password: string) {
    const usuarioAutenticado = await loginUsuario(email, password);
    await guardarSesion(usuarioAutenticado);
    setUsuario(usuarioAutenticado);
    setBloqueado(false);
  }

  async function iniciarSesionConBiometria(): Promise<boolean> {
    if (!cuentaRecordada) return false;

    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: `Ingresá como ${cuentaRecordada.name}`,
    });
    if (!resultado.success) return false;

    await guardarSesion(cuentaRecordada);
    setUsuario(cuentaRecordada);
    setBloqueado(false);
    return true;
  }

  async function guardarSesion(usuarioAutenticado: UsuarioAutenticado) {
    await AsyncStorage.setItem(CLAVE_STORAGE, JSON.stringify(usuarioAutenticado));
    await AsyncStorage.setItem(CLAVE_RECORDADA, JSON.stringify(usuarioAutenticado));
    setCuentaRecordada(usuarioAutenticado);
  }

  async function cerrarSesion() {
    await AsyncStorage.removeItem(CLAVE_STORAGE);
    setUsuario(null);
    setBloqueado(false);
  }

  async function olvidarCuentaRecordada() {
    await AsyncStorage.removeItem(CLAVE_RECORDADA);
    setCuentaRecordada(null);
  }

  async function actualizarUsuario(actualizado: UsuarioAutenticado) {
    await guardarSesion(actualizado);
    setUsuario(actualizado);
  }

  async function activarBiometria(): Promise<boolean> {
    const tieneHardware = await LocalAuthentication.hasHardwareAsync();
    const tieneHuellasRegistradas = await LocalAuthentication.isEnrolledAsync();
    if (!tieneHardware || !tieneHuellasRegistradas) return false;

    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirmá tu identidad para activar el desbloqueo biométrico',
    });
    if (!resultado.success) return false;

    await AsyncStorage.setItem(CLAVE_BIOMETRIA, 'true');
    setBiometriaActivada(true);
    return true;
  }

  async function desactivarBiometria() {
    await AsyncStorage.removeItem(CLAVE_BIOMETRIA);
    setBiometriaActivada(false);
  }

  async function desbloquear(): Promise<boolean> {
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Desbloqueá Alerta Baches',
    });
    if (resultado.success) setBloqueado(false);
    return resultado.success;
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargandoSesion,
        bloqueado,
        biometriaActivada,
        cuentaRecordada,
        iniciarSesion,
        iniciarSesionConBiometria,
        cerrarSesion,
        olvidarCuentaRecordada,
        actualizarUsuario,
        activarBiometria,
        desactivarBiometria,
        desbloquear,
      }}>
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
