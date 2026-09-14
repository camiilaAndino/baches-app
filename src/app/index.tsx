import { Link, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AllDenunciasMap } from '@/components/all-denuncias-map';
import { Chip } from '@/components/chip';
import { MiDenunciaCard } from '@/components/mi-denuncia-card';
import { ProfileHeader } from '@/components/profile-header';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { DenunciaEstadoApi, ESTADOS_API_ORDEN, ESTADO_API_META } from '@/constants/denuncias';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { DenunciaApi, fetchDenuncias } from '@/services/api';

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();

  const [denuncias, setDenuncias] = useState<DenunciaApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<DenunciaEstadoApi | 'todas'>('todas');

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

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={handleRefresh} />}>
      <ThemedView style={styles.container}>
        <View style={styles.section}>
          <ProfileHeader />
        </View>

        <View style={styles.section}>
          <Link href="/crear-denuncia" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <View style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
                <SymbolView
                  name={{ ios: 'plus.circle.fill', android: 'add', web: 'add' }}
                  size={18}
                  tintColor={theme.onPrimary}
                />
                <ThemedText type="default" style={{ color: theme.onPrimary, fontWeight: '600' }}>
                  Hacer una denuncia
                </ThemedText>
              </View>
            </Pressable>
          </Link>
        </View>

        {error && (
          <View style={styles.section}>
            <Pressable onPress={() => cargarDenuncias()} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.errorBox}>
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
                  <ThemedView type="backgroundElement" style={styles.emptyState}>
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
                  misDenuncias.map((denuncia) => <MiDenunciaCard key={denuncia.id} denuncia={denuncia} />)
                )}
              </View>
            </View>
          </>
        )}

        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.five,
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
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  errorBox: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
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
  emptyState: {
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.five,
  },
  emptyStateText: {
    textAlign: 'center',
  },
});
