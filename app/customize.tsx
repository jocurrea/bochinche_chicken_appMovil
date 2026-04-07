import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TOPPINGS = [
  { id: '1', name: 'Tomate', icon: '🍅', price: 0.50 },
  { id: '2', name: 'Cebolla', icon: '🧅', price: 0.30 },
  { id: '3', name: 'Pepinillos', icon: '🥒', price: 0.40 },
  { id: '4', name: 'Tocino', icon: '🥓', price: 1.50 },
];

const SIDES = [
  { id: '1', name: 'Papas', icon: '🍟', price: 2.00 },
  { id: '2', name: 'Ensalada', icon: '🥗', price: 1.50 },
  { id: '3', name: 'Aros Cebolla', icon: '🧅', price: 1.80 },
];

export default function CustomizeScreen() {
  const router = useRouter();
  const item = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [extraPrice, setExtraPrice] = useState(0);

  const basePrice = parseFloat((item.price as string) || "0");
  const totalPrice = ((basePrice + extraPrice) * quantity).toFixed(2);

  const addExtra = (price: number) => setExtraPrice(prev => prev + price);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Sección Superior */}
        <View style={styles.topSection}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="close-outline" size={30} color="#333" />
          </TouchableOpacity>
          
          <Image 
            source={{ uri: (item.image_url as string) || 'https://via.placeholder.com/300' }} 
            style={styles.productImage} 
          />
          
          <View style={styles.sideControls}>
            <Text style={styles.mainTitle}>Personaliza <Text style={styles.subtitle}>tu {item.name} a tu gusto.</Text></Text>
            
            <Text style={styles.label}>Picante</Text>
            <View style={styles.sliderBase}><View style={styles.sliderFill} /></View>
            
            <Text style={styles.label}>Cantidad</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
                <Ionicons name="remove" size={18} color="white" />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={[styles.qtyBtn, {backgroundColor: '#f97316'}]}>
                <Ionicons name="add" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sección de Ingredientes */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Ingredientes Extra</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingBottom: 10}}>
            {TOPPINGS.map(extra => (
              <TouchableOpacity key={extra.id} style={styles.itemCard} onPress={() => addExtra(extra.price)}>
                <Text style={styles.itemIcon}>{extra.icon}</Text>
                <Text style={styles.itemName}>{extra.name}</Text>
                <View style={styles.addIcon}><Ionicons name="add" size={12} color="white" /></View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sección de Acompañantes */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Acompañantes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingBottom: 10}}>
            {SIDES.map(side => (
              <TouchableOpacity key={side.id} style={styles.itemCard} onPress={() => addExtra(side.price)}>
                <Text style={styles.itemIcon}>{side.icon}</Text>
                <Text style={styles.itemName}>{side.name}</Text>
                <View style={styles.addIcon}><Ionicons name="add" size={12} color="white" /></View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      {/* Footer de Confirmación (AJUSTADO PARA NO CHOCAR CON BOTONES) */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}><Text style={styles.currency}>$</Text>{totalPrice}</Text>
        </View>
        <TouchableOpacity 
          style={styles.confirmBtn} 
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.confirmText}>ORDENAR AHORA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 180 }, // Aumentado para que el scroll suba más
  
  topSection: { flexDirection: 'row', padding: 20, paddingTop: 60, alignItems: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  productImage: { width: '55%', height: 220, resizeMode: 'contain' },
  sideControls: { width: '45%', paddingLeft: 10 },
  mainTitle: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { fontWeight: 'normal', color: '#888', fontSize: 13 },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  sliderBase: { height: 4, backgroundColor: '#eee', borderRadius: 2 },
  sliderFill: { height: 4, backgroundColor: '#f97316', borderRadius: 2, width: '60%' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  qtyBtn: { backgroundColor: '#333', width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  qtyValue: { marginHorizontal: 10, fontSize: 16, fontWeight: 'bold' },
  
  section: { 
    paddingHorizontal: 20, 
    marginTop: 30, 
    marginBottom: 10 
  },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  
  itemCard: { 
    backgroundColor: '#fff', 
    width: 90, 
    height: 110, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 15, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 5,
    marginBottom: 5
  },
  itemIcon: { fontSize: 30, marginBottom: 5 },
  itemName: { fontSize: 12, color: '#333', fontWeight: '500' },
  addIcon: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#333', borderRadius: 10, padding: 2 },
  
  // FOOTER CORREGIDO
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 50, // <--- AQUÍ ESTÁ EL CAMBIO: 50px de espacio extra abajo
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -5 }
  },
  totalLabel: { fontSize: 14, color: '#888', marginBottom: 5 },
  totalPrice: { fontSize: 32, fontWeight: 'bold' }, 
  currency: { color: '#f97316', fontSize: 20 },
  confirmBtn: { backgroundColor: '#f97316', paddingHorizontal: 35, paddingVertical: 18, borderRadius: 20 },
  confirmText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});