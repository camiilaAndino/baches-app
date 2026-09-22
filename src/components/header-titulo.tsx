import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colores } from '@/constants/auth-colors';
import { Spacing } from '@/constants/theme';

type Props = {
  icono: SymbolViewProps['name'];
  titulo: string;
  subtitulo: string;
  alVolver?: () => void;
  /** Sube solo el ícono y las letras (no el botón de volver), en píxeles. */
  subirContenido?: number;
};

export function HeaderTitulo({ icono, titulo, subtitulo, alVolver, subirContenido = 0 }: Props) {
  return (
    <View style={styles.row}>
      {alVolver && (
        <Pressable onPress={alVolver} hitSlop={8} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            size={16}
            tintColor="#ffffff"
          />
        </Pressable>
      )}

      <View style={[styles.contenido, { marginTop: -subirContenido }]}>
        <View style={styles.icon}>
          <SymbolView name={icono} size={20} tintColor={Colores.signal} />
        </View>

        <View style={styles.texts}>
          <ThemedText type="small" style={{ color: 'rgba(255, 255, 255, 0.7)' }} numberOfLines={1}>
            {subtitulo}
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: '#ffffff', fontSize: 20 }} numberOfLines={1}>
            {titulo}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: Spacing.two,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  pressed: {
    opacity: 0.8,
  },
  contenido: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.two,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colores.signal}26`,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
});
