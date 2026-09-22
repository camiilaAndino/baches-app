import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthHeader } from '@/components/auth-header';
import { Chip } from '@/components/chip';
import { HeaderTitulo } from '@/components/header-titulo';
import { LocationPickerMap } from '@/components/location-picker-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DenunciaPrioridad, PRIORIDADES_ORDEN, PRIORIDAD_META, inferirVisualTipo } from '@/constants/denuncias';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { FotoParaSubir, TipoDenunciaApi, crearDenuncia, fetchTiposDenuncia } from '@/services/api';

type FotoSeleccionada = FotoParaSubir;

type CamposDenuncia = 'tipo' | 'descripcion' | 'ubicacion' | 'fotos';

export default function CrearDenunciaScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();

  const [tipos, setTipos] = useState<TipoDenunciaApi[]>([]);
  const [cargandoTipos, setCargandoTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState<string | null>(null);

  const [tipoId, setTipoId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<DenunciaPrioridad>('moderado');
  const [ubicacion, setUbicacion] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fotos, setFotos] = useState<FotoSeleccionada[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [erroresCampo, setErroresCampo] = useState<Partial<Record<CamposDenuncia, string>>>({});

  function limpiarErrorCampo(campo: CamposDenuncia) {
    setErroresCampo((actuales) => (actuales[campo] ? { ...actuales, [campo]: undefined } : actuales));
  }

  useEffect(() => {
    cargarTipos();
  }, []);

  async function cargarTipos() {
    setCargandoTipos(true);
    setErrorTipos(null);
    try {
      const data = await fetchTiposDenuncia();
      setTipos(data);
    } catch {
      setErrorTipos('No se pudieron cargar los tipos de denuncia. Revisá tu conexión.');
    } finally {
      setCargandoTipos(false);
    }
  }

  async function agregarFotos() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería para adjuntar fotos.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (resultado.canceled) return;

    const nuevas: FotoSeleccionada[] = resultado.assets.map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName ?? `foto-${Date.now()}-${index}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
      file: asset.file,
    }));

    setFotos((actuales) => [...actuales, ...nuevas]);
    limpiarErrorCampo('fotos');
  }

  function quitarFoto(uri: string) {
    setFotos((actuales) => actuales.filter((foto) => foto.uri !== uri));
  }

  function validar(): boolean {
    const errores: Partial<Record<CamposDenuncia, string>> = {};

    if (!tipoId) {
      errores.tipo = 'Elegí un tipo de denuncia.';
    }
    if (!descripcion.trim()) {
      errores.descripcion = 'Contanos qué está pasando.';
    }
    if (!ubicacion) {
      errores.ubicacion = 'Marcá el punto en el mapa.';
    }
    if (fotos.length === 0) {
      errores.fotos = 'Agregá al menos una foto como evidencia.';
    }

    setErroresCampo(errores);
    return Object.keys(errores).length === 0;
  }

  async function enviarDenuncia() {
    setError(null);
    if (!validar() || !ubicacion || !tipoId) return;

    const descripcionCompleta = titulo.trim() ? `${titulo.trim()}\n\n${descripcion.trim()}` : descripcion.trim();

    setEnviando(true);
    try {
      await crearDenuncia({
        tipoDenunciaId: tipoId,
        usuarioId: usuario?.id,
        descripcion: descripcionCompleta,
        latitud: ubicacion.latitude,
        longitud: ubicacion.longitude,
        direccion: direccion.trim() || undefined,
        prioridad,
        fotos,
      });
      setMostrarExito(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la denuncia. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  function volverAlInicio() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  function cerrarExitoYVolver() {
    setMostrarExito(false);
    volverAlInicio();
  }

  return (
    <ThemedView style={styles.screen}>
      <AuthHeader height={45}>
        <HeaderTitulo
          icono={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
          subtitulo="Reportar"
          titulo="Nueva denuncia"
          subirContenido={50}
        />
      </AuthHeader>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.five }]}>
        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Tipo de denuncia
          </ThemedText>

          {cargandoTipos ? (
            <ActivityIndicator color={theme.primary} style={styles.tiposLoader} />
          ) : errorTipos ? (
            <Pressable onPress={cargarTipos} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText type="small" style={{ color: theme.primary }}>
                {errorTipos} Tocá para reintentar.
              </ThemedText>
            </Pressable> 
          ) : (
            <View style={styles.chipsWrap}>
              {tipos.map((item) => {
                const visual = inferirVisualTipo(item.nombre);
                return (
                  <Chip
                    key={item.id}
                    label={visual.label}
                    icon={visual.icon}
                    color={visual.color}
                    selected={tipoId === item.id}
                    onPress={() => {
                      setTipoId(item.id);
                      limpiarErrorCampo('tipo');
                    }}
                  />
                );
              })}
            </View>
          )}
          {erroresCampo.tipo && (
            <ThemedText type="small" style={styles.campoError}>
              {erroresCampo.tipo}
            </ThemedText>
          )}
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Título
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.inputWrapper}>
            <TextInput
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej: Bache profundo en la calzada"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
            />
          </ThemedView>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Dirección o zona
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.inputWrapper}>
            <SymbolView
              name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
              size={15}
              tintColor={theme.textSecondary}
            />
            <TextInput
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Calle, esquina o punto de referencia"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
            />
          </ThemedView>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Ubicación en el mapa
          </ThemedText>
          <LocationPickerMap
            value={ubicacion}
            onChange={(coords) => {
              setUbicacion(coords);
              limpiarErrorCampo('ubicacion');
            }}
          />
          {erroresCampo.ubicacion && (
            <ThemedText type="small" style={styles.campoError}>
              {erroresCampo.ubicacion}
            </ThemedText>
          )}
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Descripción
          </ThemedText>
          <ThemedView type="backgroundElement" style={[styles.inputWrapper, styles.textareaWrapper]}>
            <TextInput
              value={descripcion}
              onChangeText={(valor) => {
                setDescripcion(valor);
                limpiarErrorCampo('descripcion');
              }}
              placeholder="Contá con el mayor detalle posible qué está pasando"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, styles.textarea, { color: theme.text }]}
              multiline
              numberOfLines={4}
            />
          </ThemedView>
          {erroresCampo.descripcion && (
            <ThemedText type="small" style={styles.campoError}>
              {erroresCampo.descripcion}
            </ThemedText>
          )}
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Prioridad
          </ThemedText>
          <View style={styles.chipsWrap}>
            {PRIORIDADES_ORDEN.map((item) => (
              <Chip
                key={item}
                label={PRIORIDAD_META[item].label}
                color={PRIORIDAD_META[item].color}
                selected={prioridad === item}
                onPress={() => setPrioridad(item)}
              />
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Evidencia
          </ThemedText>

          {fotos.length > 0 && (
            <View style={styles.fotosRow}>
              {fotos.map((foto) => (
                <View key={foto.uri} style={styles.fotoThumbWrapper}>
                  <Image source={{ uri: foto.uri }} style={styles.fotoThumb} />
                  <Pressable
                    onPress={() => quitarFoto(foto.uri)}
                    hitSlop={8}
                    style={({ pressed }) => [styles.fotoQuitar, pressed && styles.pressed]}>
                    <SymbolView
                      name={{ ios: 'xmark', android: 'close', web: 'close' }}
                      size={10}
                      tintColor="#ffffff"
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <Pressable onPress={agregarFotos} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView type="backgroundElement" style={styles.attachBox}>
              <SymbolView
                name={{ ios: 'camera', android: 'photo_camera', web: 'photo_camera' }}
                size={22}
                tintColor={theme.textSecondary}
              />
              <ThemedText type="small" themeColor="textSecondary">
                {fotos.length > 0 ? 'Agregar más fotos' : 'Tocá para agregar fotos'}
              </ThemedText>
            </ThemedView>
          </Pressable>

          {erroresCampo.fotos && (
            <ThemedText type="small" style={styles.campoError}>
              {erroresCampo.fotos}
            </ThemedText>
          )}
        </View>

        {error && (
          <ThemedView type="backgroundElement" style={styles.errorBox}>
            <ThemedText type="small" style={styles.campoError}>
              {error}
            </ThemedText>
          </ThemedView>
        )}

        <Pressable
          disabled={enviando}
          style={({ pressed }) => pressed && styles.pressed}
          onPress={enviarDenuncia}>
          <View style={[styles.submitButton, { backgroundColor: theme.primary, opacity: enviando ? 0.7 : 1 }]}>
            {enviando ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <ThemedText type="default" style={{ color: theme.onPrimary, fontWeight: '600' }}>
                Enviar denuncia
              </ThemedText>
            )}
          </View>
        </Pressable>
      </ScrollView>

      <Modal visible={mostrarExito} transparent animationType="fade" onRequestClose={cerrarExitoYVolver}>
        <View style={styles.exitoBackdrop}>
          <ThemedView type="background" style={styles.exitoCard}>
            <View style={[styles.exitoIconWrapper, { backgroundColor: `${ExitoColor}26` }]}>
              <SymbolView
                name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                size={36}
                tintColor={ExitoColor}
              />
            </View>

            <ThemedText type="default" style={styles.exitoTitulo}>
              ¡Denuncia enviada!
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.exitoTexto}>
              Tu reporte fue registrado correctamente. Vas a poder seguir su estado desde el inicio.
            </ThemedText>

            <Pressable
              onPress={cerrarExitoYVolver}
              style={({ pressed }) => [styles.exitoBoton, { backgroundColor: theme.primary }, pressed && styles.pressed]}>
              <ThemedText type="default" style={{ color: theme.onPrimary, fontWeight: '600' }}>
                Aceptar
              </ThemedText>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const ExitoColor = '#2FAF64';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tiposLoader: {
    alignSelf: 'flex-start',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  textareaWrapper: {
    alignItems: 'flex-start',
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  attachBox: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  fotosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  fotoThumbWrapper: {
    position: 'relative',
  },
  fotoThumb: {
    width: 64,
    height: 64,
    borderRadius: Spacing.two,
  },
  fotoQuitar: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00000099',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  campoError: {
    color: '#EB5757',
  },
  errorBox: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  exitoBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: '#00000066',
  },
  exitoCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Spacing.four,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  exitoIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  exitoTitulo: {
    fontWeight: '700',
    fontSize: 18,
  },
  exitoTexto: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  exitoBoton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
});
