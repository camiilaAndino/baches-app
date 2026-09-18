import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function RecuperarPasswordScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  function volverAlLogin() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable
          onPress={volverAlLogin}
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.backButtonInner}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              size={16}
              tintColor={theme.text}
            />
          </ThemedView>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconWrapper, { backgroundColor: `${theme.primary}26` }]}>
          <SymbolView
            name={{ ios: 'wrench.and.screwdriver', android: 'build', web: 'build' }}
            size={28}
            tintColor={theme.primary}
          />
        </View>
        <ThemedText type="default" style={styles.title}>
          Muy pronto
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          Todavía estamos armando la recuperación de contraseña. Por ahora, contactá al municipio si no
          podés ingresar a tu cuenta.
        </ThemedText>

        <Pressable onPress={volverAlLogin} style={({ pressed }) => pressed && styles.pressed}>
          <View style={[styles.button, { backgroundColor: theme.primary }]}>
            <ThemedText type="default" style={{ color: theme.onPrimary, fontWeight: '600' }}>
              Volver al inicio de sesión
            </ThemedText>
          </View>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  backButtonInner: {
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
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.three,
  },
});
