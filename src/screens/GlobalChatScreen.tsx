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
  Modal,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { socketService } from '../services/socketService';
import { useGlobalRoom } from '../hooks/useChatRooms';
import { usersService } from '../services/usersService';
import type { User } from '../types/user.types';

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  initials: string;
  text: string;
  time: string;
  isMe: boolean;
  hidden?: boolean;
}

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
  const [currentUser, setCurrentUser] = useState<{ _id: string; username: string } | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);

  const { globalRoom } = useGlobalRoom();
  const roomId = globalRoom?._id;
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const openProfile = async (senderId: string) => {
    if (!senderId) return;
    setProfileUser(null);
    setShowProfile(true);
    setProfileLoading(true);
    try {
      const user = await usersService.getById(senderId);
      setProfileUser(user);
    } catch {
      setProfileUser(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('auth_user').then((raw) => {
      if (raw) setCurrentUser(JSON.parse(raw));
    });
  }, []);

  useEffect(() => {
    if (!roomId) return;
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
          hidden: m.hidden ?? m.isDeleted ?? false,
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
            hidden: m.hidden ?? m.isDeleted ?? false,
          },
        ]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      };

      socketService.on('previous_messages', handlePrevious);
      socketService.on('receive_message', handleReceive);
      socketService.joinRoom(roomId);

      return () => {
        socketService.off('previous_messages', handlePrevious);
        socketService.off('receive_message', handleReceive);
        socketService.leaveRoom(roomId);
      };
    };

    let cleanupFn: (() => void) | undefined;
    const promise = setup().then((fn) => { cleanupFn = fn; });

    return () => {
      isMounted = false;
      promise.then(() => cleanupFn?.());
    };
  }, [roomId, currentUser]);

  const sendMessage = async () => {
    if (!input.trim() || !roomId) return;
    await socketService.connect();
    socketService.sendMessage(roomId, input.trim());
    setInput('');
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
        renderItem={({ item: msg }) => (
          <View style={[styles.msgRow, msg.isMe && styles.msgRowMe]}>
            {!msg.isMe && (
              <TouchableOpacity
                style={[styles.msgAvatar, { backgroundColor: colors.primary + '1A' }]}
                onPress={() => openProfile(msg.senderId)}
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
        )}
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
      <Modal
        visible={showProfile}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfile(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfile(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.profileSheet, { backgroundColor: colors.card }]}
            onPress={() => {}}
          >
            {/* Handle bar */}
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

            {profileLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
            ) : profileUser ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Avatar */}
                <View style={styles.profileAvatarWrap}>
                  {profileUser.displayUrl ? (
                    <Image source={{ uri: profileUser.displayUrl }} style={styles.profileAvatar} />
                  ) : (
                    <View style={[styles.profileAvatarPlaceholder, { backgroundColor: colors.primary + '22' }]}>
                      <Text style={[styles.profileAvatarInitials, { color: colors.primary }]}>
                        {profileUser.username.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Name & type */}
                <Text style={[styles.profileName, { color: colors.foreground }]}>
                  {profileUser.name ?? profileUser.username}
                </Text>
                <Text style={[styles.profileUsername, { color: colors.mutedForeground }]}>
                  @{profileUser.username}
                </Text>
                {profileUser.type && profileUser.type !== 'user' && (
                  <View style={[styles.profileBadge, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[styles.profileBadgeText, { color: colors.primary }]}>{profileUser.type}</Text>
                  </View>
                )}

                {/* Interests */}
                {profileUser.interests && profileUser.interests.length > 0 && (
                  <View style={styles.interestsSection}>
                    <Text style={[styles.interestsLabel, { color: colors.mutedForeground }]}>Interests</Text>
                    <View style={styles.interestsTags}>
                      {profileUser.interests.map((tag, i) => (
                        <View key={i} style={[styles.interestTag, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                          <Text style={[styles.interestTagText, { color: colors.primary }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="person-circle-outline" size={48} color={colors.mutedForeground} />
                <Text style={[{ color: colors.mutedForeground, marginTop: 12, fontSize: 14 }]}>Profile not available</Text>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  profileSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '75%',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  profileAvatarWrap: { alignItems: 'center', marginBottom: 12 },
  profileAvatar: { width: 88, height: 88, borderRadius: 44 },
  profileAvatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarInitials: { fontSize: 28, fontWeight: '700' },
  profileName: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  profileUsername: { fontSize: 14, textAlign: 'center', marginTop: 2, marginBottom: 8 },
  profileBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  profileBadgeText: { fontSize: 12, fontWeight: '600' },
  interestsSection: { marginTop: 16 },
  interestsLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  interestsTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  interestTagText: { fontSize: 13, fontWeight: '500' },
});

export default GlobalChatScreen;
