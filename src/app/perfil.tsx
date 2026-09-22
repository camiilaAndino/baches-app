import { Link, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AuthHeader } from '@/components/auth-header';
import { HeaderTitulo } from '@/components/header-titulo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function PerfilScreen() {
  const theme = useTheme();
  const { usuario, cerrarSesion, biometriaActivada, activarBiometria, desactivarBiometria } = useAuth();

  async function handleCerrarSesion() {
    await cerrarSesion();
    router.replace('/login');
  }

  async function handleToggleBiometria(valor: boolean) {
    if (!valor) {
      await desactivarBiometria();
      return;
    }

    const activada = await activarBiometria();
    if (!activada) {
      Alert.alert(
        'No se pudo activar',
        'Tu dispositivo no tiene huella/Face ID configurado, o no pudimos verificar tu identidad.'
      );
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <AuthHeader height={45}>
        <HeaderTitulo
          icono={{ ios: 'person.fill', android: 'person', web: 'person' }}
          subtitulo="Cuenta"
          titulo="Mi perfil"
          subirContenido={50}
        />
      </AuthHeader>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
              {usuario?.name?.slice(0, 2).toUpperCase() ?? '??'}
            </ThemedText>
          </View>
          <ThemedText type="default" style={{ fontWeight: '700' }}>
            {usuario?.name ?? 'Sin nombre'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {usuario?.email}
          </ThemedText>
        </View>

        <Link href="/editar-perfil" asChild>
          <Pressable style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView type="backgroundElement" style={styles.logoutRow}>
              <SymbolView
                name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                size={16}
                tintColor={theme.text}
              />
              <ThemedText type="small">Editar perfil</ThemedText>
            </ThemedView>
          </Pressable>
        </Link>

        <ThemedView type="backgroundElement" style={styles.logoutRow}>
          <SymbolView
            name={{ ios: 'faceid', android: 'fingerprint', web: 'fingerprint' }}
            size={16}
            tintColor={theme.text}
          />
          <ThemedText type="small" style={styles.switchLabel}>
            Desbloqueo biométrico
          </ThemedText>
          <Switch
            value={biometriaActivada}
            onValueChange={handleToggleBiometria}
            trackColor={{ true: theme.primary }}
          />
        </ThemedView>

        <Pressable onPress={handleCerrarSesion} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.logoutRow}>
            <SymbolView
              name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
              size={16}
              tintColor="#EB5757"
            />
            <ThemedText type="small" style={{ color: '#EB5757' }}>
              Cerrar sesión
            </ThemedText>
          </ThemedView>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  card: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.five,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  switchLabel: {
    flex: 1,
  },
});
