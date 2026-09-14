import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OutlinedText } from '@/components/outlined-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { iniciarSesion } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleIniciarSesion() {
    if (!email.trim() || !password) {
      setError('Completá tu email y contraseña.');
      return;
    }

    setError(null);
    setEnviando(true);
    try {
      await iniciarSesion(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={[styles.content, { paddingTop: insets.top + Spacing.five, paddingBottom: insets.bottom + Spacing.five }]}>
        <View style={styles.brand}>
          <View style={styles.brandRow}>
            <SymbolView
              name={{ ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }}
              size={30}
              tintColor={theme.primary}
            />
            <View style={styles.titleRow}>
              <Text style={[styles.brandTitle, { color: theme.text }]}>Alerta</Text>
              <OutlinedText text="Baches" style={styles.brandTitle} color={theme.primary} />
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary" style={styles.brandSubtitle}>
            Iniciá sesión para reportar y seguir el estado de tus denuncias
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.formCard}>
          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              Email
            </ThemedText>
            <View style={styles.inputRow}>
              <SymbolView
                name={{ ios: 'envelope', android: 'mail', web: 'mail' }}
                size={16}
                tintColor={theme.textSecondary}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              Contraseña
            </ThemedText>
            <View style={styles.inputRow}>
              <SymbolView
                name={{ ios: 'lock', android: 'lock', web: 'lock' }}
                size={16}
                tintColor={theme.textSecondary}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                autoComplete="password"
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>
        </ThemedView>

        {error && (
          <ThemedView type="backgroundElement" style={styles.errorBox}>
            <ThemedText type="small" style={{ color: '#EB5757' }}>
              {error}
            </ThemedText>
          </ThemedView>
        )}

        <Pressable
          disabled={enviando}
          onPress={handleIniciarSesion}
          style={({ pressed }) => pressed && styles.pressed}>
          <View style={[styles.submitButton, { backgroundColor: theme.primary, opacity: enviando ? 0.7 : 1 }]}>
            {enviando ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <ThemedText type="default" style={{ color: theme.onPrimary, fontWeight: '600' }}>
                Ingresar
              </ThemedText>
            )}
          </View>
        </Pressable>

        <Link href="/registro" asChild>
          <Pressable style={({ pressed }) => [styles.registroRow, pressed && styles.pressed]}>
            <ThemedText type="small" themeColor="textSecondary">
              ¿No tenés cuenta?
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.primary, fontWeight: '600' }}>
              Registrate
            </ThemedText>
          </Pressable>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
  },
  brandTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    textAlign: 'center',
    marginTop: Spacing.one,
    maxWidth: 260,
  },
  formCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.two,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#80808040',
  },
  errorBox: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  pressed: {
    opacity: 0.8,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  registroRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
});
