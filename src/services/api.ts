import { DenunciaEstadoApi, DenunciaPrioridad } from '@/constants/denuncias';

/**
 * IP local de la PC donde corre el backend (baches-web). El celular y la PC
 * tienen que estar en la misma red WiFi. Si cambia la IP de la PC (podés
 * verla con `ipconfig`), actualizá este valor.
 *
 * En la PC, levantá el backend con:
 *   php artisan serve --host=0.0.0.0 --port=8000
 */
const API_BASE_URL = 'http://192.168.0.10:8000/api';

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
};

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
  return json.data as UsuarioAutenticado;
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
  return json.data as UsuarioAutenticado;
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

export async function crearDenuncia(payload: NuevaDenunciaPayload): Promise<void> {
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

  payload.fotos.forEach((foto) => {
    if (foto.file) {
      // Web: hay que mandar el File real del navegador, no un objeto {uri,name,type}.
      formData.append('fotos[]', foto.file, foto.name);
    } else {
      formData.append('fotos[]', {
        uri: foto.uri,
        name: foto.name,
        type: foto.type,
      } as unknown as Blob);
    }
  });

  const response = await fetch(`${API_BASE_URL}/denuncias`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeDeError(response, 'No se pudo enviar la denuncia.'));
  }
}
