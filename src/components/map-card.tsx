import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DenunciaTipo, ESTADOS_ORDEN, ESTADO_META, TIPO_META } from '@/constants/denuncias';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TIPOS: DenunciaTipo[] = ['bache', 'alumbrado', 'basura', 'seguridad', 'agua'];

export function MapCard() {
  const theme = useTheme();
  const [tipoSeleccionado, setTipoSeleccionado] = useState<DenunciaTipo | null>(null);

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="smallBold">Mapa de denuncias</ThemedText>
        <View style={styles.dateChip}>
          <SymbolView
            name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }}
            size={12}
            tintColor={theme.textSecondary}
          />
          <ThemedText type="small" themeColor="textSecondary">
            Últimos 30 días
          </ThemedText>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        <Chip
          label="Todos los tipos"
          icon={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
          selected={tipoSeleccionado === null}
          onPress={() => setTipoSeleccionado(null)}
        />
        {TIPOS.map((tipo) => (
          <Chip
            key={tipo}
            label={TIPO_META[tipo].label}
            icon={TIPO_META[tipo].icon}
            color={TIPO_META[tipo].color}
            selected={tipoSeleccionado === tipo}
            onPress={() => setTipoSeleccionado(tipo)}
          />
        ))}
      </ScrollView>

      <ThemedView type="backgroundSelected" style={styles.mapPlaceholder}>
        <SymbolView
          name={{ ios: 'map', android: 'map', web: 'map' }}
          size={28}
          tintColor={theme.textSecondary}
        />
        <ThemedText type="small" themeColor="textSecondary">
          Vista de mapa
        </ThemedText>
      </ThemedView>

      <View style={styles.legendRow}>
        {ESTADOS_ORDEN.map((estado) => {
          const meta = ESTADO_META[estado];
          return (
            <View key={estado} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: meta.color }]} />
              <ThemedText type="small" themeColor="textSecondary">
                {meta.label}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  chipsRow: {
    gap: Spacing.two,
  },
  mapPlaceholder: {
    height: 140,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
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
