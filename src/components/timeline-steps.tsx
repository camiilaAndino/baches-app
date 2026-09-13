import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DenunciaEstado, ESTADOS_ORDEN, ESTADO_META } from '@/constants/denuncias';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function TimelineSteps({ estado }: { estado: DenunciaEstado }) {
  const theme = useTheme();
  const currentIndex = ESTADOS_ORDEN.indexOf(estado);

  return (
    <View style={styles.row}>
      {ESTADOS_ORDEN.map((step, index) => {
        const meta = ESTADO_META[step];
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isActive = isDone || isCurrent;
        const color = isActive ? meta.color : theme.textSecondary;

        return (
          <View key={step} style={styles.step}>
            <View style={styles.markerRow}>
              {index > 0 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: isActive ? color : theme.backgroundSelected },
                  ]}
                />
              )}
              <View
                style={[
                  styles.marker,
                  {
                    borderColor: color,
                    backgroundColor: isActive ? color : 'transparent',
                  },
                ]}>
                {isDone && (
                  <SymbolView
                    name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }}
                    size={10}
                    tintColor={theme.background}
                  />
                )}
              </View>
              {index < ESTADOS_ORDEN.length - 1 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: index < currentIndex ? color : theme.backgroundSelected },
                  ]}
                />
              )}
            </View>
            <ThemedText
              type="small"
              style={styles.label}
              themeColor={isActive ? undefined : 'textSecondary'}>
              {meta.label}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  step: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  markerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  marker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    height: 2,
  },
  label: {
    textAlign: 'center',
    fontSize: 11,
  },
});
