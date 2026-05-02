import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { events } from '../data/events';
import { socketService } from '../services/socketService';

interface ChatMessage {
  id: string;
  sender: string;
  initials: string;
  text: string;
  time: string;
  isMe: boolean;
}

const dmProfiles: Record<string, { name: string; initials: string; status: string }> = {
  'dm-1': { name: 'Yahia (Admin)', initials: 'YA', status: 'Online' },
  'dm-2': { name: 'Amar Kovačević', initials: 'AK', status: 'Active recently' },
  'dm-3': { name: 'Hana Begović', initials: 'HB', status: 'Online' },
  'dm-4': { name: 'Kayra Tanović', initials: 'KT', status: 'Active 2h ago' },
  'dm-5': { name: 'Mirza Redžić', initials: 'MR', status: 'Active recently' },
  'dm-6': { name: 'Sara Bašić', initials: 'SB', status: 'Active 1d ago' },
};

const dmMessages: Record<string, ChatMessage[]> = {
  'dm-1': [
    { id: '1', sender: 'Yahia', initials: 'YA', text: 'Welcome to the community! Let me know if you need anything 🙌', time: '9:00 AM', isMe: false },
    { id: '2', sender: 'You', initials: 'TT', text: 'Thanks Yahia! Excited to be here.', time: '9:05 AM', isMe: true },
    { id: '3', sender: 'Yahia', initials: 'YA', text: 'Check out the events page, lots happening this week!', time: '9:06 AM', isMe: false },
  ],
  'dm-2': [
    { id: '1', sender: 'Amar', initials: 'AK', text: 'Hey! Are you coming to the basketball game?', time: '2:30 PM', isMe: false },
    { id: '2', sender: 'You', initials: 'TT', text: 'Definitely! What time does it start?', time: '2:35 PM', isMe: true },
    { id: '3', sender: 'Amar', initials: 'AK', text: '6 PM at the outdoor court. Bring water!', time: '2:37 PM', isMe: false },
  ],
  'dm-3': [
    { id: '1', sender: 'You', initials: 'TT', text: 'Hey Hana! Do you know any good restaurants near Baščaršija?', time: '11:00 AM', isMe: true },
    { id: '2', sender: 'Hana', initials: 'HB', text: 'Try Dveri! Amazing Bosnian food 😊', time: '11:10 AM', isMe: false },
    { id: '3', sender: 'You', initials: 'TT', text: 'Thanks for the recommendation!', time: '11:12 AM', isMe: true },
  ],
  'dm-4': [
    { id: '1', sender: 'Kayra', initials: 'KT', text: "Let's grab coffee sometime this week ☕", time: '4:00 PM', isMe: false },
    { id: '2', sender: 'You', initials: 'TT', text: 'Sure! Wednesday afternoon works for me', time: '4:15 PM', isMe: true },
  ],
  'dm-5': [
    { id: '1', sender: 'Mirza', initials: 'MR', text: "I'll send you the details tomorrow", time: '6:00 PM', isMe: false },
    { id: '2', sender: 'You', initials: 'TT', text: 'Sounds good, thanks!', time: '6:05 PM', isMe: true },
  ],
  'dm-6': [
    { id: '1', sender: 'Sara', initials: 'SB', text: 'Great meeting you at the event! 🎉', time: '10:00 PM', isMe: false },
    { id: '2', sender: 'You', initials: 'TT', text: 'Likewise! Hope to see you at the next one', time: '10:05 PM', isMe: true },
  ],
};

const chatMessages: Record<string, ChatMessage[]> = {
  '1': [
    { id: '1', sender: 'Amar K.', initials: 'AK', text: "Who's bringing the ball today? 🏀", time: '3:15 PM', isMe: false },
    { id: '2', sender: 'You', initials: 'TT', text: "I've got one! See you at the court.", time: '3:17 PM', isMe: true },
    { id: '3', sender: 'Hana B.', initials: 'HB', text: "Great, I'll be there at 6. Don't start without me 😄", time: '3:20 PM', isMe: false },
    { id: '4', sender: 'Mirza R.', initials: 'MR', text: 'Same here, running a bit late though', time: '3:22 PM', isMe: false },
    { id: '5', sender: 'You', initials: 'TT', text: "No worries, we'll warm up first!", time: '3:24 PM', isMe: true },
  ],
  '3': [
    { id: '1', sender: 'Kayra T.', initials: 'KT', text: "I'm bringing Catan tonight! 🎲", time: '5:00 PM', isMe: false },
    { id: '2', sender: 'Sara B.', initials: 'SB', text: 'Yes! I call dibs on the longest road strategy', time: '5:02 PM', isMe: false },
    { id: '3', sender: 'You', initials: 'TT', text: "I'll bring snacks. Any requests?", time: '5:05 PM', isMe: true },
    { id: '4', sender: 'Jasmin D.', initials: 'JD', text: 'Chips and dip would be perfect 🙌', time: '5:08 PM', isMe: false },
  ],
  '2': [
    { id: '1', sender: 'Lejla P.', initials: 'LP', text: "Weather looks perfect for Saturday's hike!", time: '9:00 AM', isMe: false },
    { id: '2', sender: 'You', initials: 'TT', text: "Can't wait! Which trail are we doing?", time: '9:05 AM', isMe: true },
    { id: '3', sender: 'Nihad V.', initials: 'NV', text: 'I vote for Trebević, amazing views up there 🏔️', time: '9:10 AM', isMe: false },
    { id: '4', sender: 'You', initials: 'TT', text: 'Trebević it is! Meet at 8 AM at the cable car?', time: '9:15 AM', isMe: true },
    { id: '5', sender: 'Lejla P.', initials: 'LP', text: 'Perfect, see you all there! ☀️', time: '9:18 AM', isMe: false },
  ],
  '5': [
    { id: '1', sender: 'Faruk K.', initials: 'FK', text: 'Anyone need a ride to the event?', time: '2:00 PM', isMe: false },
    { id: '2', sender: 'You', initials: 'TT', text: "That would be great! I'm coming from Baščaršija", time: '2:05 PM', isMe: true },
    { id: '3', sender: 'Faruk K.', initials: 'FK', text: 'I can pick you up at 5:30, DM me the exact spot 🚗', time: '2:08 PM', isMe: false },
  ],
  '7': [
    { id: '1', sender: 'Dina M.', initials: 'DM', text: "Can't wait for the tasting menu tonight 🍽️", time: '11:00 AM', isMe: false },
    { id: '2', sender: 'Tarik I.', initials: 'TI', text: 'I heard the chef prepared something special!', time: '11:05 AM', isMe: false },
    { id: '3', sender: 'You', initials: 'TT', text: 'So excited! Do we need to pre-order anything?', time: '11:10 AM', isMe: true },
    { id: '4', sender: 'Dina M.', initials: 'DM', text: "Nope, it's a surprise tasting. Just come hungry! 😋", time: '11:12 AM', isMe: false },
  ],
};

const pollOptions = [
  { label: 'Saturday Evening', votes: 18 },
  { label: 'Sunday Afternoon', votes: 12 },
  { label: 'Next Week', votes: 5 },
];
const totalVotes = pollOptions.reduce((s, o) => s + o.votes, 0);

const ChatDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RootStackScreenProps<'ChatDetail'>['route']>();
  const { chatId } = route.params;
  const { colors } = useTheme();
  const isDm = chatId.startsWith('dm-');
  const dmProfile = isDm ? dmProfiles[chatId] : null;
  const event = !isDm ? events.find((e) => e.id === chatId) : null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const [showPoll, setShowPoll] = useState(true);

  const chatTitle = isDm ? dmProfile?.name ?? 'Chat' : event?.title ?? 'Chat';

  React.useEffect(() => {
    const socket = socketService.connect();
    socket.emit('join_room', chatId);

    const handlePrevious = (msgs: any[]) => {
      const formatted = msgs.map((m) => ({
        id: m.id,
        sender: m.senderId === 'me' ? 'You' : m.senderName,
        initials: m.senderName.substring(0, 2).toUpperCase(),
        text: m.content,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: m.senderId === 'me',
      }));
      setMessages(formatted);
    };

    const handleReceive = (m: any) => {
      const formatted = {
        id: m.id,
        sender: m.senderId === 'me' ? 'You' : m.senderName,
        initials: m.senderName.substring(0, 2).toUpperCase(),
        text: m.content,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: m.senderId === 'me',
      };
      setMessages((prev) => [...prev, formatted]);
    };

    socket.on('previous_messages', handlePrevious);
    socket.on('receive_message', handleReceive);

    return () => {
      socket.off('previous_messages', handlePrevious);
      socket.off('receive_message', handleReceive);
    };
  }, [chatId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const socket = socketService.connect();
    socket.emit('send_message', {
      roomId: chatId,
      senderId: 'me',
      senderName: 'You',
      content: input.trim(),
    });
    
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {chatTitle}
          </Text>
          {isDm && dmProfile && (
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{dmProfile.status}</Text>
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
