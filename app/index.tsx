import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  StatusBar, ScrollView, Alert, ActivityIndicator, 
  Switch, Platform, Image, ImageBackground, Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const API_URL = 'http://192.168.250.1:8000/api/login';

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          router.replace('/selection'); 
        }
      } catch (e) {
        console.log("Error verificando sesión", e);
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Atención", "Por favor ingresa correo y contraseña");
      return;
    }

    setLoading(true);

    // Timeout de 10 segundos para no quedarse colgado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      console.log("Intentando conectar a:", API_URL);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const textResponse = await response.text(); 
      let data;
      
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        Alert.alert("Error de Formato", "El servidor no envió una respuesta válida. Revisa que Laravel esté corriendo en " + API_URL);
        setLoading(false);
        return;
      }

      if (response.ok) {
        if (data.token) {
          await AsyncStorage.setItem('userToken', data.token);
          await AsyncStorage.setItem('userName', data.user.name);
          router.replace('/selection'); 
        }
      } else {
        Alert.alert("Error de Acceso", data.message || "Credenciales incorrectas");
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        Alert.alert("Timeout", "El servidor tardó demasiado en responder. ¿La IP " + API_URL + " es correcta?");
      } else {
        console.error(error);
        Alert.alert("Error de Red", "No se pudo conectar con el servidor. Verifica que tu celular y la PC estén en la misma red WIFI.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerContainer}>
          {/* LADO IZQUIERDO (CHICKEN / NARANJA) */}
          <View style={styles.sideChicken}>
            <Image 
              source={require('../assets/images/logos/chicken.png')}
              style={styles.fadedMascot}
            />
          </View>
          
          {/* LADO DERECHO (GRILL / MARRÓN) */}
          <View style={styles.sideGrill}>
            <Image 
              source={require('../assets/images/logos/grill.png')}
              style={styles.fadedMascot}
            />
          </View>

          {/* TEXTO CENTRAL */}
          <View style={styles.headerContent}>
            <Text style={styles.welcomeTitle}>¡Bienvenido {"\n"} Bochinchero!</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#94a3b8" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.rememberRow}>
            <Text style={styles.rememberText}>Recordar datos</Text>
            <Switch 
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: "#e2e8f0", true: "#fdba74" }}
              thumbColor={rememberMe ? "#f97316" : "#f1f5f9"}
              ios_backgroundColor="#e2e8f0"
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginBtn, loading && styles.btnDisabled]} 
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginText}>INICIAR SESIÓN</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.signupText}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.48, // Muy alto para que sobre por debajo del card
    flexDirection: 'row',
    overflow: 'hidden',
  },
  sideChicken: {
    flex: 1,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideGrill: {
    flex: 1,
    backgroundColor: '#2D1E1E', // El marrón de tu imagen
    justifyContent: 'center',
    alignItems: 'center',
  },
  fadedMascot: {
    width: 200,
    height: 200,
    opacity: 0.1, // Más difuminado para que resalte el texto
    resizeMode: 'contain',
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  welcomeTitle: { 
    fontSize: 40,
    fontWeight: '900', 
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 45,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  formCard: { 
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: -80, // Gran solapamiento para ocultar cualquier detalle bajo los corners
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 30,
    paddingTop: 35,
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT * 0.6,
  },
  label: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#1e293b',
    marginBottom: 8, 
    marginTop: 15,
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f1f5f9', 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    height: 55, 
    borderWidth: 1, 
    borderColor: '#e2e8f0',
  },
  icon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#0f172a' 
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  rememberText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginBtn: { 
    backgroundColor: '#f97316', 
    height: 60, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 50, // Más espacio
  },
  btnDisabled: {
    opacity: 0.7,
  },
  loginText: { 
    color: '#ffffff', 
    fontWeight: '800', 
    fontSize: 18,
    letterSpacing: 1,
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 50, // Más espacio para llenar el fondo
    paddingBottom: 50,
  },
  footerText: { 
    color: '#64748b',
    fontSize: 14,
  },
  signupText: { 
    color: '#f97316', 
    fontWeight: 'bold',
    fontSize: 14,
  }
});