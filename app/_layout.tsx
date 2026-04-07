import 'react-native-gesture-handler'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot } from 'expo-router';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Configuramos la barra del sistema con colores estándar (No transparente)
      NavigationBar.setBackgroundColorAsync('#f2f2f2'); // Gris estándar
      NavigationBar.setButtonStyleAsync('dark');
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
        <Slot />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}