import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { socketService } from '../services/socketService';
import { chatService } from '../services/chatService';
import { authService } from '../services/authService';
import { useGlobalRoom } from '../hooks/useChatRooms';
import { useUserProfile } from '../hooks/useUserProfile';
import UserProfileModal from '../components/UserProfileModal';
import { useChatUserAvatars } from '../hooks/useChatUserAvatars';
import ChatMessageAvatar from '../components/ChatMessageAvatar';
import {
  formatSocketChatMessage,
  formatSocketChatMessages,
  type FormattedChatMessage,
} from '../utils/formatChatMessage';
import type { User } from '../types/user.types';
import { seedChatUserAvatar } from '../services/chatAvatarService';
import { useActiveChatRoom } from '../hooks/useActiveChatRoom';

interface ChatMessage extends FormattedChatMessage {}

const pollOptions = [
  { label: 'Saturday Evening', votes: 18 },
  { label: 'Sunday Afternoon', votes: 12 },
  { label: 'Next Week', votes: 5 },
];
const totalVotes = pollOptions.reduce((s, o) => s + o.votes, 0);

const GlobalChatScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const [isLoadingOld, setIsLoadingOld] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { getAvatarUrl, prefetchForMessages } = useChatUserAvatars();

  const { globalRoom } = useGlobalRoom();
  const roomId = globalRoom?._id;
  useActiveChatRoom(roomId);
  const { profilePreview, profileLoading, showProfile, openProfile, closeProfile } = useUserProfile();

  useEffect(() => {
    authService.getStoredUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        if (user._id && user.displayUrl) seedChatUserAvatar(user._id, user.displayUrl);
      }
    });
  }, []);

  useEffect(() => {
    if (!roomId) return;
    let isMounted = true;

    const setup = async () => {
      await socketService.connect();

      const handlePrevious = (data: { roomId: string; messages: unknown[] } | unknown[]) => {
        if (!isMounted) return;
        const formatted = formatSocketChatMessages(data, currentUser?._id).reverse();
        setMessages(formatted);
        void prefetchForMessages(formatted);
      };

      const handleReceive = (m: unknown) => {
        if (!isMounted) return;
        const row = formatSocketChatMessage(m, currentUser?._id);
        if (!row) return;
        setMessages((prev) => [row, ...prev]);
        void prefetchForMessages([row]);
      };

      socketService.on('previous_messages', handlePrevious);
      socketService.on('receive_message', handleReceive);
      socketService.joinRoom(roomId);

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
  }, [roomId, currentUser?._id, prefetchForMessages]);

  const sendMessage = async () => {
    if (!input.trim() || !roomId) return;
    await socketService.connect();
    socketService.sendMessage(roomId, input.trim());
    setInput('');
  };

  const loadOlderMessages = async () => {
    if (isLoadingOld || !hasMore || !roomId) return;
    setIsLoadingOld(true);
    try {
      const response = await chatService.getRoomMessages(roomId, 30, messages.length);
      if (response.messages.length > 0) {
        const formattedOldMsgs = formatSocketChatMessages(response.messages, currentUser?._id).reverse();
        setMessages((prev) => [...prev, ...formattedOldMsgs]);
        void prefetchForMessages(formattedOldMsgs);
      }
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("Eski mesajlar çekilemedi", error);
    } finally {
      setIsLoadingOld(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
          }
        }}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Global Community Chat</Text>
        </View>
        <View style={[styles.memberBadge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.memberBadgeText, { color: colors.mutedForeground }]}>👥 1,250 Members</Text>
        </View>
      </View>

      {/* Pinned Poll */}
      <View style={[styles.pollBanner, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.pollCard, { borderColor: colors.border, backgroundColor: colors.accent + '50' }]}>
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

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messages}
        inverted={true}
        onEndReached={loadOlderMessages}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          isLoadingOld ? <ActivityIndicator size="small" color={colors.primary} style={{ margin: 10 }} /> : null
        }
        renderItem={({ item: msg }) => {
          const avatarUrl = getAvatarUrl(msg.senderId, msg.displayUrl);

          return (
          <View style={[styles.msgRow, msg.isMe && styles.msgRowMe]}>
            {!msg.isMe && (
              <TouchableOpacity
                onPress={() => openProfile(msg.senderId, msg.sender, msg.initials)}
                activeOpacity={0.7}
              >
                <ChatMessageAvatar
                  displayUrl={avatarUrl}
                  initials={msg.initials}
                  size={32}
                  backgroundColor={colors.primary + '1A'}
                  textColor={colors.primary}
                  style={{ marginTop: 4 }}
                />
              </TouchableOpacity>
            )}
            <View style={[styles.msgBubbleWrap, msg.isMe && { alignItems: 'flex-end' }]}>
              {!msg.isMe && (
                <Text style={[styles.msgSender, { color: colors.mutedForeground }]}>{msg.sender}</Text>
              )}
              <View
                style={[
                  styles.bubble,
                  msg.hidden
                    ? { backgroundColor: colors.muted, borderBottomLeftRadius: 4 }
                    : msg.isMe
                    ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                    : { backgroundColor: colors.muted, borderBottomLeftRadius: 4 },
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    { color: msg.hidden ? colors.mutedForeground : msg.isMe ? '#fff' : colors.foreground },
                    msg.hidden && { fontStyle: 'italic', opacity: 0.7 },
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
              <Text style={[styles.msgTime, { color: colors.mutedForeground }, msg.isMe && { alignSelf: 'flex-end' }]}>
                {msg.time}
              </Text>
            </View>
          </View>
          );
        }}
      />

      {/* Input */}
      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom || 12 }]}>
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
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.primary }]} onPress={sendMessage}>
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
  memberBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  memberBadgeText: { fontSize: 11, fontWeight: '600' },
  pollBanner: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  pollCard: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 8 },
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
  msgRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  msgRowMe: { flexDirection: 'row-reverse' },
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

export default GlobalChatScreen;
