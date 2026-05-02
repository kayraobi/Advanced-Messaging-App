import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ChatMessage {
  id: string;
  sender: string;
  initials: string;
  text: string;
  time: string;
  isMe: boolean;
  hidden?: boolean;
}

const initialMessages: ChatMessage[] = [
  { id: '1', sender: 'Anna K.', initials: 'AK', text: 'Hey everyone! Anyone up for coffee this weekend? ☕', time: '10:12 AM', isMe: false },
  { id: '2', sender: 'Marco R.', initials: 'MR', text: "I'm in! Kibe Mahala or somewhere new?", time: '10:14 AM', isMe: false },
  { id: '3', sender: 'You', initials: 'TT', text: "Count me in! I've been wanting to try that new place on Ferhadija.", time: '10:15 AM', isMe: true },
  { id: '4', sender: 'Sara B.', initials: 'SB', text: 'The new one is great, I went last week. Highly recommend the cappuccino 👌', time: '10:17 AM', isMe: false },
  { id: '5', sender: 'You', initials: 'TT', text: "Perfect, let's do Saturday morning then!", time: '10:18 AM', isMe: true },
  { id: '6', sender: 'Liam P.', initials: 'LP', text: 'Saturday works for me too. What time?', time: '10:20 AM', isMe: false },
  { id: '7', sender: 'Anna K.', initials: 'AK', text: "How about 10 AM? Not too early 😄", time: '10:22 AM', isMe: false },
  { id: '8', sender: 'Marco R.', initials: 'MR', text: 'Sounds perfect. See you all there! 🎉', time: '10:23 AM', isMe: false },
  { id: '9', sender: 'Unknown', initials: '??', text: '🛡️ [Message hidden by AI Auto-Moderator]', time: '10:25 AM', isMe: false, hidden: true },
];

const pollOptions = [
  { label: 'Saturday Evening', votes: 18 },
  { label: 'Sunday Afternoon', votes: 12 },
  { label: 'Next Week', votes: 5 },
];
const totalVotes = pollOptions.reduce((s, o) => s + o.votes, 0);

const GlobalChatScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [votedIndex, setVotedIndex] = useState<number | null>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'You',
        initials: 'TT',
        text: input.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      },
    ]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
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
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item: msg }) => (
          <View style={[styles.msgRow, msg.isMe && styles.msgRowMe]}>
            {!msg.isMe && (
              <View style={[styles.msgAvatar, { backgroundColor: colors.primary + '1A' }]}>
                <Text style={[styles.msgAvatarText, { color: colors.primary }]}>{msg.initials}</Text>
              </View>
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
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.primary }]} onPress={sendMessage}>
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
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
});

export default GlobalChatScreen;
