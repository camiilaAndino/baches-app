import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { DenunciaCard } from '@/components/denuncia-card';
import { MapCard } from '@/components/map-card';
import { ProfileHeader } from '@/components/profile-header';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { DenunciaEstado, ESTADOS_ORDEN, ESTADO_META } from '@/constants/denuncias';
import { BottomTabInset, Spacing, MaxContentWidth } from '@/constants/theme';
import { MOCK_DENUNCIAS } from '@/data/mock-denuncias';
import { useTheme } from '@/hooks/use-theme';

const NOTIFICACIONES = [
  { id: 'n1', texto: 'Tu denuncia #1042 pasó a "En proceso"', tiempo: 'hace 1 h', leida: false },
  { id: 'n2', texto: 'Nuevo comentario en la denuncia #1018', tiempo: 'ayer', leida: true },
];

export default function HomeScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const [anonima, setAnonima] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<DenunciaEstado | 'todas'>('todas');

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.five,
      paddingBottom: Spacing.four,
    },
  });

  const denunciasFiltradas = MOCK_DENUNCIAS.filter(
    (denuncia) => filtroEstado === 'todas' || denuncia.estado === filtroEstado
  );

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <View style={styles.section}>
          <ProfileHeader />
        </View>

        <View style={styles.section}>
          <SearchBar />
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

          <ThemedView type="backgroundElement" style={styles.quickCard}>
            <Link href="/crear-denuncia" asChild>
              <Pressable style={({ pressed }) => [styles.quickRow, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'camera', android: 'photo_camera', web: 'photo_camera' }}
                  size={16}
                  tintColor={theme.text}
                />
                <ThemedText type="small" style={styles.quickRowLabel}>
                  Adjuntar evidencia (foto o video)
                </ThemedText>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                  size={13}
                  tintColor={theme.textSecondary}
                />
              </Pressable>
            </Link>

            <View style={styles.quickDivider} />

            <View style={styles.quickRow}>
              <SymbolView
                name={{ ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }}
                size={16}
                tintColor={theme.text}
              />
              <ThemedText type="small" style={styles.quickRowLabel}>
                Denunciar de forma anónima
              </ThemedText>
              <Switch value={anonima} onValueChange={setAnonima} />
            </View>
          </ThemedView>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Notificaciones
          </ThemedText>
          <View style={styles.notifications}>
            {NOTIFICACIONES.map((notificacion) => (
              <View key={notificacion.id} style={styles.notificationRow}>
                <View
                  style={[
                    styles.notificationDot,
                    { backgroundColor: notificacion.leida ? theme.backgroundSelected : theme.primary },
                  ]}
                />
                <ThemedText type="small" style={styles.notificationText}>
                  {notificacion.texto}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {notificacion.tiempo}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <MapCard />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Mis denuncias
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {denunciasFiltradas.length} de {MOCK_DENUNCIAS.length}
            </ThemedText>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}>
            <Chip
              label="Todas"
              selected={filtroEstado === 'todas'}
              onPress={() => setFiltroEstado('todas')}
            />
            {ESTADOS_ORDEN.map((estado) => (
              <Chip
                key={estado}
                label={ESTADO_META[estado].label}
                icon={ESTADO_META[estado].icon}
                color={ESTADO_META[estado].color}
                selected={filtroEstado === estado}
                onPress={() => setFiltroEstado(estado)}
              />
            ))}
          </ScrollView>

          <View style={styles.denunciasList}>
            {denunciasFiltradas.map((denuncia) => (
              <DenunciaCard key={denuncia.id} denuncia={denuncia} />
            ))}
          </View>
        </View>

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
  quickCard: {
    marginTop: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  quickRowLabel: {
    flex: 1,
  },
  quickDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#80808040',
  },
  notifications: {
    gap: Spacing.two,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  notificationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  notificationText: {
    flex: 1,
  },
  filterChips: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  denunciasList: {
    gap: Spacing.two,
  },
});
