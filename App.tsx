import React, { useState, useCallback, useRef, Suspense } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

import AppHeader from './src/components/AppHeader';
import LoadingOverlay from './src/components/LoadingOverlay';
import BottomNav, { TabName } from './src/components/BottomNav';

// Tüm ekranlar merkezi lazy registry'den geliyor (src/screens/index.ts)
// Lazy/statik ayrımı orada yönetilir — App.tsx bu detayı bilmez
import {
  SplashScreen,
  AuthScreen,
  HomeScreen,
  CalendarScreen,
  ExploreScreen,
  ChatsScreen,
  ChatDetailScreen,
  GlobalChatScreen,
  EventDetailScreen,
  NewsDetailScreen,
  PlaceDetailScreen,
  RealEstateDetailScreen,
  ServiceDetailScreen,
  TripDetailScreen,
  ProfileScreen,
  SettingsScreen,
  MyEventsScreen,
  QaasScreen,
} from './src/screens';

const queryClient = new QueryClient();

type Screen =
  | 'main'
  | 'eventDetail'
  | 'newsDetail'
  | 'placeDetail'
  | 'realEstateDetail'
  | 'serviceDetail'
  | 'tripDetail'
  | 'chatDetail'
  | 'globalChat'
  | 'settings'
  | 'myEvents'
  | 'faq';

const AppContent = () => {
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentNewsId, setCurrentNewsId] = useState<string | null>(null);
  const [currentPlaceId, setCurrentPlaceId] = useState<string | null>(null);
  const [currentRealEstateId, setCurrentRealEstateId] = useState<string | null>(null);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
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

  const showHeader = currentScreen === 'main' || currentScreen === 'eventDetail';
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
      case 'newsDetail':
        return (
          <NewsDetailScreen
            newsId={currentNewsId!}
            onBack={() => setCurrentScreen('main')}
          />
        );
      case 'placeDetail':
        return (
          <PlaceDetailScreen
            placeId={currentPlaceId!}
            onBack={() => setCurrentScreen('main')}
          />
        );
      case 'realEstateDetail':
        return (
          <RealEstateDetailScreen
            listingId={currentRealEstateId!}
            onBack={() => setCurrentScreen('main')}
          />
        );
      case 'serviceDetail':
        return (
          <ServiceDetailScreen
            serviceId={currentServiceId!}
            onBack={() => setCurrentScreen('main')}
          />
        );
      case 'tripDetail':
        return (
          <TripDetailScreen
            tripId={currentTripId!}
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
        return <GlobalChatScreen onBack={() => setCurrentScreen('main')} />;
      case 'settings':
        return <SettingsScreen onBack={() => setCurrentScreen('main')} />;
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
      case 'faq':
        return <QaasScreen onBack={() => setCurrentScreen('main')} />;
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
                onNewsPress={(id) => {
                  setCurrentNewsId(id);
                  setCurrentScreen('newsDetail');
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
          case 'Explore':
            return (
              <ExploreScreen
                onPlacePress={(id) => {
                  setCurrentPlaceId(id);
                  setCurrentScreen('placeDetail');
                }}
                onRealEstatePress={(id) => {
                  setCurrentRealEstateId(id);
                  setCurrentScreen('realEstateDetail');
                }}
                onServicePress={(id) => {
                  setCurrentServiceId(id);
                  setCurrentScreen('serviceDetail');
                }}
                onTripPress={(id) => {
                  setCurrentTripId(id);
                  setCurrentScreen('tripDetail');
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
                onMyEvents={() => setCurrentScreen('myEvents')}
                onSettings={() => setCurrentScreen('settings')}
                onFaq={() => setCurrentScreen('faq')}
                onLogout={() => {
                  setIsLoggedIn(false);
                  setActiveTab('Home');
                  setCurrentScreen('main');
                }}
                onRealEstatePress={(id) => {
                  setCurrentRealEstateId(id);
                  setCurrentScreen('realEstateDetail');
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
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={['top', 'left', 'right']}
      >
        {showHeader && <AppHeader />}
        <LoadingOverlay visible={loading} />
        {/* Suspense: lazy ekran chunk'ı indirilirken LoadingOverlay gösterilir */}
        <Suspense fallback={<LoadingOverlay visible />}>
          <View style={{ flex: 1 }}>{renderScreen()}</View>
        </Suspense>
        {showNav && (
          <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.card }}>
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
