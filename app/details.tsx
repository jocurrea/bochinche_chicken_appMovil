import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Platform, DeviceEventEmitter } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProductDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const item = useLocalSearchParams(); 
  const [quantity, setQuantity] = useState(1);

  // Lógica para resolver la imagen (local vs remota)
  const resolveImage = () => {
    if (item.local_image) {
      // Si recibimos un ID numérico serializado como string, lo convertimos de vuelta a number
      const localId = parseInt(item.local_image as string);
      return !isNaN(localId) ? localId : { uri: item.local_image as string };
    }
    return { uri: (item.image_url as string) || 'https://via.placeholder.com/300' };
  };

  const imageSource = resolveImage();

  // PRECIO DE RESPALDO: Si no viene precio, ponemos 0 para que no explote
  const price = parseFloat((item.price as string) || "0");

  const handleAddToCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('bochinche_cart');
      let cart = cartData ? JSON.parse(cartData) : [];

      const newItem = {
        id: item.id as string,
        name: item.name as string,
        price: price,
        qty: quantity,
        brand: item.brand as string || 'Chicken',
        color: (item.brand as string)?.toLowerCase() === 'grill' ? '#38241b' : '#f97316',
        image: item.local_image ? item.local_image : ((item.image_url as string) || 'https://via.placeholder.com/300')
      };

      const existingIndex = cart.findIndex((i: any) => i.id === newItem.id);
      if (existingIndex > -1) {
        cart[existingIndex].qty += quantity;
      } else {
        cart.push(newItem);
      }

      await AsyncStorage.setItem('bochinche_cart', JSON.stringify(cart));
      
      // Notificar a la barra de menú para que actualice el contador
      DeviceEventEmitter.emit('cartUpdated');
      
      router.push('/cart');
    } catch (error) {
      console.error("Error al añadir al carrito:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={imageSource} 
          style={styles.mainImage} 
        />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.name || "Producto"}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {item.description || "Deliciosa opción preparada por J/N DEV Food."}
          </Text>

          {/* BOTÓN PARA IR A CUSTOMIZE - Para BBQ y Hamburguesas */}
          {(item.name?.toString().toLowerCase().includes('bbq') || 
            item.name?.toString().toLowerCase().includes('hamburguesa') ||
            item.name?.toString().toLowerCase().includes('crispy') ||
            item.name?.toString().toLowerCase().includes('grill') ||
            item.name?.toString().toLowerCase().includes('mixta') ||
            item.name?.toString().toLowerCase().includes('mini') ||
            item.name?.toString().toLowerCase().includes('cachapa') ||
            item.name?.toString().toLowerCase().includes('ligera')) && (
            <TouchableOpacity 
              style={styles.customizeCard}
              onPress={() => router.push({ pathname: '/customize', params: item })}
            >
              <View style={styles.customizeIconBox}>
                <Ionicons name="construct-outline" size={20} color="white" />
              </View>
              <View style={styles.customizeTextContent}>
                <Text style={styles.customizeTitle}>Toca aquí para personalizar</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#f97316" />
            </TouchableOpacity>
          )}

          <View style={styles.quantityRow}>
            <Text style={styles.optionTitle}>Cantidad</Text>
            <View style={styles.qtyControls}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
                <Ionicons name="remove" size={18} color="white" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={[styles.qtyBtn, {backgroundColor: '#f97316'}]}>
                <Ionicons name="add" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
          <View style={styles.priceBadge}>
            <Text style={styles.footerPrice}>${(price * quantity).toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.orderBtn}
            onPress={handleAddToCart}
          >
            <Text style={styles.orderBtnText}>ORDENAR AHORA</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: { width: '100%', height: 320, backgroundColor: '#F9FAFB' },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', padding: 10, borderRadius: 15, elevation: 5 },
  mainContent: { flex: 1, justifyContent: 'space-between' },
  infoContainer: { paddingHorizontal: 25, paddingTop: 15, flexShrink: 1 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  description: { color: '#666', lineHeight: 22, fontSize: 14, marginBottom: 15 },
  customizeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#FED7D7', marginBottom: 15 },
  customizeIconBox: { backgroundColor: '#f97316', padding: 8, borderRadius: 10 },
  customizeTextContent: { flex: 1, marginLeft: 12 },
  customizeTitle: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  customizeSub: { color: '#f97316', fontSize: 12, fontWeight: '600' },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  optionTitle: { fontWeight: 'bold', fontSize: 16 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 15, padding: 4 },
  qtyBtn: { backgroundColor: '#333', width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  qtyText: { marginHorizontal: 12, fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', paddingHorizontal: 25, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: 'white' },
  priceBadge: { backgroundColor: '#f97316', paddingHorizontal: 20, height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  footerPrice: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  orderBtn: { flex: 1, backgroundColor: '#333', height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  orderBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});