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
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.buttonBack} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonBackText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.navBrand}>lockbox</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{groupName}</Text>
        <Text style={styles.subtitle}>Credenciais seguras guardadas nesta pasta</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Título (ex: GitHub)"
            placeholderTextColor="#4b5563"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.rowInputs}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Usuário / E-mail"
              placeholderTextColor="#4b5563"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Senha"
              placeholderTextColor="#4b5563"
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
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonSaveText}>Adicionar Credencial</Text>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#6366f1" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={credentials}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Nenhuma senha guardada aqui ainda.</Text>
              </View>
            )}
            renderItem={({ item }) => {
              const isVisible = visiblePasswordId === item.id;
              
              return (
                <View style={styles.credentialCard}>
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
                        size={18} 
                        color="#9ca3af" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
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
    backgroundColor: '#030712' 
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
  buttonRevealText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500'
  },
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
  buttonBack: { 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 6, 
    backgroundColor: '#111827', 
    borderWidth: 1, 
    borderColor: '#1f2937' 
  },
  buttonBackText: { 
    color: '#9ca3af', 
    fontSize: 13, 
    fontWeight: '500' 
  },
  navBrand: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#f3f4f6', 
    letterSpacing: -0.5 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 24, 
    paddingTop: 24 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '600', 
    color: '#f3f4f6', 
    letterSpacing: -0.3 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#6b7280', 
    marginTop: 4, 
    marginBottom: 20 
  },
  form: { 
    backgroundColor: '#090d16', 
    borderWidth: 1, 
    borderColor: '#1f2937', 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 24 
  },
  rowInputs: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 12 
  },
  input: { 
    backgroundColor: '#030712', 
    borderWidth: 1, 
    borderColor: '#1f2937', 
    color: '#f3f4f6', 
    padding: 10, 
    borderRadius: 6, 
    fontSize: 14,
    marginBottom: 12
  },
  buttonSave: { 
    backgroundColor: '#6366f1', 
    padding: 12, 
    borderRadius: 6, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#4f46e5', 
    marginTop: 4 
  },
  buttonSaveText: { 
    color: '#ffffff', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  listContainer: { 
    paddingBottom: 24 
  },
  credentialCard: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#090d16', 
    borderWidth: 1, 
    borderColor: '#1f2937', 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 12 
  },
  credentialTitle: { 
    color: '#f3f4f6', 
    fontSize: 15, 
    fontWeight: '600' 
  },
  credentialLogin: { 
    color: '#6b7280', 
    fontSize: 13, 
    marginTop: 2 
  },
  credentialPassword: { 
    color: '#e5e7eb', 
    fontFamily: 'monospace', 
    fontSize: 14 
  },
  emptyCard: { 
    borderWidth: 1, 
    borderColor: '#1f2937', 
    borderStyle: 'dashed', 
    borderRadius: 8, 
    padding: 32, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#090d16',
  },
  emptyText: { 
    color: '#4b5563', 
    fontSize: 14, 
    textAlign: 'center' 
  }
});