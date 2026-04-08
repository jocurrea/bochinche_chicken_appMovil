import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  ScrollView, Platform, DeviceEventEmitter, Animated 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOST_POPULAR = [
  { 
    id: 'mp1', 
    name: 'Papas Fritas XL', 
    price: 2.50, 
    image: require('../assets/images/bochinche/french_fries_v2.png'),
    brand: 'Grill',
    color: '#f97316'
  },
  { 
    id: 'mp2', 
    name: 'Refresco 1.5L', 
    price: 2.00, 
    image: require('../assets/images/bochinche/drinks_coke.png'),
    brand: 'Bebidas',
    color: '#38241b'
  },
  { 
    id: 'mp4', 
    name: 'Hamburguesa Crispy', 
    price: 5.99, 
    image: require('../assets/images/bochinche/burger_crispy.png'),
    brand: 'Grill',
    color: '#f97316'
  },
  { 
    id: 'mp5', 
    name: 'Parrilla Popular', 
    price: 4.99, 
    image: require('../assets/images/bochinche/parrilla_popular.png'),
    brand: 'Grill',
    color: '#38241b'
  }
];

export default function ProductDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const item = useLocalSearchParams(); 
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Lógica para resolver la imagen (local vs remota)
  const resolveImage = () => {
    if (item.local_image) {
      const localId = parseInt(item.local_image as string);
      return !isNaN(localId) ? localId : { uri: item.local_image as string };
    }
    return { uri: (item.image_url as string) || 'https://via.placeholder.com/300' };
  };

  const imageSource = resolveImage();
  const price = parseFloat((item.price as string) || "0");

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

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
      DeviceEventEmitter.emit('cartUpdated');
      router.push('/cart');
    } catch (error) {
      console.error("Error al añadir al carrito:", error);
    }
  };

  const handleAddUpsell = async (extra: any) => {
    try {
      const cartData = await AsyncStorage.getItem('bochinche_cart');
      let cart = cartData ? JSON.parse(cartData) : [];

      const existingIndex = cart.findIndex((i: any) => i.id === extra.id);
      if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
      } else {
        cart.push({
          ...extra,
          qty: 1
        });
      }

      await AsyncStorage.setItem('bochinche_cart', JSON.stringify(cart));
      DeviceEventEmitter.emit('cartUpdated');
      showNotification(`¡${extra.name} añadido!`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
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
              {item.description || "Deliciosa opción preparada por Bochinche Grill & Chicken."}
            </Text>

            {/* BOTÓN PARA PERSONALIZAR */}
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

            {/* UPSELLING SECTION */}
            <View style={styles.upsellSection}>
              <Text style={styles.upsellTitle}>¡Lo más comprado!</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.upsellScroll}
              >
                {MOST_POPULAR.map((extra) => (
                  <View key={extra.id} style={styles.upsellCard}>
                    <Image source={extra.image} style={styles.upsellImage} />
                    <Text style={styles.upsellName} numberOfLines={1}>{extra.name}</Text>
                    <Text style={styles.upsellPrice}>${extra.price.toFixed(2)}</Text>
                    <TouchableOpacity 
                      style={styles.addUpsellBtn}
                      onPress={() => handleAddUpsell(extra)}
                    >
                      <Ionicons name="add" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER */}
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

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <View style={[styles.toast, { bottom: 100 }]}>
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: { width: '100%', height: 320, backgroundColor: '#F9FAFB' },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', padding: 10, borderRadius: 15, elevation: 5 },
  mainContent: { flex: 1 },
  infoContainer: { paddingHorizontal: 25, paddingTop: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  description: { color: '#666', lineHeight: 22, fontSize: 14, marginBottom: 15 },
  customizeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#FED7D7', marginBottom: 15 },
  customizeIconBox: { backgroundColor: '#f97316', padding: 8, borderRadius: 10 },
  customizeTextContent: { flex: 1, marginLeft: 12 },
  customizeTitle: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 25 },
  optionTitle: { fontWeight: 'bold', fontSize: 16 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 15, padding: 4 },
  qtyBtn: { backgroundColor: '#333', width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  qtyText: { marginHorizontal: 12, fontSize: 18, fontWeight: 'bold' },
  upsellSection: { marginTop: 10, marginBottom: 30 },
  upsellTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  upsellScroll: { paddingRight: 20 },
  upsellCard: { width: 130, backgroundColor: '#F8FAFB', borderRadius: 22, padding: 10, marginRight: 15, alignItems: 'center', position: 'relative' },
  upsellImage: { width: 90, height: 80, borderRadius: 15, backgroundColor: '#fff', marginBottom: 8 },
  upsellName: { fontSize: 13, fontWeight: '700', color: '#444' },
  upsellPrice: { fontSize: 14, fontWeight: 'bold', color: '#f97316', marginTop: 4 },
  addUpsellBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: '#f97316', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  footer: { flexDirection: 'row', paddingHorizontal: 25, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: 'white' },
  priceBadge: { backgroundColor: '#f97316', paddingHorizontal: 20, height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  footerPrice: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  orderBtn: { flex: 1, backgroundColor: '#333', height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  orderBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  toast: { position: 'absolute', left: 20, right: 20, backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 15, gap: 8, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  toastText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});