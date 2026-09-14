import type { AndroidSymbol, SFSymbol } from 'expo-symbols';

export type DenunciaEstado = 'pendiente' | 'revision' | 'proceso' | 'resuelta';

export type DenunciaTipo = 'bache' | 'alumbrado' | 'basura' | 'seguridad' | 'agua';

export type SymbolName = { ios: SFSymbol; android: AndroidSymbol; web: AndroidSymbol };

export const ESTADOS_ORDEN: DenunciaEstado[] = ['pendiente', 'revision', 'proceso', 'resuelta'];

export const ESTADO_META: Record<DenunciaEstado, { label: string; color: string; icon: SymbolName }> = {
  pendiente: {
    label: 'Pendiente',
    color: '#E8A93C',
    icon: { ios: 'clock', android: 'schedule', web: 'schedule' },
  },
  revision: {
    label: 'En revisión',
    color: '#3C87F7',
    icon: { ios: 'eye', android: 'visibility', web: 'visibility' },
  },
  proceso: {
    label: 'En proceso',
    color: '#8B5CF6',
    icon: { ios: 'wrench.and.screwdriver', android: 'engineering', web: 'engineering' },
  },
  resuelta: {
    label: 'Resuelta',
    color: '#2FAF64',
    icon: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  },
};

export const TIPO_META: Record<DenunciaTipo, { label: string; color: string; icon: SymbolName }> = {
  bache: {
    label: 'Bache',
    color: '#F2994A',
    icon: { ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' },
  },
  alumbrado: {
    label: 'Alumbrado',
    color: '#F2C94C',
    icon: { ios: 'lightbulb', android: 'lightbulb', web: 'lightbulb' },
  },
  basura: {
    label: 'Basura',
    color: '#00B8A9',
    icon: { ios: 'trash', android: 'delete', web: 'delete' },
  },
  seguridad: {
    label: 'Seguridad',
    color: '#EB5757',
    icon: { ios: 'shield', android: 'shield', web: 'shield' },
  },
  agua: {
    label: 'Agua/Cloacas',
    color: '#56CCF2',
    icon: { ios: 'drop', android: 'water_drop', web: 'water_drop' },
  },
};

/** Estados reales que devuelve la API (distinto del enum de datos mock de abajo). */
export type DenunciaEstadoApi = 'pendiente' | 'en_proceso' | 'resuelta';

export const ESTADOS_API_ORDEN: DenunciaEstadoApi[] = ['pendiente', 'en_proceso', 'resuelta'];

export const ESTADO_API_META: Record<DenunciaEstadoApi, { label: string; color: string; icon: SymbolName }> = {
  pendiente: {
    label: 'Pendiente',
    color: '#E8A93C',
    icon: { ios: 'clock', android: 'schedule', web: 'schedule' },
  },
  en_proceso: {
    label: 'En proceso',
    color: '#3C87F7',
    icon: { ios: 'wrench.and.screwdriver', android: 'engineering', web: 'engineering' },
  },
  resuelta: {
    label: 'Resuelta',
    color: '#2FAF64',
    icon: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  },
};

export type DenunciaPrioridad = 'leve' | 'moderado' | 'grave';

export const PRIORIDADES_ORDEN: DenunciaPrioridad[] = ['leve', 'moderado', 'grave'];

export const PRIORIDAD_META: Record<DenunciaPrioridad, { label: string; color: string }> = {
  leve: { label: 'Leve', color: '#8B93A1' },
  moderado: { label: 'Moderado', color: '#F2994A' },
  grave: { label: 'Grave', color: '#EB5757' },
};

const TIPO_VISUAL_POR_DEFECTO: { label: string; color: string; icon: SymbolName } = {
  label: '',
  color: '#8B93A1',
  icon: { ios: 'questionmark.circle', android: 'help', web: 'help' },
};

/**
 * El backend permite crear tipos de denuncia libremente (solo nombre + descripción,
 * sin ícono/color propios). Para no perder la identidad visual ya definida en
 * TIPO_META, intentamos matchear por palabra clave; si no hay match, usamos un
 * ícono/color genérico.
 */
export function inferirVisualTipo(nombre: string): { label: string; color: string; icon: SymbolName } {
  const nombreNormalizado = nombre.toLowerCase();
  const claveConocida = (Object.keys(TIPO_META) as DenunciaTipo[]).find((clave) =>
    nombreNormalizado.includes(clave)
  );

  if (claveConocida) {
    return { ...TIPO_META[claveConocida], label: nombre };
  }

  return { ...TIPO_VISUAL_POR_DEFECTO, label: nombre };
}

export type Comentario = {
  id: string;
  autor: string;
  mensaje: string;
  fecha: string;
  esOficial?: boolean;
};

export type Denuncia = {
  id: string;
  titulo: string;
  tipo: DenunciaTipo;
  estado: DenunciaEstado;
  fecha: string;
  direccion: string;
  descripcion: string;
  anonima?: boolean;
  fotos: number;
  comentarios: Comentario[];
  calificacion?: number;
};
