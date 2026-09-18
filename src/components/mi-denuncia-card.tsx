import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ESTADO_API_META, inferirVisualTipo } from '@/constants/denuncias';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DenunciaApi } from '@/services/api';

export function MiDenunciaCard({ denuncia }: { denuncia: DenunciaApi }) {
  const theme = useTheme();
  const visualTipo = inferirVisualTipo(denuncia.tipo_denuncia.nombre);
  const estadoMeta = ESTADO_API_META[denuncia.estado];
  const fecha = new Date(denuncia.created_at).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Pressable
        onPress={() => router.push({ pathname: '/denuncia/[id]', params: { id: String(denuncia.id) } })}
        style={({ pressed }) => pressed && styles.pressed}>
        <View style={styles.headerRow}>
          {denuncia.fotos_urls[0] ? (
            <Image source={{ uri: denuncia.fotos_urls[0] }} style={styles.thumb} contentFit="cover" />
          ) : (
            <View style={[styles.typeIcon, { backgroundColor: `${visualTipo.color}26` }]}>
              <SymbolView name={visualTipo.icon} size={18} tintColor={visualTipo.color} />
            </View>
          )}

          <View style={styles.headerTexts}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {visualTipo.label}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {denuncia.direccion ?? 'Sin dirección'} · {fecha}
            </ThemedText>
          </View>

          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={13}
            weight="bold"
            tintColor={theme.textSecondary}
          />
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: `${estadoMeta.color}26` }]}>
            <View style={[styles.badgeDot, { backgroundColor: estadoMeta.color }]} />
            <ThemedText type="small" style={{ color: estadoMeta.color }}>
              {estadoMeta.label}
            </ThemedText>
          </View>

          {denuncia.fotos_urls.length > 0 && (
            <View style={styles.metaTag}>
              <SymbolView
                name={{ ios: 'photo', android: 'image', web: 'image' }}
                size={11}
                tintColor={theme.textSecondary}
              />
              <ThemedText type="small" themeColor="textSecondary">
                {denuncia.fotos_urls.length}
              </ThemedText>
            </View>
          )}
        </View>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: Spacing.two,
  },
  headerTexts: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
