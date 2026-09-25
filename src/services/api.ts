import Constants from 'expo-constants';
import { File as ArchivoNativo, UploadType } from 'expo-file-system';
import { Platform } from 'react-native';

import { DenunciaEstadoApi, DenunciaPrioridad } from '@/constants/denuncias';

/**
 * URL del backend (baches-web). Se resuelve así:
 *   1. Si existe EXPO_PUBLIC_API_URL (en .env), se usa esa (ej. para producción).
 *   2. Si no, se toma la IP de la PC que corre Expo (la misma donde corre el
 *      backend), así no hay que cambiarla a mano al cambiar de red WiFi.
 *
 * En la PC, levantá el backend con:
 *   php artisan serve --host=0.0.0.0 --port=8000
 */
function resolverApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // En web, `window` no existe durante el renderizado en el servidor de Expo Router.
  const host =
    Platform.OS === 'web'
      ? typeof window !== 'undefined'
        ? window.location.hostname
        : undefined
      : Constants.expoConfig?.hostUri?.split(':')[0];

  return `http://${host ?? 'localhost'}:8000/api`;
}

const API_BASE_URL = resolverApiBaseUrl();

/**
 * Laravel devuelve las URLs de archivos (fotos) con la IP que tenía la PC al
 * momento de pedirlas, y la sesión guardada en el dispositivo las conserva.
 * Esto reemplaza el origen por el del backend actual, para que las fotos
 * sigan cargando después de cambiar de red.
 */
export function urlDelServidor(url: string): string {
  const origenActual = API_BASE_URL.replace(/\/api\/?$/, '');
  return url.replace(/^https?:\/\/[^/]+/, origenActual);
}

async function extraerMensajeDeError(response: Response, mensajePorDefecto: string): Promise<string> {
  const json = await response.json().catch(() => null);
  const primerError = json?.errors ? Object.values(json.errors)[0] : null;
  const mensaje = Array.isArray(primerError) ? primerError[0] : json?.message;
  return mensaje ?? mensajePorDefecto;
}

export type TipoDenunciaApi = {
  id: number;
  nombre: string;
  descripcion: string | null;
};

export type UsuarioAutenticado = {
  id: number;
  name: string;
  email: string;
  fotoPerfilUrl: string | null;
};

function mapearUsuario(data: {
  id: number;
  name: string;
  email: string;
  foto_perfil_url: string | null;
}): UsuarioAutenticado {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    fotoPerfilUrl: data.foto_perfil_url,
  };
}

/**
 * TODO (backend): todavía no existe `POST /api/login` en baches-web.
 * Hay que crear un endpoint que reciba { email, password }, valide contra la
 * tabla `users` (Auth::attempt) y devuelva { data: { id, name, email } }.
 */
export async function loginUsuario(email: string, password: string): Promise<UsuarioAutenticado> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeDeError(response, 'No se pudo iniciar sesión.'));
  }

  const json = await response.json();
  return mapearUsuario(json.data);
}

export type NuevoUsuarioPayload = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

/**
 * TODO (backend): todavía no existe `POST /api/registro` en baches-web.
 * Hay que crear un endpoint que reciba { name, email, password, password_confirmation },
 * cree el User con el rol "Usuario App" por defecto, y devuelva { data: { id, name, email } }.
 */
export async function registrarUsuario(payload: NuevoUsuarioPayload): Promise<UsuarioAutenticado> {
  const response = await fetch(`${API_BASE_URL}/registro`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
    }),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeDeError(response, 'No se pudo crear la cuenta.'));
  }

  const json = await response.json();
  return mapearUsuario(json.data);
}

export type ActualizarPerfilPayload = {
  name: string;
  email: string;
};

export async function actualizarPerfil(usuarioId: number, payload: ActualizarPerfilPayload): Promise<UsuarioAutenticado> {
  const response = await fetch(`${API_BASE_URL}/perfil/${usuarioId}`, {
    method: 'PUT',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeDeError(response, 'No se pudo actualizar el perfil.'));
  }

  const json = await response.json();
  return mapearUsuario(json.data);
}

export type ActualizarPasswordPayload = {
  passwordActual: string;
  password: string;
  passwordConfirmation: string;
};

export async function actualizarPassword(usuarioId: number, payload: ActualizarPasswordPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/perfil/${usuarioId}/password`, {
    method: 'PUT',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password_actual: payload.passwordActual,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
    }),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeDeError(response, 'No se pudo actualizar la contraseña.'));
  }
}

export async function actualizarPushToken(usuarioId: number, expoPushToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/perfil/${usuarioId}/push-token`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ expo_push_token: expoPushToken }),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeDeError(response, 'No se pudo guardar el token de notificaciones.'));
  }
}

export async function actualizarFotoPerfil(usuarioId: number, foto: FotoParaSubir): Promise<string | null> {
  if (Platform.OS === 'web') {
    const formData = new FormData();
    if (foto.file) formData.append('foto', foto.file, foto.name);

    const response = await fetch(`${API_BASE_URL}/perfil/${usuarioId}/foto`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await extraerMensajeDeError(response, 'No se pudo actualizar la foto de perfil.'));
    }

    const json = await response.json();
    return json.data.foto_perfil_url as string | null;
  }

  // Nativo (iOS/Android): mismo bug de FormData con archivos que en crearDenuncia,
  // se sube con el subsistema nativo de subida de expo-file-system.
  const archivo = new ArchivoNativo(foto.uri);
  const resultado = await archivo.upload(`${API_BASE_URL}/perfil/${usuarioId}/foto`, {
    uploadType: UploadType.MULTIPART,
    fieldName: 'foto',
    mimeType: foto.type,
    headers: { Accept: 'application/json' },
  });

  if (resultado.status >= 400) {
    throw new Error('No se pudo actualizar la foto de perfil.');
  }

  const json = JSON.parse(resultado.body);
  return json.data.foto_perfil_url as string | null;
}

/**
 * Solo confirma que exista una cuenta con ese email. El envío del PIN de
 * recuperación por correo todavía no está implementado (falta el paso 2).
 */
export async function verificarEmailRecuperacion(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/recuperar-password/verificar-email`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeDeError(response, 'No encontramos ninguna cuenta con ese correo.'));
  }
}

export type RestablecerPasswordPayload = {
  email: string;
  codigo: string;
  password: string;
  passwordConfirmation: string;
};

/**
 * Todavía no hay envío de correo (paso pendiente): por ahora el código se
 * genera en `verificarEmailRecuperacion` y hay que consultarlo directo en la
 * base de datos para probar este flujo.
 */
export async function restablecerPassword(payload: RestablecerPasswordPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/recuperar-password/restablecer`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: payload.email,
      codigo: payload.codigo,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
    }),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeDeError(response, 'No se pudo restablecer la contraseña.'));
  }
}

export async function fetchTiposDenuncia(): Promise<TipoDenunciaApi[]> {
  const response = await fetch(`${API_BASE_URL}/tipos-denuncia`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('No se pudieron cargar los tipos de denuncia.');
  }

  const json = await response.json();
  return json.data as TipoDenunciaApi[];
}

export type DenunciaApi = {
  id: number;
  descripcion: string;
  latitud: number;
  longitud: number;
  direccion: string | null;
  estado: DenunciaEstadoApi;
  prioridad: DenunciaPrioridad;
  usuario_id: number | null;
  created_at: string;
  tipo_denuncia: { id: number; nombre: string };
  fotos_urls: string[];
};

export async function fetchDenuncias(): Promise<DenunciaApi[]> {
  const response = await fetch(`${API_BASE_URL}/denuncias`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('No se pudieron cargar las denuncias.');
  }

  const json = await response.json();
  return json.data as DenunciaApi[];
}

export type NotificacionApi = {
  id: number;
  denunciaId: number;
  estado: DenunciaEstadoApi;
  leido: boolean;
  createdAt: string;
  tipoDenuncia: string | null;
  direccion: string | null;
};

function mapearNotificacion(data: {
  id: number;
  denuncia_id: number;
  estado: DenunciaEstadoApi;
  leido: boolean;
  created_at: string;
  tipo_denuncia: string | null;
  direccion: string | null;
}): NotificacionApi {
  return {
    id: data.id,
    denunciaId: data.denuncia_id,
    estado: data.estado,
    leido: data.leido,
    createdAt: data.created_at,
    tipoDenuncia: data.tipo_denuncia,
    direccion: data.direccion,
  };
}

export async function fetchNotificaciones(usuarioId: number): Promise<NotificacionApi[]> {
  const response = await fetch(`${API_BASE_URL}/notificaciones/${usuarioId}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('No se pudieron cargar las notificaciones.');
  }

  const json = await response.json();
  return (json.data as Parameters<typeof mapearNotificacion>[0][]).map(mapearNotificacion);
}

export async function marcarNotificacionLeida(notificacionId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notificaciones/${notificacionId}/leido`, {
    method: 'PATCH',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('No se pudo marcar la notificación como leída.');
  }
}

export type FotoParaSubir = {
  uri: string;
  name: string;
  type: string;
  /** Solo en web: expo-image-picker entrega un File real del navegador. */
  file?: File;
};

export type NuevaDenunciaPayload = {
  tipoDenunciaId: number;
  usuarioId?: number;
  descripcion: string;
  latitud: number;
  longitud: number;
  direccion?: string;
  prioridad: DenunciaPrioridad;
  fotos: FotoParaSubir[];
};

function construirFormDataDenuncia(payload: NuevaDenunciaPayload, incluirFotosWeb: boolean): FormData {
  const formData = new FormData();
  formData.append('tipo_denuncia_id', String(payload.tipoDenunciaId));
  formData.append('descripcion', payload.descripcion);
  formData.append('latitud', String(payload.latitud));
  formData.append('longitud', String(payload.longitud));
  formData.append('prioridad', payload.prioridad);

  if (payload.direccion) {
    formData.append('direccion', payload.direccion);
  }

  if (payload.usuarioId) {
    formData.append('usuario_id', String(payload.usuarioId));
  }

  if (incluirFotosWeb) {
    payload.fotos.forEach((foto) => {
      // Web: expo-image-picker entrega un File real del navegador, sin el bug de nativo.
      if (foto.file) formData.append('fotos[]', foto.file, foto.name);
    });
  }

  return formData;
}

export async function crearDenuncia(payload: NuevaDenunciaPayload): Promise<void> {
  if (Platform.OS === 'web') {
    const formData = construirFormDataDenuncia(payload, true);
    const response = await fetch(`${API_BASE_URL}/denuncias`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await extraerMensajeDeError(response, 'No se pudo enviar la denuncia.'));
    }
    return;
  }

  // Nativo (iOS/Android): con la New Architecture, el FormData de React Native ya
  // no acepta archivos ("Unsupported FormData part implementation"). Primero se
  // crea la denuncia sin fotos, y después cada foto se sube por separado con el
  // subsistema nativo de subida de expo-file-system (bypassea ese bug por completo).
  const formData = construirFormDataDenuncia(payload, false);
  const response = await fetch(`${API_BASE_URL}/denuncias`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeDeError(response, 'No se pudo enviar la denuncia.'));
  }

  const json = await response.json();
  const denunciaId = json.data.id as number;

  for (const foto of payload.fotos) {
    const archivo = new ArchivoNativo(foto.uri);
    const resultado = await archivo.upload(`${API_BASE_URL}/denuncias/${denunciaId}/fotos`, {
      uploadType: UploadType.MULTIPART,
      fieldName: 'foto',
      mimeType: foto.type,
      headers: { Accept: 'application/json' },
    });

    if (resultado.status >= 400) {
      throw new Error('La denuncia se guardó, pero una foto no se pudo subir. Intentá agregarla de nuevo más tarde.');
    }
  }
}
