import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AllDenunciasMap } from '@/components/all-denuncias-map';
import { AuthHeader } from '@/components/auth-header';
import { BottomNav } from '@/components/bottom-nav';
import { Chip } from '@/components/chip';
import { MiDenunciaCard } from '@/components/mi-denuncia-card';
import { ProfileIcons } from '@/components/profile-header';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DenunciaEstadoApi, ESTADOS_API_ORDEN, ESTADO_API_META } from '@/constants/denuncias';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { DenunciaApi, fetchDenuncias } from '@/services/api';

const DENUNCIAS_POR_PAGINA = 4;

export default function HomeScreen() {
  const theme = useTheme();
  const { usuario } = useAuth();

  const [denuncias, setDenuncias] = useState<DenunciaApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<DenunciaEstadoApi | 'todas'>('todas');
  const [pagina, setPagina] = useState(0);

  const cargarDenuncias = useCallback(async () => {
    try {
      const data = await fetchDenuncias();
      setDenuncias(data);
      setError(null);
    } catch {
      setError('No se pudieron cargar las denuncias. Revisá tu conexión.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  // Recarga las denuncias cada vez que se vuelve a esta pantalla (por ej. al
  // volver de crear una denuncia nueva), no solo la primera vez que se monta.
  useFocusEffect(
    useCallback(() => {
      cargarDenuncias();
    }, [cargarDenuncias])
  );

  function handleRefresh() {
    setRefrescando(true);
    cargarDenuncias();
  }

  const misDenuncias = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLowerCase();

    return denuncias
      .filter((denuncia) => denuncia.usuario_id === usuario?.id)
      .filter((denuncia) => filtroEstado === 'todas' || denuncia.estado === filtroEstado)
      .filter((denuncia) => {
        if (!busquedaNormalizada) return true;
        return (
          denuncia.descripcion.toLowerCase().includes(busquedaNormalizada) ||
          denuncia.tipo_denuncia.nombre.toLowerCase().includes(busquedaNormalizada) ||
          (denuncia.direccion ?? '').toLowerCase().includes(busquedaNormalizada)
        );
      });
  }, [denuncias, usuario?.id, filtroEstado, busqueda]);

  useEffect(() => {
    setPagina(0);
  }, [filtroEstado, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(misDenuncias.length / DENUNCIAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas - 1);
  const denunciasPagina = misDenuncias.slice(
    paginaActual * DENUNCIAS_POR_PAGINA,
    paginaActual * DENUNCIAS_POR_PAGINA + DENUNCIAS_POR_PAGINA
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <AuthHeader height={90}>
        <ProfileIcons />
      </AuthHeader>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingTop: Spacing.four }]}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={handleRefresh} />}>
        <ThemedView style={styles.container}>
          {error && (
            <View style={styles.section}>
              <Pressable onPress={() => cargarDenuncias()} style={({ pressed }) => pressed && styles.pressed}>
                <ThemedView type="backgroundElement" style={[styles.errorBox, { borderColor: theme.border }]}>
                  <ThemedText type="small" style={{ color: '#EB5757' }}>
                    {error} Tocá para reintentar.
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </View>
          )}

          {cargando ? (
            <ActivityIndicator color={theme.primary} style={styles.loader} />
          ) : (
            <>
              <View style={styles.section}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Mapa de denuncias
                </ThemedText>
                <AllDenunciasMap denuncias={denuncias} />
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    Mis denuncias
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {misDenuncias.length}
                  </ThemedText>
                </View>

                <SearchBar
                  value={busqueda}
                  onChangeText={setBusqueda}
                  placeholder="Buscar en mis denuncias"
                />

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterChips}>
                  <Chip
                    label="Todas"
                    selected={filtroEstado === 'todas'}
                    onPress={() => setFiltroEstado('todas')}
                  />
                  {ESTADOS_API_ORDEN.map((estado) => (
                    <Chip
                      key={estado}
                      label={ESTADO_API_META[estado].label}
                      icon={ESTADO_API_META[estado].icon}
                      color={ESTADO_API_META[estado].color}
                      selected={filtroEstado === estado}
                      onPress={() => setFiltroEstado(estado)}
                    />
                  ))}
                </ScrollView>

                <View style={styles.denunciasList}>
                  {misDenuncias.length === 0 ? (
                    <ThemedView type="backgroundElement" style={[styles.emptyState, { borderColor: theme.border }]}>
                      <SymbolView
                        name={{ ios: 'tray', android: 'inbox', web: 'inbox' }}
                        size={22}
                        tintColor={theme.textSecondary}
                      />
                      <ThemedText type="small" themeColor="textSecondary" style={styles.emptyStateText}>
                        Todavía no hiciste ninguna denuncia. ¡Reportá el primer bache!
                      </ThemedText>
                    </ThemedView>
                  ) : (
                    denunciasPagina.map((denuncia) => <MiDenunciaCard key={denuncia.id} denuncia={denuncia} />)
                  )}
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
              </View>
            </>
          )}

          <ThemedText type="code" themeColor="textSecondary" style={styles.appVersion}>
            v{Constants.expoConfig?.version}
          </ThemedText>
        </ThemedView>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.six + Spacing.five,
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    textTransform: 'uppercase',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.8,
  },
  errorBox: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
  },
  loader: {
    marginTop: Spacing.six,
  },
  filterChips: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  denunciasList: {
    gap: Spacing.two,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    marginTop: Spacing.two,
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
  emptyState: {
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.five,
    borderWidth: 1,
  },
  emptyStateText: {
    textAlign: 'center',
  },
  appVersion: {
    textAlign: 'center',
    marginTop: Spacing.two,
    fontSize: 11,
    letterSpacing: 1,
    opacity: 0.6,
  },
});
