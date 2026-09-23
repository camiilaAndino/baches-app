import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AuthHeader } from '@/components/auth-header';
import { HeaderTitulo } from '@/components/header-titulo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { restablecerPassword } from '@/services/api';

const PASSWORD_MIN_LENGTH = 8;

type Campos = 'codigo' | 'password' | 'passwordConfirmation';

export default function RestablecerPasswordScreen() {
  const theme = useTheme();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState<Partial<Record<Campos, string>>>({});
  const [enviando, setEnviando] = useState(false);
  const [restablecida, setRestablecida] = useState(false);

  function volverAlLogin() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  }

  function irALogin() {
    router.replace('/login');
  }

  function validar(): boolean {
    const nuevosErrores: Partial<Record<Campos, string>> = {};

    if (codigo.trim().length !== 5) {
      nuevosErrores.codigo = 'El código tiene 5 caracteres.';
    }
    if (!password) {
      nuevosErrores.password = 'Ingresá una contraseña nueva.';
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      nuevosErrores.password = `Mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;
    }
    if (!passwordConfirmation) {
      nuevosErrores.passwordConfirmation = 'Confirmá tu contraseña nueva.';
    } else if (password !== passwordConfirmation) {
      nuevosErrores.passwordConfirmation = 'Las contraseñas no coinciden.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function handleRestablecer() {
    if (!email || !validar()) return;

    setEnviando(true);
    try {
      await restablecerPassword({ email, codigo: codigo.trim(), password, passwordConfirmation });
      setRestablecida(true);
    } catch (err) {
      setErrores({ codigo: err instanceof Error ? err.message : 'No se pudo restablecer la contraseña.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <AuthHeader height={45}>
        <HeaderTitulo
          icono={{ ios: 'checkmark.shield.fill', android: 'verified_user', web: 'verified_user' }}
          subtitulo="Cuenta"
          titulo="Ingresar código"
          alVolver={restablecida ? irALogin : volverAlLogin}
          subirContenido={50}
        />
      </AuthHeader>

      <View style={styles.content}>
        {restablecida ? (
          <>
            <View style={[styles.iconWrapper, { backgroundColor: '#2FAF6426' }]}>
              <SymbolView
                name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                size={28}
                tintColor="#2FAF64"
              />
            </View>
            <ThemedText type="default" style={styles.title}>
              ¡Contraseña actualizada!
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Ya podés iniciar sesión con tu contraseña nueva.
            </ThemedText>

            <Pressable onPress={irALogin} style={({ pressed }) => pressed && styles.pressed}>
              <View style={[styles.button, { backgroundColor: theme.primary }]}>
                <ThemedText type="default" style={{ color: theme.onPrimary, fontWeight: '600' }}>
                  Ir a iniciar sesión
                </ThemedText>
              </View>
            </Pressable>
          </>
        ) : (
          <>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Te enviamos un código de 5 caracteres a {email}. Ingresalo junto con tu contraseña nueva.
            </ThemedText>

            <View style={styles.field}>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  errores.codigo && styles.inputWrapError,
                ]}>
                <SymbolView
                  name={{ ios: 'number', android: 'pin', web: 'pin' }}
                  size={16}
                  tintColor={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={codigo}
                  onChangeText={(valor) => {
                    setCodigo(valor.toUpperCase());
                    if (errores.codigo) setErrores((actuales) => ({ ...actuales, codigo: undefined }));
                  }}
                  placeholder="Código de 5 caracteres"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="characters"
                  maxLength={5}
                  style={[styles.input, styles.inputCodigo, { color: theme.text }]}
                />
              </View>
              {errores.codigo && (
                <ThemedText type="small" style={styles.campoError}>
                  {errores.codigo}
                </ThemedText>
              )}
            </View>

            <View style={styles.field}>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  errores.password && styles.inputWrapError,
                ]}>
                <SymbolView name={{ ios: 'lock', android: 'lock', web: 'lock' }} size={16} tintColor={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={(valor) => {
                    setPassword(valor);
                    if (errores.password) setErrores((actuales) => ({ ...actuales, password: undefined }));
                  }}
                  placeholder="Contraseña nueva"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!mostrarPassword}
                  style={[styles.input, { color: theme.text }]}
                />
                <Pressable onPress={() => setMostrarPassword((valor) => !valor)} hitSlop={8} style={styles.toggleVisibility}>
                  <SymbolView
                    name={
                      mostrarPassword
                        ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
                        : { ios: 'eye', android: 'visibility', web: 'visibility' }
                    }
                    size={17}
                    tintColor={theme.textSecondary}
                  />
                </Pressable>
              </View>
              {errores.password && (
                <ThemedText type="small" style={styles.campoError}>
                  {errores.password}
                </ThemedText>
              )}
            </View>

            <View style={styles.field}>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  errores.passwordConfirmation && styles.inputWrapError,
                ]}>
                <SymbolView name={{ ios: 'lock', android: 'lock', web: 'lock' }} size={16} tintColor={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  value={passwordConfirmation}
                  onChangeText={(valor) => {
                    setPasswordConfirmation(valor);
                    if (errores.passwordConfirmation) {
                      setErrores((actuales) => ({ ...actuales, passwordConfirmation: undefined }));
                    }
                  }}
                  placeholder="Confirmar contraseña nueva"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!mostrarPassword}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
              {errores.passwordConfirmation && (
                <ThemedText type="small" style={styles.campoError}>
                  {errores.passwordConfirmation}
                </ThemedText>
              )}
            </View>

            <Pressable
              disabled={enviando}
              onPress={handleRestablecer}
              style={({ pressed }) => [styles.botonAnchoCompleto, pressed && styles.pressed]}>
              <View style={[styles.button, { backgroundColor: theme.primary, opacity: enviando ? 0.7 : 1 }]}>
                {enviando ? (
                  <ActivityIndicator color={theme.onPrimary} />
                ) : (
                  <ThemedText type="default" style={{ color: theme.onPrimary, fontWeight: '600' }}>
                    Restablecer contraseña
                  </ThemedText>
                )}
              </View>
            </Pressable>
          </>
        )}
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
    justifyContent: 'center',
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
  inputCodigo: {
    letterSpacing: 4,
    fontWeight: '700',
  },
  toggleVisibility: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
