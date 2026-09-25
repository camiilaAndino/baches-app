import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Pide permiso y devuelve el Expo push token de este dispositivo, o `null` si
 * no se pudo (simulador, permiso rechazado, o falta el projectId de EAS).
 */
export async function registrarParaNotificaciones(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: statusActual } = await Notifications.getPermissionsAsync();
  let status = statusActual;

  if (status !== 'granted') {
    const resultado = await Notifications.requestPermissionsAsync();
    status = resultado.status;
  }

  if (status !== 'granted') {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('No se pudo obtener el push token: falta el projectId de EAS en app.json.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  return token;
}
