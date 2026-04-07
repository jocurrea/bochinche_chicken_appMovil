import React from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
        }}
      />
      {/* ESPACIADOR PARA EL FAB DEL CARRITO EN EL ÍNDICE 2 */}
      <Tabs.Screen
        name="cart_placeholder"
        options={{
          title: '',
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Soporte',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
        }}
      />
    </Tabs>
  );
}
