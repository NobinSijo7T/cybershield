import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import SplashScreen from '@/components/SplashScreen';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { bertDetector } from '@/services/bertDetector';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Initialize app
    const init = async () => {
      try {
        console.log('[App] Starting initialization...');
        
        // Try to initialize BERT in background (don't wait for it)
        console.log('[App] Starting BERT initialization in background...');
        bertDetector.initialize().then(() => {
          console.log('[App] BERT loaded successfully');
        }).catch((error) => {
          console.warn('[App] BERT initialization failed:', error);
          console.log('[App] App will use semantic detector');
        });
        
        // Don't wait for BERT - continue immediately
        const minSplashTime = 1000;
        await new Promise(resolve => setTimeout(resolve, minSplashTime));
        
        setAppReady(true);
        console.log('[App] Initialization complete - app ready');
        console.log('[App] BERT loading continues in background');
      } catch (error) {
        console.error('[App] Initialization error:', error);
        setAppReady(true);
      }
    };

    init();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (!appReady || showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <CustomThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </CustomThemeProvider>
  );
}

