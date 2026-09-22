import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { AuthHeader } from '@/components/auth-header';
import { HeaderTitulo } from '@/components/header-titulo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function NotificacionesScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.screen}>
      <AuthHeader height={45}>
        <HeaderTitulo
          icono={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
          subtitulo="Alertas"
          titulo="Notificaciones"
          subirContenido={50}
        />
      </AuthHeader>

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
