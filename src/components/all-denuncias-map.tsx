import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ESTADO_API_META } from '@/constants/denuncias';
import { ENCARNACION_CENTRO, ENCARNACION_LIMITES, ENCARNACION_ZOOM_MIN } from '@/constants/mapa';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DenunciaApi } from '@/services/api';
import { Coordenadas, distanciaMetros } from '@/utils/distancia';

type Props = {
  denuncias: DenunciaApi[];
};

const RADIO_CERCA_METROS = 1500;

function construirHtml(denuncias: DenunciaApi[], ubicacionUsuario: Coordenadas | null): string {
  const denunciasAMostrar = ubicacionUsuario
    ? denuncias.filter(
        (denuncia) => distanciaMetros(ubicacionUsuario, { lat: denuncia.latitud, lng: denuncia.longitud }) <= RADIO_CERCA_METROS
      )
    : denuncias;

  const puntos = denunciasAMostrar.map((denuncia) => ({
    lat: denuncia.latitud,
    lng: denuncia.longitud,
    color: ESTADO_API_META[denuncia.estado].color,
    icono: ESTADO_API_META[denuncia.estado].icon.web,
    tipo: denuncia.tipo_denuncia.nombre,
    estado: ESTADO_API_META[denuncia.estado].label,
    direccion: denuncia.direccion ?? 'Sin dirección',
  }));

  const centro = ubicacionUsuario ?? ENCARNACION_CENTRO;
  const zoomInicial = ubicacionUsuario ? 15 : 11;

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .marcador-estado {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .marcador-estado .material-icons {
      font-size: 14px;
      color: #ffffff;
    }
    .marcador-usuario {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #3B82F6;
      border: 3px solid #ffffff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var limites = L.latLngBounds(${JSON.stringify(ENCARNACION_LIMITES)});
    var map = L.map('map', {
      attributionControl: false,
      zoomControl: false,
      maxBounds: limites,
      maxBoundsViscosity: 1.0,
      minZoom: ${ENCARNACION_ZOOM_MIN},
    }).setView([${centro.lat}, ${centro.lng}], ${zoomInicial});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    ${
      ubicacionUsuario
        ? `L.marker([${ubicacionUsuario.lat}, ${ubicacionUsuario.lng}], {
      icon: L.divIcon({ className: '', html: '<div class="marcador-usuario"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }),
    }).addTo(map).bindPopup('Tu ubicación');`
        : ''
    }

    var puntos = ${JSON.stringify(puntos)};

    puntos.forEach(function (p) {
      var icono = L.divIcon({
        className: '',
        html:
          '<div class="marcador-estado" style="background:' +
          p.color +
          '"><span class="material-icons">' +
          esc(p.icono) +
          '</span></div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      L.marker([p.lat, p.lng], { icon: icono })
        .addTo(map)
        .bindPopup('<b>' + esc(p.tipo) + '</b><br/>' + esc(p.estado) + '<br/>' + esc(p.direccion));
    });
  </script>
</body>
</html>`;
}

/** Leyenda de estados que flota sobre la parte inferior del mapa. */
function Leyenda({ bottomOffset }: { bottomOffset: number }) {
  const theme = useTheme();

  return (
    <View pointerEvents="none" style={[styles.legendFloating, { bottom: bottomOffset }]}>
      {/* Sufijo hex "E6" = ~90% de opacidad, para que se intuya el mapa detrás. */}
      <View style={[styles.legendRow, { backgroundColor: `${theme.background}E6`, borderColor: theme.border }]}>
        {(Object.keys(ESTADO_API_META) as (keyof typeof ESTADO_API_META)[]).map((estado) => (
          <View key={estado} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ESTADO_API_META[estado].color }]}>
              <SymbolView name={ESTADO_API_META[estado].icon} size={9} tintColor="#ffffff" />
            </View>
            <ThemedText type="small" style={styles.legendText}>
              {ESTADO_API_META[estado].label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

export function AllDenunciasMap({ denuncias }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [ubicacionUsuario, setUbicacionUsuario] = useState<Coordenadas | null>(null);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  const html = useMemo(() => construirHtml(denuncias, ubicacionUsuario), [denuncias, ubicacionUsuario]);

  const denunciasCerca = useMemo(() => {
    if (!ubicacionUsuario) return null;
    return denuncias.filter(
      (denuncia) => distanciaMetros(ubicacionUsuario, { lat: denuncia.latitud, lng: denuncia.longitud }) <= RADIO_CERCA_METROS
    );
  }, [denuncias, ubicacionUsuario]);

  async function alternarCercaDeMi() {
    if (ubicacionUsuario) {
      setUbicacionUsuario(null);
      setErrorUbicacion(null);
      return;
    }

    setBuscandoUbicacion(true);
    setErrorUbicacion(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorUbicacion('Sin permiso de ubicación. Activalo para ver los baches cerca tuyo.');
        return;
      }

      const posicion = await Location.getCurrentPositionAsync({});
      setUbicacionUsuario({ lat: posicion.coords.latitude, lng: posicion.coords.longitude });
    } catch {
      setErrorUbicacion('No se pudo obtener tu ubicación. Intentá de nuevo.');
    } finally {
      setBuscandoUbicacion(false);
    }
  }

  function renderBotonCercaDeMi(topOffset: number) {
    return (
      <Pressable
        onPress={alternarCercaDeMi}
        disabled={buscandoUbicacion}
        style={({ pressed }) => [styles.cercaButton, { top: topOffset }, pressed && styles.pressed]}>
        <ThemedView type={ubicacionUsuario ? 'primary' : 'backgroundElement'} style={styles.cercaButtonInner}>
          {buscandoUbicacion ? (
            <ActivityIndicator size="small" color={ubicacionUsuario ? theme.onPrimary : theme.primary} />
          ) : (
            <SymbolView
              name={{ ios: 'location.fill', android: 'my_location', web: 'my_location' }}
              size={14}
              tintColor={ubicacionUsuario ? theme.onPrimary : theme.primary}
            />
          )}
          <ThemedText
            type="small"
            style={{ color: ubicacionUsuario ? theme.onPrimary : theme.primary, fontWeight: '600' }}>
            Cerca de mí
          </ThemedText>
        </ThemedView>
      </Pressable>
    );
  }

  const infoTexto = errorUbicacion ? (
    <ThemedText type="small" style={{ color: '#EB5757' }}>
      {errorUbicacion}
    </ThemedText>
  ) : ubicacionUsuario ? (
    <ThemedText type="small" themeColor="textSecondary">
      {denunciasCerca?.length ?? 0} denuncia{denunciasCerca?.length === 1 ? '' : 's'} a menos de{' '}
      {RADIO_CERCA_METROS / 1000} km tuyo.
    </ThemedText>
  ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <WebView originWhitelist={['*']} source={{ html }} style={styles.map} />

        <Pressable
          onPress={() => setPantallaCompleta(true)}
          hitSlop={8}
          style={({ pressed }) => [styles.expandButton, pressed && styles.pressed]}>
          <ThemedView type="backgroundElement" style={styles.expandButtonInner}>
            <SymbolView
              name={{ ios: 'arrow.up.left.and.arrow.down.right', android: 'fullscreen', web: 'fullscreen' }}
              size={14}
              tintColor={theme.primary}
            />
          </ThemedView>
        </Pressable>

        {renderBotonCercaDeMi(Spacing.two)}

        <Leyenda bottomOffset={Spacing.two} />
      </View>

      {infoTexto}

      <Modal visible={pantallaCompleta} animationType="slide" onRequestClose={() => setPantallaCompleta(false)}>
        <View style={[styles.pantallaCompleta, { backgroundColor: theme.background }]}>
          <View style={styles.mapWrapperCompleto}>
            <WebView originWhitelist={['*']} source={{ html }} style={styles.map} />

            <Pressable
              onPress={() => setPantallaCompleta(false)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.closeButton,
                { top: insets.top + Spacing.two },
                pressed && styles.pressed,
              ]}>
              <ThemedView type="backgroundElement" style={styles.closeButtonInner}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={16} tintColor={theme.text} />
              </ThemedView>
            </Pressable>

            {renderBotonCercaDeMi(insets.top + Spacing.two)}

            <Leyenda bottomOffset={(infoTexto ? Spacing.two : insets.bottom) + Spacing.two} />
          </View>

          {infoTexto && (
            <View style={[styles.pantallaCompletaFooter, { paddingBottom: insets.bottom + Spacing.two }]}>
              {infoTexto}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  mapWrapper: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
    height: 220,
  },
  map: {
    flex: 1,
  },
  cercaButton: {
    position: 'absolute',
    right: Spacing.two,
  },
  expandButton: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
  },
  expandButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pantallaCompleta: {
    flex: 1,
  },
  mapWrapperCompleto: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    left: Spacing.two,
  },
  closeButtonInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pantallaCompletaFooter: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cercaButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.8,
  },
  legendFloating: {
    position: 'absolute',
    left: Spacing.two,
    right: Spacing.two,
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: Spacing.three,
    rowGap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  legendText: {
    fontSize: 12,
    lineHeight: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
