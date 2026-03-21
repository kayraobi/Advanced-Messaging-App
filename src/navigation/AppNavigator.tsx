import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '../contexts/ThemeContext';
import AuthScreen from '../screens/AuthScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import GlobalChatScreen from '../screens/GlobalChatScreen';
import SplashScreen from '../screens/SplashScreen';
import MainTabNavigator from './MainTabNavigator';
import RootScreenLayout from './RootScreenLayout';
import { RootNavProps, RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

const AuthRoute = ({ onLogin }: { onLogin: () => void }) => {
  const { colors } = useTheme();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <RootScreenLayout>
        <AuthScreen onLogin={onLogin} />
      </RootScreenLayout>
    </>
  );
};

const EventDetailRoute = ({ route, navigation }: RootNavProps<'EventDetail'>) => (
  <RootScreenLayout>
    <EventDetailScreen
      eventId={route.params.eventId}
      onBack={() => navigation.goBack()}
    />
  </RootScreenLayout>
);

const ChatDetailRoute = ({ route, navigation }: RootNavProps<'ChatDetail'>) => (
  <RootScreenLayout>
    <ChatDetailScreen
      chatId={route.params.chatId}
      onBack={() => navigation.goBack()}
    />
  </RootScreenLayout>
);

const GlobalChatRoute = ({ navigation }: RootNavProps<'GlobalChat'>) => (
  <RootScreenLayout>
    <GlobalChatScreen onBack={() => navigation.goBack()} />
  </RootScreenLayout>
);

export default function AppNavigator() {
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (showSplash) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <RootStack.Screen name="MainTabs">
              {() => <MainTabNavigator onLogout={() => setIsLoggedIn(false)} />}
            </RootStack.Screen>
            <RootStack.Screen name="EventDetail" component={EventDetailRoute} />
            <RootStack.Screen name="ChatDetail" component={ChatDetailRoute} />
            <RootStack.Screen name="GlobalChat" component={GlobalChatRoute} />
          </>
        ) : (
          <RootStack.Screen name="Auth">
            {() => <AuthRoute onLogin={() => setIsLoggedIn(true)} />}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
