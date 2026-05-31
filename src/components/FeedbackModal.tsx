import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabaseClient';

interface Props {
  visible: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

const CATEGORIES = [
  { id: 'feature', label: 'Feature Request', icon: 'bulb-outline' as const },
  { id: 'bug', label: 'Bug Report', icon: 'bug-outline' as const },
  { id: 'ui', label: 'UI / Design', icon: 'color-palette-outline' as const },
  { id: 'performance', label: 'Performance', icon: 'speedometer-outline' as const },
  { id: 'other', label: 'Other', icon: 'chatbubble-outline' as const },
];

const PRIORITIES = [
  { id: 'low', label: 'Low', color: '#22c55e' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'high', label: 'High', color: '#ef4444' },
];

export default function FeedbackModal({ visible, onClose, userName, userEmail }: Props) {
  const { colors } = useTheme();
  const accentColor = colors.primary ?? '#f97316';

  const [category, setCategory] = useState('feature');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const reset = () => {
    setCategory('feature');
    setPriority('medium');
    setMessage('');
    setSent(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (message.trim().length < 10) {
      Alert.alert('Too short', 'Please write at least 10 characters.');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('feedbacks').insert({
        user_name: userName ?? null,
        user_email: userEmail ?? null,
        category,
        priority,
        message: message.trim(),
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not send feedback. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerCenter}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color={accentColor} />
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Send Feedback</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {sent ? (
          /* Success state */
          <View style={styles.successWrap}>
            <View style={[styles.successIcon, { backgroundColor: '#22c55e18' }]}>
              <Ionicons name="checkmark-circle" size={56} color="#22c55e" />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Thanks for your feedback!</Text>
            <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
              We read every submission and use them to improve the app.
            </Text>
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: accentColor }]} onPress={handleClose}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={reset} style={styles.anotherBtn}>
              <Text style={[styles.anotherBtnText, { color: accentColor }]}>Send another</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              {/* Category */}
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((c) => {
                  const active = category === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: active ? accentColor : colors.card,
                          borderColor: active ? accentColor : colors.border,
                        },
                      ]}
                      onPress={() => setCategory(c.id)}
                    >
                      <Ionicons name={c.icon} size={16} color={active ? '#fff' : colors.foreground} />
                      <Text style={[styles.categoryLabel, { color: active ? '#fff' : colors.foreground }]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Priority */}
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Priority</Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((p) => {
                  const active = priority === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.priorityChip,
                        {
                          backgroundColor: active ? p.color + '20' : colors.card,
                          borderColor: active ? p.color : colors.border,
                        },
                      ]}
                      onPress={() => setPriority(p.id)}
                    >
                      <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                      <Text style={[styles.priorityLabel, { color: active ? p.color : colors.foreground }]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Message */}
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Your feedback</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="What's on your mind? Describe a feature, report a bug, or share an idea..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={6}
                style={[
                  styles.textArea,
                  {
                    color: colors.foreground,
                    borderColor: message.length > 0 ? accentColor + '80' : colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              />
              <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
                {message.length} characters
              </Text>

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: message.trim().length >= 10 ? accentColor : colors.muted },
                ]}
                onPress={submit}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={18} color="#fff" />
                    <Text style={styles.submitBtnText}>Send Feedback</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  closeBtn: { width: 36, alignItems: 'flex-end' },
  content: { padding: 20, gap: 8, paddingBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  categoryLabel: { fontSize: 13, fontWeight: '600' },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityLabel: { fontSize: 13, fontWeight: '600' },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 130,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: -4 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    marginTop: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  successIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  successSub: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  doneBtn: { paddingHorizontal: 36, paddingVertical: 13, borderRadius: 14, marginTop: 8 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  anotherBtn: { paddingVertical: 8 },
  anotherBtnText: { fontSize: 14, fontWeight: '600' },
});
