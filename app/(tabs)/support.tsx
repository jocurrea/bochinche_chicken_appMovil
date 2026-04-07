import React, { useState, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, 
  Image, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { StatusBar, setStatusBarStyle } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: '¡Hola! Soy el asistente de J/N DEV. ¿En qué puedo ayudarte?', sender: 'ai', type: 'text' }
  ]);
  const flatListRef = useRef<FlatList>(null);

  const YOUR_IP = '192.168.250.1:8000'; 

  const sendMessage = async (textMsg: string, isImage = false, imageUri: any = null) => {
    if (!textMsg.trim() && !isImage) return;

    const newMessage: any = {
      id: Date.now().toString(),
      text: textMsg,
      sender: 'user',
      type: isImage ? 'image' : 'text',
      uri: imageUri
    };

    setMessages(prev => [...prev, newMessage]);
    if (!isImage) setInput('');

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://${YOUR_IP}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ mensaje: textMsg })
      });

      if (response.ok) {
        const data = await response.json();
        const aiRes = { 
            id: (Date.now()+1).toString(), 
            text: data.respuesta, 
            sender: 'ai', 
            type: 'text' 
        };
        setMessages(prev => [...prev, aiRes]);
      }
    } catch (e) {
      console.log("Error en chat", e);
    }
  };

  const pickCapture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        sendMessage("Capture de Pago", true, asset.uri);
    }
  };

  const renderMessage = ({ item }: any) => (
    <View style={[styles.msgWrapper, item.sender === 'user' ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
      <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
        {item.type === 'image' ? (
          <Image source={{ uri: item.uri }} style={styles.captureImg} />
        ) : (
          <Text style={[styles.msgText, item.sender === 'user' ? { color: 'white' } : { color: '#333' }]}>
            {item.text}
          </Text>
        )}
      </View>
    </View>
  );

  useFocusEffect(
    React.useCallback(() => {
      setStatusBarStyle('light');
    }, [])
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="light" translucent />
      
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 15 }]}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Soporte J/N DEV</Text>
        <Ionicons name="information-circle-outline" size={24} color="white" />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[styles.chatList, { paddingBottom: 100 }]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 10) + 75 }]}>
        <TouchableOpacity style={styles.attachBtn} onPress={pickCapture}>
          <Ionicons name="add" size={28} color="#f97316" />
        </TouchableOpacity>
        
        <TextInput 
          style={styles.input} 
          placeholder="Escribe tus dudas aquí..." 
          value={input} 
          onChangeText={setInput} 
        />

        <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage(input)}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { height: 100, backgroundColor: '#f97316', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, justifyContent: 'space-between' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  chatList: { padding: 20 },
  msgWrapper: { marginBottom: 15, width: '100%' },
  bubble: { padding: 12, borderRadius: 20, maxWidth: '80%', elevation: 1 },
  userBubble: { backgroundColor: '#f97316', borderBottomRightRadius: 2 },
  aiBubble: { backgroundColor: 'white', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#EEE' },
  msgText: { fontSize: 15, lineHeight: 20 },
  captureImg: { width: 200, height: 200, borderRadius: 10 },
  
  inputArea: { 
    flexDirection: 'row', 
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: 'white', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: '#EEE',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  attachBtn: { width: 40, alignItems: 'center' },
  input: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 25, 
    paddingHorizontal: 15, 
    height: 45,
    marginHorizontal: 5
  },
  sendBtn: { 
    backgroundColor: '#f97316', 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    justifyContent: 'center', 
    alignItems: 'center' 
  }
});