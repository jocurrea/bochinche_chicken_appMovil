import React, { useState } from 'react';
import { 
  View, Text, Image, ScrollView, TouchableOpacity, 
  StatusBar, Platform, StyleSheet 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Datos del Carrito (Pedido Mixto)
  const [items, setItems] = useState([
    { 
      id: '1', 
      name: 'Combo Bam Bam', 
      desc: '1 pieza de muslo, papas y ensalada', 
      price: 2.99, 
      qty: 2, 
      brand: 'Chicken',
      color: '#f97316',
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=200&auto=format&fit=crop'
    },
    { 
      id: '2', 
      name: 'Parrilla Popular', 
      desc: 'Carne, pollo, ensalada + contorno', 
      price: 4.99, 
      qty: 1, 
      brand: 'Grill',
      color: '#38241b',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=200&auto=format&fit=crop'
    },
    { 
      id: '3', 
      name: 'Cachapa La Cheese', 
      desc: 'Queso de mano', 
      price: 3.99, 
      qty: 1, 
      brand: 'Grill',
      color: '#38241b',
      image: 'https://images.unsplash.com/photo-1626202340516-646e2730303b?q=80&w=200&auto=format&fit=crop'
    },
    { 
      id: '4', 
      name: 'Refresco 2L', 
      desc: 'Bebida gaseosa', 
      price: 2.99, 
      qty: 1, 
      brand: 'Tomate Algo',
      color: '#64748b',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&auto=format&fit=crop'
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState('pago_movil');

  // Lógica de cantidades
  const updateQty = (id: string, delta: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const delivery = 2.00;
  const total = subtotal + delivery;

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
        
        {/* LISTA DE PRODUCTOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.cartCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              
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
                <Text style={styles.productDesc} numberOfLines={1}>{item.desc}</Text>
                
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
          ))}
        </View>

        {/* DETALLES DE ENTREGA */}
        <View style={styles.section}>
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryIconBox}>
              <Ionicons name="location" size={24} color="#f97316" />
            </View>
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>Dirección de Entrega</Text>
              <Text style={styles.deliveryAddress}>Santa Teresa del Tuy, Centro</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.editBtnText}>Editar</Text>
            </TouchableOpacity>
          </View>
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

        {/* RESUMEN DE PAGO */}
        <View style={[styles.section, styles.summarySection]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>${delivery.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

      </ScrollView>

      {/* CTA BOTÓN FIJO */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.8}>
          <Text style={styles.confirmBtnText}>Confirmar Pedido - ${total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

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
    paddingBottom: 120,
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
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f97316',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  confirmBtn: {
    backgroundColor: '#f97316',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  confirmBtnText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
