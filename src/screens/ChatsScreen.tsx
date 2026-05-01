import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { eventService } from '../services/eventService';

const directMessages = [
  { id: 'dm-1', name: 'Yahia (Admin)', initials: 'YA', lastMessage: 'Welcome to the community! Let me know if you need anything.', time: '1m ago', unread: 1 },
  { id: 'dm-2', name: 'Amar Kovačević', initials: 'AK', lastMessage: 'Are you coming to the basketball game?', time: '10m ago', unread: 2 },
  { id: 'dm-3', name: 'Hana Begović', initials: 'HB', lastMessage: 'Thanks for the restaurant recommendation! 😊', time: '30m ago', unread: 0 },
  { id: 'dm-4', name: 'Kayra Tanović', initials: 'KT', lastMessage: "Let's grab coffee sometime this week", time: '2h ago', unread: 0 },
  { id: 'dm-5', name: 'Mirza Redžić', initials: 'MR', lastMessage: "I'll send you the details tomorrow", time: '5h ago', unread: 0 },
  { id: 'dm-6', name: 'Sara Bašić', initials: 'SB', lastMessage: 'Great meeting you at the event! 🎉', time: '1d ago', unread: 0 },
];

interface ChatsScreenProps {
  onChatPress: (id: string) => void;
  onGlobalChatPress: () => void;
}

const ChatsScreen = ({ onChatPress, onGlobalChatPress }: ChatsScreenProps) => {
  const { colors } = useTheme();
  const [tab, setTab] = useState<'groups' | 'dms'>('groups');
  const [eventList, setEventList] = useState<any[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);

  useEffect(() => {
    eventService.getAll()
      .then((data) => setEventList(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => setEventList([]))
      .finally(() => setIsEventsLoading(false));
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
      {/* Segmented Control */}
      <View style={styles.segmentWrap}>
        <View style={[styles.segment, { backgroundColor: colors.muted }]}>
          {(['groups', 'dms'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.segBtn, tab === t && { backgroundColor: colors.primary }]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.segText, { color: tab === t ? '#fff' : colors.mutedForeground }]}>
                {t === 'groups' ? 'Groups' : 'Direct Messages'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === 'groups' ? (
        <View style={styles.content}>
          {/* Global Community Chat */}
          <TouchableOpacity
            onPress={onGlobalChatPress}
            style={[styles.globalRoom, { backgroundColor: colors.card, borderColor: colors.primary }]}
          >
            <View style={styles.globalTitle}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.globalRoomName, { color: colors.foreground }]}>Global Community Chat</Text>
                <View style={[styles.memberBadge, { backgroundColor: colors.primary + '1A' }]}>
                  <Text style={[styles.memberBadgeText, { color: colors.primary }]}>👥 1,250</Text>
                </View>
              </View>
              <View style={styles.pinnedRow}>
                <Ionicons name="pin-outline" size={12} color={colors.mutedForeground} />
                <Text style={[styles.pinnedText, { color: colors.mutedForeground }]}>Pinned</Text>
              </View>
            </View>
            <View style={[styles.pollChip, { backgroundColor: colors.primary + '1A' }]}>
              <Ionicons name="bar-chart-outline" size={16} color={colors.primary} />
              <Text style={[styles.pollChipText, { color: colors.primary }]}>Poll: Next Pizza Tour Location?</Text>
            </View>
            <Text style={[styles.globalDesc, { color: colors.mutedForeground }]}>
              Welcome all expats! Community updates & fun polls.
            </Text>
          </TouchableOpacity>

          {/* Event Chats */}
          <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>Your Event Chats</Text>
          {isEventsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 8 }} />
          ) : (
            <View style={[styles.chatList, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {eventList.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>No event chats yet.</Text>
                </View>
              ) : (
                eventList.map((event, idx) => {
                  const title =
                    (typeof event.content === 'string'
                      ? event.content
                      : (event.content ?? [])[0] ?? ''
                    ).split('\n')[0].trim() || 'Event';
                  return (
                    <TouchableOpacity
                      key={event._id}
                      onPress={() => onChatPress(event._id)}
                      style={[
                        styles.chatRow,
                        { borderBottomColor: colors.border },
                        idx === eventList.length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      {event.displayUrl ? (
                        <Image
                          source={{ uri: event.displayUrl }}
                          style={styles.avatar}
                          fadeDuration={200}
                        />
                      ) : (
                        <View style={[styles.avatar, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
                          <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
                        </View>
                      )}
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[styles.chatName, { color: colors.foreground }]} numberOfLines={1}>
                          {title}
                        </Text>
                        <Text style={[styles.chatLast, { color: colors.mutedForeground }]} numberOfLines={1}>
                          Chat coming soon...
                        </Text>
                      </View>
                      <View style={styles.chatMeta}>
                        <Text style={[styles.chatTime, { color: colors.mutedForeground }]}>{event.date ?? ''}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.content}>
          <View style={[styles.chatList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {directMessages.map((dm, idx) => (
              <TouchableOpacity
                key={dm.id}
                onPress={() => onChatPress(dm.id)}
                style={[
                  styles.chatRow,
                  { borderBottomColor: colors.border },
                  idx === directMessages.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={[styles.initialsAvatar, { backgroundColor: colors.primary + '1A' }]}>
                  <Text style={[styles.initialsText, { color: colors.primary }]}>{dm.initials}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.chatName, { color: colors.foreground }]} numberOfLines={1}>
                    {dm.name}
                  </Text>
                  <Text style={[styles.chatLast, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {dm.lastMessage}
                  </Text>
                </View>
                <View style={styles.chatMeta}>
                  <Text style={[styles.chatTime, { color: colors.mutedForeground }]}>{dm.time}</Text>
                  {dm.unread > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.unreadText}>{dm.unread}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  segmentWrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  segment: { flexDirection: 'row', borderRadius: 14, padding: 4 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  segText: { fontSize: 13, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },
  globalRoom: {
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  globalTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  globalRoomName: { fontSize: 15, fontWeight: '700' },
  memberBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  memberBadgeText: { fontSize: 11, fontWeight: '700' },
  pinnedRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pinnedText: { fontSize: 10, fontWeight: '600' },
  pollChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pollChipText: { fontSize: 13, fontWeight: '600' },
  globalDesc: { fontSize: 12 },
  groupLabel: { fontSize: 12, fontWeight: '700', paddingLeft: 2 },
  chatList: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  initialsAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { fontSize: 14, fontWeight: '700' },
  chatName: { fontSize: 14, fontWeight: '600' },
  chatLast: { fontSize: 12, marginTop: 2 },
  chatMeta: { alignItems: 'flex-end', gap: 4 },
  chatTime: { fontSize: 10 },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

export default ChatsScreen;
