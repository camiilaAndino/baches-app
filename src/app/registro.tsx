import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthHeader } from '@/components/auth-header';
import { AuthSwitch } from '@/components/auth-switch';
import { Colores } from '@/constants/auth-colors';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { registrarUsuario } from '@/services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

type CamposRegistro = 'nombre' | 'email' | 'password' | 'passwordConfirmation' | 'terminos';

export default function RegistroScreen() {
  const insets = useSafeAreaInsets();
  const { iniciarSesion } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarPasswordConfirmation, setMostrarPasswordConfirmation] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [erroresCampo, setErroresCampo] = useState<Partial<Record<CamposRegistro, string>>>({});

  function validar(): boolean {
    const errores: Partial<Record<CamposRegistro, string>> = {};

    if (!nombre.trim()) {
      errores.nombre = 'Ingresá tu nombre.';
    }

    if (!email.trim()) {
      errores.email = 'Ingresá tu email.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errores.email = 'Ingresá un email válido.';
    }

    if (!password) {
      errores.password = 'Ingresá una contraseña.';
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      errores.password = `Mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;
    }

    if (!passwordConfirmation) {
      errores.passwordConfirmation = 'Confirmá tu contraseña.';
    } else if (password !== passwordConfirmation) {
      errores.passwordConfirmation = 'Las contraseñas no coinciden.';
    }

    if (!aceptaTerminos) {
      errores.terminos = 'Tenés que aceptar los términos y condiciones.';
    }

    setErroresCampo(errores);
    return Object.keys(errores).length === 0;
  }

  async function handleRegistrarse() {
    setError(null);
    if (!validar()) return;

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

  return (
    <View style={styles.screen}>
      <AuthHeader showBack />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.five }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        <View style={styles.formCard}>
          <Text style={styles.greeting}>Creá tu cuenta</Text>
          <Text style={styles.subtitle}>Registrate para reportar y seguir denuncias</Text>

          <View style={styles.field}>
            <View style={[styles.inputWrap, erroresCampo.nombre && styles.inputWrapError]}>
              <SymbolView
                name={{ ios: 'person', android: 'person', web: 'person' }}
                size={16}
                tintColor={Colores.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                value={nombre}
                onChangeText={(valor) => {
                  setNombre(valor);
                  if (erroresCampo.nombre) setErroresCampo((actuales) => ({ ...actuales, nombre: undefined }));
                }}
                placeholder="Tu nombre completo"
                placeholderTextColor="#a8abb1"
                style={styles.input}
              />
            </View>
            {erroresCampo.nombre && <Text style={styles.campoError}>{erroresCampo.nombre}</Text>}
          </View>

          <View style={styles.field}>
            <View style={[styles.inputWrap, erroresCampo.email && styles.inputWrapError]}>
              <SymbolView
                name={{ ios: 'envelope', android: 'mail', web: 'mail' }}
                size={16}
                tintColor={Colores.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                value={email}
                onChangeText={(valor) => {
                  setEmail(valor);
                  if (erroresCampo.email) setErroresCampo((actuales) => ({ ...actuales, email: undefined }));
                }}
                placeholder="tu@email.com"
                placeholderTextColor="#a8abb1"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
            {erroresCampo.email && <Text style={styles.campoError}>{erroresCampo.email}</Text>}
          </View>

          <View style={styles.field}>
            <View style={[styles.inputWrap, erroresCampo.password && styles.inputWrapError]}>
              <SymbolView
                name={{ ios: 'lock', android: 'lock', web: 'lock' }}
                size={16}
                tintColor={Colores.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                value={password}
                onChangeText={(valor) => {
                  setPassword(valor);
                  if (erroresCampo.password) setErroresCampo((actuales) => ({ ...actuales, password: undefined }));
                }}
                placeholder="••••••••"
                placeholderTextColor="#a8abb1"
                secureTextEntry={!mostrarPassword}
                style={styles.input}
              />
              <Pressable
                onPress={() => setMostrarPassword((valor) => !valor)}
                hitSlop={8}
                style={styles.toggleVisibility}>
                <SymbolView
                  name={
                    mostrarPassword
                      ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
                      : { ios: 'eye', android: 'visibility', web: 'visibility' }
                  }
                  size={17}
                  tintColor={Colores.textMuted}
                />
              </Pressable>
            </View>
            {erroresCampo.password && <Text style={styles.campoError}>{erroresCampo.password}</Text>}
          </View>

          <View style={styles.field}>
            <View style={[styles.inputWrap, erroresCampo.passwordConfirmation && styles.inputWrapError]}>
              <SymbolView
                name={{ ios: 'lock', android: 'lock', web: 'lock' }}
                size={16}
                tintColor={Colores.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                value={passwordConfirmation}
                onChangeText={(valor) => {
                  setPasswordConfirmation(valor);
                  if (erroresCampo.passwordConfirmation) {
                    setErroresCampo((actuales) => ({ ...actuales, passwordConfirmation: undefined }));
                  }
                }}
                placeholder="••••••••"
                placeholderTextColor="#a8abb1"
                secureTextEntry={!mostrarPasswordConfirmation}
                style={styles.input}
              />
              <Pressable
                onPress={() => setMostrarPasswordConfirmation((valor) => !valor)}
                hitSlop={8}
                style={styles.toggleVisibility}>
                <SymbolView
                  name={
                    mostrarPasswordConfirmation
                      ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
                      : { ios: 'eye', android: 'visibility', web: 'visibility' }
                  }
                  size={17}
                  tintColor={Colores.textMuted}
                />
              </Pressable>
            </View>
            {erroresCampo.passwordConfirmation && (
              <Text style={styles.campoError}>{erroresCampo.passwordConfirmation}</Text>
            )}
          </View>

          <Pressable
            onPress={() => {
              setAceptaTerminos((valor) => !valor);
              if (erroresCampo.terminos) setErroresCampo((actuales) => ({ ...actuales, terminos: undefined }));
            }}
            style={styles.checkboxRow}>
            <View style={[styles.checkbox, aceptaTerminos && styles.checkboxMarcado]}>
              {aceptaTerminos && <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={12} tintColor="#ffffff" />}
            </View>
            <Text style={styles.checkboxLabel}>Acepto los términos y condiciones</Text>
          </Pressable>
          {erroresCampo.terminos && <Text style={styles.campoError}>{erroresCampo.terminos}</Text>}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          <Pressable
            disabled={enviando}
            onPress={handleRegistrarse}
            style={({ pressed }) => pressed && styles.pressed}>
            <View style={[styles.submitButton, { opacity: enviando ? 0.7 : 1 }]}>
              {enviando ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Crear cuenta</Text>
              )}
            </View>
          </Pressable>

          <AuthSwitch question="¿Ya tenés cuenta?" actionLabel="Iniciar sesión" href="/login" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    justifyContent: 'flex-start',
  },
  formCard: {
    backgroundColor: Colores.card,
    borderWidth: 1,
    borderColor: Colores.line200,
    borderRadius: 28,
    padding: 24,
    paddingTop: 20,
    marginTop: Spacing.five,
    shadowColor: Colores.asphalt900,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  greeting: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: Colores.signal,
  },
  subtitle: {
    textAlign: 'center',
    color: Colores.textMuted,
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 24,
    alignSelf: 'center',
    maxWidth: 260,
  },
  field: {
    marginBottom: 18,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: Colores.line200,
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
    color: Colores.textPrimary,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  toggleVisibility: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colores.line200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMarcado: {
    backgroundColor: Colores.signal,
    borderColor: Colores.signal,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colores.textMuted,
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  errorBox: {
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  errorBoxText: {
    fontSize: 13,
    color: '#D64545',
  },
  campoError: {
    fontSize: 12,
    color: '#EB5757',
    marginTop: 4,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 28,
    backgroundColor: Colores.signal,
    marginTop: 4,
    shadowColor: Colores.signalDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '600',
  },
});
