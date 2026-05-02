import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabConfig: {
  name: keyof MainTabParamList;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar' },
  { name: 'Explore', icon: 'compass-outline', activeIcon: 'compass' },
  { name: 'Chats', icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
  { name: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

const screenComponents: Record<keyof MainTabParamList, React.ComponentType<any>> = {
  Home: HomeScreen,
  Calendar: CalendarScreen,
  Explore: ExploreScreen,
  Chats: ChatsScreen,
  Profile: ProfileScreen,
};

export default function MainTabs() {
  const { colors } = useTheme();

  return (
    <>
      <AppHeader />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
          },
        }}
      >
        {tabConfig.map((tab) => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={screenComponents[tab.name]}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons
                  name={focused ? tab.activeIcon : tab.icon}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
        ))}
      </Tab.Navigator>
    </>
  );
}
