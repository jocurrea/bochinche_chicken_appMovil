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
      // Con edge-to-edge habilitado en app.json, la barra es transparente por defecto.
      // Solo configuramos el estilo de los botones (oscuros) para que contrasten con fondos claros.
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