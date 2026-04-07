import React, { useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity,  
  Platform, Dimensions 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, setStatusBarStyle } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('dark');
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Favoritos</Text>
        <View style={{ width: 45 }} />
      </View>

      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={100} color="#f97316" style={{ opacity: 0.2 }} />
        <Text style={styles.text}>¡Aún no hay favoritos! ❤️</Text>
        <Text style={styles.subText}>Próximamente verás tus platos favoritos aquí.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fcfcfc' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 25, 
    paddingBottom: 25,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 45,
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: '#2D1E1E' 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.1,
  },
  text: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#2D1E1E',
    marginTop: 20
  },
  subText: { 
    fontSize: 16, 
    color: '#888', 
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 50
  }
});
