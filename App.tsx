import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { supabase } from './src/utils/supabase';

export default function App() {
  // Mudança aqui: <any[]> impede o TS de quebrar o build
  const [todos, setTodos] = useState<any[]>([]);

  useEffect(() => {
    const getTodos = async () => {
      try {
        console.log("Puxando dados do Supabase...");
        const { data, error } = await supabase.from('todos').select();

        if (error) {
          console.error('Erro retornado pelo Supabase:', error.message);
          return;
        }

        console.log("Dados brutos que chegaram do banco:", data);

        if (data && data.length > 0) {
          setTodos(data);
        } else {
          console.log("O banco respondeu com sucesso, mas veio um array VAZIO []");
        }
      } catch (error) {
        console.error('Erro catastrófico no bloco catch:', error);
      }
    };

    getTodos();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Todo List</Text>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        // Mudança aqui: definindo o item como tipo any
        renderItem={({ item }: { item: any }) => (
          <Text key={item.id} style={{ fontSize: 18, marginVertical: 4 }}>
            {item.name}
          </Text>
        )}
      />
    </View>
  );
};