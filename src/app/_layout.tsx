import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LockScreen } from '@/components/lock-screen';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <RootNavigation />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigation() {
  const { usuario, cargandoSesion, bloqueado } = useAuth();

  if (cargandoSesion) {
    return null;
  }

  if (usuario && bloqueado) {
    return <LockScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!usuario}>
        <Stack.Screen name="index" />
        <Stack.Screen name="crear-denuncia" options={{ presentation: 'modal' }} />
        <Stack.Screen name="perfil" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notificaciones" options={{ presentation: 'modal' }} />
        <Stack.Screen name="denuncia/[id]" />
      </Stack.Protected>

      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
        <Stack.Screen name="recuperar-password" />
      </Stack.Protected>
    </Stack>
  );
}
