import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ProfileHeader() {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
        <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
          JP
        </ThemedText>
      </View>

      <View style={styles.texts}>
        <ThemedText type="small" themeColor="textSecondary">
          Hola 👋
        </ThemedText>
        <ThemedText type="smallBold">Juan Pérez</ThemedText>
      </View>

      <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
        <ThemedView type="backgroundElement" style={styles.iconCircle}>
          <SymbolView
            name={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
            size={16}
            tintColor={theme.text}
          />
          <View style={styles.badgeDot} />
        </ThemedView>
      </Pressable>

      <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
        <ThemedView type="backgroundElement" style={styles.iconCircle}>
          <SymbolView
            name={{ ios: 'person.crop.circle', android: 'person', web: 'person' }}
            size={16}
            tintColor={theme.text}
          />
        </ThemedView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  iconButton: {
    marginLeft: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E14C4C',
  },
});
