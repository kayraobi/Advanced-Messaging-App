import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { events } from '../data/events';
import { socketService } from '../services/socketService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserProfile } from '../hooks/useUserProfile';
import UserProfileModal from '../components/UserProfileModal';
import { useActiveChatRoom } from '../hooks/useActiveChatRoom';

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  initials: string;
  text: string;
  time: string;
  isMe: boolean;
}



const pollOptions = [
  { label: 'Saturday Evening', votes: 18 },
  { label: 'Sunday Afternoon', votes: 12 },
  { label: 'Next Week', votes: 5 },
];
const totalVotes = pollOptions.reduce((s, o) => s + o.votes, 0);

const ChatDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RootStackScreenProps<'ChatDetail'>['route']>();
  const { chatId, roomId: roomIdParam, dmPeerName } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isDm = !!dmPeerName;
  const event = !isDm ? events.find((e) => e.id === chatId) : null;

  const socketRoomId = roomIdParam ?? (!isDm ? chatId : null);
  useActiveChatRoom(socketRoomId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const [showPoll, setShowPoll] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ _id: string; username: string } | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const { profilePreview, profileLoading, showProfile, openProfile, closeProfile } = useUserProfile();

  const chatTitle = dmPeerName ?? event?.title ?? 'Chat';

  useEffect(() => {
    AsyncStorage.getItem('auth_user').then((raw) => {
      if (raw) setCurrentUser(JSON.parse(raw));
    });
  }, []);

  useEffect(() => {
    if (!socketRoomId) return;
    let isMounted = true;

    const setup = async () => {
      await socketService.connect();

      const handlePrevious = (data: { roomId: string; messages: any[] }) => {
        if (!isMounted) return;
        const msgs = Array.isArray(data) ? data : data.messages ?? [];
        const formatted = msgs.map((m) => ({
          id: m._id ?? m.id,
          sender: m.senderName,
          senderId: m.senderId ?? '',
          initials: m.senderName?.substring(0, 2).toUpperCase() ?? '??',
          text: m.message ?? m.content ?? '',
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: m.senderId === currentUser?._id,
        }));
        setMessages(formatted);
      };

      const handleReceive = (m: any) => {
        if (!isMounted) return;
        setMessages((prev) => [
          ...prev,
          {
            id: m._id ?? m.id,
            sender: m.senderName,
            senderId: m.senderId ?? '',
            initials: m.senderName?.substring(0, 2).toUpperCase() ?? '??',
            text: m.message ?? m.content ?? '',
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: m.senderId === currentUser?._id,
          },
        ]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      };

      socketService.on('previous_messages', handlePrevious);
      socketService.on('receive_message', handleReceive);
      socketService.joinRoom(socketRoomId);

      return () => {
        socketService.off('previous_messages', handlePrevious);
        socketService.off('receive_message', handleReceive);
      };
    };

    let cleanupFn: (() => void) | undefined;
    const promise = setup().then((fn) => { cleanupFn = fn; });

    return () => {
      isMounted = false;
      promise.then(() => cleanupFn?.());
    };
  }, [chatId, socketRoomId, currentUser, isDm]);

  const sendMessage = async () => {
    if (!input.trim() || !socketRoomId) return;

    await socketService.connect();
    socketService.sendMessage(socketRoomId, input.trim());
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {chatTitle}
          </Text>
          {isDm && (
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Direct Message
            </Text>
          )}
        </View>
        {!isDm && event && (
          <View style={[styles.memberBadge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.memberBadgeText, { color: colors.mutedForeground }]}>👥 {event.filled}</Text>
          </View>
        )}
      </View>

      {/* Poll — group chats only */}
      {!isDm && showPoll && (
        <View style={[styles.pollBanner, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={[styles.pollCard, { borderColor: colors.border, backgroundColor: colors.accent + '50' }]}>
            <TouchableOpacity style={styles.pollClose} onPress={() => setShowPoll(false)}>
              <Ionicons name="close" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
            <View style={styles.pollHeader}>
              <Ionicons name="bar-chart-outline" size={16} color={colors.primary} />
              <Text style={[styles.pollTitle, { color: colors.foreground }]}>Poll: Next Pizza Tour?</Text>
              <Text style={[styles.pollVotes, { color: colors.mutedForeground }]}>{totalVotes} votes</Text>
            </View>
            {pollOptions.map((opt, i) => {
              const pct = Math.round((opt.votes / totalVotes) * 100);
              const sel = votedIndex === i;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setVotedIndex(i)}
                  style={[
                    styles.pollOpt,
                    { borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primary + '0D' : colors.background },
                  ]}
                >
                  <View style={styles.pollOptRow}>
                    <Text style={[styles.pollOptLabel, { color: sel ? colors.primary : colors.foreground }]}>{opt.label}</Text>
                    <Text style={[styles.pollOptPct, { color: colors.mutedForeground }]}>{pct}%</Text>
                  </View>
                  <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                    <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${pct}%` as any }]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item: msg }) => (
          <View style={[styles.msgRow, msg.isMe && styles.msgRowMe]}>
            {!msg.isMe && (
              <TouchableOpacity
                style={[styles.msgAvatar, { backgroundColor: colors.primary + '1A' }]}
                onPress={() => openProfile(msg.senderId, msg.sender, msg.initials)}
                activeOpacity={0.7}
              >
                <Text style={[styles.msgAvatarText, { color: colors.primary }]}>{msg.initials}</Text>
              </TouchableOpacity>
            )}
            <View style={[styles.msgBubbleWrap, msg.isMe && { alignItems: 'flex-end' }]}>
              {!msg.isMe && (
                <Text style={[styles.msgSender, { color: colors.mutedForeground }]}>{msg.sender}</Text>
              )}
              <View
                style={[
                  styles.bubble,
                  msg.isMe
                    ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                    : { backgroundColor: colors.muted, borderBottomLeftRadius: 4 },
                ]}
              >
                <Text style={[styles.bubbleText, { color: msg.isMe ? '#fff' : colors.foreground }]}>
                  {msg.text}
                </Text>
              </View>
              <Text style={[styles.msgTime, { color: colors.mutedForeground }, msg.isMe && { alignSelf: 'flex-end' }]}>
                {msg.time}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Input */}
      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
          <Ionicons name="attach-outline" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.textInput, { backgroundColor: colors.muted, color: colors.foreground }]}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.primary }]}
          onPress={sendMessage}
        >
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* User Profile Modal */}
      <UserProfileModal
        visible={showProfile}
        onClose={closeProfile}
        profilePreview={profilePreview}
        profileLoading={profileLoading}
        colors={colors}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  headerTitle: { fontSize: 15, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 1 },
  memberBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  memberBadgeText: { fontSize: 12, fontWeight: '600' },
  pollBanner: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  pollCard: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 8, position: 'relative' },
  pollClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pollTitle: { fontSize: 13, fontWeight: '700', flex: 1 },
  pollVotes: { fontSize: 11 },
  pollOpt: { borderRadius: 10, borderWidth: 1, padding: 8, gap: 4 },
  pollOptRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pollOptLabel: { fontSize: 12, fontWeight: '600' },
  pollOptPct: { fontSize: 11 },
  progressBg: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  messages: { paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  msgRow: { flexDirection: 'row', gap: 8 },
  msgRowMe: { flexDirection: 'row-reverse' },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    flexShrink: 0,
  },
  msgAvatarText: { fontSize: 10, fontWeight: '700' },
  msgBubbleWrap: { maxWidth: '75%', gap: 2 },
  msgSender: { fontSize: 10, fontWeight: '600', marginLeft: 4 },
  bubble: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  msgTime: { fontSize: 10, marginLeft: 4 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: 1,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  textInput: { flex: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14 },
});

export default ChatDetailScreen;
