import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ESTADO_API_META } from '@/constants/denuncias';
import { ENCARNACION_LIMITES, ENCARNACION_ZOOM_MIN } from '@/constants/mapa';
import { Spacing } from '@/constants/theme';
import { DenunciaApi } from '@/services/api';

type Props = {
  denuncia: DenunciaApi;
};

function construirHtml(denuncia: DenunciaApi): string {
  const color = ESTADO_API_META[denuncia.estado].color;
  const icono = ESTADO_API_META[denuncia.estado].icon.web;

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .marcador-estado {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .marcador-estado .material-icons {
      font-size: 16px;
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
    }).setView([${denuncia.latitud}, ${denuncia.longitud}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    var icono = L.divIcon({
      className: '',
      html: '<div class="marcador-estado" style="background:${color}"><span class="material-icons">${icono}</span></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    L.marker([${denuncia.latitud}, ${denuncia.longitud}], { icon: icono }).addTo(map);
  </script>
</body>
</html>`;
}

export function DenunciaMap({ denuncia }: Props) {
  const html = useMemo(() => construirHtml(denuncia), [denuncia]);

  return (
    <View style={styles.mapWrapper}>
      <WebView originWhitelist={['*']} source={{ html }} style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrapper: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
    height: 200,
  },
  map: {
    flex: 1,
  },
});
