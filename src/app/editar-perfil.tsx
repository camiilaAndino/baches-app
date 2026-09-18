import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { actualizarPassword, actualizarPerfil } from '@/services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

type CamposPerfil = 'nombre' | 'email';
type CamposPassword = 'passwordActual' | 'password' | 'passwordConfirmation';

export default function EditarPerfilScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { usuario, actualizarUsuario } = useAuth();

  const [nombre, setNombre] = useState(usuario?.name ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [erroresPerfil, setErroresPerfil] = useState<Partial<Record<CamposPerfil, string>>>({});
  const [enviandoPerfil, setEnviandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);
  const [perfilGuardado, setPerfilGuardado] = useState(false);

  const [passwordActual, setPasswordActual] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [mostrarPasswordActual, setMostrarPasswordActual] = useState(false);
  const [mostrarPasswordNueva, setMostrarPasswordNueva] = useState(false);
  const [erroresPassword, setErroresPassword] = useState<Partial<Record<CamposPassword, string>>>({});
  const [enviandoPassword, setEnviandoPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [passwordGuardada, setPasswordGuardada] = useState(false);

  function volver() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/perfil');
    }
  }

  function validarPerfil(): boolean {
    const errores: Partial<Record<CamposPerfil, string>> = {};

    if (!nombre.trim()) {
      errores.nombre = 'Ingresá tu nombre.';
    }

    if (!email.trim()) {
      errores.email = 'Ingresá tu email.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errores.email = 'Ingresá un email válido.';
    }

    setErroresPerfil(errores);
    return Object.keys(errores).length === 0;
  }

  async function handleGuardarPerfil() {
    setErrorPerfil(null);
    setPerfilGuardado(false);
    if (!usuario || !validarPerfil()) return;

    setEnviandoPerfil(true);
    try {
      const actualizado = await actualizarPerfil(usuario.id, { name: nombre.trim(), email: email.trim() });
      await actualizarUsuario(actualizado);
      setPerfilGuardado(true);
    } catch (err) {
      setErrorPerfil(err instanceof Error ? err.message : 'No se pudo actualizar el perfil.');
    } finally {
      setEnviandoPerfil(false);
    }
  }

  function validarPassword(): boolean {
    const errores: Partial<Record<CamposPassword, string>> = {};

    if (!passwordActual) {
      errores.passwordActual = 'Ingresá tu contraseña actual.';
    }

    if (!password) {
      errores.password = 'Ingresá una contraseña nueva.';
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      errores.password = `Mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;
    }

    if (!passwordConfirmation) {
      errores.passwordConfirmation = 'Confirmá tu contraseña nueva.';
    } else if (password !== passwordConfirmation) {
      errores.passwordConfirmation = 'Las contraseñas no coinciden.';
    }

    setErroresPassword(errores);
    return Object.keys(errores).length === 0;
  }

  async function handleGuardarPassword() {
    setErrorPassword(null);
    setPasswordGuardada(false);
    if (!usuario || !validarPassword()) return;

    setEnviandoPassword(true);
    try {
      await actualizarPassword(usuario.id, { passwordActual, password, passwordConfirmation });
      setPasswordActual('');
      setPassword('');
      setPasswordConfirmation('');
      setPasswordGuardada(true);
    } catch (err) {
      setErrorPassword(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.');
    } finally {
      setEnviandoPassword(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable onPress={volver} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.closeButton}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={14}
              tintColor={theme.text}
            />
          </ThemedView>
        </Pressable>
        <ThemedText type="smallBold">Editar perfil</ThemedText>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.five }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Datos generales
          </ThemedText>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Nombre
            </ThemedText>
            <View style={[styles.inputWrap, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <SymbolView name={{ ios: 'person', android: 'person', web: 'person' }} size={16} tintColor={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={nombre}
                onChangeText={(valor) => {
                  setNombre(valor);
                  if (erroresPerfil.nombre) setErroresPerfil((actuales) => ({ ...actuales, nombre: undefined }));
                }}
                placeholder="Tu nombre completo"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
            {erroresPerfil.nombre && <ThemedText type="small" style={styles.campoError}>{erroresPerfil.nombre}</ThemedText>}
          </View>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Email
            </ThemedText>
            <View style={[styles.inputWrap, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <SymbolView name={{ ios: 'envelope', android: 'mail', web: 'mail' }} size={16} tintColor={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={(valor) => {
                  setEmail(valor);
                  if (erroresPerfil.email) setErroresPerfil((actuales) => ({ ...actuales, email: undefined }));
                }}
                placeholder="tu@email.com"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                style={[styles.input, { color: theme.text }]}
              />
            </View>
            {erroresPerfil.email && <ThemedText type="small" style={styles.campoError}>{erroresPerfil.email}</ThemedText>}
          </View>

          {errorPerfil && (
            <ThemedView type="backgroundElement" style={[styles.messageBox, { borderColor: theme.border }]}>
              <ThemedText type="small" style={styles.campoError}>{errorPerfil}</ThemedText>
            </ThemedView>
          )}
          {perfilGuardado && !errorPerfil && (
            <ThemedView type="backgroundElement" style={[styles.messageBox, { borderColor: theme.border }]}>
              <ThemedText type="small" style={{ color: '#2FAF64' }}>Perfil actualizado correctamente.</ThemedText>
            </ThemedView>
          )}

          <Pressable disabled={enviandoPerfil} onPress={handleGuardarPerfil} style={({ pressed }) => pressed && styles.pressed}>
            <View style={[styles.submitButton, { backgroundColor: theme.primary, opacity: enviandoPerfil ? 0.7 : 1 }]}>
              {enviandoPerfil ? (
                <ActivityIndicator color={theme.onPrimary} />
              ) : (
                <ThemedText type="default" style={{ color: theme.onPrimary, fontWeight: '600' }}>
                  Guardar datos
                </ThemedText>
              )}
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Cambiar contraseña
          </ThemedText>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Contraseña actual
            </ThemedText>
            <View style={[styles.inputWrap, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <SymbolView name={{ ios: 'lock', android: 'lock', web: 'lock' }} size={16} tintColor={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={passwordActual}
                onChangeText={(valor) => {
                  setPasswordActual(valor);
                  if (erroresPassword.passwordActual) {
                    setErroresPassword((actuales) => ({ ...actuales, passwordActual: undefined }));
                  }
                }}
                placeholder="••••••••"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!mostrarPasswordActual}
                style={[styles.input, { color: theme.text }]}
              />
              <Pressable onPress={() => setMostrarPasswordActual((valor) => !valor)} hitSlop={8} style={styles.toggleVisibility}>
                <SymbolView
                  name={
                    mostrarPasswordActual
                      ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
                      : { ios: 'eye', android: 'visibility', web: 'visibility' }
                  }
                  size={17}
                  tintColor={theme.textSecondary}
                />
              </Pressable>
            </View>
            {erroresPassword.passwordActual && (
              <ThemedText type="small" style={styles.campoError}>{erroresPassword.passwordActual}</ThemedText>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Contraseña nueva
            </ThemedText>
            <View style={[styles.inputWrap, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <SymbolView name={{ ios: 'lock', android: 'lock', web: 'lock' }} size={16} tintColor={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={(valor) => {
                  setPassword(valor);
                  if (erroresPassword.password) setErroresPassword((actuales) => ({ ...actuales, password: undefined }));
                }}
                placeholder="••••••••"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!mostrarPasswordNueva}
                style={[styles.input, { color: theme.text }]}
              />
              <Pressable onPress={() => setMostrarPasswordNueva((valor) => !valor)} hitSlop={8} style={styles.toggleVisibility}>
                <SymbolView
                  name={
                    mostrarPasswordNueva
                      ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
                      : { ios: 'eye', android: 'visibility', web: 'visibility' }
                  }
                  size={17}
                  tintColor={theme.textSecondary}
                />
              </Pressable>
            </View>
            {erroresPassword.password && <ThemedText type="small" style={styles.campoError}>{erroresPassword.password}</ThemedText>}
          </View>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Confirmar contraseña nueva
            </ThemedText>
            <View style={[styles.inputWrap, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <SymbolView name={{ ios: 'lock', android: 'lock', web: 'lock' }} size={16} tintColor={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={passwordConfirmation}
                onChangeText={(valor) => {
                  setPasswordConfirmation(valor);
                  if (erroresPassword.passwordConfirmation) {
                    setErroresPassword((actuales) => ({ ...actuales, passwordConfirmation: undefined }));
                  }
                }}
                placeholder="••••••••"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!mostrarPasswordNueva}
                style={[styles.input, { color: theme.text }]}
              />
            </View>
            {erroresPassword.passwordConfirmation && (
              <ThemedText type="small" style={styles.campoError}>{erroresPassword.passwordConfirmation}</ThemedText>
            )}
          </View>

          {errorPassword && (
            <ThemedView type="backgroundElement" style={[styles.messageBox, { borderColor: theme.border }]}>
              <ThemedText type="small" style={styles.campoError}>{errorPassword}</ThemedText>
            </ThemedView>
          )}
          {passwordGuardada && !errorPassword && (
            <ThemedView type="backgroundElement" style={[styles.messageBox, { borderColor: theme.border }]}>
              <ThemedText type="small" style={{ color: '#2FAF64' }}>Contraseña actualizada correctamente.</ThemedText>
            </ThemedView>
          )}

          <Pressable disabled={enviandoPassword} onPress={handleGuardarPassword} style={({ pressed }) => pressed && styles.pressed}>
            <View style={[styles.submitButton, { backgroundColor: theme.primary, opacity: enviandoPassword ? 0.7 : 1 }]}>
              {enviandoPassword ? (
                <ActivityIndicator color={theme.onPrimary} />
              ) : (
                <ThemedText type="default" style={{ color: theme.onPrimary, fontWeight: '600' }}>
                  Cambiar contraseña
                </ThemedText>
              )}
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  closeButton: {
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
    paddingTop: Spacing.two,
    gap: Spacing.six,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    textTransform: 'uppercase',
  },
  field: {
    gap: Spacing.one,
  },
  label: {
    marginLeft: Spacing.one,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 26,
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
  toggleVisibility: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  campoError: {
    color: '#EB5757',
    marginLeft: Spacing.one,
  },
  messageBox: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 28,
    marginTop: Spacing.one,
  },
});
