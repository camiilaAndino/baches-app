import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DenunciaMap } from '@/components/denuncia-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ESTADO_API_META, PRIORIDAD_META, inferirVisualTipo } from '@/constants/denuncias';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DenunciaApi, fetchDenuncias } from '@/services/api';

export default function DenunciaDetalleScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [denuncia, setDenuncia] = useState<DenunciaApi | null>(null);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDenuncias()
      .then((denuncias) => {
        const encontrada = denuncias.find((d) => String(d.id) === id);
        setDenuncia(encontrada ?? null);
        if (!encontrada) setError('No se encontró la denuncia.');
      })
      .catch(() => setError('No se pudo cargar la denuncia. Revisá tu conexión.'))
      .finally(() => setCargando(false));
  }, [id]);

  function volver() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  const visualTipo = denuncia ? inferirVisualTipo(denuncia.tipo_denuncia.nombre) : null;
  const estadoMeta = denuncia ? ESTADO_API_META[denuncia.estado] : null;
  const prioridadMeta = denuncia ? PRIORIDAD_META[denuncia.prioridad] : null;
  const fecha = denuncia
    ? new Date(denuncia.created_at).toLocaleDateString('es-PY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <ThemedView style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable onPress={volver} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.backButton}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              size={16}
              tintColor={theme.text}
            />
          </ThemedView>
        </Pressable>
        <ThemedText type="smallBold">Detalle de denuncia</ThemedText>
        <View style={styles.backButton} />
      </View>

      {cargando ? (
        <ActivityIndicator color={theme.primary} style={styles.loader} />
      ) : error || !denuncia || !visualTipo || !estadoMeta || !prioridadMeta ? (
        <View style={styles.errorContainer}>
          <ThemedText type="small" themeColor="textSecondary">
            {error ?? 'No se encontró la denuncia.'}
          </ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.five }]}>
          {denuncia.fotos_urls.length > 0 ? (
            <View style={styles.fotos}>
              <Image source={{ uri: denuncia.fotos_urls[fotoActiva] }} style={styles.fotoPrincipal} contentFit="cover" />

              {denuncia.fotos_urls.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbsRow}>
                  {denuncia.fotos_urls.map((url, index) => (
                    <Pressable key={url} onPress={() => setFotoActiva(index)}>
                      <Image
                        source={{ uri: url }}
                        style={[
                          styles.thumb,
                          { borderColor: index === fotoActiva ? theme.primary : theme.border },
                        ]}
                        contentFit="cover"
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            <ThemedView type="backgroundElement" style={[styles.sinFotos, { borderColor: theme.border }]}>
              <SymbolView name={{ ios: 'photo', android: 'image', web: 'image' }} size={28} tintColor={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                Sin fotos
              </ThemedText>
            </ThemedView>
          )}

          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
            <View style={styles.tipoRow}>
              <View style={[styles.typeIcon, { backgroundColor: `${visualTipo.color}26` }]}>
                <SymbolView name={visualTipo.icon} size={20} tintColor={visualTipo.color} />
              </View>
              <ThemedText type="default" style={{ fontWeight: '700' }}>
                {visualTipo.label}
              </ThemedText>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.badgesRow}>
              <View style={[styles.badge, { backgroundColor: `${estadoMeta.color}26` }]}>
                <View style={[styles.badgeDot, { backgroundColor: estadoMeta.color }]} />
                <ThemedText type="small" style={{ color: estadoMeta.color }}>
                  {estadoMeta.label}
                </ThemedText>
              </View>

              <View style={[styles.badge, { backgroundColor: `${prioridadMeta.color}26` }]}>
                <ThemedText type="small" style={{ color: prioridadMeta.color }}>
                  Prioridad {prioridadMeta.label}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.infoRow}>
              <SymbolView
                name={{ ios: 'calendar', android: 'event', web: 'event' }}
                size={15}
                tintColor={theme.textSecondary}
              />
              <ThemedText type="small" themeColor="textSecondary">
                {fecha}
              </ThemedText>
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
              Descripción
            </ThemedText>
            <ThemedText type="default">{denuncia.descripcion}</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
              Ubicación
            </ThemedText>
            <View style={styles.infoRow}>
              <SymbolView
                name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
                size={15}
                tintColor={theme.textSecondary}
              />
              <ThemedText type="default">{denuncia.direccion ?? 'Sin dirección'}</ThemedText>
            </View>
            <DenunciaMap denuncia={denuncia} />
          </ThemedView>
        </ScrollView>
      )}
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
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  loader: {
    marginTop: Spacing.six,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.five,
  },
  fotos: {
    gap: Spacing.two,
  },
  fotoPrincipal: {
    width: '100%',
    height: 240,
    borderRadius: Spacing.three,
  },
  thumbsRow: {
    gap: Spacing.two,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Spacing.two,
    borderWidth: 2,
  },
  sinFotos: {
    height: 200,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  card: {
    borderRadius: Spacing.three,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  divider: {
    height: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  tipoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    textTransform: 'uppercase',
  },
});
