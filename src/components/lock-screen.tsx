import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colores } from '@/constants/auth-colors';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export function LockScreen() {
  const insets = useSafeAreaInsets();
  const { desbloquear, cerrarSesion } = useAuth();
  const [intentando, setIntentando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    intentarDesbloquear();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function intentarDesbloquear() {
    setIntentando(true);
    setError(null);
    const exito = await desbloquear();
    if (!exito) setError('No se pudo verificar tu identidad. Intentá de nuevo.');
    setIntentando(false);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.six, paddingBottom: insets.bottom + Spacing.five }]}>
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

      <View style={styles.centro}>
        <View style={styles.icono}>
          <SymbolView
            name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
            size={32}
            tintColor="#ffffff"
          />
        </View>
        <Text style={styles.titulo}>Sesión bloqueada</Text>
        <Text style={styles.subtitulo}>Verificá tu identidad para continuar</Text>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.acciones}>
        <Pressable
          disabled={intentando}
          onPress={intentarDesbloquear}
          style={({ pressed }) => [styles.botonPrimario, pressed && styles.pressed]}>
          <Text style={styles.botonPrimarioTexto}>{intentando ? 'Verificando…' : 'Desbloquear'}</Text>
        </Pressable>

        <Pressable onPress={cerrarSesion} style={({ pressed }) => [styles.botonSecundario, pressed && styles.pressed]}>
          <Text style={styles.botonSecundarioTexto}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colores.asphalt900,
    paddingHorizontal: Spacing.four,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  centro: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  icono: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitulo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    color: '#EB5757',
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  acciones: {
    gap: Spacing.two,
  },
  botonPrimario: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 28,
    backgroundColor: Colores.signal,
  },
  botonPrimarioTexto: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '600',
  },
  botonSecundario: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  botonSecundarioTexto: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.8,
  },
});
