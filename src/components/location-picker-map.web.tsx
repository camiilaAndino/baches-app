import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Coordenadas = { latitude: number; longitude: number };

type Props = {
  value: Coordenadas | null;
  onChange: (coords: Coordenadas) => void;
};

/**
 * `react-native-webview` (usado para el mapa Leaflet en la app instalada) no
 * tiene implementación para web, así que en el navegador ofrecemos
 * geolocalización + carga manual de coordenadas en vez de un mapa interactivo.
 */
export function LocationPickerMap({ value, onChange }: Props) {
  const theme = useTheme();
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latTexto, setLatTexto] = useState(value ? String(value.latitude) : '');
  const [lngTexto, setLngTexto] = useState(value ? String(value.longitude) : '');

  async function usarUbicacionActual() {
    setBuscandoUbicacion(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Sin permiso de ubicación. Ingresá las coordenadas manualmente.');
        return;
      }

      const posicion = await Location.getCurrentPositionAsync({});
      const coords = { latitude: posicion.coords.latitude, longitude: posicion.coords.longitude };
      setLatTexto(String(coords.latitude));
      setLngTexto(String(coords.longitude));
      onChange(coords);
    } catch {
      setError('No se pudo obtener tu ubicación. Ingresá las coordenadas manualmente.');
    } finally {
      setBuscandoUbicacion(false);
    }
  }

  function aplicarCoordenadasManuales() {
    const latitude = Number(latTexto);
    const longitude = Number(lngTexto);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setError('Las coordenadas deben ser números válidos.');
      return;
    }
    setError(null);
    onChange({ latitude, longitude });
  }

  return (
    <View style={styles.wrapper}>
      <ThemedView type="backgroundElement" style={styles.noticeBox}>
        <SymbolView
          name={{ ios: 'map', android: 'map', web: 'map' }}
          size={16}
          tintColor={theme.textSecondary}
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.noticeText}>
          El mapa interactivo está disponible en la app instalada. Acá podés usar tu ubicación actual o cargar las coordenadas a mano.
        </ThemedText>
      </ThemedView>

      <Pressable
        onPress={usarUbicacionActual}
        style={({ pressed }) => [styles.locateRow, pressed && styles.pressed]}>
        <ThemedView type="backgroundElement" style={styles.locateButton}>
          {buscandoUbicacion ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <SymbolView
              name={{ ios: 'location.fill', android: 'my_location', web: 'my_location' }}
              size={16}
              tintColor={theme.primary}
            />
          )}
          <ThemedText type="small" style={{ color: theme.primary, fontWeight: '600' }}>
            Usar mi ubicación
          </ThemedText>
        </ThemedView>
      </Pressable>

      <View style={styles.coordsRow}>
        <ThemedView type="backgroundElement" style={styles.coordInputWrapper}>
          <TextInput
            value={latTexto}
            onChangeText={setLatTexto}
            onEndEditing={aplicarCoordenadasManuales}
            placeholder="Latitud"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numbers-and-punctuation"
            style={[styles.input, { color: theme.text }]}
          />
        </ThemedView>
        <ThemedView type="backgroundElement" style={styles.coordInputWrapper}>
          <TextInput
            value={lngTexto}
            onChangeText={setLngTexto}
            onEndEditing={aplicarCoordenadasManuales}
            placeholder="Longitud"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numbers-and-punctuation"
            style={[styles.input, { color: theme.text }]}
          />
        </ThemedView>
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        {error ?? (value
          ? `Punto seleccionado: ${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
          : 'Todavía no marcaste un punto.')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  noticeBox: {
    flexDirection: 'row',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  locateRow: {
    alignSelf: 'flex-start',
  },
  locateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  coordInputWrapper: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  input: {
    fontSize: 14,
    padding: 0,
  },
});
