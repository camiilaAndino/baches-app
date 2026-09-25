import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { DenunciaApi, fetchDenuncias } from '@/services/api';
import { Coordenadas, distanciaMetros } from '@/utils/distancia';

const CLAVE_ALERTAS = 'alertabaches:alertas-cercania';
const CANAL_ANDROID = 'alertas-cercania';

const RADIO_ALERTA_METROS = 300;
/** Un mismo reporte no vuelve a avisar hasta que pase este tiempo. */
const ESPERA_ENTRE_AVISOS_MS = 60 * 60 * 1000;
const REFRESCO_DENUNCIAS_MS = 5 * 60 * 1000;
/** Cada cuántos metros recorridos se vuelve a revisar la cercanía. */
const DISTANCIA_ENTRE_LECTURAS_METROS = 25;

export type ResultadoActivacion = 'ok' | 'sin-ubicacion' | 'sin-notificaciones';

type AlertasCercaniaContextValue = {
  alertasActivadas: boolean;
  activarAlertas: () => Promise<ResultadoActivacion>;
  desactivarAlertas: () => Promise<void>;
};

const AlertasCercaniaContext = createContext<AlertasCercaniaContextValue | null>(null);

/**
 * Busca reportes sin resolver a menos de RADIO_ALERTA_METROS y, si hay alguno
 * que no se avisó recientemente, muestra una notificación con el más cercano.
 */
function revisarCercania(posicion: Coordenadas, denuncias: DenunciaApi[], ultimoAviso: Map<number, number>) {
  const ahora = Date.now();

  const cercanas = denuncias
    .filter((denuncia) => denuncia.estado !== 'resuelta')
    .map((denuncia) => ({
      denuncia,
      distancia: distanciaMetros(posicion, { lat: denuncia.latitud, lng: denuncia.longitud }),
    }))
    .filter(
      ({ denuncia, distancia }) =>
        distancia <= RADIO_ALERTA_METROS && ahora - (ultimoAviso.get(denuncia.id) ?? 0) > ESPERA_ENTRE_AVISOS_MS
    )
    .sort((a, b) => a.distancia - b.distancia);

  if (cercanas.length === 0) return;

  cercanas.forEach(({ denuncia }) => ultimoAviso.set(denuncia.id, ahora));

  const { denuncia, distancia } = cercanas[0];
  const lugar = denuncia.direccion ? `en ${denuncia.direccion}` : 'cerca de tu ubicación';
  const otras = cercanas.length - 1;

  Notifications.scheduleNotificationAsync({
    content: {
      title: `⚠️ Atención: ${denuncia.tipo_denuncia.nombre.toLowerCase()} muy cerca tuyo`,
      body:
        `A ${Math.round(distancia / 10) * 10} m, ${lugar}.` +
        (otras > 0 ? ` Hay ${otras} reporte${otras === 1 ? '' : 's'} más en la zona.` : ''),
      data: { denunciaId: denuncia.id },
      sound: true,
    },
    trigger: Platform.OS === 'android' ? { channelId: CANAL_ANDROID } : null,
  }).catch(() => {});
}

/**
 * Avisa con una notificación local cuando el usuario pasa a menos de
 * RADIO_ALERTA_METROS de un reporte sin resolver. Solo funciona con la app
 * abierta (compatible con Expo Go): al pasar a segundo plano deja de seguir
 * la ubicación.
 */
export function AlertasCercaniaProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [alertasActivadas, setAlertasActivadas] = useState(false);
  const [appActiva, setAppActiva] = useState(AppState.currentState === 'active');

  const denunciasRef = useRef<DenunciaApi[]>([]);
  const ultimoAvisoRef = useRef(new Map<number, number>());
  const ultimaPosicionRef = useRef<Coordenadas | null>(null);

  const vigilando = Platform.OS !== 'web' && alertasActivadas && !!usuario && appActiva;

  useEffect(() => {
    AsyncStorage.getItem(CLAVE_ALERTAS).then((valor) => setAlertasActivadas(valor === 'true'));
  }, []);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) => setAppActiva(estado === 'active'));
    return () => suscripcion.remove();
  }, []);

  // Al tocar la notificación, abre el detalle del reporte.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const suscripcion = Notifications.addNotificationResponseReceivedListener((respuesta) => {
      const denunciaId = respuesta.notification.request.content.data?.denunciaId;
      if (typeof denunciaId === 'number') {
        router.push({ pathname: '/denuncia/[id]', params: { id: String(denunciaId) } });
      }
    });
    return () => suscripcion.remove();
  }, []);

  useEffect(() => {
    if (!vigilando) return;

    const cargar = () =>
      fetchDenuncias()
        .then((data) => {
          denunciasRef.current = data;
          // Si la ubicación llegó antes que la lista, se revisa ahora; si no,
          // estando quieto no se volvería a revisar hasta moverse.
          if (ultimaPosicionRef.current) {
            revisarCercania(ultimaPosicionRef.current, data, ultimoAvisoRef.current);
          }
        })
        .catch(() => {
          // sin conexión: se sigue usando la última lista cargada
        });

    cargar();
    const intervalo = setInterval(cargar, REFRESCO_DENUNCIAS_MS);
    return () => clearInterval(intervalo);
  }, [vigilando]);

  useEffect(() => {
    if (!vigilando) return;

    let suscripcion: Location.LocationSubscription | null = null;
    let cancelado = false;

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: DISTANCIA_ENTRE_LECTURAS_METROS },
      (posicion) => {
        ultimaPosicionRef.current = { lat: posicion.coords.latitude, lng: posicion.coords.longitude };
        revisarCercania(ultimaPosicionRef.current, denunciasRef.current, ultimoAvisoRef.current);
      }
    )
      .then((sub) => {
        if (cancelado) sub.remove();
        else suscripcion = sub;
      })
      .catch(() => {
        // permiso de ubicación revocado desde los ajustes del teléfono
      });

    return () => {
      cancelado = true;
      suscripcion?.remove();
    };
  }, [vigilando]);

  async function activarAlertas(): Promise<ResultadoActivacion> {
    const ubicacion = await Location.requestForegroundPermissionsAsync();
    if (ubicacion.status !== 'granted') return 'sin-ubicacion';

    const notificaciones = await Notifications.requestPermissionsAsync();
    if (notificaciones.status !== 'granted') return 'sin-notificaciones';

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
        name: 'Reportes cercanos',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    await AsyncStorage.setItem(CLAVE_ALERTAS, 'true');
    setAlertasActivadas(true);
    return 'ok';
  }

  async function desactivarAlertas() {
    await AsyncStorage.removeItem(CLAVE_ALERTAS);
    setAlertasActivadas(false);
    // Al volver a activarlas, los reportes cercanos avisan de nuevo sin esperar la hora.
    ultimoAvisoRef.current.clear();
  }

  return (
    <AlertasCercaniaContext.Provider value={{ alertasActivadas, activarAlertas, desactivarAlertas }}>
      {children}
    </AlertasCercaniaContext.Provider>
  );
}

export function useAlertasCercania() {
  const context = useContext(AlertasCercaniaContext);
  if (!context) {
    throw new Error('useAlertasCercania debe usarse dentro de <AlertasCercaniaProvider>');
  }
  return context;
}
