import { Link, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OutlinedText } from '@/components/outlined-text';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { registrarUsuario } from '@/services/api';

export default function RegistroScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { iniciarSesion } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegistrarse() {
    if (!nombre.trim() || !email.trim() || !password) {
      setError('Completá todos los campos.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError(null);
    setEnviando(true);
    try {
      await registrarUsuario({
        name: nombre.trim(),
        email: email.trim(),
        password,
        passwordConfirmation,
      });
      await iniciarSesion(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setEnviando(false);
    }
  }

  function volverAlLogin() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable
          onPress={volverAlLogin}
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.backButtonInner}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              size={16}
              tintColor={theme.text}
            />
          </ThemedView>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.five }]}>
        <View style={styles.brand}>
          <View style={styles.brandRow}>
            <SymbolView
              name={{ ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }}
              size={26}
              tintColor={theme.primary}
            />
            <View style={styles.titleRow}>
              <Text style={[styles.brandTitle, { color: theme.text }]}>Alerta</Text>
              <OutlinedText text="Baches" style={styles.brandTitle} color={theme.primary} />
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary" style={styles.brandSubtitle}>
            Creá tu cuenta para reportar y seguir denuncias
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.formCard}>
          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              Nombre
            </ThemedText>
            <View style={styles.inputRow}>
              <SymbolView
                name={{ ios: 'person', android: 'person', web: 'person' }}
                size={16}
                tintColor={theme.textSecondary}
              />
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Tu nombre completo"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          <View style={styles.divider} />

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
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              Confirmar contraseña
            </ThemedText>
            <View style={styles.inputRow}>
              <SymbolView
                name={{ ios: 'lock', android: 'lock', web: 'lock' }}
                size={16}
                tintColor={theme.textSecondary}
              />
              <TextInput
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                placeholder="••••••••"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
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
          onPress={handleRegistrarse}
          style={({ pressed }) => pressed && styles.pressed}>
          <View style={[styles.submitButton, { backgroundColor: theme.primary, opacity: enviando ? 0.7 : 1 }]}>
            {enviando ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <ThemedText type="default" style={{ color: theme.onPrimary, fontWeight: '600' }}>
                Crear cuenta
              </ThemedText>
            )}
          </View>
        </Pressable>

        <Link href="/login" asChild>
          <Pressable style={({ pressed }) => [styles.loginRow, pressed && styles.pressed]}>
            <ThemedText type="small" themeColor="textSecondary">
              ¿Ya tenés cuenta?
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.primary, fontWeight: '600' }}>
              Iniciar sesión
            </ThemedText>
          </Pressable>
        </Link>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  backButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
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
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    textAlign: 'center',
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
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
});
