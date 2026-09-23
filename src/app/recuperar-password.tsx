import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AuthHeader } from '@/components/auth-header';
import { HeaderTitulo } from '@/components/header-titulo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { verificarEmailRecuperacion } from '@/services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RecuperarPasswordScreen() {
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  function volverAlLogin() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  }

  async function handleVerificar() {
    setErrorEmail(null);

    if (!email.trim()) {
      setErrorEmail('Ingresá tu email.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorEmail('Ingresá un email válido.');
      return;
    }

    setVerificando(true);
    try {
      await verificarEmailRecuperacion(email.trim());
      router.push({ pathname: '/restablecer-password', params: { email: email.trim() } });
    } catch (err) {
      setErrorEmail(err instanceof Error ? err.message : 'No pudimos verificar ese correo.');
    } finally {
      setVerificando(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <AuthHeader height={80}>
        <HeaderTitulo
          icono={{ ios: 'lock.rotation', android: 'lock_reset', web: 'lock_reset' }}
          subtitulo="Cuenta"
          titulo="Recuperar contraseña"
          alVolver={volverAlLogin}
          subirContenido={5}
        />
      </AuthHeader>

      <View style={styles.content}>
        <View style={[styles.iconWrapper, { backgroundColor: `${theme.primary}26` }]}>
          <SymbolView name={{ ios: 'envelope', android: 'mail', web: 'mail' }} size={28} tintColor={theme.primary} />
        </View>
        <ThemedText type="default" style={styles.title}>
          Recuperar contraseña
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          Ingresá el email de tu cuenta y verificamos que exista.
        </ThemedText>

        <View style={styles.field}>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              errorEmail && styles.inputWrapError,
            ]}>
            <SymbolView
              name={{ ios: 'envelope', android: 'mail', web: 'mail' }}
              size={16}
              tintColor={theme.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              value={email}
              onChangeText={(valor) => {
                setEmail(valor);
                if (errorEmail) setErrorEmail(null);
              }}
              placeholder="tu@email.com"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              style={[styles.input, { color: theme.text }]}
            />
          </View>
          {errorEmail && (
            <ThemedText type="small" style={styles.campoError}>
              {errorEmail}
            </ThemedText>
          )}
        </View>

        <Pressable
          disabled={verificando}
          onPress={handleVerificar}
          style={({ pressed }) => [styles.botonAnchoCompleto, pressed && styles.pressed]}>
          <View style={[styles.button, { backgroundColor: theme.primary, opacity: verificando ? 0.7 : 1 }]}>
            {verificando ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <ThemedText type="default" style={{ color: theme.onPrimary, fontWeight: '600' }}>
                Verificar correo
              </ThemedText>
            )}
          </View>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  field: {
    width: '100%',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 26,
  },
  inputWrapError: {
    borderColor: '#EB5757',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  campoError: {
    fontSize: 12,
    color: '#EB5757',
    marginTop: 4,
    marginLeft: Spacing.one,
  },
  botonAnchoCompleto: {
    alignSelf: 'stretch',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.three,
  },
});
