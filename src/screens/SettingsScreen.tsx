import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { colors, theme, toggleTheme } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(false);
  const [eventReminders, setEventReminders] = useState(true);
  const [newMessages, setNewMessages] = useState(true);

  const isDark = theme === 'dark';

  const sections: Array<{
    title: string;
    items: Array<{
      icon: keyof typeof Ionicons.glyphMap;
      label: string;
      desc: string;
      value: boolean;
      onToggle: (v: boolean) => void;
    }>;
  }> = [
    {
      title: 'Appearance',
      items: [
        {
          icon: isDark ? 'moon' : 'sunny',
          label: 'Dark Mode',
          desc: 'Switch between light and dark theme',
          value: isDark,
          onToggle: (v: boolean) => {
            if ((v && !isDark) || (!v && isDark)) toggleTheme();
          },
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Push Notifications',
          desc: 'Receive push notifications from the app',
          value: pushNotifications,
          onToggle: setPushNotifications,
        },
        {
          icon: 'partly-sunny-outline',
          label: 'Weather Alerts',
          desc: 'Get notified about severe weather in Sarajevo',
          value: weatherAlerts,
          onToggle: setWeatherAlerts,
        },
        {
          icon: 'alarm-outline',
          label: 'Event Reminders',
          desc: 'Reminders 1 hour before your events',
          value: eventReminders,
          onToggle: setEventReminders,
        },
        {
          icon: 'chatbubble-outline',
          label: 'New Messages',
          desc: 'Notifications for new chat messages',
          value: newMessages,
          onToggle: setNewMessages,
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>App Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <View key={section.title} style={{ gap: 8 }}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title.toUpperCase()}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, idx) => (
                <View key={item.label}>
                  <View style={styles.row}>
                    <View style={[styles.iconWrap, { backgroundColor: colors.primary + '1A' }]}>
                      <Ionicons name={item.icon} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{item.label}</Text>
                      <Text style={[styles.rowDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                    </View>
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: colors.primary + 'AA' }}
                      thumbColor={item.value ? colors.primary : '#f4f3f4'}
                    />
                  </View>
                  {idx < section.items.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginLeft: 4 },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowDesc: { fontSize: 12, lineHeight: 16 },
  divider: { height: 1, marginLeft: 68 },
});

export default SettingsScreen;
