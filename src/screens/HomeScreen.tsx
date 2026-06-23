import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert
} from 'react-native';
import * as Crypto from 'expo-crypto';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../routes';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface Group {
  id: string;
  name: string;
  created_at: string;
}

export function HomeScreen() {
  const { user } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Home'>>();

  useEffect(() => {
    async function initializeHome() {
      if (!user) return;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('master_password_hash')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profile && profile.master_password_hash === 'placeholder_until_first_login') {
          const saltBase = `${user.id}-${user.email}`;
          const secureHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, saltBase);

          await supabase
            .from('profiles')
            .update({ master_password_hash: secureHash, updated_at: new Date() })
            .eq('id', user.id);
        }

        await fetchGroups();
      } catch (err) {
        console.error("Erro na inicialização:", err);
      } finally {
        setCheckingProfile(false);
      }
    }

    initializeHome();
  }, [user]);


  async function handleDeleteGroup(id: string) {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchGroups();
    } catch (err: any) {
      Alert.alert('Erro ao excluir grupo', err.message);
    }
  }

  async function handleEditGroup(id: string, currentName: string) {
    Alert.prompt(
      'Renomear Grupo',
      'Digite o novo nome do grupo',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salvar',
          onPress: async (newName: string | undefined) => {
            if (!newName?.trim()) return;
            try {
              const { error } = await supabase
                .from('groups')
                .update({ name: newName.trim() })
                .eq('id', id);
              if (error) throw error;
              await fetchGroups();
            } catch (e: any) {
              Alert.alert('Erro ao atualizar grupo', e.message);
            }
          },
        },
      ],
      'plain-text',
      currentName
    );
      // Moved group fetching logic to dedicated async function
  }

  async function fetchGroups() {
    if (!user) return;
    setLoadingGroups(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error: any) {
      Alert.alert('Erro ao carregar grupos', error.message);
    } finally {
      setLoadingGroups(false);
    }
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim() || !user) return;

    setIsSubmitting(true);
    try {
        const { error } = await supabase
          .from('groups')
          .insert([{ name: newGroupName.trim(), user_id: user.id }]);

        if (error) throw error;

        setNewGroupName('');
        await fetchGroups();
    } catch (error: any) {
      Alert.alert('Erro ao criar grupo', error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (checkingProfile) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator size="small" color="#F43F5E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(500)} style={styles.navbar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="lock-closed" size={20} color="#F43F5E" style={{ marginRight: 8 }} />
          <Text style={styles.navBrand}>lockbox</Text>
        </View>
        <TouchableOpacity style={styles.buttonLogout} onPress={() => supabase.auth.signOut()}>
          <Ionicons name="log-out-outline" size={20} color="#737373" />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.content}>
        <Animated.Text entering={FadeInUp.duration(500).delay(100)} style={styles.title}>
          Seus Grupos
        </Animated.Text>
        <Animated.Text entering={FadeInUp.duration(500).delay(200)} style={styles.subtitle}>
          Gerencie as categorias do seu cofre
        </Animated.Text>

        <Animated.View entering={FadeInUp.duration(500).delay(300)} style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Novo grupo (ex: Bancos)"
            placeholderTextColor="#525252"
            value={newGroupName}
            onChangeText={setNewGroupName}
            editable={!isSubmitting}
          />
          <TouchableOpacity
            style={[styles.buttonAdd, !newGroupName.trim() && styles.buttonAddDisabled]}
            onPress={handleCreateGroup}
            disabled={isSubmitting || !newGroupName.trim()}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="add" size={24} color="#ffffff" />
            )}
          </TouchableOpacity>
        </Animated.View>

        {loadingGroups ? (
          <ActivityIndicator size="small" color="#F43F5E" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <Animated.View entering={FadeInDown.duration(500)} style={styles.emptyCard}>
                <Ionicons name="folder-open-outline" size={32} color="#262626" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>Nenhum grupo mapeado ainda.</Text>
              </Animated.View>
            )}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.duration(400).delay(index * 100)}>
                <TouchableOpacity
                  style={styles.groupCard}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Credentials', { groupId: item.id, groupName: item.name })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="folder" size={20} color="#F5F5F5" style={{ marginRight: 12 }} />
                    <Text style={styles.groupName}>{item.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                      style={{ marginRight: 12 }}
                      onPress={() => handleEditGroup(item.id, item.name)}
                    >
                      <Ionicons name="create-outline" size={20} color="#F43F5E" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ marginRight: 12 }}
                      onPress={() => {
                        Alert.alert(
                          'Excluir grupo',
                          'Tem certeza que deseja excluir este grupo?',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Excluir', style: 'destructive', onPress: () => handleDeleteGroup(item.id) },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#F43F5E" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Credentials', { groupId: item.id, groupName: item.name })}>
                      <Ionicons name="chevron-forward" size={20} color="#525252" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A'
  },
  containerCenter: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    justifyContent: 'space-between'
  },
  navBrand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F5F5F5',
    letterSpacing: -0.5
  },
  buttonLogout: {
    padding: 8,
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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12
  },
  input: {
    flex: 1,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    color: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    fontSize: 15,
  },
  buttonAdd: {
    backgroundColor: '#F43F5E',
    width: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  buttonAddDisabled: {
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    shadowOpacity: 0,
    elevation: 0
  },
  listContainer: {
    paddingBottom: 40
  },
  groupCard: {
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
  groupName: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '600'
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
    marginTop: 12
  },
  emptyText: {
    color: '#A3A3A3',
    fontSize: 14,
    textAlign: 'center'
  }
});