import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Link, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AuthHeader } from '@/components/auth-header';
import { HeaderTitulo } from '@/components/header-titulo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAlertasCercania } from '@/contexts/alertas-cercania-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { actualizarFotoPerfil, urlDelServidor } from '@/services/api';

export default function PerfilScreen() {
  const theme = useTheme();
  const { usuario, cerrarSesion, biometriaActivada, activarBiometria, desactivarBiometria, actualizarUsuario } =
    useAuth();
  const { alertasActivadas, activarAlertas, desactivarAlertas } = useAlertasCercania();
  const [subiendoFoto, setSubiendoFoto] = useState(false);

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

  async function handleToggleAlertas(valor: boolean) {
    if (!valor) {
      await desactivarAlertas();
      return;
    }

    const resultado = await activarAlertas();
    if (resultado === 'sin-ubicacion') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu ubicación para avisarte de reportes cercanos.');
    } else if (resultado === 'sin-notificaciones') {
      Alert.alert('Permiso necesario', 'Necesitamos permiso para mostrarte notificaciones.');
    }
  }

  async function handleCambiarFoto() {
    if (!usuario) return;

    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería para cambiar la foto de perfil.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (resultado.canceled) return;

    const asset = resultado.assets[0];

    setSubiendoFoto(true);
    try {
      const fotoPerfilUrl = await actualizarFotoPerfil(usuario.id, {
        uri: asset.uri,
        name: asset.fileName ?? `foto-perfil-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
        file: asset.file,
      });
      await actualizarUsuario({ ...usuario, fotoPerfilUrl });
    } catch (err) {
      Alert.alert('No se pudo actualizar la foto', err instanceof Error ? err.message : 'Intentá de nuevo.');
    } finally {
      setSubiendoFoto(false);
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
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
          <Pressable onPress={handleCambiarFoto} disabled={subiendoFoto} style={styles.avatarWrapper}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              {usuario?.fotoPerfilUrl ? (
                <Image source={{ uri: urlDelServidor(usuario.fotoPerfilUrl) }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
                  {usuario?.name?.slice(0, 2).toUpperCase() ?? '??'}
                </ThemedText>
              )}
              {subiendoFoto && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#ffffff" size="small" />
                </View>
              )}
            </View>

            <View style={[styles.pincelButton, { backgroundColor: theme.primary, borderColor: theme.backgroundElement }]}>
              <SymbolView
                name={{ ios: 'paintbrush.fill', android: 'brush', web: 'brush' }}
                size={12}
                tintColor={theme.onPrimary}
              />
            </View>
          </Pressable>
          <ThemedText type="default" style={{ fontWeight: '700' }}>
            {usuario?.name ?? 'Sin nombre'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {usuario?.email}
          </ThemedText>
        </ThemedView>

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

        {Platform.OS !== 'web' && (
          <ThemedView type="backgroundElement" style={styles.logoutRow}>
            <SymbolView
              name={{ ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }}
              size={16}
              tintColor={theme.text}
            />
            <ThemedText type="small" style={styles.switchLabel}>
              Avisarme de reportes cercanos (300 m)
            </ThemedText>
            <Switch
              value={alertasActivadas}
              onValueChange={handleToggleAlertas}
              trackColor={{ true: theme.primary }}
            />
          </ThemedView>
        )}

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
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  avatarWrapper: {
    marginBottom: Spacing.two,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pincelButton: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
