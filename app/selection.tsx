import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, 
  Platform, StatusBar, SafeAreaView, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function SelectionScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('Usuario');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const YOUR_IP = '192.168.250.1:8000';

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
            const res = await fetch(`http://${YOUR_IP}/api/user`, {
               headers: { Authorization: `Bearer ${token}` }
            });
            const uData = await res.json();
            if (uData.name) setUserName(uData.name);
            if (uData.avatar) {
                const fullUrl = uData.avatar.startsWith('http') 
                  ? uData.avatar 
                  : `http://${YOUR_IP}${uData.avatar.startsWith('/') ? '' : '/'}${uData.avatar}`;
                setUserAvatar(fullUrl);
            }
          }
        } catch (error) {
          console.log("Error cargando usuario:", error);
        }
      };
      fetchUser();
    }, [])
  );

  const BrandCard = ({ 
    brand, 
    title, 
    desc, 
    logo, 
    bgColor, 
    textColor, 
    descColor,
    btnColor 
  }: any) => (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={styles.logoCircle}>
        <Image source={logo} style={styles.logoImage} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.cardDesc, { color: descColor }]}>{desc}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.entrarBtn, { backgroundColor: btnColor }]}
        onPress={async () => {
          await AsyncStorage.setItem('lastBrand', brand);
          router.push({ pathname: '/home', params: { brand } });
        }}
      >
        <Text style={styles.entrarBtnText}>VER MENÚ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>¡Hola {userName.split(' ')[0]}!</Text>
            <Text style={styles.tagline}>¿Qué vamos a comer hoy?</Text>
          </View>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, {backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center'}]}>
              <Ionicons name="person" size={24} color="#ccc" />
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BrandCard 
          brand="chicken"
          title="BOCHINCHE CHICKEN"
          desc="POLLO FRITO, COMBOS, TENDERS"
          logo={require('../assets/images/logos/chicken.png')}
          bgColor="#FFFDE7" 
          textColor="#f97316" 
          descColor="#888"
          btnColor="#f97316"
        />

        <View style={{ marginTop: 10 }}>
          <BrandCard 
            brand="grill"
            title="BOCHINCHE GRILL"
            desc="PARRILLAS, CACHAPAS, BURGERS"
            logo={require('../assets/images/logos/grill.png')}
            bgColor="#2D1E1E" 
            textColor="#FFD700" 
            descColor="#AAA"
            btnColor="#f97316"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 25, paddingTop: Platform.OS === 'android' ? 40 : 10, marginBottom: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  tagline: { fontSize: 16, color: '#888', marginTop: 2 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  scrollContent: { paddingHorizontal: 25, flexGrow: 1, justifyContent: 'center', paddingBottom: 40 },
  card: { 
    width: '100%', 
    height: (height * 0.35), 
    marginBottom: 20, 
    borderRadius: 35, 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  logoCircle: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    backgroundColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoImage: { width: 80, height: 80, resizeMode: 'contain' },
  textContainer: { alignItems: 'center', width: '100%', marginBottom: 15 },
  cardTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase' },
  cardDesc: { fontSize: 11, fontWeight: '700', marginTop: 4, letterSpacing: 1, textAlign: 'center', color: '#666' },
  entrarBtn: { width: '60%', height: 48, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3, marginTop: 10 },
  entrarBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
