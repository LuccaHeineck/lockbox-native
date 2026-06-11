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
        <Text style={styles.title}>Seus Grupos</Text>
        <Text style={styles.subtitle}>Gerencie as categorias do seu cofre</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Novo grupo (ex: Bancos)"
            placeholderTextColor="#4b5563"
            value={newGroupName}
            onChangeText={setNewGroupName}
            editable={!isSubmitting}
          />
          <TouchableOpacity
            style={[styles.buttonAdd, !newGroupName.trim() && styles.buttonAddDisabled]}
            onPress={handleCreateGroup}
            disabled={isSubmitting || !newGroupName.trim()}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonAddText}>+</Text>
            )}
          </TouchableOpacity>
        </View>

        {loadingGroups ? (
          <ActivityIndicator size="small" color="#6366f1" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Nenhum grupo mapeado ainda.</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.groupCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Credentials', { groupId: item.id, groupName: item.name })}
              >
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.groupArrow}>→</Text>
              </TouchableOpacity>
            )}
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
  containerCenter: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'center',
    alignItems: 'center'
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
  navBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f3f4f6',
    letterSpacing: -0.5
  },
  buttonLogout: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  buttonLogoutText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500'
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32
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
    marginBottom: 24
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
    color: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
  },
  buttonAdd: {
    backgroundColor: '#6366f1',
    width: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4f46e5'
  },
  buttonAddDisabled: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    opacity: 0.6
  },
  buttonAddText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600'
  },
  listContainer: {
    paddingBottom: 24
  },
  groupCard: {
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
  groupName: {
    color: '#f3f4f6',
    fontSize: 15,
    fontWeight: '500'
  },
  groupArrow: {
    color: '#4b5563',
    fontSize: 16
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
    marginTop: 12
  },
  emptyText: {
    color: '#4b5563',
    fontSize: 14,
    textAlign: 'center'
  }
});