import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.card}>
        <Text style={styles.title}>Teste inicial</Text>
        <Text style={styles.subtitle}>
          card de teste.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#7c3aed', // violet-600
    borderRadius: 16,           // rounded-2xl
    padding: 24,
    shadowColor: '#000',        // shadow-xl
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,              // Sombra necessária para o Android
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: 24,               // text-2xl
    fontWeight: 'bold',         // font-bold
    color: '#ffffff',           // text-white
    textAlign: 'center',
    marginBottom: 8,            // mt-2 equivalente
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',           // text-slate-200
    textAlign: 'center',
    lineHeight: 22,
  },
});