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
import { encryptData, decryptData } from '../utils/crypto';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
type CredentialsScreenRouteProp = RouteProp<RootStackParamList, 'Credentials'>;

interface Credential {
  id: string;
  title: string;
  username: string;
  password: string;
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
  const [editingCredentialId, setEditingCredentialId] = useState<string | null>(null);

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
      if (data) {
        const decrypted = await Promise.all(
          data.map(async (item) => ({
            id: item.id,
            title: item.title,
            username: await decryptData(item.username),
            password: await decryptData(item.encrypted_password),
          }))
        );
        setCredentials(decrypted);
      } else {
        setCredentials([]);
      }
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
      if (editingCredentialId) {
        const { error } = await supabase
          .from('credentials')
          .update({
            title: title.trim(),
            username: await encryptData(username.trim()),
            encrypted_password: await encryptData(password.trim()),
          })
          .eq('id', editingCredentialId);
        if (error) throw error;
        setEditingCredentialId(null);
      } else {
        const { error } = await supabase
          .from('credentials')
          .insert([{
            user_id: user.id,
            group_id: groupId,
            title: title.trim(),
            username: await encryptData(username.trim()),
            encrypted_password: await encryptData(password.trim()),
            encryption_iv: 'placeholder_iv_until_crypto_implemented'
          }]);
        if (error) throw error;
      }

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

  function startEditCredential(item: Credential) {
    setEditingCredentialId(item.id);
    setTitle(item.title);
    setUsername(item.username);
    setPassword(item.password);
  }

  // Toggle visibility of password in list
  function togglePasswordVisibility(item: Credential) {
    setVisiblePasswordId(visiblePasswordId === item.id ? null : item.id);
  }

  // Delete a credential
  async function handleDeleteCredential(id: string) {
    try {
      const { error } = await supabase.from('credentials').delete().eq('id', id);
      if (error) throw error;
      await fetchCredentials();
    } catch (e: any) {
      Alert.alert('Erro ao excluir credencial', e.message);
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
                  {/* Top row: title + username */}
                  <View style={styles.cardTop}>
                    <Text style={styles.credentialTitle}>{item.title}</Text>
                    <Text style={styles.credentialLogin}>{item.username}</Text>
                  </View>

                  {/* Bottom row: password + actions */}
                  <View style={styles.cardBottom}>
                    <View style={styles.passwordRow}>
                      <Text style={styles.credentialPassword}>
                        {isVisible ? item.password : '••••••••'}
                      </Text>
                      <TouchableOpacity
                        onPress={() => togglePasswordVisibility(item)}
                        activeOpacity={0.6}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={isVisible ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="#A3A3A3"
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        onPress={() => startEditCredential(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="create-outline" size={18} color="#F43F5E" />
                      </TouchableOpacity>
                      <View style={styles.actionDivider} />
                      <TouchableOpacity
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => {
                          Alert.alert(
                            'Excluir credencial',
                            'Tem certeza que deseja excluir esta credencial?',
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { text: 'Excluir', style: 'destructive', onPress: () => handleDeleteCredential(item.id) },
                            ]
                          );
                        }}
                      >
                        <Ionicons name="trash-outline" size={18} color="#F43F5E" />
                      </TouchableOpacity>
                    </View>
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
    alignItems: 'center', // vertically center password text and eye button
    gap: 12,
    // Ensure vertical alignment of text and button
    overflow: 'visible',
  },
  buttonReveal: {
    // Slightly enlarge touchable area and ensure icon is fully visible
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center', // center icon within touchable area
    alignSelf: 'center',
    marginLeft: 4,
    width: 28,
    height: 28,
    overflow: 'visible',
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
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
    marginBottom: 12,
  },
  cardTop: {
    marginBottom: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#262626',
    paddingVertical: 12,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#262626',
  },
  credentialTitle: {
    color: '#F5F5F5',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  credentialLogin: {
    color: '#A3A3A3',
    fontSize: 13,
    marginTop: 2,
  },
  credentialPassword: {
    color: '#F5F5F5',
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 2,
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
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center', // vertically align edit/delete icons with password line
    alignSelf: 'center', // center container within credential card row
    gap: 12,
  },
  emptyText: {
    color: '#A3A3A3',
    fontSize: 14,
    textAlign: 'center',
  },
});