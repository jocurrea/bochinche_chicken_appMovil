import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Platform, DeviceEventEmitter } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BBQ_SAUCES = [
  { id: '1', name: 'BBQ', icon: '🔥', price: 0.00, heat: 0.1 },
  { id: '2', name: 'Picante', icon: '🌶️', price: 0.00, heat: 0.5 },
  { id: '3', name: 'BBQ Picante', icon: '🍗', price: 0.00, heat: 0.7 },
  { id: '4', name: 'Extra Picante', icon: '🌋', price: 0.00, heat: 1.0 },
];

const BURGER_SAUCES = [
  { id: '1', name: 'Salsa de Ajo', icon: '🧄' },
  { id: '2', name: 'Salsa Rosada', icon: '🥣' },
  { id: '3', name: 'Ketchup', icon: '🍅' },
  { id: '4', name: 'Mayonesa', icon: '🥚' },
  { id: '5', name: 'Mostaza', icon: '🟡' },
];

const BASE_INGREDIENTS = [
  { id: '1', name: 'Lechuga', icon: '🥬' },
  { id: '2', name: 'Tomate', icon: '🍅' },
  { id: '3', name: 'Pepinillos', icon: '🥒' },
  { id: '4', name: 'Papas frita', icon: '🍟' },
  { id: '5', name: 'Queso Amarillo', icon: '🧀' },
];

const ONION_OPTIONS = [
  { id: '1', name: 'Cebolla Crispy', icon: '🧅' },
  { id: '2', name: 'Cebolla Caramelizada', icon: '🍯' },
];

const MILANESA_OPTIONS = [
  { id: '1', name: 'Crispy', icon: '🍗' },
  { id: '2', name: 'A la Plancha', icon: '🍳' },
];

const PROTEIN_OPTIONS = [
  { id: '1', name: 'Carne', icon: '🥩' },
  { id: '2', name: 'Pollo', icon: '🍗' },
];

const CACHAPA_EXTRAS = [
  { id: 'ext1', name: 'Jamón', icon: '🍖', price: 1.50 },
  { id: 'ext2', name: 'Tocineta', icon: '🥓', price: 2.50 },
  { id: 'ext3', name: 'Queso', icon: '🧀', price: 2.50 },
  { id: 'ext4', name: 'Pollo Cryspy', icon: '🍗', price: 2.50 },
  { id: 'ext5', name: 'Cerdo', icon: '🐷', price: 2.99 },
  { id: 'ext6', name: 'Solomo', icon: '🥩', price: 3.50 },
];

export default function CustomizeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const item = useLocalSearchParams(); 
  const [quantity, setQuantity] = useState(1);
  
  const nameLower = item.name?.toString().toLowerCase() || "";
  const isBBQ = nameLower.includes('alitas') || nameLower.includes('bbq');
  const isMini = nameLower.includes('mini');
  const isLigera = nameLower.includes('ligera');
  const isMixta = nameLower.includes('mixta');
  const isCachapa = nameLower.includes('cachapa');
  
  const isBurger = !isBBQ && !isCachapa && (
    nameLower.includes('hamburguesa') ||
    nameLower.includes('crispy') ||
    nameLower.includes('grill') ||
    isMixta ||
    isMini ||
    isLigera
  );

  // Estados
  const [selectedBBQSauce, setSelectedBBQSauce] = useState<string | null>(isBBQ ? 'BBQ' : null);
  const [selectedBurgerSauce, setSelectedBurgerSauce] = useState<string | null>(isMini ? 'Salsa de Ajo' : null);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [selectedOnion, setSelectedOnion] = useState<string>((isBurger && !isMini) ? 'Cebolla Crispy' : '');
  const [selectedMilanesa, setSelectedMilanesa] = useState<string>(isMixta ? 'Crispy' : '');
  const [selectedProtein, setSelectedProtein] = useState<string>(isLigera ? 'Carne' : '');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const resolveImage = () => {
    if (item.local_image) {
      const localId = parseInt(item.local_image as string);
      return !isNaN(localId) ? localId : { uri: item.local_image as string };
    }
    return { uri: (item.image_url as string) || 'https://via.placeholder.com/300' };
  };

  const imageSource = resolveImage();
  const basePrice = parseFloat((item.price as string) || "0");
  
  // Calcular precio de extras (Cachapa)
  const extraPrice = isCachapa 
    ? selectedExtras.reduce((sum, extraName) => {
        const extra = CACHAPA_EXTRAS.find(e => e.name === extraName);
        return sum + (extra?.price || 0);
      }, 0)
    : 0;

  const unitPrice = basePrice + extraPrice;
  const totalPrice = (unitPrice * quantity).toFixed(2);

  const toggleBaseIngredient = (name: string) => {
    setRemovedIngredients(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const toggleExtra = (name: string) => {
    setSelectedExtras(prev => 
      prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
    );
  };

  const handleAddToCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('bochinche_cart');
      let cart = cartData ? JSON.parse(cartData) : [];

      let customName = item.name as string;
      
      if (isBBQ) {
        customName = `${item.name} (${selectedBBQSauce})`;
      } else if (isBurger) {
        const removedText = removedIngredients.length === 0 ? 'Con todo' : `Sin ${removedIngredients.join(', ')}`;
        let details = `(${removedText})`;
        if (isMini) {
          if (selectedBurgerSauce) details += ` + ${selectedBurgerSauce}`;
        } else if (isLigera) {
          if (selectedProtein) details = `(${selectedProtein}) + ${details}`;
          if (selectedOnion) details += ` + ${selectedOnion}`;
        } else {
          if (selectedOnion) details += ` + ${selectedOnion}`;
          if (isMixta && selectedMilanesa) details += ` + Milanesa ${selectedMilanesa}`;
        }
        customName = `${item.name} ${details}`;
      } else if (isCachapa) {
        if (selectedExtras.length > 0) {
          customName = `${item.name} + Extra ${selectedExtras.join(' + Extra ')}`;
        }
      }

      const newItem = {
        id: `${item.id}_${Date.now()}`,
        name: customName,
        price: unitPrice,
        qty: quantity,
        brand: item.brand as string || 'Grill',
        color: '#f97316',
        image: item.local_image ? item.local_image : ((item.image_url as string) || 'https://via.placeholder.com/300')
      };

      cart.push(newItem);
      await AsyncStorage.setItem('bochinche_cart', JSON.stringify(cart));
      DeviceEventEmitter.emit('cartUpdated');
      router.push('/cart');
    } catch (error) {
      console.error("Error al añadir al carrito:", error);
    }
  };

  const availableIngredients = isMini 
    ? [...BASE_INGREDIENTS.filter(i => i.name !== 'Queso Amarillo'), { id: 'salse', name: 'Salsas', icon: '🥫' }]
    : isLigera ? [...BASE_INGREDIENTS, { id: 'jamon', name: 'Jamón', icon: '🍖' }] : BASE_INGREDIENTS;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.imageHeader}>
          <Image source={imageSource} style={styles.fullProductImage} />
          <TouchableOpacity style={styles.premiumBackBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.controlsSection}>
          <Text style={styles.mainTitle}>Personaliza tu <Text style={styles.subtitle}>{item.name}</Text></Text>
          <View style={styles.optionsGrid}>
            <View style={styles.optionBox}>
              <Text style={styles.controlLabel}>{isBBQ ? 'Sabor' : 'Preparación'}</Text>
              <View style={styles.sliderBase}>
                <View style={[styles.sliderFill, { width: isBBQ ? `${(BBQ_SAUCES.find(s => s.name === selectedBBQSauce)?.heat || 0.1) * 100}%` : '100%' }]} />
              </View>
            </View>
            <View style={styles.optionBox}>
              <Text style={styles.controlLabel}>Cantidad</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}><Ionicons name="remove" size={18} color="white" /></TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={[styles.qtyBtn, {backgroundColor: '#f97316'}]}><Ionicons name="add" size={18} color="white" /></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* --- SECCIÓN PARA BBQ --- */}
        {isBBQ && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>¿Con qué salsa lo desea?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {BBQ_SAUCES.map(s => (
                <TouchableOpacity key={s.id} style={[styles.itemCard, selectedBBQSauce === s.name && styles.itemCardSelected]} onPress={() => setSelectedBBQSauce(s.name)}>
                  <Text style={styles.itemIcon}>{s.icon}</Text>
                  <Text style={[styles.itemName, selectedBBQSauce === s.name && styles.itemNameSelected]}>{s.name}</Text>
                  <View style={[styles.addIcon, selectedBBQSauce === s.name && { backgroundColor: '#f97316' }]}><Ionicons name={selectedBBQSauce === s.name ? "checkmark" : "add"} size={12} color="white" /></View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* --- SECCIÓN PARA CACHAPAS (EXTRAS) --- */}
        {isCachapa && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>¿Añadir adicionales?</Text>
            <Text style={styles.sectionSub}>Sumar ingredientes extra a tu cachapa</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CACHAPA_EXTRAS.map(extra => (
                <TouchableOpacity 
                  key={extra.id} 
                  style={[styles.itemCard, selectedExtras.includes(extra.name) && styles.itemCardSelected, { width: 120 }]} 
                  onPress={() => toggleExtra(extra.name)}
                >
                  <Text style={styles.itemIcon}>{extra.icon}</Text>
                  <Text style={[styles.itemName, selectedExtras.includes(extra.name) && styles.itemNameSelected]}>{extra.name}</Text>
                  <Text style={styles.itemPrice}>+ref. {extra.price}</Text>
                  <View style={[styles.addIcon, selectedExtras.includes(extra.name) && { backgroundColor: '#f97316' }]}>
                    <Ionicons name={selectedExtras.includes(extra.name) ? "checkmark" : "add"} size={12} color="white" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* --- SECCIÓN PARA HAMBURGUESAS --- */}
        {isBurger && (
          <>
            {isLigera && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>¿Qué proteína deseas?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {PROTEIN_OPTIONS.map(opt => (
                    <TouchableOpacity key={opt.id} style={[styles.itemCard, selectedProtein === opt.name && styles.itemCardSelected, { width: 130 }]} onPress={() => setSelectedProtein(opt.name)}>
                      <Text style={styles.itemIcon}>{opt.icon}</Text>
                      <Text style={[styles.itemName, selectedProtein === opt.name && styles.itemNameSelected]}>{opt.name}</Text>
                      <View style={[styles.addIcon, selectedProtein === opt.name && { backgroundColor: '#f97316' }]}><Ionicons name={selectedProtein === opt.name ? "checkmark-circle" : "ellipse-outline"} size={14} color="white" /></View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {isMixta && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>¿Cómo deseas la milanesa?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {MILANESA_OPTIONS.map(opt => (
                    <TouchableOpacity key={opt.id} style={[styles.itemCard, selectedMilanesa === opt.name && styles.itemCardSelected, { width: 130 }]} onPress={() => setSelectedMilanesa(opt.name)}>
                      <Text style={styles.itemIcon}>{opt.icon}</Text>
                      <Text style={[styles.itemName, selectedMilanesa === opt.name && styles.itemNameSelected]}>{opt.name}</Text>
                      <View style={[styles.addIcon, selectedMilanesa === opt.name && { backgroundColor: '#f97316' }]}><Ionicons name={selectedMilanesa === opt.name ? "checkmark-circle" : "ellipse-outline"} size={14} color="white" /></View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {!isMini && (
              <View style={[styles.section, (isMixta || isLigera) && {marginTop: 30}]}>
                <Text style={styles.sectionHeader}>¿Con qué cebolla lo deseas?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {ONION_OPTIONS.map(onion => (
                    <TouchableOpacity key={onion.id} style={[styles.itemCard, selectedOnion === onion.name && styles.itemCardSelected, { width: 130 }]} onPress={() => setSelectedOnion(onion.name)}>
                      <Text style={styles.itemIcon}>{onion.icon}</Text>
                      <Text style={[styles.itemName, selectedOnion === onion.name && styles.itemNameSelected]}>{onion.name}</Text>
                      <View style={[styles.addIcon, selectedOnion === onion.name && { backgroundColor: '#f97316' }]}><Ionicons name={selectedOnion === onion.name ? "checkmark-circle" : "ellipse-outline"} size={14} color="white" /></View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={[styles.section, {marginTop: 30}]}>
              <Text style={styles.sectionHeader}>¿Qué ingredientes deseas?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {availableIngredients.map(ing => (
                  <TouchableOpacity key={ing.id} style={[styles.itemCard, !removedIngredients.includes(ing.name) && styles.itemCardSelected]} onPress={() => toggleBaseIngredient(ing.name)}>
                    <Text style={styles.itemIcon}>{ing.icon}</Text>
                    <Text style={[styles.itemName, !removedIngredients.includes(ing.name) && styles.itemNameSelected, removedIngredients.includes(ing.name) && { color: '#bbb', textDecorationLine: 'line-through' }]}>{ing.name}</Text>
                    <View style={[styles.addIcon, !removedIngredients.includes(ing.name) ? { backgroundColor: '#f97316' } : { backgroundColor: '#bbb' }]}><Ionicons name={!removedIngredients.includes(ing.name) ? "checkmark" : "close"} size={12} color="white" /></View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 25) }]}>
        <View><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalPrice}><Text style={styles.currency}>$</Text>{totalPrice}</Text></View>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleAddToCart}><Text style={styles.confirmText}>ORDENAR AHORA</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 180 },
  imageHeader: { width: '100%', height: 280, backgroundColor: '#fcfcfc' },
  fullProductImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  premiumBackBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'white', padding: 10, borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  controlsSection: { padding: 20, paddingTop: 10 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { color: '#f97316' },
  optionsGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  optionBox: { width: '48%' },
  controlLabel: { fontSize: 13, fontWeight: 'bold', color: '#888', marginBottom: 8 },
  sliderBase: { height: 6, backgroundColor: '#eee', borderRadius: 3 },
  sliderFill: { height: 6, backgroundColor: '#f97316', borderRadius: 3 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 5, borderRadius: 12, justifyContent: 'space-between' },
  qtyBtn: { backgroundColor: '#333', width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  qtyValue: { fontSize: 18, fontWeight: '900', color: '#333' },
  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  sectionSub: { fontSize: 13, color: '#888', marginBottom: 15 },
  itemCard: { backgroundColor: '#fff', width: 100, height: 110, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, marginBottom: 5, borderWidth: 1, borderColor: 'transparent' },
  itemCardSelected: { borderColor: '#f97316', backgroundColor: '#fff7ed' },
  itemIcon: { fontSize: 30, marginBottom: 5 },
  itemName: { fontSize: 11, color: '#333', fontWeight: '500', textAlign: 'center' },
  itemNameSelected: { color: '#f97316', fontWeight: 'bold' },
  itemPrice: { fontSize: 10, color: '#f97316', fontWeight: 'bold', marginTop: 2 },
  addIcon: { position: 'absolute', bottom: 8, right: 8, borderRadius: 10, padding: 2 },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30, paddingTop: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: -5 } },
  totalLabel: { fontSize: 14, color: '#888', marginBottom: 5 },
  totalPrice: { fontSize: 32, fontWeight: 'bold' }, 
  currency: { color: '#f97316', fontSize: 20 },
  confirmBtn: { backgroundColor: '#f97316', paddingHorizontal: 35, paddingVertical: 18, borderRadius: 20 },
  confirmText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});