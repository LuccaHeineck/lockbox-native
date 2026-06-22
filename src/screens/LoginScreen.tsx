import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../routes';
import { supabase } from '../utils/supabase';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import Animated, { FadeInUp } from 'react-native-reanimated';

type LoginScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginScreenProp>();
  const { setUnlocked } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);

  React.useEffect(() => {
    checkBiometricsAndCredentials();
  }, []);

  async function checkBiometricsAndCredentials() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricSupported(compatible && enrolled);

    const savedEmail = await SecureStore.getItemAsync('user_email');
    const savedPassword = await SecureStore.getItemAsync('user_password');
    if (savedEmail && savedPassword) {
      setHasSavedCredentials(true);
    }
  }

  async function handleBiometricLogin() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para acessar o lockbox',
        fallbackLabel: 'Usar senha',
      });

      if (result.success) {
        const savedEmail = await SecureStore.getItemAsync('user_email');
        const savedPassword = await SecureStore.getItemAsync('user_password');

        if (savedEmail && savedPassword) {
          setLoading(true);
          setUnlocked(true); // Desbloqueia na sessão
          const { error } = await supabase.auth.signInWithPassword({ email: savedEmail, password: savedPassword });
          if (error) Alert.alert('Erro no acesso', error.message);
          setLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao autenticar.');
    }
  }

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Aviso', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    setUnlocked(true); // Desbloqueia na sessão se o login por senha for bem sucedido
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('Erro no acesso', error.message);
    } else {
      await SecureStore.setItemAsync('user_email', email);
      await SecureStore.setItemAsync('user_password', password);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(600).damping(14)} style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="lock-closed" size={32} color="#F43F5E" style={{ marginBottom: 12 }} />
          <Text style={styles.brandTitle}>lockbox</Text>
          <Text style={styles.brandSubtitle}>Insira suas credenciais mestre para acessar o cofre.</Text>
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
            placeholder="••••••••"
            placeholderTextColor="#525252"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Acessar cofre</Text>
            )}
          </TouchableOpacity>

          {isBiometricSupported && hasSavedCredentials && (
            <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin} disabled={loading} activeOpacity={0.8}>
              <Ionicons name="finger-print" size={20} color="#F5F5F5" />
              <Text style={styles.biometricButtonText}>Acessar com Biometria</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não possui uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Criar conta</Text>
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
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171717',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#262626'
  },
  biometricButtonText: { color: '#F5F5F5', fontSize: 15, fontWeight: '600', marginLeft: 10 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#737373', fontSize: 14 },
  linkText: { color: '#F43F5E', fontSize: 14, fontWeight: '600' },
});