import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colores } from '@/constants/auth-colors';
import { Spacing } from '@/constants/theme';

export const HERO_HEIGHT = 170;

type Props = {
  showBack?: boolean;
  height?: number;
  children?: ReactNode;
};

export function AuthHeader({ showBack, height = HERO_HEIGHT, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top, height: insets.top + height }]}>
      {showBack && (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, { top: insets.top + Spacing.three }, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            size={16}
            tintColor="#ffffff"
          />
        </Pressable>
      )}

      {children ?? (
        <View style={styles.brandRow}>
          <SymbolView
            name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
            size={28}
            tintColor={Colores.signal}
          />
          <Text style={styles.brandText}>
            <Text style={{ color: '#ffffff' }}>Alerta</Text>
            <Text style={{ color: Colores.signal }}>Baches</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colores.asphalt900,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    position: 'absolute',
    left: Spacing.four,
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandText: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
