import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  Dimensions, FlatList, StatusBar,
  Animated, Platform, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: '¡El Crujido Perfecto!',
    description: 'Pollo doradito por fuera, jugoso por dentro. Un sabor irresistible.',
    icon: require('../assets/images/bochinche/chicken_muslos_bochinche.png'),
  },
  {
    id: '2',
    title: '¡Puro Sabor Real',
    description: 'Papas fritas, aros de cebolla o ensalada fresca. ¡Hacé tu combo perfecto!',
    icon: require('../assets/images/onboarding_fries.png'),
  },
  {
    id: '3',
    title: '¡Listo para disfrutar!',
    description: 'Confirmá tu pedido y nosotros nos encargamos del resto. ¡Rápido y calentito!',
    icon: require('../assets/images/onboarding_scooter.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  
  // ANIMATION REFS
  const scrollX = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;
  
  // LOGO REFS
  const logoOpacity = useRef(new Animated.Value(0)).current; // Control exclusivo de visibilidad de logos
  const logoScale = useRef(new Animated.Value(0)).current;
  const chickenX = useRef(new Animated.Value(-width * 0.5)).current;
  const chickenY = useRef(new Animated.Value(-height * 0.3)).current;
  const grillX = useRef(new Animated.Value(width * 0.5)).current;
  const grillY = useRef(new Animated.Value(height * 0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // 1. INICIAR PULSO (Loop latente)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. SECUENCIA MAESTRA CINEMÁTICA
    Animated.sequence([
      // ENTRADA SEÑORIAL (1.5 segundos)
      Animated.parallel([
        Animated.timing(chickenX, {
          toValue: 0,
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(chickenY, {
          toValue: 0,
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(grillX, {
          toValue: 0,
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(grillY, {
          toValue: 0,
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 20,
          useNativeDriver: true,
        }),
      ]),
      
      // HOLD DE MARCA (2.5 segundos) para impacto visual
      Animated.delay(2500),
      
      // SALIDA DE LOGOS (Efecto Disolución)
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.8,
          duration: 600,
          easing: Easing.in,
          useNativeDriver: true,
        }),
      ]),

      // SALIDA DEL FONDO Y REVELACIÓN DE ONBOARDING
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowSplash(false);
    });
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentSlideIndex(viewableItems[0].index);
    }
  }).current;

  const handleSkip = () => {
    router.replace('/login'); 
  };

  const handleFinish = async () => {
    if (currentSlideIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentSlideIndex + 1 });
    } else {
      try {
        await AsyncStorage.setItem('@has_seen_onboarding', 'true');
      } catch (e) {}
      router.replace('/login');
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slideContainer}>
      <View style={styles.cardContainer}>
        <View style={styles.floatingCard}>
          <View style={styles.slideContent}>
            <View style={styles.imageBox}>
              <Image source={item.icon} style={styles.marketingIcon} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideDescription}>{item.description}</Text>
            </View>
          </View>
          <View style={styles.paginationContainer}>
            {slides.map((_, index) => (
              <View key={index} style={[styles.dot, currentSlideIndex === index && styles.activeDot]} />
            ))}
          </View>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleFinish} activeOpacity={0.8}>
              <Text style={styles.actionBtnText}>
                {currentSlideIndex === slides.length - 1 ? "¡EMPEZAR!" : "¡SIGUIENTE!"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {!showSplash ? (
        <View style={styles.onboardingContent}>
          <View style={styles.backgroundSplit}>
            <View style={styles.topBackground} />
            <View style={styles.bottomBackground} />
          </View>
          <View style={styles.header}>
            <Text style={styles.brandTitle}>Bochinche</Text>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Omitir</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={flatListRef}
            data={slides}
            renderItem={renderSlide}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            keyExtractor={(item) => item.id}
          />
        </View>
      ) : (
        <Animated.View style={[styles.splashContainer, { opacity: splashOpacity }]}>
          {/* FONDO DE MARCA (DIAGONAL2.PNG) */}
          <Image 
            source={require('../assets/images/logos/diagonal2.png')} 
            style={styles.backgroundImage} 
            resizeMode="cover"
          />

          {/* LOGO CHICKEN - Entrada Diagonal Suave */}
          <Animated.View style={[
            styles.logoAbsolute,
            { 
              top: '22%', 
              left: '12%', 
              opacity: logoOpacity,
              transform: [
                { translateX: chickenX }, 
                { translateY: chickenY }, 
                { scale: logoScale }, 
                { scale: pulseAnim }
              ] 
            }
          ]}>
            <View style={styles.logoCircleLarge}>
              <Image source={require('../assets/images/logos/chicken.png')} style={styles.logoImg} />
            </View>
          </Animated.View>

          {/* LOGO GRILL - Entrada Diagonal Suave */}
          <Animated.View style={[
            styles.logoAbsolute,
            { 
              bottom: '25%', 
              right: '8%', 
              opacity: logoOpacity,
              transform: [
                { translateX: grillX }, 
                { translateY: grillY }, 
                { scale: logoScale }, 
                { scale: pulseAnim }
              ] 
            }
          ]}>
            <View style={styles.logoCircleLarge}>
              <Image source={require('../assets/images/logos/grill.png')} style={styles.logoImg} />
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  onboardingContent: { flex: 1 },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000', 
    zIndex: 1000,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  logoAbsolute: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircleLarge: {
    width: 155,
    height: 155,
    borderRadius: 78,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoImg: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
  },
  // ONBOARDING STYLES
  cardContainer: { width: width * 0.9, height: height * 0.78 },
  floatingCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 45,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
  },
  slideContent: { alignItems: 'center', flex: 1, justifyContent: 'center', width: '100%' },
  imageBox: { width: '100%', height: height * 0.32, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  marketingIcon: { width: width * 0.8, height: '100%', resizeMode: 'contain', borderRadius: 20 },
  textContainer: { alignItems: 'center', width: '100%', paddingHorizontal: 15 },
  slideTitle: { fontSize: 26, fontWeight: '900', color: '#38241b', textAlign: 'center', lineHeight: 32, marginBottom: 10, textTransform: 'uppercase' },
  slideDescription: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24 },
  paginationContainer: { flexDirection: 'row', height: 10, alignItems: 'center', justifyContent: 'center', marginVertical: 15 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#cbd5e1', marginHorizontal: 5 },
  activeDot: { width: 25, backgroundColor: '#f97316' },
  buttonWrapper: { width: '100%', paddingBottom: 5 },
  actionBtn: { width: '100%', height: 60, backgroundColor: '#f97316', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  actionBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  backgroundSplit: { ...StyleSheet.absoluteFillObject, zIndex: -1 },
  topBackground: { flex: 1, backgroundColor: '#38241b', opacity: 0.05 },
  bottomBackground: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: Platform.OS === 'android' ? 20 : 10, zIndex: 10 },
  brandTitle: { fontSize: 24, fontWeight: '900', color: '#38241b' },
  skipText: { fontSize: 16, fontWeight: '700', color: '#f97316' },
  slideContainer: { width: width, height: height, justifyContent: 'center', alignItems: 'center' },
});