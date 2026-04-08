import React from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  Dimensions, Platform, Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function RewardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 15 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Puntos Bochinche</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TARJETA DE PUNTOS */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsIconBox}>
            <Ionicons name="star" size={32} color="#f97316" />
          </View>
          <Text style={styles.pointsNumber}>850 pts</Text>
          <Text style={styles.pointsValue}>Equivale a $8.50 para canjear</Text>
        </View>

        {/* RETO DEL MES */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeTitle}>Meta del Mes: ¡Gana un Combo!</Text>
            <Ionicons name="trophy" size={20} color="#f97316" />
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '75%' }]} />
            </View>
            <Text style={styles.progressText}>75% completado</Text>
          </View>

          <Text style={styles.challengeDetail}>
            Has consumido <Text style={styles.boldText}>$75</Text> de <Text style={styles.boldText}>$100</Text> este mes. ¡Solo te faltan $25 para tu premio!
          </Text>
        </View>

        {/* SECCIÓN CANJEAR */}
        <View style={styles.redeemSection}>
          <Text style={styles.sectionTitle}>Canjear Premios</Text>
          
          {/* ITEM 1 - BLOQUEADO */}
          <View style={styles.redeemItem}>
            <View style={styles.itemImageContainer}>
              <Image 
                source={require('../assets/images/bochinche/chicken_v2.png')} 
                style={[styles.itemImage, { opacity: 0.6 }]} 
              />
              <View style={styles.lockOverlay}>
                <Ionicons name="lock-closed" size={20} color="white" />
              </View>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>Combo Bam Bam</Text>
              <Text style={styles.itemCost}>1000 pts</Text>
              <TouchableOpacity style={styles.btnDisabled} disabled>
                <Text style={styles.btnTextDisabled}>Faltan 150 pts</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ITEM 2 - DISPONIBLE */}
          <View style={styles.redeemItem}>
            <View style={styles.itemImageContainer}>
              <Image 
                source={require('../assets/images/bochinche/french_fries_v2.png')} 
                style={styles.itemImage} 
              />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>Ración de Papas</Text>
              <Text style={styles.itemCost}>300 pts</Text>
              <TouchableOpacity style={styles.btnActive}>
                <Text style={styles.btnTextActive}>CANJEAR AHORA</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },
  pointsCard: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    marginBottom: 25,
  },
  pointsIconBox: {
    width: 70,
    height: 70,
    backgroundColor: '#fff7ed',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  pointsNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#2D1E1E',
  },
  pointsValue: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '700',
    marginTop: 5,
  },
  challengeCard: {
    backgroundColor: '#FEF3C7', // Fondo crema/tan como solicitado
    borderRadius: 25,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  challengeTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#92400E',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f97316',
    textAlign: 'right',
  },
  challengeDetail: {
    fontSize: 14,
    color: '#4B3621',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  redeemSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2D1E1E',
    marginBottom: 20,
  },
  redeemItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 20,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D1E1E',
  },
  itemCost: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  btnActive: {
    backgroundColor: '#f97316',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnTextActive: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  btnDisabled: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnTextDisabled: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
