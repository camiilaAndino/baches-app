import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthHeader } from '@/components/auth-header';
import { AuthSwitch } from '@/components/auth-switch';
import { Colores } from '@/constants/auth-colors';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CamposLogin = 'email' | 'password';
type ModoIngreso = 'password' | 'biometrico';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { iniciarSesion, iniciarSesionConBiometria, cuentaRecordada, biometriaActivada, olvidarCuentaRecordada } =
    useAuth();

  const puedeUsarBiometria = !!cuentaRecordada && biometriaActivada;

  const [modo, setModo] = useState<ModoIngreso>(puedeUsarBiometria ? 'biometrico' : 'password');
  const [email, setEmail] = useState(cuentaRecordada?.email ?? '');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [erroresCampo, setErroresCampo] = useState<Partial<Record<CamposLogin, string>>>({});

  const [enviandoBiometria, setEnviandoBiometria] = useState(false);
  const [errorBiometria, setErrorBiometria] = useState<string | null>(null);

  function validar(): boolean {
    const errores: Partial<Record<CamposLogin, string>> = {};

    if (!email.trim()) {
      errores.email = 'Ingresá tu email.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errores.email = 'Ingresá un email válido.';
    }

    if (!password) {
      errores.password = 'Ingresá tu contraseña.';
    }

    setErroresCampo(errores);
    return Object.keys(errores).length === 0;
  }

  async function handleIniciarSesion() {
    setError(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      await iniciarSesion(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setEnviando(false);
    }
  }

  async function handleIniciarSesionBiometrica() {
    setErrorBiometria(null);
    setEnviandoBiometria(true);
    const exito = await iniciarSesionConBiometria();
    if (!exito) setErrorBiometria('No se pudo verificar tu identidad. Intentá de nuevo.');
    setEnviandoBiometria(false);
  }

  async function handleUsarOtraCuenta() {
    await olvidarCuentaRecordada();
    setEmail('');
    setModo('password');
  }

  return (
    <View style={styles.screen}>
      <AuthHeader />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.five }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        <View style={styles.formCard}>
          {puedeUsarBiometria && (
            <View style={styles.modoTabs}>
              <Pressable
                style={[styles.modoTab, modo === 'biometrico' && styles.modoTabActivo]}
                onPress={() => setModo('biometrico')}>
                <Text style={[styles.modoTabTexto, modo === 'biometrico' && styles.modoTabTextoActivo]}>
                  Biometría
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modoTab, modo === 'password' && styles.modoTabActivo]}
                onPress={() => setModo('password')}>
                <Text style={[styles.modoTabTexto, modo === 'password' && styles.modoTabTextoActivo]}>
                  Contraseña
                </Text>
              </Pressable>
            </View>
          )}

          {modo === 'biometrico' && cuentaRecordada ? (
            <View style={styles.biometricoBlock}>
              <View style={styles.biometricoIcono}>
                <SymbolView
                  name={{ ios: 'faceid', android: 'fingerprint', web: 'fingerprint' }}
                  size={30}
                  tintColor={Colores.signal}
                />
              </View>

              <Text style={styles.greeting}>¡Hola, {cuentaRecordada.name.split(' ')[0]}!</Text>
              <Text style={styles.subtitle}>Confirmá tu identidad para ingresar</Text>

              {errorBiometria && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{errorBiometria}</Text>
                </View>
              )}

              <Pressable
                disabled={enviandoBiometria}
                onPress={handleIniciarSesionBiometrica}
                style={({ pressed }) => pressed && styles.pressed}>
                <View style={[styles.submitButton, { opacity: enviandoBiometria ? 0.7 : 1 }]}>
                  {enviandoBiometria ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Ingresar con biometría</Text>
                  )}
                </View>
              </Pressable>

              <Pressable onPress={handleUsarOtraCuenta} style={({ pressed }) => pressed && styles.pressed}>
                <Text style={styles.otraCuenta}>¿No sos {cuentaRecordada.name.split(' ')[0]}? Usar otra cuenta</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.greeting}>¡Hola!</Text>
              <Text style={styles.subtitle}>Iniciá sesión para reportar y seguir el estado de tus denuncias</Text>

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
                    placeholder="Email"
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
                    placeholder="Contraseña"
                    placeholderTextColor="#a8abb1"
                    secureTextEntry={!mostrarPassword}
                    autoComplete="password"
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

                <Link href="/recuperar-password" asChild>
                  <Pressable style={({ pressed }) => pressed && styles.pressed}>
                    <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
                  </Pressable>
                </Link>
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{error}</Text>
                </View>
              )}

              <Pressable
                disabled={enviando}
                onPress={handleIniciarSesion}
                style={({ pressed }) => pressed && styles.pressed}>
                <View style={[styles.submitButton, { opacity: enviando ? 0.7 : 1 }]}>
                  {enviando ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Ingresar</Text>
                  )}
                </View>
              </Pressable>
            </>
          )}

          <AuthSwitch question="¿No tenés cuenta?" actionLabel="Crear una cuenta" href="/registro" />
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
  modoTabs: {
    flexDirection: 'row',
    backgroundColor: Colores.line200,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modoTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  modoTabActivo: {
    backgroundColor: '#ffffff',
    shadowColor: Colores.asphalt900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  modoTabTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: Colores.textMuted,
  },
  modoTabTextoActivo: {
    color: Colores.asphalt900,
  },
  biometricoBlock: {
    alignItems: 'center',
  },
  biometricoIcono: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colores.signal}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  otraCuenta: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: Colores.textMuted,
    marginTop: Spacing.three,
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
  forgot: {
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '500',
    color: Colores.textMuted,
    marginTop: 10,
  },
  pressed: {
    opacity: 0.8,
  },
  errorBox: {
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    width: '100%',
  },
  errorBoxText: {
    fontSize: 13,
    color: '#D64545',
    textAlign: 'center',
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
    width: '100%',
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
