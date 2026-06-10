import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

// 🔍 TESTE DE CONEXÃO: Olhe o terminal do seu VS Code quando o app recarregar!
console.log("--- TESTE DE ENVS ---");
console.log("URL do Supabase:", supabaseUrl);
console.log("Key do Supabase:", supabaseAnonKey ? "Preenchida (OK)" : "Vazia (ERRO)");
console.log("---------------------");

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});