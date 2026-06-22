import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing, 
  FadeInUp 
} from 'react-native-reanimated';

export function UnlockScreen() {
  const { setUnlocked } = useAuth();
  const [loading, setLoading] = useState(false);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Inicia a animação de pulso infinito
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    handleUnlock();
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  async function handleUnlock() {
    setLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para acessar o lockbox',
        fallbackLabel: 'Usar PIN do dispositivo',
      });
      if (result.success) {
        setUnlocked(true);
      }
    } catch (error) {
      console.log('Erro na biometria:', error);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(600).damping(14)} style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <Ionicons name="lock-closed" size={72} color="#F43F5E" />
        </Animated.View>
        
        <Text style={styles.title}>Cofre Bloqueado</Text>
        <Text style={styles.subtitle}>Confirme sua identidade para continuar.</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleUnlock} disabled={loading} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="finger-print" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Desbloquear</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.logoutText}>Sair e usar outra conta</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A0A0A', 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#F5F5F5', 
    letterSpacing: -1,
    marginBottom: 8
  },
  subtitle: { 
    fontSize: 14, 
    color: '#A3A3A3', 
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F43F5E',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  buttonText: { 
    color: '#ffffff', 
    fontSize: 15, 
    fontWeight: '700',
    letterSpacing: 0.5
  },
  logoutButton: {
    marginTop: 32,
    padding: 10
  },
  logoutText: {
    color: '#737373',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5
  }
});
