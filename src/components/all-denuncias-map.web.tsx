import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ESTADO_API_META } from '@/constants/denuncias';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DenunciaApi } from '@/services/api';

type Props = {
  denuncias: DenunciaApi[];
};

/**
 * `react-native-webview` (usado para el mapa Leaflet en la app instalada) no
 * tiene implementación para web. En el navegador mostramos un resumen en vez
 * del mapa interactivo.
 */
export function AllDenunciasMap({ denuncias }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedView type="backgroundSelected" style={styles.placeholder}>
        <SymbolView
          name={{ ios: 'map', android: 'map', web: 'map' }}
          size={26}
          tintColor={theme.textSecondary}
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.placeholderText}>
          El mapa interactivo está disponible en la app instalada.{'\n'}
          {denuncias.length} denuncia{denuncias.length === 1 ? '' : 's'} registrada{denuncias.length === 1 ? '' : 's'} en total.
        </ThemedText>
      </ThemedView>

      <View style={styles.legendRow}>
        {(Object.keys(ESTADO_API_META) as (keyof typeof ESTADO_API_META)[]).map((estado) => (
          <View key={estado} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ESTADO_API_META[estado].color }]} />
            <ThemedText type="small" themeColor="textSecondary">
              {ESTADO_API_META[estado].label} ({denuncias.filter((d) => d.estado === estado).length})
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  placeholder: {
    height: 160,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  placeholderText: {
    textAlign: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
