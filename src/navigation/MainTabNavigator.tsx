import React from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';
import { useTheme } from '../contexts/ThemeContext';
import CalendarScreen from '../screens/CalendarScreen';
import ChatsScreen from '../screens/ChatsScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileStackNavigator from './ProfileStackNavigator';
import RootScreenLayout from './RootScreenLayout';
import { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeTabRoute = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <RootScreenLayout showHeader>
      <HomeScreen
        onEventPress={(eventId) => navigation.navigate('EventDetail', { eventId })}
      />
    </RootScreenLayout>
  );
};

const CalendarTabRoute = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <RootScreenLayout showHeader>
      <CalendarScreen
        onEventPress={(eventId) => navigation.navigate('EventDetail', { eventId })}
      />
    </RootScreenLayout>
  );
};

const ChatsTabRoute = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <RootScreenLayout showHeader>
      <ChatsScreen
        onChatPress={(chatId) => navigation.navigate('ChatDetail', { chatId })}
        onGlobalChatPress={() => navigation.navigate('GlobalChat')}
      />
    </RootScreenLayout>
  );
};

const MainTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.card }}>
      <BottomNav
        activeTab={
          state.routeNames[state.index] as 'Home' | 'Calendar' | 'Chats' | 'Profile'
        }
        onNavigate={(tab) => navigation.navigate(tab)}
      />
    </SafeAreaView>
  );
};

export default function MainTabNavigator({
  onLogout,
}: {
  onLogout: () => void;
}) {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <MainTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeTabRoute} />
      <Tab.Screen name="Calendar" component={CalendarTabRoute} />
      <Tab.Screen name="Chats" component={ChatsTabRoute} />
      <Tab.Screen name="Profile">
        {() => <ProfileStackNavigator onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
