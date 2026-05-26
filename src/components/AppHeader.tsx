import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useWeather } from '../hooks/useWeather';
import { useNotifications } from '../hooks/useNotifications';
import { formatNotificationTime } from '../utils/notificationTime';
import WeatherModal from './WeatherModal';

const AppHeader = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { data: weather, loading: weatherLoading } = useWeather();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>Sarajevo Expats</Text>
        <View style={styles.right}>
          {/* Weather button */}
          <TouchableOpacity onPress={() => setShowWeather(true)} style={styles.weatherBtn}>
            {weatherLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : weather ? (
              <View style={styles.weatherRow}>
                <MaterialCommunityIcons name={weather.headerIcon as any} size={18} color="#fff" />
                <Text style={styles.weatherText}>{weather.temp}°C</Text>
              </View>
            ) : (
              <Text style={styles.weatherText}>—</Text>
            )}
          </TouchableOpacity>

          {/* Bell button */}
          <TouchableOpacity style={styles.bellBtn} onPress={() => setShowNotifs(true)}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {unreadCount > 0 && <View style={styles.badge} />}
          </TouchableOpacity>
        </View>
      </View>

      <WeatherModal
        visible={showWeather}
        weather={weather}
        onClose={() => setShowWeather(false)}
      />

      {/* Notifications modal */}
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
            {notifications.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No notifications yet
                </Text>
              </View>
            ) : (
              notifications.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  onPress={() => markAsRead(n.id)}
                  style={[
                    styles.notifRow,
                    { borderBottomColor: colors.border },
                    !n.isRead && { backgroundColor: colors.primary + '0D' },
                  ]}
                >
                  <View style={[styles.notifIcon, { backgroundColor: colors.primary + '1A' }]}>
                    <Text style={styles.notifEmoji}>{n.emoji}</Text>
                    {!n.isRead && <View style={styles.notifDot} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.notifText,
                        { color: !n.isRead ? colors.foreground : colors.mutedForeground },
                        !n.isRead && { fontWeight: '600' },
                      ]}
                    >
                      {n.title}
                    </Text>
                    {!!n.body && (
                      <Text style={[styles.notifBody, { color: colors.mutedForeground }]} numberOfLines={2}>
                        {n.body}
                      </Text>
                    )}
                    <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>
                      {formatNotificationTime(n.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
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
  weatherBtn: {
    padding: 4,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherText: {
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
  emptyWrap: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
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
  notifBody: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 11,
    marginTop: 4,
  },
});

export default AppHeader;
