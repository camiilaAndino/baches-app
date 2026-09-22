import { router, usePathname } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export function BottomNav() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { cerrarSesion } = useAuth();
  const enInicio = pathname === '/';
  const enDenuncias = pathname === '/denuncias';

  function confirmarSalir() {
    Alert.alert('¿Estás seguro?', 'Vas a cerrar tu sesión en AlertaBaches.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await cerrarSesion();
          router.replace('/login');
        },
      },
    ]);
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + Spacing.two }]} pointerEvents="box-none">
      <View style={[styles.bar, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <Pressable
          onPress={() => router.replace('/')}
          hitSlop={12}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
          <View style={[styles.itemCircle, enInicio && { backgroundColor: `${theme.primary}1A` }]}>
            <SymbolView
              name={{ ios: enInicio ? 'house.fill' : 'house', android: 'home', web: 'home' }}
              size={22}
              tintColor={enInicio ? theme.primary : theme.textSecondary}
            />
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.replace('/denuncias')}
          hitSlop={12}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
          <View style={[styles.itemCircle, enDenuncias && { backgroundColor: `${theme.primary}1A` }]}>
            <SymbolView
              name={{ ios: enDenuncias ? 'list.bullet.rectangle.fill' : 'list.bullet.rectangle', android: 'list_alt', web: 'list_alt' }}
              size={22}
              tintColor={enDenuncias ? theme.primary : theme.textSecondary}
            />
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push('/crear-denuncia')}
          hitSlop={12}
          style={({ pressed }) => [styles.addButton, { backgroundColor: theme.primary }, pressed && styles.pressed]}>
          <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={26} tintColor={theme.onPrimary} />
        </Pressable>

        <Pressable
          onPress={() => router.push('/perfil')}
          hitSlop={12}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
          <View style={styles.itemCircle}>
            <SymbolView
              name={{ ios: 'person', android: 'person', web: 'person' }}
              size={22}
              tintColor={theme.textSecondary}
            />
          </View>
        </Pressable>

        <Pressable onPress={confirmarSalir} hitSlop={12} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
          <View style={styles.itemCircle}>
            <SymbolView
              name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
              size={22}
              tintColor={theme.textSecondary}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 380,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
    borderRadius: 32,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  pressed: {
    opacity: 0.8,
  },
});
