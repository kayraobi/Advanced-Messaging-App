import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { SplashScreen, AuthScreen } from '../screens';
import MainTabs from './MainTabs';
import type { RootStackParamList } from './types';

// Detail / sub-screens
import EventDetailScreen from '../screens/EventDetailScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import RealEstateDetailScreen from '../screens/RealEstateDetailScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import SponsorDetailScreen from '../screens/SponsorDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import GlobalChatScreen from '../screens/GlobalChatScreen';
import SubmitPlaceScreen from '../screens/SubmitPlaceScreen';
import SubmitRealEstateScreen from '../screens/SubmitRealEstateScreen';
import BusinessPartnershipScreen from '../screens/BusinessPartnershipScreen';
import MyEventsScreen from '../screens/MyEventsScreen';
import GmAdminScreen from '../screens/GmAdminScreen';
import SettingsScreen from '../screens/SettingsScreen';
import QaasScreen from '../screens/QaasScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ---- Splash (shown before NavigationContainer mounts) ----
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
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            {/* Main tabs */}
            <Stack.Screen name="Main" component={MainTabs} />

            {/* Detail screens — pushable from any tab, swipe-back enabled */}
            <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
            <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
            <Stack.Screen name="RealEstateDetail" component={RealEstateDetailScreen} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
            <Stack.Screen name="TripDetail" component={TripDetailScreen} />
            <Stack.Screen name="SponsorDetail" component={SponsorDetailScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="GlobalChat" component={GlobalChatScreen} />
            <Stack.Screen name="SubmitPlace" component={SubmitPlaceScreen} />
            <Stack.Screen name="SubmitRealEstate" component={SubmitRealEstateScreen} />
            <Stack.Screen name="BusinessPartnership" component={BusinessPartnershipScreen} />
            <Stack.Screen name="MyEvents" component={MyEventsScreen} />
            <Stack.Screen name="GmAdmin" component={GmAdminScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Qaas" component={QaasScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth">
            {() => <AuthScreen onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
