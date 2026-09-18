import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { ESTADO_API_META } from '@/constants/denuncias';
import { ENCARNACION_CENTRO, ENCARNACION_LIMITES, ENCARNACION_ZOOM_MIN } from '@/constants/mapa';
import { Spacing } from '@/constants/theme';
import { DenunciaApi } from '@/services/api';

type Props = {
  denuncias: DenunciaApi[];
};

function construirHtml(denuncias: DenunciaApi[]): string {
  const puntos = denuncias.map((denuncia) => ({
    lat: denuncia.latitud,
    lng: denuncia.longitud,
    color: ESTADO_API_META[denuncia.estado].color,
    icono: ESTADO_API_META[denuncia.estado].icon.web,
    tipo: denuncia.tipo_denuncia.nombre,
    estado: ESTADO_API_META[denuncia.estado].label,
    direccion: denuncia.direccion ?? 'Sin dirección',
  }));

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
  </style>
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
    }).setView([${ENCARNACION_CENTRO.lat}, ${ENCARNACION_CENTRO.lng}], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    var puntos = ${JSON.stringify(puntos)};
    var marcadores = [];

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

      var marcador = L.marker([p.lat, p.lng], { icon: icono })
        .addTo(map)
        .bindPopup('<b>' + esc(p.tipo) + '</b><br/>' + esc(p.estado) + '<br/>' + esc(p.direccion));
      marcadores.push(marcador);
    });

    if (marcadores.length > 0) {
      var grupo = L.featureGroup(marcadores);
      map.fitBounds(grupo.getBounds().pad(0.3));
    }
  </script>
</body>
</html>`;
}

export function AllDenunciasMap({ denuncias }: Props) {
  const html = useMemo(() => construirHtml(denuncias), [denuncias]);

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <WebView originWhitelist={['*']} source={{ html }} style={styles.map} />
      </View>

      <View style={styles.legendRow}>
        {(Object.keys(ESTADO_API_META) as (keyof typeof ESTADO_API_META)[]).map((estado) => (
          <View key={estado} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ESTADO_API_META[estado].color }]}>
              <SymbolView name={ESTADO_API_META[estado].icon} size={9} tintColor="#ffffff" />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {ESTADO_API_META[estado].label}
            </ThemedText>
          </View>
        ))}
      </View>
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
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
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
