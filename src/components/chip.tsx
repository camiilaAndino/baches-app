import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SymbolName } from '@/constants/denuncias';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipProps = {
  label: string;
  icon?: SymbolName;
  color?: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, icon, color, selected, onPress }: ChipProps) {
  const theme = useTheme();
  const accent = color ?? theme.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? `${accent}26` : theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      {icon && (
        <SymbolView name={icon} size={13} tintColor={color ?? (selected ? accent : theme.textSecondary)} />
      )}
      <ThemedText type="small" style={{ color: selected ? accent : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.7,
  },
});
