import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SymbolName, metaEstado } from '@/constants/denuncias';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DenunciaApi } from '@/services/api';

type Props = {
  denuncia: DenunciaApi;
};

function formatearFecha(valor: string, conHora = false): string {
  // "YYYY-MM-DD" sin hora se interpreta como UTC y en Paraguay mostraría el día anterior.
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T00:00:00`) : new Date(valor);
  return fecha.toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(conHora ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

/** Qué pasó con la denuncia: en revisión, técnico asignado, trabajo realizado o motivo de rechazo. */
export function SeguimientoDenuncia({ denuncia }: Props) {
  const theme = useTheme();
  const { mantenimiento } = denuncia;

  let icono: SymbolName;
  let titulo: string;
  let detalle: string | null = null;
  let texto: string | null = null;
  let color = metaEstado(denuncia.estado).color;

  if (denuncia.estado === 'rechazada') {
    icono = { ios: 'nosign', android: 'block', web: 'block' };
    titulo = 'Tu denuncia fue rechazada';
    detalle = denuncia.rechazada_at ? formatearFecha(denuncia.rechazada_at, true) : null;
    texto = denuncia.motivo_rechazo ? `Motivo: ${denuncia.motivo_rechazo}` : null;
  } else if (denuncia.estado === 'resuelta') {
    icono = { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' };
    titulo = 'Problema resuelto';
    detalle = mantenimiento
      ? `Por ${mantenimiento.tecnico}${mantenimiento.fecha_fin ? ` · ${formatearFecha(mantenimiento.fecha_fin, true)}` : ''}`
      : null;
    texto = mantenimiento?.trabajo_realizado ? `Trabajo realizado: ${mantenimiento.trabajo_realizado}` : null;
  } else if (mantenimiento) {
    icono = { ios: 'wrench.and.screwdriver.fill', android: 'engineering', web: 'engineering' };
    titulo = mantenimiento.estado === 'en_curso' ? 'Trabajo en curso' : 'Técnico asignado';
    detalle = `${mantenimiento.tecnico} · Programado para el ${formatearFecha(mantenimiento.fecha_programada)}`;
  } else {
    icono = { ios: 'hourglass', android: 'hourglass_top', web: 'hourglass_top' };
    titulo = 'En revisión';
    texto = 'El municipio todavía no asignó un técnico a tu denuncia.';
    color = theme.textSecondary;
  }

  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border, borderLeftColor: color }]}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        Seguimiento
      </ThemedText>

      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: `${color}26` }]}>
          <SymbolView name={icono} size={18} tintColor={color} />
        </View>
        <View style={styles.textos}>
          <ThemedText type="default" style={{ fontWeight: '700' }}>
            {titulo}
          </ThemedText>
          {detalle && (
            <ThemedText type="small" themeColor="textSecondary">
              {detalle}
            </ThemedText>
          )}
        </View>
      </View>

      {texto && <ThemedText type="default">{texto}</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionTitle: {
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: {
    flex: 1,
  },
});
