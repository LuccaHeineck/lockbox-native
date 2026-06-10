import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../utils/supabase';

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
      <View style={styles.header}>
        <Text style={styles.brandTitle}>nova conta</Text>
        <Text style={styles.brandSubtitle}>Crie suas credenciais para começar a encriptar seus dados locais.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          placeholderTextColor="#4b5563"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha Mestre</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor="#4b5563"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleRegister} disabled={loading}>
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
    </View>
  );
}

// Reutilização consistente dos estilos para manter a UI coesa
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712', paddingHorizontal: 28, justifyContent: 'center' },
  header: { marginBottom: 36 },
  brandTitle: { fontSize: 28, fontWeight: '700', color: '#f3f4f6', letterSpacing: -0.5 },
  brandSubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 6, lineHeight: 20 },
  form: { width: '100%' },
  label: { color: '#9ca3af', fontSize: 12, fontWeight: '500', marginBottom: 6, letterSpacing: 0.5 },
  input: { 
    backgroundColor: '#0f172a', 
    borderWidth: 1, 
    borderColor: '#1f2937', 
    color: '#f3f4f6', 
    padding: 14, 
    borderRadius: 8, 
    fontSize: 15, 
    marginBottom: 20 
  },
  buttonPrimary: { 
    backgroundColor: '#6366f1', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4f46e5'
  },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#6b7280', fontSize: 14 },
  linkText: { color: '#6366f1', fontSize: 14, fontWeight: '500' },
});