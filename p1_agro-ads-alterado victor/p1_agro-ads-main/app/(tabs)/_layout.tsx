import { Redirect, Tabs } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth } from '@/firebase';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // undefined = ainda verificando | null = deslogado | User = logado
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (u) => setUsuario(u));
    return cancelar;
  }, []);

  if (usuario === undefined) return null;

  // Protege as telas: sem login volta para a tela de autenticação
  if (usuario === null) return <Redirect href="/(auth)" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="aluno"
        options={{
          title: 'Cadastro',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.badge.plus" color={color} />,
        }}
      />
      <Tabs.Screen
        name="lstAlunos"
        options={{
          title: 'Alunos',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      {/* Telas do template inicial: mantidas no projeto, mas fora da barra de abas */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
