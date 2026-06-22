import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../routes';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, Layout, SlideInRight } from 'react-native-reanimated';

type CredentialsScreenRouteProp = RouteProp<RootStackParamList, 'Credentials'>;

interface Credential {
  id: string;
  title: string;
  username: string;
  encrypted_password: string;
}

export function CredentialsScreen() {
  const { user } = useAuth();
  const route = useRoute<CredentialsScreenRouteProp>();
  const navigation = useNavigation();
  const { groupId, groupName } = route.params;

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [visiblePasswordId, setVisiblePasswordId] = useState<string | null>(null);

  useEffect(() => {
    fetchCredentials();
  }, [groupId]);

  async function fetchCredentials() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('id, title, username, encrypted_password')
        .eq('group_id', groupId)
        .order('title', { ascending: true });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCredential() {
    if (!title.trim() || !username.trim() || !password.trim()) {
      Alert.alert('Aviso', 'Preencha todos os campos.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('credentials')
        .insert([{
          user_id: user.id,
          group_id: groupId,
          title: title.trim(),
          username: username.trim(),
          encrypted_password: password.trim(),
          encryption_iv: 'placeholder_iv_until_crypto_implemented'
        }]);

      if (error) throw error;

      setTitle('');
      setUsername('');
      setPassword('');
      
      await fetchCredentials();
    } catch (error: any) {
      Alert.alert('Erro ao salvar', error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(500)} style={styles.navbar}>
        <TouchableOpacity style={styles.buttonBack} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#A3A3A3" />
        </TouchableOpacity>
        <Text style={styles.navBrand}>lockbox</Text>
        <View style={{ width: 24 }} />
      </Animated.View>

      <View style={styles.content}>
        <Animated.Text entering={FadeInUp.duration(500).delay(100)} style={styles.title}>
          {groupName}
        </Animated.Text>
        <Animated.Text entering={FadeInUp.duration(500).delay(200)} style={styles.subtitle}>
          Credenciais seguras guardadas nesta pasta
        </Animated.Text>

        <Animated.View entering={FadeInUp.duration(500).delay(300)} style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Título (ex: GitHub)"
            placeholderTextColor="#525252"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.rowInputs}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Usuário / E-mail"
              placeholderTextColor="#525252"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Senha"
              placeholderTextColor="#525252"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.buttonSave} 
            onPress={handleCreateCredential}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonSaveText}>Adicionar Credencial</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {loading ? (
          <ActivityIndicator size="small" color="#F43F5E" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={credentials}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <Animated.View entering={FadeInDown.duration(500)} style={styles.emptyCard}>
                <Ionicons name="key-outline" size={32} color="#262626" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>Nenhuma senha guardada aqui ainda.</Text>
              </Animated.View>
            )}
            renderItem={({ item, index }) => {
              const isVisible = visiblePasswordId === item.id;
              
              return (
                <Animated.View 
                  entering={FadeInDown.duration(400).delay(index * 100)} 
                  layout={Layout.springify()} 
                  style={styles.credentialCard}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.credentialTitle}>{item.title}</Text>
                    <Text style={styles.credentialLogin}>{item.username}</Text>
                  </View>
                  
                  <View style={styles.passwordContainer}>
                    <Text style={styles.credentialPassword}>
                      {isVisible ? item.encrypted_password : '••••••••'}
                    </Text>
                    
                    <TouchableOpacity 
                      style={styles.buttonReveal}
                      onPress={() => setVisiblePasswordId(isVisible ? null : item.id)}
                      activeOpacity={0.6}
                    >
                      <Ionicons 
                        name={isVisible ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#A3A3A3" 
                      />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A0A0A' 
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  buttonReveal: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingTop: 60, 
    paddingBottom: 16,
    justifyContent: 'space-between'
  },
  buttonBack: { 
    padding: 8,
    marginLeft: -8
  },
  navBrand: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#F5F5F5', 
    letterSpacing: -0.5 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 24, 
    paddingTop: 16 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#F5F5F5', 
    letterSpacing: -0.5 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#A3A3A3', 
    marginTop: 4, 
    marginBottom: 32 
  },
  form: { 
    backgroundColor: '#171717', 
    borderWidth: 1, 
    borderColor: '#262626', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6
  },
  rowInputs: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 16 
  },
  input: { 
    backgroundColor: '#0A0A0A', 
    borderWidth: 1, 
    borderColor: '#262626', 
    color: '#F5F5F5', 
    padding: 14, 
    borderRadius: 12, 
    fontSize: 14,
    marginBottom: 16
  },
  buttonSave: { 
    backgroundColor: '#F43F5E', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 4,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  buttonSaveText: { 
    color: '#ffffff', 
    fontSize: 15, 
    fontWeight: '700',
    letterSpacing: 0.5 
  },
  listContainer: { 
    paddingBottom: 40 
  },
  credentialCard: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#171717', 
    borderWidth: 1, 
    borderColor: '#262626', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 12 
  },
  credentialTitle: { 
    color: '#F5F5F5', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  credentialLogin: { 
    color: '#A3A3A3', 
    fontSize: 13, 
    marginTop: 4 
  },
  credentialPassword: { 
    color: '#F5F5F5', 
    fontFamily: 'monospace', 
    fontSize: 14,
    letterSpacing: 2
  },
  emptyCard: { 
    borderWidth: 1, 
    borderColor: '#262626', 
    borderStyle: 'dashed', 
    borderRadius: 16, 
    padding: 40, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#171717',
  },
  emptyText: { 
    color: '#A3A3A3', 
    fontSize: 14, 
    textAlign: 'center' 
  }
});