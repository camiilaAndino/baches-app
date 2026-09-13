import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Coordenadas = { latitude: number; longitude: number };

type Props = {
  value: Coordenadas | null;
  onChange: (coords: Coordenadas) => void;
};

const REGION_POR_DEFECTO: Region = {
  latitude: -25.2637,
  longitude: -57.5759,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export function LocationPickerMap({ value, onChange }: Props) {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      usarUbicacionActual();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
    } catch {
      setErrorUbicacion('No se pudo obtener tu ubicación. Marcá el punto tocando el mapa.');
    } finally {
      setBuscandoUbicacion(false);
    }
  }

  function handlePress(event: MapPressEvent) {
    onChange(event.nativeEvent.coordinate);
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={value ? { ...value, latitudeDelta: 0.01, longitudeDelta: 0.01 } : REGION_POR_DEFECTO}
          onPress={handlePress}>
          {value && <Marker coordinate={value} />}
        </MapView>

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
  },
  map: {
    width: '100%',
    height: 200,
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
