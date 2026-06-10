import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../routes';
import { supabase } from '../utils/supabase';

type LoginScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginScreenProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Aviso', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Erro no acesso', error.message);
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>lockbox</Text>
        <Text style={styles.brandSubtitle}>Insira suas credenciais mestre para acessar o cofre.</Text>
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
          placeholder="••••••••"
          placeholderTextColor="#4b5563"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Acessar cofre</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Não possui uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712', paddingHorizontal: 28, justifyContent: 'center' },
  header: { marginBottom: 36 },
  brandTitle: { fontSize: 28, fontWeight: '700', color: '#f3f4f6', letterSpacing: -0.5 },
  brandSubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 6, lineHeight: 20 },
  form: { width: '100%' },
  label: { color: '#9ca3af', fontSize: 12, fontWeight: '500', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
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