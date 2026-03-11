import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

import AppHeader from './src/components/AppHeader';
import LoadingOverlay from './src/components/LoadingOverlay';
import BottomNav from './src/components/BottomNav';

import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ChatsScreen from './src/screens/ChatsScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import GlobalChatScreen from './src/screens/GlobalChatScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MyEventsScreen from './src/screens/MyEventsScreen';

const queryClient = new QueryClient();

type Tab = 'Home' | 'Calendar' | 'Chats' | 'Profile';

type Screen =
  | 'main'
  | 'eventDetail'
  | 'chatDetail'
  | 'globalChat'
  | 'settings'
  | 'myEvents';

const AppContent = () => {
  const { colors, theme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useCallback((fn: () => void) => {
    setLoading(true);
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    loadingTimer.current = setTimeout(() => {
      fn();
      setLoading(false);
    }, 400);
  }, []);

  if (showSplash) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <AuthScreen onLogin={() => setIsLoggedIn(true)} />
        </SafeAreaView>
      </>
    );
  }

  const showHeader =
    currentScreen === 'main' || currentScreen === 'eventDetail';
  const showNav = currentScreen === 'main';

  const renderScreen = () => {
    switch (currentScreen) {
      case 'eventDetail':
        return (
          <EventDetailScreen
            eventId={currentEventId!}
            onBack={() => setCurrentScreen('main')}
          />
        );
      case 'chatDetail':
        return (
          <ChatDetailScreen
            chatId={currentChatId!}
            onBack={() => setCurrentScreen('main')}
          />
        );
      case 'globalChat':
        return (
          <GlobalChatScreen onBack={() => setCurrentScreen('main')} />
        );
      case 'settings':
        return (
          <SettingsScreen onBack={() => setCurrentScreen('main')} />
        );
      case 'myEvents':
        return (
          <MyEventsScreen
            onBack={() => setCurrentScreen('main')}
            onEventPress={(id) => {
              setCurrentEventId(id);
              setCurrentScreen('eventDetail');
            }}
          />
        );
      case 'main':
      default:
        switch (activeTab) {
          case 'Home':
            return (
              <HomeScreen
                onEventPress={(id) => {
                  setCurrentEventId(id);
                  setCurrentScreen('eventDetail');
                }}
              />
            );
          case 'Calendar':
            return (
              <CalendarScreen
                onEventPress={(id) => {
                  setCurrentEventId(id);
                  setCurrentScreen('eventDetail');
                }}
              />
            );
          case 'Chats':
            return (
              <ChatsScreen
                onChatPress={(id) => {
                  setCurrentChatId(id);
                  setCurrentScreen('chatDetail');
                }}
                onGlobalChatPress={() => setCurrentScreen('globalChat')}
              />
            );
          case 'Profile':
            return (
              <ProfileScreen
                onMyEvents={() => {
                  setCurrentScreen('myEvents');
                }}
                onSettings={() => {
                  setCurrentScreen('settings');
                }}
                onLogout={() => {
                  setIsLoggedIn(false);
                  setActiveTab('Home');
                  setCurrentScreen('main');
                }}
              />
            );
          default:
            return null;
        }
    }
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
      />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={['top', 'left', 'right']}
      >
        {showHeader && <AppHeader />}
        <View style={{ flex: 1 }}>{renderScreen()}</View>
        {showNav && (
          <SafeAreaView
            edges={['bottom']}
            style={{ backgroundColor: colors.card }}
          >
            <BottomNav
              activeTab={activeTab}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setCurrentScreen('main');
              }}
            />
          </SafeAreaView>
        )}
      </SafeAreaView>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({});
