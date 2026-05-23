import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useEvents } from '../hooks/useEvents';
import { useChatRooms, useDmRooms } from '../hooks/useChatRooms';
import { chatService, getDmPeerName } from '../services/chatService';
import { usersService } from '../services/usersService';
import { sendGeminiMessage, type GeminiMessage } from '../services/geminiService';
import type { User } from '../types/user.types';

const ChatsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'groups' | 'dms'>('groups');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [startingDm, setStartingDm] = useState<string | null>(null);

  // AI Assistant state
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState<GeminiMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiListRef = useRef<FlatList>(null);

  const sendAiMessage = useCallback(async () => {
    const text = aiInput.trim();
    if (!text || aiLoading) return;
    setAiInput('');
    const userMsg: GeminiMessage = { role: 'user', text };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiLoading(true);
    try {
      const reply = await sendGeminiMessage(aiMessages, text);
      setAiMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch {
      setAiMessages((prev) => [...prev, { role: 'model', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, aiLoading, aiMessages]);

  const { data: rawEvents = [], isLoading: isEventsLoading } = useEvents();
  const { data: rooms = [] } = useChatRooms();
  const { data: dmRooms = [], isLoading: isDmLoading } = useDmRooms(currentUser?._id ?? null);

  const eventList = useMemo(() => (rawEvents as any[]).slice(0, 5), [rawEvents]);
  const eventRoomMap = useMemo(() => {
    const map: Record<string, string> = {};
    rooms.forEach((r) => {
      if (r.type === 'event' && r.eventId) map[r.eventId] = r._id;
    });
    return map;
  }, [rooms]);

  useEffect(() => {
    AsyncStorage.getItem('auth_user').then((raw) => {
      if (raw) setCurrentUser(JSON.parse(raw));
    });
  }, []);

  const openPicker = useCallback(async () => {
    setShowPicker(true);
    setSearch('');
    if (users.length === 0) {
      setUsersLoading(true);
      try {
        const all = await usersService.getAll();
        setUsers(all.filter((u) => u._id !== currentUser?._id));
      } catch {
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    }
  }, [users.length, currentUser]);

  const startDm = useCallback(
    async (target: User) => {
      if (!currentUser?._id || !target._id) return;
      setStartingDm(target._id);
      try {
        const room = await chatService.getOrCreateDmRoom(
          target._id,
          target.username ?? target.name ?? 'User',
        );
        queryClient.invalidateQueries({ queryKey: ['dmRooms'] });
        setShowPicker(false);
        navigation.navigate('ChatDetail', {
          chatId: room._id,
          roomId: room._id,
          dmPeerName: target.username ?? target.name ?? 'User',
        });
      } catch {
        // silently fail — user sees no change
      } finally {
        setStartingDm(null);
      }
    },
    [currentUser, navigation, queryClient],
  );

  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        (u.username ?? u.name ?? '').toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Segmented Control */}
      <View style={styles.segmentWrap}>
        <View style={[styles.segment, { backgroundColor: colors.muted }]}>
          {(['groups', 'dms'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.segBtn, tab === t && { backgroundColor: colors.primary }]}
              onPress={() => setTab(t)}
            >
              <Text
                style={[
                  styles.segText,
                  { color: tab === t ? '#fff' : colors.mutedForeground },
                ]}
              >
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
            onPress={() => navigation.navigate('GlobalChat')}
            style={[
              styles.globalRoom,
              { backgroundColor: colors.card, borderColor: colors.primary },
            ]}
          >
            <View style={styles.globalTitle}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.globalRoomName, { color: colors.foreground }]}>
                  Global Community Chat
                </Text>
                <View style={[styles.memberBadge, { backgroundColor: colors.primary + '1A' }]}>
                  <Text style={[styles.memberBadgeText, { color: colors.primary }]}>
                    👥 1,250
                  </Text>
                </View>
              </View>
              <View style={styles.pinnedRow}>
                <Ionicons name="pin-outline" size={12} color={colors.mutedForeground} />
                <Text style={[styles.pinnedText, { color: colors.mutedForeground }]}>Pinned</Text>
              </View>
            </View>
            <View style={[styles.pollChip, { backgroundColor: colors.primary + '1A' }]}>
              <Ionicons name="bar-chart-outline" size={16} color={colors.primary} />
              <Text style={[styles.pollChipText, { color: colors.primary }]}>
                Poll: Next Pizza Tour Location?
              </Text>
            </View>
            <Text style={[styles.globalDesc, { color: colors.mutedForeground }]}>
              Welcome all expats! Community updates & fun polls.
            </Text>
          </TouchableOpacity>

          {/* Event Chats */}
          <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>
            Your Event Chats
          </Text>
          {isEventsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 8 }} />
          ) : (
            <View style={[styles.chatList, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {eventList.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
                    No event chats yet.
                  </Text>
                </View>
              ) : (
                eventList.map((event, idx) => {
                  const title =
                    (typeof event.content === 'string'
                      ? event.content
                      : (event.content ?? [])[0] ?? ''
                    )
                      .split('\n')[0]
                      .trim() || 'Event';
                  const roomId = eventRoomMap[event._id];
                  return (
                    <TouchableOpacity
                      key={event._id}
                      onPress={() =>
                        navigation.navigate('ChatDetail', {
                          chatId: `event-${event._id}`,
                          ...(roomId ? { roomId } : {}),
                        })
                      }
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
                        <View
                          style={[
                            styles.avatar,
                            {
                              backgroundColor: colors.muted,
                              alignItems: 'center',
                              justifyContent: 'center',
                            },
                          ]}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={20}
                            color={colors.mutedForeground}
                          />
                        </View>
                      )}
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          style={[styles.chatName, { color: colors.foreground }]}
                          numberOfLines={1}
                        >
                          {title}
                        </Text>
                        <Text
                          style={[styles.chatLast, { color: colors.mutedForeground }]}
                          numberOfLines={1}
                        >
                          {roomId ? 'Tap to join chat' : 'Chat coming soon...'}
                        </Text>
                      </View>
                      <View style={styles.chatMeta}>
                        <Text style={[styles.chatTime, { color: colors.mutedForeground }]}>
                          {event.date ?? ''}
                        </Text>
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
          {/* Header row with New DM button */}
          <View style={styles.dmHeader}>
            <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>
              Your Conversations
            </Text>
            <TouchableOpacity
              onPress={openPicker}
              style={[styles.newDmBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.newDmBtnText}>New</Text>
            </TouchableOpacity>
          </View>

          {isDmLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
          ) : dmRooms.length === 0 ? (
            <View style={[styles.emptyDm, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyDmText, { color: colors.mutedForeground }]}>
                No conversations yet
              </Text>
              <Text style={[styles.emptyDmSub, { color: colors.mutedForeground }]}>
                Tap "New" to message someone
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.chatList,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {dmRooms.map((room, idx) => {
                const peerName = currentUser?._id
                  ? getDmPeerName(room, currentUser._id)
                  : room.name;
                const initials = peerName.substring(0, 2).toUpperCase();
                return (
                  <TouchableOpacity
                    key={room._id}
                    onPress={() =>
                      navigation.navigate('ChatDetail', {
                        chatId: room._id,
                        roomId: room._id,
                        dmPeerName: peerName,
                      })
                    }
                    style={[
                      styles.chatRow,
                      { borderBottomColor: colors.border },
                      idx === dmRooms.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View
                      style={[
                        styles.initialsAvatar,
                        { backgroundColor: colors.primary + '1A' },
                      ]}
                    >
                      <Text style={[styles.initialsText, { color: colors.primary }]}>
                        {initials}
                      </Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={[styles.chatName, { color: colors.foreground }]}
                        numberOfLines={1}
                      >
                        {peerName}
                      </Text>
                      <Text
                        style={[styles.chatLast, { color: colors.mutedForeground }]}
                        numberOfLines={1}
                      >
                        Tap to open conversation
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* User Picker Modal */}
      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.pickerTitle, { color: colors.foreground }]}>
              New Message
            </Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchWrap, { backgroundColor: colors.muted }]}>
            <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search people..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.searchInput, { color: colors.foreground }]}
              autoFocus
            />
          </View>

          {usersLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(u) => u._id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: user }) => {
                const name = user.username ?? user.name ?? user.email ?? 'User';
                const initials = name.substring(0, 2).toUpperCase();
                const isLoading = startingDm === user._id;
                return (
                  <TouchableOpacity
                    onPress={() => startDm(user)}
                    disabled={!!startingDm}
                    style={[styles.userRow, { borderBottomColor: colors.border }]}
                  >
                    <View
                      style={[
                        styles.initialsAvatar,
                        { backgroundColor: colors.primary + '1A' },
                      ]}
                    >
                      <Text style={[styles.initialsText, { color: colors.primary }]}>
                        {initials}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.chatName, { color: colors.foreground }]}>
                        {name}
                      </Text>
                      {user.email ? (
                        <Text style={[styles.chatLast, { color: colors.mutedForeground }]}>
                          {user.email}
                        </Text>
                      ) : null}
                    </View>
                    {isLoading && (
                      <ActivityIndicator size="small" color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ color: colors.mutedForeground }}>No users found</Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </ScrollView>

    {/* Floating AI Button */}
    <TouchableOpacity
      style={[styles.aiFloat, { backgroundColor: colors.primary, bottom: insets.bottom + 24 }]}
      onPress={() => setShowAI(true)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: 'https://groq.com/favicon.ico' }} style={styles.aiFloatLogo} resizeMode="contain" />
      <Text style={styles.aiFloatText}>Ask AI</Text>
    </TouchableOpacity>

    {/* AI Chat Modal */}
    <Modal visible={showAI} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAI(false)}>
      <KeyboardAvoidingView
        style={[styles.aiModal, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.aiHeader, { borderBottomColor: colors.border }]}>
          <View style={styles.aiHeaderLeft}>
            <Image
              source={{ uri: 'https://groq.com/favicon.ico' }}
              style={styles.aiAvatar}
              resizeMode="contain"
            />
            <View>
              <Text style={[styles.aiHeaderTitle, { color: colors.foreground }]}>AI Assistant</Text>
              <Text style={[styles.aiHeaderSub, { color: colors.mutedForeground }]}>Powered by Groq AI</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowAI(false)} style={styles.aiCloseBtn}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={aiListRef}
          data={aiMessages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.aiList}
          onContentSizeChange={() => aiListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.aiEmpty}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🌍</Text>
              <Text style={[styles.aiEmptyTitle, { color: colors.foreground }]}>
                Ask me anything about Sarajevo!
              </Text>
              <Text style={[styles.aiEmptySub, { color: colors.mutedForeground }]}>
                Best places, expat tips, local events, real estate advice and more.
              </Text>
              <View style={styles.aiSuggestions}>
                {[
                  '🏙️ What is Sarajevo Expats?',
                  '📍 Best places to visit?',
                  '🏠 How to find housing?',
                  '🌍 Tips for new expats?',
                  '🎉 What events are happening?',
                ].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.aiSuggestionChip, { borderColor: colors.primary, backgroundColor: colors.primary + '12' }]}
                    onPress={() => { setAiInput(q.slice(3)); }}
                  >
                    <Text style={[styles.aiSuggestionText, { color: colors.primary }]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[
              styles.aiBubble,
              item.role === 'user'
                ? [styles.aiBubbleUser, { backgroundColor: colors.primary }]
                : [styles.aiBubbleModel, { backgroundColor: colors.card, borderColor: colors.border }],
            ]}>
              <Text style={[
                styles.aiBubbleText,
                { color: item.role === 'user' ? '#fff' : colors.foreground },
              ]}>
                {item.text}
              </Text>
            </View>
          )}
        />

        {/* Loading indicator */}
        {aiLoading && (
          <View style={[styles.aiTyping, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.aiTypingText, { color: colors.mutedForeground }]}>AI is thinking…</Text>
          </View>
        )}

        {/* Input */}
        <View style={[styles.aiInputRow, { borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={[styles.aiInput, { backgroundColor: colors.muted, color: colors.foreground }]}
            placeholder="Ask about Sarajevo..."
            placeholderTextColor={colors.mutedForeground}
            value={aiInput}
            onChangeText={setAiInput}
            onSubmitEditing={sendAiMessage}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[styles.aiSendBtn, { backgroundColor: aiInput.trim() ? colors.primary : colors.muted }]}
            onPress={sendAiMessage}
            disabled={!aiInput.trim() || aiLoading}
          >
            <Ionicons name="send" size={18} color={aiInput.trim() ? '#fff' : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    </View>
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
  globalTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
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
  dmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newDmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  newDmBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyDm: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyDmText: { fontSize: 15, fontWeight: '600' },
  emptyDmSub: { fontSize: 13 },
  pickerContainer: { flex: 1 },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  pickerTitle: { fontSize: 17, fontWeight: '700' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  // Floating AI button
  aiFloat: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  aiFloatIcon: { fontSize: 16 },
  aiFloatLogo: { width: 18, height: 18, borderRadius: 4 },
  aiFloatText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  // AI Modal
  aiModal: { flex: 1 },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  aiHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  aiHeaderTitle: { fontSize: 16, fontWeight: '700' },
  aiHeaderSub: { fontSize: 12, marginTop: 1 },
  aiCloseBtn: { padding: 4 },
  aiList: { padding: 16, gap: 10, flexGrow: 1 },
  aiEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 },
  aiEmptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  aiEmptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  aiSuggestions: { gap: 8, width: '100%' },
  aiSuggestionChip: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  aiSuggestionText: { fontSize: 14, fontWeight: '600' },
  aiBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  aiBubbleUser: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubbleModel: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1 },
  aiBubbleText: { fontSize: 14, lineHeight: 20 },
  aiTyping: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  aiTypingText: { fontSize: 13 },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  aiInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  aiSendBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
});

export default ChatsScreen;
