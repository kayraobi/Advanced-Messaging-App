import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../components/AppHeader';
import { useTheme } from '../contexts/ThemeContext';

interface RootScreenLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export default function RootScreenLayout({
  children,
  showHeader = false,
}: RootScreenLayoutProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}
    >
      {showHeader && <AppHeader />}
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
