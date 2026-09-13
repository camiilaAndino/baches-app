import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DenunciaEstado, ESTADO_META } from '@/constants/denuncias';
import { Spacing } from '@/constants/theme';

export function StatusBadge({ estado }: { estado: DenunciaEstado }) {
  const meta = ESTADO_META[estado];

  return (
    <View style={[styles.badge, { backgroundColor: `${meta.color}26` }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <ThemedText type="small" style={{ color: meta.color }}>
        {meta.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
