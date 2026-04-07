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
const GRILL_CATS = ['Todo', 'Parrillas', 'Burgers', 'Cachapas', 'Bebidas'];

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
    if (brandParam) {
      setBrand(brandParam);
      AsyncStorage.setItem('lastBrand', brandParam as string);
      // Reset category if brand changes
      setSelectedCategory(brandParam === 'chicken' ? 'Arma tu Combo' : 'Todo');
    } else {
      // Si no hay param, intentar recuperar del storage
      const recoverBrand = async () => {
        const last = await AsyncStorage.getItem('lastBrand');
        if (last) {
          setBrand(last);
          setSelectedCategory(last === 'chicken' ? 'Arma tu Combo' : 'Todo');
        } else {
          setBrand('chicken'); // Default final
        }
      };
      recoverBrand();
    }
  }, [brandParam]);

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
      const products = json.data || json;
      setData(products);
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
          source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
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
      return matchesSearch && isBrandMatch && isCategoryMatch;
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
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <CategoriesCarousel 
        categories={categories} 
        selectedCategory={selectedCategory} 
        onSelect={setSelectedCategory}
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
