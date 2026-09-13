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
 * react-native-maps no soporta web. En esta plataforma ofrecemos GPS del
 * navegador + edición manual de coordenadas; el mapa interactivo se usa en
 * la app nativa (ver location-picker-map.tsx).
 */
export function LocationPickerMap({ value, onChange }: Props) {
  const theme = useTheme();
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);

  async function usarUbicacionActual() {
    setBuscandoUbicacion(true);
    setErrorUbicacion(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorUbicacion('Sin permiso de ubicación. Ingresá las coordenadas manualmente.');
        return;
      }
      const posicion = await Location.getCurrentPositionAsync({});
      onChange({ latitude: posicion.coords.latitude, longitude: posicion.coords.longitude });
    } catch {
      setErrorUbicacion('No se pudo obtener tu ubicación. Ingresá las coordenadas manualmente.');
    } finally {
      setBuscandoUbicacion(false);
    }
  }

  function actualizarCampo(campo: 'latitude' | 'longitude', texto: string) {
    const numero = Number(texto.replace(',', '.'));
    onChange({
      latitude: campo === 'latitude' ? numero : (value?.latitude ?? 0),
      longitude: campo === 'longitude' ? numero : (value?.longitude ?? 0),
    });
  }

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={usarUbicacionActual} style={({ pressed }) => pressed && styles.pressed}>
        <ThemedView type="backgroundElement" style={styles.locateRow}>
          {buscandoUbicacion ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <SymbolView
              name={{ ios: 'location.fill', android: 'my_location', web: 'my_location' }}
              size={16}
              tintColor={theme.primary}
            />
          )}
          <ThemedText type="small" style={{ color: theme.primary }}>
            Usar mi ubicación actual
          </ThemedText>
        </ThemedView>
      </Pressable>

      <View style={styles.coordsRow}>
        <ThemedView type="backgroundElement" style={styles.coordInputWrapper}>
          <ThemedText type="small" themeColor="textSecondary">
            Latitud
          </ThemedText>
          <TextInput
            value={value ? String(value.latitude) : ''}
            onChangeText={(texto) => actualizarCampo('latitude', texto)}
            placeholder="-25.2637"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            style={[styles.coordInput, { color: theme.text }]}
          />
        </ThemedView>
        <ThemedView type="backgroundElement" style={styles.coordInputWrapper}>
          <ThemedText type="small" themeColor="textSecondary">
            Longitud
          </ThemedText>
          <TextInput
            value={value ? String(value.longitude) : ''}
            onChangeText={(texto) => actualizarCampo('longitude', texto)}
            placeholder="-57.5759"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            style={[styles.coordInput, { color: theme.text }]}
          />
        </ThemedView>
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        {errorUbicacion ?? 'El mapa interactivo está disponible en la app móvil.'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  locateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  coordInputWrapper: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  coordInput: {
    fontSize: 14,
    padding: 0,
  },
});
