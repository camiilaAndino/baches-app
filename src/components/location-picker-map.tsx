import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ENCARNACION_CENTRO, ENCARNACION_LIMITES, ENCARNACION_ZOOM_MIN } from '@/constants/mapa';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Coordenadas = { latitude: number; longitude: number };

type Props = {
  value: Coordenadas | null;
  onChange: (coords: Coordenadas) => void;
};

const REGION_POR_DEFECTO = { latitude: ENCARNACION_CENTRO.lat, longitude: ENCARNACION_CENTRO.lng };

function construirHtml(inicial: Coordenadas | null): string {
  const centro = inicial ?? REGION_POR_DEFECTO;
  const marcadorInicialJs = inicial
    ? `L.marker([${inicial.latitude}, ${inicial.longitude}]).addTo(map);`
    : 'null;';

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var limites = L.latLngBounds(${JSON.stringify(ENCARNACION_LIMITES)});
    var map = L.map('map', {
      attributionControl: false,
      maxBounds: limites,
      maxBoundsViscosity: 1.0,
      minZoom: ${ENCARNACION_ZOOM_MIN},
    }).setView([${centro.latitude}, ${centro.longitude}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var marker = ${marcadorInicialJs}

    function moverMarcador(lat, lng) {
      var latlng = L.latLng(lat, lng);
      if (marker) { map.removeLayer(marker); }
      marker = L.marker(latlng).addTo(map);
      map.setView(latlng, 16);
    }

    map.on('click', function (e) {
      if (!limites.contains(e.latlng)) return;
      moverMarcador(e.latlng.lat, e.latlng.lng);
      window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng }));
    });
  </script>
</body>
</html>`;
}

export function LocationPickerMap({ value, onChange }: Props) {
  const theme = useTheme();
  const webviewRef = useRef<WebView>(null);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);

  // El HTML solo se arma una vez con el punto inicial; los cambios posteriores
  // (tocar el mapa o "usar mi ubicación") se aplican inyectando JS, no
  // reconstruyendo la página completa.
  const html = useMemo(() => construirHtml(value), []); // eslint-disable-line react-hooks/exhaustive-deps

  async function usarUbicacionActual() {
    setBuscandoUbicacion(true);
    setErrorUbicacion(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorUbicacion('Sin permiso de ubicación. Marcá el punto tocando el mapa.');
        return;
      }

      const posicion = await Location.getCurrentPositionAsync({});
      const coords = { latitude: posicion.coords.latitude, longitude: posicion.coords.longitude };
      onChange(coords);
      webviewRef.current?.injectJavaScript(`moverMarcador(${coords.latitude}, ${coords.longitude}); true;`);
    } catch {
      setErrorUbicacion('No se pudo obtener tu ubicación. Marcá el punto tocando el mapa.');
    } finally {
      setBuscandoUbicacion(false);
    }
  }

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const { lat, lng } = JSON.parse(event.nativeEvent.data);
      onChange({ latitude: lat, longitude: lng });
    } catch {
      // ignorar mensajes inesperados
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapContainer}>
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMessage}
          style={styles.map}
        />

        <Pressable
          onPress={usarUbicacionActual}
          hitSlop={8}
          style={({ pressed }) => [styles.locateButton, pressed && styles.pressed]}>
          <ThemedView type="backgroundElement" style={styles.locateButtonInner}>
            {buscandoUbicacion ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <SymbolView
                name={{ ios: 'location.fill', android: 'my_location', web: 'my_location' }}
                size={16}
                tintColor={theme.primary}
              />
            )}
          </ThemedView>
        </Pressable>
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        {errorUbicacion ?? (value
          ? `Punto seleccionado: ${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
          : 'Tocá el mapa para marcar el punto exacto')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  mapContainer: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
    height: 200,
  },
  map: {
    flex: 1,
  },
  locateButton: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
  },
  locateButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
