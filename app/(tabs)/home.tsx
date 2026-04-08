import React, { useEffect, useState, useCallback, useRef, useMemo, memo } from 'react';
import { 
  StyleSheet, Text, View, FlatList, ActivityIndicator, 
  Image, TextInput, TouchableOpacity, Dimensions, Platform 
} from 'react-native';
import { StatusBar, setStatusBarStyle } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width / 2) - 25;

const CHICKEN_CATS = ['Arma tu Combo', 'Combos de Alitas', 'Muslos o Cuadril', 'Tender', 'BBQ', 'Patacon', 'Salchipapas', 'Bebidas'];
const GRILL_CATS = ['Todo', 'Parrillas', 'Hamburguesas', 'Cachapas', 'Bebidas'];

const SectionBanner = memo(({ title }: { title: string }) => {
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerSubTitle}>Nuestras</Text>
        <View style={styles.bannerTitleRow}>
          <View style={styles.sparkLeft} />
          <Text style={styles.bannerTitleMain}>{title}</Text>
          <View style={styles.sparkRight} />
        </View>
        <View style={styles.bannerUnderline} />
      </View>
    </View>
  );
});

const CategoriesCarousel = memo(({ categories, selectedCategory, onSelect }: any) => {
  const flatListRef = useRef<FlatList>(null);

  const handlePress = (item: string, index: number) => {
    onSelect(item);
    flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 });
  };

  return (
    <View style={styles.categoriesWrapper}>
      <FlatList
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoriesScroll}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handlePress(item, index)}
            style={[
              styles.categoryCapsule,
              selectedCategory === item && styles.categoryCapsuleActive
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === item && styles.categoryTextActive
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0 });
          }, 300);
        }}
      />
    </View>
  );
});

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { brand: brandParam } = useLocalSearchParams(); 
  const [brand, setBrand] = useState<any>(brandParam);
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  
  const categories = useMemo(() => brand === 'chicken' ? CHICKEN_CATS : GRILL_CATS, [brand]);
  const [selectedCategory, setSelectedCategory] = useState(brand === 'chicken' ? 'Arma tu Combo' : 'Todo'); 

  // Sincronizar brandParam con el estado local y Storage
  useEffect(() => {
    const syncState = async () => {
      if (brandParam) {
        setBrand(brandParam);
        await AsyncStorage.setItem('lastBrand', brandParam as string);
        
        // Al cambiar de marca, resetear categoría a 'Todo' o 'Arma tu Combo'
        const defaultCat = brandParam === 'chicken' ? 'Arma tu Combo' : 'Todo';
        setSelectedCategory(defaultCat);
        await AsyncStorage.setItem('lastCategory', defaultCat);
      } else {
        const last = await AsyncStorage.getItem('lastBrand');
        const lastCat = await AsyncStorage.getItem('lastCategory');
        
        if (last) {
          setBrand(last);
          if (lastCat) {
            setSelectedCategory(lastCat);
          } else {
            setSelectedCategory(last === 'chicken' ? 'Arma tu Combo' : 'Todo');
          }
        } else {
          setBrand('chicken');
          setSelectedCategory('Arma tu Combo');
        }
      }
    };
    syncState();
  }, [brandParam]);

  // Guardar categoría cuando el usuario la cambia manualmente
  const handleCategorySelect = async (cat: string) => {
    setSelectedCategory(cat);
    await AsyncStorage.setItem('lastCategory', cat);
  };

  const [userName, setUserName] = useState('Usuario'); 
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const YOUR_IP = '192.168.250.1:8000'; 
  const API_URL = `http://${YOUR_IP}/api/products`;

  useEffect(() => {
    getProducts();
  }, []);

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
                ? uData.avatar : `http://${YOUR_IP}${uData.avatar.startsWith('/') ? '' : '/'}${uData.avatar}`;
              setUserAvatar(fullUrl);
            }
          }
        } catch (error) {}
      };
      fetchUser();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('dark');
    }, [])
  );

  const getProducts = async () => {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      const apiProducts = json.data || json;

      // SIMULACIÓN DE DATOS SOLICITADOS (4 PARRILLAS)
      const nuevasParrillas = [
        {
          id: 'p1',
          name: 'Parrilla Popular',
          description: 'Carne, pollo, ensalada + contorno 150grs',
          price: '4.99',
          brand: 'Grill',
          category: { name: 'Parrillas' },
          image_url: '' // No usado si proveemos local_image
          ,local_image: require('@/assets/images/bochinche/parrilla_popular.png')
        },
        {
          id: 'p2',
          name: 'Parrilla Clasica',
          description: 'Carne, pollo, ensalada + contorno 300grs',
          price: '8.99',
          brand: 'Grill',
          category: { name: 'Parrillas' },
          image_url: '',
          local_image: require('@/assets/images/bochinche/parrilla_clasica.png')
        },
        {
          id: 'p3',
          name: 'Parrilla Sensacional',
          description: 'Carne, pollo, chorizo, contorno 450grs + ensalada',
          price: '13.99',
          brand: 'Grill',
          category: { name: 'Parrillas' },
          image_url: '',
          local_image: require('@/assets/images/bochinche/parrilla_sensacional.png')
        },
        {
          id: 'p4',
          name: 'Parrilla Especial',
          description: 'Carne, pollo, chorizo, contorno 600grs + ensalada',
          price: '17.99',
          brand: 'Grill',
          category: { name: 'Parrillas' },
          image_url: '',
          local_image: require('@/assets/images/bochinche/parrilla_especial.png')
        }
      ];

      const nuevasHamburguesas = [
        {
          id: 'h1',
          name: 'Hamburguesa Crispy',
          description: 'Milanesa crispy, lechuga, tomate, pepinillos, papas, queso amarillo, cebolla crispy o caramelizada',
          price: '5.99',
          brand: 'Grill',
          category: { name: 'Hamburguesas' },
          local_image: require('@/assets/images/bochinche/burger_crispy.png')
        },
        {
          id: 'h2',
          name: 'Hamburguesa Grill',
          description: 'Carne, lechuga, tomate, pepinillos, papas, queso amarillo, cebolla crispy o caramelizada',
          price: '5.99',
          brand: 'Grill',
          category: { name: 'Hamburguesas' },
          local_image: require('@/assets/images/bochinche/burger_grill.png')
        },
        {
          id: 'h3',
          name: 'Hamburguesa Mixta',
          description: 'Carne, milanesa crispy o plancha, lechuga, tomate, pepinillos, papas, queso amarillo, cebolla crispy o caramelizada',
          price: '7.50',
          brand: 'Grill',
          category: { name: 'Hamburguesas' },
          local_image: require('@/assets/images/bochinche/burger_mixta.png')
        },
        {
          id: 'h4',
          name: 'Hamburguesa Mini',
          description: '4 Mini hamburguesas + papas fritas + salsas',
          price: '5.99',
          brand: 'Grill',
          category: { name: 'Hamburguesas' },
          local_image: require('@/assets/images/bochinche/burger_mini.png')
        },
        {
          id: 'h5',
          name: 'Hamburguesa Ligera',
          description: '1 Proteína (carne/pollo), pan árabe, lechuga, tomate, cebolla crispy o caramelizada, pepinillo, queso amarillo y jamón',
          price: '7.50',
          brand: 'Grill',
          category: { name: 'Hamburguesas' },
          local_image: require('@/assets/images/bochinche/burger_ligera.png')
        }
      ];

      const nuevasCachapas = [
        {
          id: 'c1',
          name: 'Cachapa La Cheese',
          description: 'Queso de mano',
          price: '3.99',
          brand: 'Grill',
          category: { name: 'Cachapas' },
          local_image: require('@/assets/images/bochinche/cachapa_cheese.png')
        },
        {
          id: 'c2',
          name: 'Cachapa Cheese Ham',
          description: 'Jamón y queso de mano',
          price: '5.50',
          brand: 'Grill',
          category: { name: 'Cachapas' },
          local_image: require('@/assets/images/bochinche/cachapa_ham.png')
        },
        {
          id: 'c3',
          name: 'Cachapa Pork Cheese',
          description: 'Carne de cerdo y queso de mano',
          price: '6.99',
          brand: 'Grill',
          category: { name: 'Cachapas' },
          local_image: require('@/assets/images/bochinche/cachapa_pork.png')
        },
        {
          id: 'c4',
          name: 'Cachapa Sirloin Cheese',
          description: 'Carne de solomo y queso de mano',
          price: '6.99',
          brand: 'Grill',
          category: { name: 'Cachapas' },
          local_image: require('@/assets/images/bochinche/cachapa_sirloin.png')
        },
        {
          id: 'c5',
          name: 'Cachapa Cheese Crispy',
          description: 'Milanesa crispy y queso de mano',
          price: '6.99',
          brand: 'Grill',
          category: { name: 'Cachapas' },
          local_image: require('@/assets/images/bochinche/cachapa_crispy.png')
        }
      ];

      const catalogBebidas = [
        // POLAR
        { id: 'b1', name: 'Agua Minalba 600ml', description: 'Empresas Polar', price: '1.20', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?q=80&w=200' },
        { id: 'b2', name: 'Malta Polar 250ml', description: 'Empresas Polar', price: '0.80', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1634645228551-7f8a7e08967b?q=80&w=200' },
        { id: 'b3', name: 'Jugo Yukeri', description: 'Empresas Polar', price: '1.50', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=200' },
        { id: 'b4', name: 'Te Lipton', description: 'Empresas Polar', price: '2.50', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=200' },
        { id: 'b5', name: 'Gatorade', description: 'Empresas Polar', price: '2.50', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1622543953495-a13efb821c7a?q=80&w=200' },
        { id: 'b6', name: 'Refresco Botella 355ml', description: 'Empresas Polar', price: '0.99', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200' },
        { id: 'b7', name: 'Refresco Polar 1L', description: 'Empresas Polar', price: '1.80', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200' },
        { id: 'b8', name: 'Refresco Polar 2L', description: 'Empresas Polar', price: '2.99', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200' },
        
        // GLUP
        { id: 'b9', name: 'Agua Glup 600ml', description: 'Marca Glup!', price: '0.99', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1550505393-5c474d28d00d?q=80&w=200' },
        { id: 'b10', name: 'Refresco Glup 400ml', description: 'Marca Glup!', price: '0.80', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200' },
        { id: 'b11', name: 'Refresco Glup 1L', description: 'Marca Glup!', price: '1.50', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200' },
        { id: 'b12', name: 'Refresco Glup 2L', description: 'Marca Glup!', price: '2.50', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200' },
        { id: 'b13', name: 'Tenta Té 500ml', description: 'Marca Glup!', price: '1.99', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=200' },
        { id: 'b14', name: 'Tenta Té 1L', description: 'Marca Glup!', price: '3.50', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=200' },

        // COCA COLA
        { id: 'b15', name: 'Agua Nevada 600ml', description: 'Coca-Cola', price: '0.99', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1550505393-5c474d28d00d?q=80&w=200' },
        { id: 'b16', name: 'Chinotto 1L', description: 'Coca-Cola', price: '1.50', category: { name: 'Bebidas' }, local_image: require('@/assets/images/bochinche/drinks_coke.png') },
        { id: 'b17', name: 'Chinotto 2L', description: 'Coca-Cola', price: '2.50', category: { name: 'Bebidas' }, local_image: require('@/assets/images/bochinche/drinks_coke.png') },
        { id: 'b18', name: 'Coca Cola 355ml', description: 'Coca-Cola', price: '0.90', category: { name: 'Bebidas' }, local_image: require('@/assets/images/bochinche/drinks_coke.png') },
        { id: 'b19', name: 'Coca Cola 1L', description: 'Coca-Cola', price: '1.50', category: { name: 'Bebidas' }, local_image: require('@/assets/images/bochinche/drinks_coke.png') },
        { id: 'b20', name: 'Coca Cola 2L', description: 'Coca-Cola', price: '2.50', category: { name: 'Bebidas' }, local_image: require('@/assets/images/bochinche/drinks_coke.png') },

        // OTROS
        { id: 'b21', name: 'Jugo Natural', description: 'Bochinche Natural', price: '1.50', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=200' },
        { id: 'b22', name: 'Aguas Saborizadas', description: 'Bochinche Natural', price: '0.99', category: { name: 'Bebidas' }, image_url: 'https://images.unsplash.com/photo-1550505393-5c474d28d00d?q=80&w=200' },
      ];

      // DUPLICAMOS LAS BEBIDAS PARA AMBAS MARCAS PARA QUE SIEMPRE APAREZCAN
      const bebidasChicken = catalogBebidas.map(b => ({ ...b, id: 'ch_'+b.id, brand: 'Chicken' }));
      const bebidasGrill = catalogBebidas.map(b => ({ ...b, id: 'gr_'+b.id, brand: 'Grill' }));

      setData([...nuevasCachapas, ...nuevasHamburguesas, ...nuevasParrillas, ...bebidasChicken, ...bebidasGrill, ...apiProducts]);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderProductCard = (item: any) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/details', params: item })}
    >
      <View style={styles.imageWrapper}>
        <Image 
          source={item.local_image ? item.local_image : { uri: item.image_url || 'https://via.placeholder.com/150' }} 
          style={styles.productImage} 
        />
        <TouchableOpacity style={styles.heartIcon}>
          <Ionicons name="heart-outline" size={18} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.brandName}>Bochinche Chicken</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.rating}><Ionicons name="star" size={12} color="#FFD700" /> 4.8</Text>
          <Text style={styles.price}>ref. {item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchText.toLowerCase());
      if (!brand) return matchesSearch;
      const itemBrand = (item.brand || item.specs?.brand || "").toLowerCase();
      const isBrandMatch = itemBrand.includes(brand.toString().toLowerCase());
      let isCategoryMatch = true;
      if (selectedCategory !== 'Todo') {
        const itemCat = item.category?.name || "";
        isCategoryMatch = (itemCat.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
      }
      // Ocultar productos de envase manuales (ahora son automáticos)
      const name = item.name?.toLowerCase() || "";
      const isManualPackaging = name.includes('llevalo') || name.includes('envase') || name.includes('bandeja');
      
      return matchesSearch && isBrandMatch && isCategoryMatch && !isManualPackaging;
    });
  }, [data, searchText, brand, selectedCategory]);

  const groupedData = useMemo(() => {
    const result: any[] = [];
    let tempRow: any[] = [];
    
    filteredData.forEach(p => {
      if (p.specs?.is_header) {
        if (tempRow.length > 0) {
          result.push({ type: 'row', items: [...tempRow] });
          tempRow = [];
        }
        result.push({ type: 'banner', title: p.name.replace('_TITLE', '') });
      } else {
        tempRow.push(p);
        if (tempRow.length === 2) {
          result.push({ type: 'row', items: [...tempRow] });
          tempRow = [];
        }
      }
    });

    if (tempRow.length > 0) {
      result.push({ type: 'row', items: [...tempRow] });
    }

    return result;
  }, [filteredData]);

  const HeaderComponent = useMemo(() => (
    <View>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 40 }]}>
        <View>
          <Text style={styles.headerTitle}>
            Menú {brand === 'chicken' ? 'Chicken 🍗' : 'Grill 🥩'}
          </Text>
          <Text style={styles.tagline}>¡Hola {userName.split(' ')[0]}! ¿Qué vamos a comer?</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput 
            placeholder="Buscar comida..." 
            style={styles.searchInput} 
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterBtn}
          onPress={() => router.push('/rewards')}
        >
          <Ionicons name="gift-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <CategoriesCarousel 
        categories={categories} 
        selectedCategory={selectedCategory} 
        onSelect={handleCategorySelect}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Menú Popular 🔥</Text>
      </View>
    </View>
  ), [brand, userName, userAvatar, searchText, categories, selectedCategory, insets.top]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#f97316" size="large" />
          <Text style={{marginTop: 10, color: '#888'}}>Cargando menú...</Text>
        </View>
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            item.type === 'banner' ? (
              <SectionBanner title={item.title} />
            ) : (
              <View style={styles.gridRow}>
                {item.items.map((p: any) => renderProductCard(p))}
                {item.items.length === 1 && <View style={{ width: CARD_WIDTH }} />}
              </View>
            )
          )}
          ListHeaderComponent={HeaderComponent}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 150 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' }, // Un blanco más puro pero con personalidad
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 25, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#2D1E1E' },
  tagline: { fontSize: 14, color: '#888', marginTop: 2 },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'white' },
  placeholderAvatar: { backgroundColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  searchBar: { flex: 1, height: 55, backgroundColor: 'white', borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
  filterBtn: { width: 55, height: 55, backgroundColor: '#f97316', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  categoriesWrapper: { marginBottom: 15 },
  categoriesScroll: { paddingHorizontal: 20, paddingVertical: 10 },
  categoryCapsule: { backgroundColor: 'white', paddingHorizontal: 25, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 10, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, borderWidth: 1, borderColor: '#F0F0F0' },
  categoryCapsuleActive: { backgroundColor: '#f97316', borderColor: '#f97316', borderWidth: 0, elevation: 8, shadowOpacity: 0.3 },
  categoryText: { color: '#2D1E1E', fontWeight: '800', fontSize: 13 },
  categoryTextActive: { color: 'white', fontWeight: '900' },
  scrollContent: { }, // paddingBottom se aplica dinámicamente
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  card: { backgroundColor: '#fff', width: CARD_WIDTH, borderRadius: 25, marginBottom: 20, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  imageWrapper: { width: '100%', height: 130, borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: 'hidden' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heartIcon: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.8)', padding: 5, borderRadius: 15 },
  cardContent: { padding: 15 },
  productTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  brandName: { fontSize: 12, color: '#AAA', marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  rating: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 17, fontWeight: '900', color: '#f97316' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#2D1E1E' },
  bannerContainer: { width: '100%', alignItems: 'center', marginVertical: 30 },
  bannerContent: { alignItems: 'center' },
  bannerSubTitle: { fontSize: 16, fontWeight: 'bold', color: '#f97316', marginBottom: -5, textTransform: 'uppercase' },
  bannerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  bannerTitleMain: { fontSize: 42, fontWeight: '900', color: '#2D1E1E', letterSpacing: 1 },
  bannerUnderline: { width: '100%', height: 8, backgroundColor: '#f97316', borderRadius: 4, marginTop: -5 },
  sparkLeft: { width: 10, height: 2, backgroundColor: '#2D1E1E', transform: [{ rotate: '45deg' }], position: 'absolute', left: -20, top: 20 },
  sparkRight: { width: 10, height: 2, backgroundColor: '#2D1E1E', transform: [{ rotate: '-45deg' }], position: 'absolute', right: -20, top: 20 },
});
