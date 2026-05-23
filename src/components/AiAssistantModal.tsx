import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GeminiMessage } from '../services/groqService';

interface Props {
  visible: boolean;
  onClose: () => void;
  aiMessages: GeminiMessage[];
  aiInput: string;
  setAiInput: (v: string) => void;
  aiLoading: boolean;
  aiListRef: React.RefObject<FlatList>;
  sendAiMessage: () => void;
  colors: Record<string, string>;
  bottomInset?: number;
}

const AiAssistantModal: React.FC<Props> = ({
  visible,
  onClose,
  aiMessages,
  aiInput,
  setAiInput,
  aiLoading,
  aiListRef,
  sendAiMessage,
  colors,
  bottomInset = 0,
}) => {
  const suggestions = [
    '🏙️ What is Sarajevo Expats?',
    '📍 Best places to visit?',
    '🏠 How to find housing?',
    '🌍 Tips for new expats?',
    '🎉 What events are happening?',
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.modal, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.aiAvatar,
                { backgroundColor: '#F55036' },
              ]}
            >
              <Text style={styles.aiAvatarLetter}>G</Text>
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                AI Assistant
              </Text>
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                Powered by Groq AI
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={aiListRef}
          data={aiMessages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          onContentSizeChange={() =>
            aiListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🌍</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                Ask me anything about Sarajevo!
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Best places, expat tips, local events, real estate advice and more.
              </Text>
              <View style={styles.suggestions}>
                {suggestions.map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[
                      styles.suggestionChip,
                      {
                        borderColor: colors.primary,
                        backgroundColor: colors.primary + '12',
                      },
                    ]}
                    onPress={() => setAiInput(q.slice(3))}
                  >
                    <Text style={[styles.suggestionText, { color: colors.primary }]}>
                      {q}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user'
                  ? [styles.bubbleUser, { backgroundColor: colors.primary }]
                  : [
                      styles.bubbleModel,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ],
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  { color: item.role === 'user' ? '#fff' : colors.foreground },
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
        />

        {/* Typing indicator */}
        {aiLoading && (
          <View
            style={[
              styles.typing,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.typingText, { color: colors.mutedForeground }]}>
              AI is thinking…
            </Text>
          </View>
        )}

        {/* Input */}
        <View
          style={[
            styles.inputRow,
            {
              borderTopColor: colors.border,
              paddingBottom: bottomInset + 8,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.muted, color: colors.foreground },
            ]}
            placeholder="Ask about Sarajevo..."
            placeholderTextColor={colors.mutedForeground}
            value={aiInput}
            onChangeText={setAiInput}
            onSubmitEditing={sendAiMessage}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: aiInput.trim() ? colors.primary : colors.muted,
              },
            ]}
            onPress={sendAiMessage}
            disabled={!aiInput.trim() || aiLoading}
          >
            <Ionicons
              name="send"
              size={18}
              color={aiInput.trim() ? '#fff' : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarLetter: { color: '#fff', fontWeight: '900', fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 1 },
  closeBtn: { padding: 4 },
  list: { padding: 16, gap: 10, flexGrow: 1 },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  suggestions: { gap: 8, width: '100%' },
  suggestionChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  suggestionText: { fontSize: 14, fontWeight: '600' },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  bubbleUser: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleModel: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  typing: {
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
  typingText: { fontSize: 13 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AiAssistantModal;
