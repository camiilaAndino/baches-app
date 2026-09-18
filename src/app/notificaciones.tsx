import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function NotificacionesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  function volverAlInicio() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable onPress={volverAlInicio} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.closeButton}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={14}
              tintColor={theme.text}
            />
          </ThemedView>
        </Pressable>
        <ThemedText type="smallBold">Notificaciones</ThemedText>
        <View style={styles.closeButton} />
      </View>

      <View style={styles.content}>
        <ThemedView type="backgroundElement" style={[styles.emptyState, { borderColor: theme.border }]}>
          <SymbolView name={{ ios: 'tray', android: 'inbox', web: 'inbox' }} size={28} tintColor={theme.textSecondary} />
          <ThemedText type="smallBold">No tenés notificaciones</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.emptyStateText}>
            Cuando haya novedades sobre tus denuncias, las vas a ver acá.
          </ThemedText>
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: 1,
    padding: Spacing.five,
  },
  emptyStateText: {
    textAlign: 'center',
  },
});
