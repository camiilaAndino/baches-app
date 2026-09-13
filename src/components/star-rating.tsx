import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
};

export function StarRating({ value, onChange }: StarRatingProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <Pressable
            key={star}
            disabled={!onChange}
            onPress={() => onChange?.(star)}
            hitSlop={4}
            style={({ pressed }) => pressed && styles.pressed}>
            <SymbolView
              name={{
                ios: filled ? 'star.fill' : 'star',
                android: filled ? 'star' : 'star_border',
                web: filled ? 'star' : 'star_border',
              }}
              size={20}
              tintColor={filled ? '#E8A93C' : theme.textSecondary}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.6,
  },
});
