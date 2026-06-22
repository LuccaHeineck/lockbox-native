import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../utils/supabase';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export function RegisterScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password) {
      Alert.alert('Aviso', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert('Conta criada', 'Sua conta foi gerada. Faça login para ativar a segurança.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(600).damping(14)} style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="key-outline" size={32} color="#F43F5E" style={{ marginBottom: 12 }} />
          <Text style={styles.brandTitle}>nova conta</Text>
          <Text style={styles.brandSubtitle}>Crie suas credenciais para começar a encriptar seus dados locais.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#525252"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Senha Mestre</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#525252"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.buttonPrimary} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Registrar credenciais</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem chaves de acesso? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center' },
  content: { paddingHorizontal: 28 },
  header: { marginBottom: 36, alignItems: 'center' },
  brandTitle: { fontSize: 32, fontWeight: '800', color: '#F5F5F5', letterSpacing: -1 },
  brandSubtitle: { fontSize: 14, color: '#A3A3A3', marginTop: 8, lineHeight: 22, textAlign: 'center', paddingHorizontal: 16 },
  form: { width: '100%' },
  label: { color: '#A3A3A3', fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { 
    backgroundColor: '#171717', 
    borderWidth: 1, 
    borderColor: '#262626', 
    color: '#F5F5F5', 
    padding: 16, 
    borderRadius: 12, 
    fontSize: 15, 
    marginBottom: 20 
  },
  buttonPrimary: { 
    backgroundColor: '#F43F5E', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 8,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#737373', fontSize: 14 },
  linkText: { color: '#F43F5E', fontSize: 14, fontWeight: '600' },
});