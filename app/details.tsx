import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetails() {
  const router = useRouter();
  const item = useLocalSearchParams(); 
  const [quantity, setQuantity] = useState(1);

  // PRECIO DE RESPALDO: Si no viene precio, ponemos 0 para que no explote
  const price = parseFloat((item.price as string) || "0");

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: (item.image_url as string) || 'https://via.placeholder.com/300' }} 
          style={styles.mainImage} 
        />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.name || "Producto sin nombre"}</Text>
        <Text style={styles.description}>
          {item.description || "Deliciosa opción preparada por J/N DEV Food."}
        </Text>

        {/* BOTÓN PARA IR A CUSTOMIZE */}
        <TouchableOpacity 
          style={styles.customizeCard}
          onPress={() => router.push({ pathname: '/customize', params: item })}
        >
          <View style={styles.customizeIconBox}>
            <Ionicons name="construct-outline" size={24} color="white" />
          </View>
          <View style={styles.customizeTextContent}>
            <Text style={styles.customizeTitle}>¿Quieres armar un combo?</Text>
            <Text style={styles.customizeSub}>Toca aquí para personalizar</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#f97316" />
        </TouchableOpacity>

        <View style={styles.quantityRow}>
          <Text style={styles.optionTitle}>Cantidad</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
              <Ionicons name="remove" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={[styles.qtyBtn, {backgroundColor: '#f97316'}]}>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.priceBadge}>
          <Text style={styles.footerPrice}>${(price * quantity).toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.orderBtn}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.orderBtnText}>ORDENAR AHORA</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: { width: '100%', height: 320, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
  mainImage: { width: '80%', height: '80%', resizeMode: 'contain' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', padding: 10, borderRadius: 15, elevation: 5 },
  infoContainer: { padding: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  description: { color: '#666', lineHeight: 22, fontSize: 15, marginBottom: 20 },
  customizeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#FED7D7', marginBottom: 20 },
  customizeIconBox: { backgroundColor: '#f97316', padding: 10, borderRadius: 12 },
  customizeTextContent: { flex: 1, marginLeft: 15 },
  customizeTitle: { fontWeight: 'bold', color: '#333', fontSize: 15 },
  customizeSub: { color: '#f97316', fontSize: 12, fontWeight: '600' },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  optionTitle: { fontWeight: 'bold', fontSize: 16 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 15, padding: 5 },
  qtyBtn: { backgroundColor: '#333', width: 35, height: 35, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  qtyText: { marginHorizontal: 15, fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', padding: 25, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 20 },
  priceBadge: { backgroundColor: '#f97316', paddingHorizontal: 25, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  footerPrice: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  orderBtn: { flex: 1, backgroundColor: '#333', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  orderBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});