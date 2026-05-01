import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export type TabName = 'Home' | 'Calendar' | 'Explore' | 'Chats' | 'Profile';

interface BottomNavProps {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
}

const tabs: { label: TabName; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Home',     icon: 'home-outline',     activeIcon: 'home' },
  { label: 'Calendar', icon: 'calendar-outline',  activeIcon: 'calendar' },
  { label: 'Explore',  icon: 'compass-outline',   activeIcon: 'compass' },
  { label: 'Chats',    icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
  { label: 'Profile',  icon: 'person-outline',    activeIcon: 'person' },
];

const BottomNav = ({ activeTab, onNavigate }: BottomNavProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.nav, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      {tabs.map((tab) => {
        const active = activeTab === tab.label;
        return (
          <TouchableOpacity
            key={tab.label}
            onPress={() => onNavigate(tab.label)}
            style={styles.tab}
          >
            <Ionicons
              name={active ? tab.activeIcon : tab.icon}
              size={22}
              color={active ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.label, { color: active ? colors.primary : colors.mutedForeground }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default BottomNav;
