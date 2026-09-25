import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ESTADO_API_META } from '@/constants/denuncias';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { NotificacionApi } from '@/services/api';

type Props = {
  notificacion: NotificacionApi;
  onPress: () => void;
};

export function NotificacionCard({ notificacion, onPress }: Props) {
  const theme = useTheme();
  const estadoMeta = ESTADO_API_META[notificacion.estado];
  const fecha = new Date(notificacion.createdAt).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type="backgroundElement"
        style={[styles.card, !notificacion.leido && { borderColor: theme.primary, borderWidth: 1.5 }]}>
        <View style={[styles.icon, { backgroundColor: `${estadoMeta.color}26` }]}>
          <SymbolView name={estadoMeta.icon} size={18} tintColor={estadoMeta.color} />
        </View>

        <View style={styles.texts}>
          <ThemedText type="small" numberOfLines={2}>
            Tu denuncia #{notificacion.denunciaId}
            {notificacion.tipoDenuncia ? ` de ${notificacion.tipoDenuncia}` : ''} pasó a{' '}
            <ThemedText type="smallBold" style={{ color: estadoMeta.color }}>
              {estadoMeta.label}
            </ThemedText>
          </ThemedText>
          {notificacion.direccion && (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {notificacion.direccion}
            </ThemedText>
          )}
          <ThemedText type="small" themeColor="textSecondary">
            {fecha}
          </ThemedText>
        </View>

        {!notificacion.leido && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
});
