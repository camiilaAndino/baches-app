import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export function ProfileIcons() {
  const theme = useTheme();
  const { usuario } = useAuth();
  const iniciales = usuario?.name?.slice(0, 2).toUpperCase() ?? '??';
  const primerNombre = usuario?.name?.split(' ')[0] ?? 'vecino/a';

  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.push('/perfil')}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
            {iniciales}
          </ThemedText>
        </View>
      </Pressable>

      <View style={styles.texts}>
        <ThemedText type="small" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Hola 👋
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
          {primerNombre}
        </ThemedText>
      </View>

      <View style={styles.spacer} />

      <Pressable
        onPress={() => router.push('/notificaciones')}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
        <View style={styles.iconCircle}>
          <SymbolView
            name={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
            size={16}
            tintColor="#ffffff"
          />
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.push('/perfil')}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
        <View style={styles.iconCircle}>
          <SymbolView
            name={{ ios: 'person.crop.circle', android: 'person', web: 'person' }}
            size={16}
            tintColor="#ffffff"
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  spacer: {
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    marginLeft: Spacing.two,
    gap: 2,
  },
  iconButton: {
    marginLeft: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
});
