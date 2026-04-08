import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  // Función para cargar la cantidad real del carrito
  const updateCartCount = async () => {
    try {
      const cartData = await AsyncStorage.getItem('bochinche_cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        const totalItems = cart.reduce((acc: number, item: any) => acc + item.qty, 0);
        setCartCount(totalItems);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error("Error al cargar contador:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    // Carga inicial
    updateCartCount();

    // Escuchar actualizaciones dinámicas
    const subscription = DeviceEventEmitter.addListener('cartUpdated', updateCartCount);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={[styles.navContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            if (route.name === 'home') {
              router.replace('/selection');
              return;
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Icon Logic
          const name = route.name.toLowerCase();
          let iconName: any = 'home-outline';
          if (name === 'home') iconName = isFocused ? 'home' : 'home-outline';
          else if (name === 'profile') iconName = isFocused ? 'person' : 'person-outline';
          else if (name === 'support') iconName = isFocused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline';
          else if (name === 'favorites') iconName = isFocused ? 'heart' : 'heart-outline';

          // Cart Spacer
          if (index === 2) return <View key="spacer" style={{ width: 60 }} />;

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
              <Ionicons name={iconName} size={24} color={isFocused ? 'white' : 'rgba(255,255,255,0.7)'} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* BOTÓN FLOTANTE (FAB) DEL CARRITO */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: Math.max(insets.bottom, 10) + 22 }]} 
        activeOpacity={0.9} 
        onPress={() => router.push('/cart')}
      >
        <Ionicons name="cart" size={30} color="white" />
        {cartCount > 0 && (
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#ebebeb',
    paddingTop: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f97316',
    width: '92%',
    height: 60,
    borderRadius: 30,
    marginTop: -25, 
    marginBottom: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    zIndex: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: { 
    position: 'absolute', 
    backgroundColor: '#f97316', 
    width: 66, 
    height: 66, 
    borderRadius: 33, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 5, 
    borderColor: '#fff', 
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 999, // Máxima prioridad
  },
  fabBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#333', 
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 1000,
    paddingHorizontal: 4,
  },
  fabBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
