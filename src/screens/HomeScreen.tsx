import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Crypto from 'expo-crypto';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export function HomeScreen() {
  const { user } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    async function checkAndFixProfile() {
      if (!user) return;
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('master_password_hash')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile && profile.master_password_hash === 'placeholder_until_first_login') {
          const saltBase = `${user.id}-${user.email}`;
          const secureHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, saltBase);

          await supabase
            .from('profiles')
            .update({ master_password_hash: secureHash, updated_at: new Date() })
            .eq('id', user.id);

          Alert.alert("Segurança ativa", "Seu hash local foi inicializado com sucesso.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingProfile(false);
      }
    }
    checkAndFixProfile();
  }, [user]);

  if (checkingProfile) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.navBrand}>lockbox</Text>
        <TouchableOpacity style={styles.buttonLogout} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.buttonLogoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Cofre ativo</Text>
        <Text style={styles.subtitle}>Conectado como {user?.email}</Text>
        
        {/* Placeholder para os cartões de senhas que faremos a seguir */}
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhuma credencial ou grupo mapeado ainda.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  containerCenter: { flex: 1, backgroundColor: '#030712', justifyContent: 'center', alignItems: 'center' },
  navbar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingTop: 60, 
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
    justifyContent: 'space-between'
  },
  navBrand: { fontSize: 18, fontWeight: '700', color: '#f3f4f6', letterSpacing: -0.5 },
  buttonLogout: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937' },
  buttonLogoutText: { color: '#9ca3af', fontSize: 13, fontWeight: '500' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 22, fontWeight: '600', color: '#f3f4f6', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 24 },
  emptyCard: { 
    borderWidth: 1, 
    borderColor: '#1f2937', 
    borderStyle: 'dashed', 
    borderRadius: 8, 
    padding: 32, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#090d16'
  },
  emptyText: { color: '#4b5563', fontSize: 14, textAlign: 'center' }
});