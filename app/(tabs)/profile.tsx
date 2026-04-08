import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, 
  Alert, Platform, ActivityIndicator, TextInput, Modal, Dimensions 
} from 'react-native';
import { StatusBar, setStatusBarStyle } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [userData, setUserData] = useState({
    name: '', email: '', phone: '', address: '', avatar: null as string | null
  });

  const [editing, setEditing] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  const [tempAddress, setTempAddress] = useState('');

  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

  const API_URL = 'http://192.168.250.1:8000/api';

  useEffect(() => {
    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setStatusBarStyle('light');
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/user`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await response.json();
      
      let fullAvatar = data.avatar;
      if (fullAvatar && !fullAvatar.startsWith('http')) {
        const baseUrl = 'http://192.168.250.1:8000';
        fullAvatar = `${baseUrl}${fullAvatar.startsWith('/') ? '' : '/'}${fullAvatar}`;
      }

      setUserData({
        name: data.name, email: data.email,
        phone: data.phone || '', address: data.address || '',
        avatar: fullAvatar
      });
      setTempPhone(data.phone || '');
      setTempAddress(data.address || '');
    } catch (error) {
      console.log("Error cargando perfil", error);
    } finally {
      setFetching(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) uploadProfile(result.assets[0].uri);
  };

  const uploadProfile = async (imageUri?: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();
      formData.append('phone', tempPhone);
      formData.append('address', tempAddress);

      if (imageUri) {
        let filename = imageUri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename || '');
        let type = match ? `image/${match[1]}` : `image`;
        formData.append('avatar', { uri: imageUri, name: filename, type } as any);
      }

      const response = await fetch(`${API_URL}/user/update`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      if (response.ok) {
        const json = await response.json();
        setUserData({ ...userData, avatar: json.user.avatar, phone: tempPhone, address: tempAddress });
        setEditing(false);
        Alert.alert("¡Listo!", "Perfil actualizado con éxito");
      }
    } catch (e) { Alert.alert("Error", "No se pudo guardar los cambios"); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (passData.new !== passData.confirm) return Alert.alert("Error", "Las contraseñas no coinciden");
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/user/change-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ current_password: passData.current, new_password: passData.new, new_password_confirmation: passData.confirm })
      });
      if (response.ok) {
        Alert.alert("Éxito", "Contraseña cambiada");
        setShowPassModal(false);
        setPassData({ current: '', new: '', confirm: '' });
      } else {
        const d = await response.json();
        Alert.alert("Error", d.message || "No se pudo cambiar la clave");
      }
    } catch (e) { Alert.alert("Error", "Fallo de conexión"); }
    finally { setLoading(false); }
  };

  if (fetching) return (
    <View style={[styles.container, {justifyContent: 'center', backgroundColor: '#f97316'}]}><ActivityIndicator size="large" color="white"/></View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />
      
      {/* FONDO DIVIDIDO GLOBAL */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{flexDirection: 'row', height: '100%'}}>
          <View style={{flex: 1, backgroundColor: '#f97316'}} />
          <View style={{flex: 1, backgroundColor: '#5D4037'}} />
        </View>
      </View>

      {/* HEADER */}
      <View style={[styles.header, { height: 180 + insets.top, paddingTop: insets.top + 10 }]}>

        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <TouchableOpacity onPress={() => editing ? uploadProfile() : setEditing(true)}>
            <Ionicons name={editing ? "checkmark-circle" : "pencil"} size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarContainer}>
          {userData.avatar ? (
            <Image source={{ uri: userData.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarImage, {backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center'}]}>
              <Ionicons name="person" size={50} color="#9CA3AF" />
            </View>
          )}
          <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* FORMULARIO */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{marginTop: 60, paddingBottom: 120 + insets.bottom}}>
          <Text style={styles.userNameText}>{userData.name}</Text>
          <Text style={styles.userEmailText}>{userData.email}</Text>

          <View style={styles.section}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <View style={[styles.inputBox, editing && {borderColor: '#f97316', borderWidth: 1}]}>
              <Ionicons name="call-outline" size={20} color="#f97316" style={{marginRight: 10}} />
              {editing ? <TextInput style={styles.textInput} value={tempPhone} onChangeText={setTempPhone} keyboardType="phone-pad" /> : 
              <Text style={styles.infoText}>{userData.phone || "No registrado"}</Text>}
            </View>

            <Text style={styles.inputLabel}>Dirección de Entrega</Text>
            <View style={[styles.inputBox, editing && {borderColor: '#f97316', borderWidth: 1}]}>
              <Ionicons name="location-outline" size={20} color="#f97316" style={{marginRight: 10}} />
              {editing ? <TextInput style={styles.textInput} value={tempAddress} onChangeText={setTempAddress} multiline /> : 
              <Text style={styles.infoText}>{userData.address || "No registrada"}</Text>}
            </View>

            <Text style={styles.inputLabel}>Seguridad</Text>
            <TouchableOpacity style={styles.inputBox} onPress={() => setShowPassModal(true)}>
              <Ionicons name="lock-closed-outline" size={20} color="#f97316" style={{marginRight: 10}} />
              <Text style={styles.infoText}>Cambiar Contraseña</Text>
              <Ionicons name="chevron-forward" size={16} color="#f97316" style={{marginLeft: 'auto'}} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Mi Actividad</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert("Historial", "Próximamente verás tus pedidos aquí.")}>
            <View style={styles.menuIcon}><Ionicons name="receipt-outline" size={22} color="#f97316" /></View>
            <Text style={styles.menuText}>Historial de Pedidos</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={async () => { 
            // NO USAR .clear() porque borra el "Recuérdame"
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userName');
            router.replace('/'); 
          }}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
            <Ionicons name="log-out-outline" size={20} color="#f97316" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL CONTRASEÑA */}
      <Modal visible={showPassModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nueva Contraseña</Text>
            <TextInput style={styles.modalInput} placeholder="Contraseña actual" secureTextEntry value={passData.current} onChangeText={(t)=>setPassData({...passData, current: t})} />
            <TextInput style={styles.modalInput} placeholder="Nueva contraseña" secureTextEntry value={passData.new} onChangeText={(t)=>setPassData({...passData, new: t})} />
            <TextInput style={styles.modalInput} placeholder="Confirmar nueva" secureTextEntry value={passData.confirm} onChangeText={(t)=>setPassData({...passData, confirm: t})} />
            
            <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity style={styles.modalBtnSec} onPress={() => setShowPassModal(false)}><Text style={{color: '#666'}}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPri} onPress={handleChangePassword}>
                {loading ? <ActivityIndicator color="white"/> : <Text style={{color: 'white', fontWeight: 'bold'}}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { alignItems: 'center', position: 'relative', zIndex: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, zIndex: 20 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  avatarContainer: { 
    position: 'absolute', 
    bottom: -50, 
    left: '50%',
    marginLeft: -59, // Mitad del ancho total (110 + 4+4 de padding)
    zIndex: 999,
    elevation: 10,
    backgroundColor: 'white', 
    padding: 4, 
    borderRadius: 75,
  },
  avatarImage: { width: 110, height: 110, borderRadius: 55 },
  cameraBtn: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#333', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
  content: { flex: 1, backgroundColor: '#F9FAFB', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25 },
  userNameText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  userEmailText: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 20 },
  inputLabel: { fontSize: 13, color: '#888', fontWeight: 'bold', marginBottom: 8, marginLeft: 5 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 16, marginBottom: 15, elevation: 1 },
  infoText: { flex: 1, color: '#333', fontSize: 15 },
  textInput: { flex: 1, color: '#333', fontSize: 15, padding: 0 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 20, elevation: 1 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: '#FFF7ED', borderRadius: 16, borderWidth: 1, borderColor: '#FFEDD5' },
  logoutText: { color: '#f97316', fontWeight: 'bold', marginRight: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: 'white', borderRadius: 25, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  modalInput: { width: '100%', backgroundColor: '#F3F4F6', padding: 15, borderRadius: 15, marginBottom: 15 },
  modalBtnPri: { flex: 1, backgroundColor: '#f97316', padding: 15, borderRadius: 15, alignItems: 'center' },
  modalBtnSec: { flex: 1, backgroundColor: '#E5E7EB', padding: 15, borderRadius: 15, alignItems: 'center' }
});