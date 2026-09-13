import { DenunciaPrioridad } from '@/constants/denuncias';

/**
 * IP local de la PC donde corre el backend (baches-web). El celular y la PC
 * tienen que estar en la misma red WiFi. Si cambia la IP de la PC (podés
 * verla con `ipconfig`), actualizá este valor.
 *
 * En la PC, levantá el backend con:
 *   php artisan serve --host=0.0.0.0 --port=8000
 */
const API_BASE_URL = 'http://192.168.0.10:8000/api';

export type TipoDenunciaApi = {
  id: number;
  nombre: string;
  descripcion: string | null;
};

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

export type FotoParaSubir = {
  uri: string;
  name: string;
  type: string;
  /** Solo en web: expo-image-picker entrega un File real del navegador. */
  file?: File;
};

export type NuevaDenunciaPayload = {
  tipoDenunciaId: number;
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
    const json = await response.json().catch(() => null);
    const primerError = json?.errors ? Object.values(json.errors)[0] : null;
    const mensaje = Array.isArray(primerError) ? primerError[0] : json?.message;
    throw new Error(mensaje ?? 'No se pudo enviar la denuncia.');
  }
}
