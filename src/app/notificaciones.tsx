import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AuthHeader } from '@/components/auth-header';
import { HeaderTitulo } from '@/components/header-titulo';
import { NotificacionCard } from '@/components/notificacion-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { fetchNotificaciones, marcarNotificacionLeida, NotificacionApi } from '@/services/api';

const NOTIFICACIONES_POR_PAGINA = 5;

export default function NotificacionesScreen() {
  const theme = useTheme();
  const { usuario } = useAuth();

  const [notificaciones, setNotificaciones] = useState<NotificacionApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);

  const cargarNotificaciones = useCallback(async () => {
    if (!usuario) return;
    try {
      const data = await fetchNotificaciones(usuario.id);
      setNotificaciones(data);
      setError(null);
    } catch {
      setError('No se pudieron cargar las notificaciones. Revisá tu conexión.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      cargarNotificaciones();
    }, [cargarNotificaciones])
  );

  function handleRefresh() {
    setRefrescando(true);
    cargarNotificaciones();
  }

  async function handlePressNotificacion(notificacion: NotificacionApi) {
    router.push({ pathname: '/denuncia/[id]', params: { id: String(notificacion.denunciaId) } });

    if (notificacion.leido) return;

    setNotificaciones((actuales) =>
      actuales.map((item) => (item.id === notificacion.id ? { ...item, leido: true } : item))
    );
    try {
      await marcarNotificacionLeida(notificacion.id);
    } catch {
      // si falla, no revertimos: se va a volver a marcar la próxima vez que se toque o recargue
    }
  }

  useEffect(() => {
    setPagina(0);
  }, [notificaciones.length]);

  const totalPaginas = Math.max(1, Math.ceil(notificaciones.length / NOTIFICACIONES_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas - 1);
  const notificacionesPagina = notificaciones.slice(
    paginaActual * NOTIFICACIONES_POR_PAGINA,
    paginaActual * NOTIFICACIONES_POR_PAGINA + NOTIFICACIONES_POR_PAGINA
  );

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

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={handleRefresh} />}>
        {error && (
          <Pressable onPress={() => cargarNotificaciones()} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView type="backgroundElement" style={[styles.errorBox, { borderColor: theme.border }]}>
              <ThemedText type="small" style={{ color: '#EB5757' }}>
                {error} Tocá para reintentar.
              </ThemedText>
            </ThemedView>
          </Pressable>
        )}

        {cargando ? (
          <ActivityIndicator color={theme.primary} style={styles.loader} />
        ) : notificaciones.length === 0 ? (
          <ThemedView type="backgroundElement" style={[styles.emptyState, { borderColor: theme.border }]}>
            <SymbolView name={{ ios: 'tray', android: 'inbox', web: 'inbox' }} size={28} tintColor={theme.textSecondary} />
            <ThemedText type="smallBold">No tenés notificaciones</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyStateText}>
              Cuando haya novedades sobre tus denuncias, las vas a ver acá.
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            <View style={styles.lista}>
              {notificacionesPagina.map((notificacion) => (
                <NotificacionCard
                  key={notificacion.id}
                  notificacion={notificacion}
                  onPress={() => handlePressNotificacion(notificacion)}
                />
              ))}
            </View>

            {totalPaginas > 1 && (
              <View style={styles.pager}>
                <Pressable
                  disabled={paginaActual === 0}
                  onPress={() => setPagina(paginaActual - 1)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.pagerButton,
                    { borderColor: theme.border },
                    paginaActual === 0 && styles.pagerButtonDisabled,
                    pressed && styles.pressed,
                  ]}>
                  <SymbolView
                    name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                    size={16}
                    tintColor={paginaActual === 0 ? theme.border : theme.text}
                  />
                </Pressable>

                <ThemedText type="small" themeColor="textSecondary">
                  {paginaActual + 1} de {totalPaginas}
                </ThemedText>

                <Pressable
                  disabled={paginaActual === totalPaginas - 1}
                  onPress={() => setPagina(paginaActual + 1)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.pagerButton,
                    { borderColor: theme.border },
                    paginaActual === totalPaginas - 1 && styles.pagerButtonDisabled,
                    pressed && styles.pressed,
                  ]}>
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                    size={16}
                    tintColor={paginaActual === totalPaginas - 1 ? theme.border : theme.text}
                  />
                </Pressable>
              </View>
            )}
          </>
        )}
      </ScrollView>
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
    flexGrow: 1,
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  loader: {
    marginTop: Spacing.six,
  },
  lista: {
    gap: Spacing.two,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  pagerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagerButtonDisabled: {
    opacity: 0.4,
  },
  errorBox: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
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
