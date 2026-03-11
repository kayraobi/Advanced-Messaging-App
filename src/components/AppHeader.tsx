import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const notifications = [
  {
    id: 1,
    emoji: '📅',
    title: 'Reminder: Pizza Tour starts in 2 hours!',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 2,
    emoji: '💬',
    title: 'Amar mentioned you in Global Chat',
    time: '4 hours ago',
    unread: true,
  },
  {
    id: 3,
    emoji: '⛅',
    title: 'Weather Alert: Light rain expected during your Trebević Hike tomorrow',
    time: '6 hours ago',
    unread: true,
  },
];

const AppHeader = () => {
  const { colors } = useTheme();
  const [showNotifs, setShowNotifs] = useState(false);
  const [readIds, setReadIds] = useState<number[]>([]);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const markAsRead = (id: number) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Sarajevo Expats</Text>
        <View style={styles.right}>
          <Text style={styles.weather}>⛅ 14°C</Text>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => setShowNotifs(true)}
          >
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {unreadCount > 0 && <View style={styles.badge} />}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showNotifs}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotifs(false)}
      >
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Notifications</Text>
              <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>{unreadCount} unread</Text>
            </View>
            <TouchableOpacity onPress={() => setShowNotifs(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {notifications.map((n) => {
              const isUnread = !readIds.includes(n.id);
              return (
                <TouchableOpacity
                  key={n.id}
                  onPress={() => markAsRead(n.id)}
                  style={[
                    styles.notifRow,
                    { borderBottomColor: colors.border },
                    isUnread && { backgroundColor: colors.primary + '0D' },
                  ]}
                >
                  <View style={[styles.notifIcon, { backgroundColor: colors.primary + '1A' }]}>
                    <Text style={styles.notifEmoji}>{n.emoji}</Text>
                    {isUnread && <View style={styles.notifDot} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.notifText,
                        { color: isUnread ? colors.foreground : colors.mutedForeground },
                        isUnread && { fontWeight: '600' },
                      ]}
                    >
                      {n.title}
                    </Text>
                    <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{n.time}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weather: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  bellBtn: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifEmoji: {
    fontSize: 18,
  },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notifText: {
    fontSize: 13,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    marginTop: 4,
  },
});

export default AppHeader;
