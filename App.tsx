import 'react-native-gesture-handler'; // OBRIGATÓRIO ser o primeiro
import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { Routes } from './src/routes';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <Routes />
    </AuthProvider>
  );
}