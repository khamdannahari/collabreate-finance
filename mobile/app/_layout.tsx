import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { LogBox, View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments, SplashScreen } from 'expo-router';
import { checkAuth } from '../services/api';
import { useFonts } from 'expo-font';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: Failed prop type',
  'Non-serializable values were found in the navigation state',
]);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    DMSans_400Regular: require('../assets/fonts/DMSans-Regular.ttf'),
    DMSans_500Medium: require('../assets/fonts/DMSans-Medium.ttf'),
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isAuthenticated = await checkAuth();
        const inAuthGroup = segments[0] === '(auth)';

        if (isAuthenticated && inAuthGroup) {
          // Redirect authenticated users from auth screens
          router.replace('/(app)/(tabs)');
        } else if (!isAuthenticated && !inAuthGroup) {
          // Redirect unauthenticated users to login
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/(auth)/login');
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, [segments]);

  if (!fontsLoaded || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
