import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { StatusBar, setStatusBarStyle } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://192.168.250.1:8000/api/register';

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          password_confirmation: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("¡Éxito!", "Cuenta creada. Por favor inicia sesión.");
        router.back(); // Regresa al Login (index.tsx)
      } else {
        Alert.alert("Error", data.message || "No se pudo registrar");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Revisa tu conexión a Laravel");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setStatusBarStyle('light');
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Cuenta</Text>
        <Text style={styles.headerSubtitle}>Únete a J/N DEV Food</Text>
      </View>

      <View style={styles.formContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          <Text style={styles.label}>Nombre Completo</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Tu Nombre"
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.registerBtn, loading && {opacity: 0.7}]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerText}>REGISTRARSE</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f97316' },
  header: { height: 200, padding: 30, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 10 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', marginTop: 20 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  formContainer: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingTop: 40 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 15, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 5 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  registerBtn: { backgroundColor: '#333', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 40, elevation: 5 },
  registerText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#666' },
  loginLink: { color: '#f97316', fontWeight: 'bold' }
});