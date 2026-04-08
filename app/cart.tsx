import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, ScrollView, TouchableOpacity, 
  StatusBar, Platform, StyleSheet, Modal, FlatList, DeviceEventEmitter
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ZONAS_DELIVERY = [
  { id: '1', name: 'Santa Teresa', price: 2 },
  { id: '2', name: 'Palmar', price: 4 },
  { id: '3', name: 'Tomuso', price: 4 },
  { id: '4', name: 'Cartanal', price: 4 },
  { id: '5', name: 'El alto', price: 4 },
  { id: '6', name: 'La tortuga', price: 3 },
  { id: '7', name: 'Mopia', price: 4 },
  { id: '8', name: 'Lozada', price: 3 },
  { id: '9', name: 'Yare', price: 6 },
];

const IVA_TASA = 0.16;
const COSTO_ENVASE = 0.20;

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Datos del Carrito (Dinámicos)
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar carrito desde AsyncStorage
  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('bochinche_cart');
      if (cartData) {
        setItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error("Error cargando el carrito:", error);
    } finally {
      setLoading(false);
    }
  };

  // Recargar cada vez que la pantalla gana foco
  React.useEffect(() => {
    loadCart();
  }, []);

  // Función para guardar cambios en el storage
  const saveCart = async (newItems: any[]) => {
    try {
      await AsyncStorage.setItem('bochinche_cart', JSON.stringify(newItems));
      // Notificar a la barra de menú para que actualice el contador
      DeviceEventEmitter.emit('cartUpdated');
    } catch (error) {
      console.error("Error guardando el carrito:", error);
    }
  };

  const [orderType, setOrderType] = useState('local'); // 'local' o 'delivery'
  const [paymentMethod, setPaymentMethod] = useState('pago_movil');
  const [selectedZone, setSelectedZone] = useState(ZONAS_DELIVERY[0]);
  const [showZoneModal, setShowZoneModal] = useState(false);

  // Lógica de cantidades
  const updateQty = (id: string, delta: number) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    );
    setItems(newItems);
    saveCart(newItems);
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    saveCart(newItems);
  };

  // Cálculos detallados
  const subtotalProducts = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const ivaTotal = subtotalProducts * IVA_TASA;
  const packagingFee = orderType === 'delivery' ? COSTO_ENVASE : 0;
  const shippingCost = orderType === 'delivery' ? selectedZone.price : 0;
  const grandTotal = subtotalProducts + ivaTotal + packagingFee + shippingCost;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* SELECTOR DE TIPO DE PEDIDO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Dónde vas a comer?</Text>
          <View style={styles.orderTypeContainer}>
            <TouchableOpacity 
              style={[styles.typeBtn, orderType === 'local' && styles.typeBtnActive]} 
              onPress={() => setOrderType('local')}
            >
              <Ionicons 
                name="restaurant-outline" 
                size={22} 
                color={orderType === 'local' ? 'white' : '#64748b'} 
              />
              <Text style={[styles.typeBtnText, orderType === 'local' && styles.typeBtnTextActive]}>
                Comer en el local
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.typeBtn, orderType === 'delivery' && styles.typeBtnActive]} 
              onPress={() => setOrderType('delivery')}
            >
              <Ionicons 
                name="bicycle-outline" 
                size={22} 
                color={orderType === 'delivery' ? 'white' : '#64748b'} 
              />
              <Text style={[styles.typeBtnText, orderType === 'delivery' && styles.typeBtnTextActive]}>
                Para llevar / Delivery
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LISTA DE PRODUCTOS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
            <Text style={styles.itemsCount}>{items.length} productos</Text>
          </View>
          
          {items.length === 0 && !loading ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={60} color="#cbd5e1" />
              <Text style={styles.emptyText}>Tu carrito está vacío</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
                <Text style={styles.browseText}>Ver menú</Text>
              </TouchableOpacity>
            </View>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.cartCard}>
                <Image 
                  source={typeof item.image === 'number' || !isNaN(parseInt(item.image)) 
                    ? (typeof item.image === 'number' ? item.image : parseInt(item.image)) 
                    : { uri: item.image }} 
                  style={styles.productImage} 
                />
                
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.brandBadge, { backgroundColor: item.color }]}>
                      <Text style={styles.brandText}>{item.brand}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Ionicons name="trash-outline" size={20} color="#f97316" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDesc} numberOfLines={1}>{item.desc || 'Preparado al momento'}</Text>
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.productPrice}>${(item.price * item.qty).toFixed(2)}</Text>
                    
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity 
                        onPress={() => updateQty(item.id, -1)} 
                        style={styles.qtyBtn}
                      >
                        <Ionicons name="remove" size={16} color="#333" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.qty}</Text>
                      <TouchableOpacity 
                        onPress={() => updateQty(item.id, 1)} 
                        style={[styles.qtyBtn, styles.qtyBtnPlus]}
                      >
                        <Ionicons name="add" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* DETALLES DE ENTREGA / ZONAS */}
        <View style={styles.section}>
          {orderType === 'delivery' ? (
            <TouchableOpacity 
              style={styles.deliveryCard}
              onPress={() => setShowZoneModal(true)}
            >
              <View style={styles.deliveryIconBox}>
                <Ionicons name="map-outline" size={24} color="#f97316" />
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Zona de Entrega</Text>
                <Text style={styles.deliveryAddress}>
                  {selectedZone.name} - ${selectedZone.price.toFixed(2)}
                </Text>
              </View>
              <View style={styles.editBtnBox}>
                <Text style={styles.editBtnText}>Cambiar</Text>
                <Ionicons name="chevron-forward" size={16} color="#f97316" />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.deliveryCard, { opacity: 0.6 }]}>
              <View style={[styles.deliveryIconBox, { backgroundColor: '#f1f5f9' }]}>
                <Ionicons name="restaurant-outline" size={24} color="#64748b" />
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Consumo en el Local</Text>
                <Text style={styles.deliveryAddress}>Bochinche Principal</Text>
              </View>
            </View>
          )}
        </View>

        {/* MÉTODOS DE PAGO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          <View style={styles.paymentContainer}>
            {[
              { id: 'pago_movil', label: 'Pago Móvil', icon: 'phone-portrait-outline' },
              { id: 'zelle', label: 'Zelle', icon: 'flash-outline' },
              { id: 'efectivo', label: 'Efectivo', icon: 'cash-outline' },
            ].map((method) => (
              <TouchableOpacity 
                key={method.id}
                style={[
                  styles.paymentOption, 
                  paymentMethod === method.id && styles.paymentOptionActive
                ]}
                onPress={() => setPaymentMethod(method.id)}
              >
                <View style={[
                  styles.paymentIconBox,
                  paymentMethod === method.id && styles.paymentIconBoxActive
                ]}>
                  <Ionicons 
                    name={method.icon as any} 
                    size={20} 
                    color={paymentMethod === method.id ? 'white' : '#64748b'} 
                  />
                </View>
                <Text style={[
                  styles.paymentLabel,
                  paymentMethod === method.id && styles.paymentLabelActive
                ]}>
                  {method.label}
                </Text>
                {paymentMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#f97316" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* RESUMEN DE PAGO (RECIBO PREMIUM) */}
        <View style={[styles.section, styles.summarySection]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal Productos</Text>
            <Text style={styles.summaryValue}>${subtotalProducts.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>IVA (16% de Ley)</Text>
            <Text style={styles.summaryValue}>${ivaTotal.toFixed(2)}</Text>
          </View>
          
          {orderType === 'delivery' && (
            <>
              <View style={styles.summaryRow}>
                <View style={styles.labelWithBadge}>
                  <Text style={styles.summaryLabel}>Envases</Text>
                  <View style={styles.autoBadge}>
                    <Text style={styles.autoBadgeText}>AUTO</Text>
                  </View>
                </View>
                <Text style={styles.summaryValue}>${packagingFee.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Costo de Envío ({selectedZone.name})</Text>
                <Text style={styles.summaryValue}>${shippingCost.toFixed(2)}</Text>
              </View>
            </>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL FINAL</Text>
            <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* ESPACIADOR FINAL */}
        <View style={{ height: 40 }} />

      </ScrollView>

      {/* CTA BOTÓN FIJO */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.8}>
          <Text style={styles.confirmBtnText}>Confirmar Pedido - ${grandTotal.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL SELECCION DE ZONA */}
      <Modal
        visible={showZoneModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowZoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona Zona de Envío</Text>
              <TouchableOpacity onPress={() => setShowZoneModal(false)}>
                <Ionicons name="close-circle" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={ZONAS_DELIVERY}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.zoneItem,
                    selectedZone.id === item.id && styles.zoneItemActive
                  ]}
                  onPress={() => {
                    setSelectedZone(item);
                    setShowZoneModal(false);
                  }}
                >
                  <Text style={[
                    styles.zoneName,
                    selectedZone.id === item.id && styles.zoneNameActive
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={[
                    styles.zonePrice,
                    selectedZone.id === item.id && styles.zonePriceActive
                  ]}>
                    ${item.price.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20, 
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 16,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    resizeMode: 'cover',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  brandText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  productDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qtyBtnPlus: {
    backgroundColor: '#333',
  },
  qtyText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  deliveryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryInfo: {
    flex: 1,
    marginLeft: 16,
  },
  deliveryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  deliveryAddress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  editBtnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 30,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 15,
  },
  browseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f97316',
  },
  paymentContainer: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  paymentOptionActive: {
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  paymentIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIconBoxActive: {
    backgroundColor: '#f97316',
  },
  paymentLabel: {
    flex: 1,
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  paymentLabelActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  summarySection: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  labelWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  autoBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#ef4444',
  },
  orderTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 20,
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  typeBtnActive: {
    backgroundColor: '#f97316',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  typeBtnTextActive: {
    color: 'white',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#38241b', // Marrón oscuro premium
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#f97316', // Naranja vibrante
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  confirmBtn: {
    backgroundColor: '#38241b', // Marrón oscuro para el botón
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38241b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  confirmBtnText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  // ESTILOS MODAL Y ZONAS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalList: {
    padding: 15,
  },
  zoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  zoneItemActive: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#f97316',
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  zoneNameActive: {
    color: '#f97316',
  },
  zonePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748b',
  },
  zonePriceActive: {
    color: '#f97316',
  },
});
