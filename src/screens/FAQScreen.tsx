import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { FaqItem } from '../data/faqs';
import { useTheme } from '../contexts/ThemeContext';
import { faqService } from '../services';

interface FAQScreenProps {
  onBack: () => void;
}

export default function FAQScreen({ onBack }: FAQScreenProps) {
  const { colors } = useTheme();
  const [openId, setOpenId] = useState<string | null>(null);
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadFaqs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await faqService.getAll();
        if (active) setItems(data);
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Failed to load FAQ data.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadFaqs();

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>FAQ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '14' }]}>
              <Ionicons name="hourglass-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Loading FAQ
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              We are preparing the question and answer list for the Sarajevo Expats help section.
            </Text>
          </View>
        ) : error ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.emptyIcon, { backgroundColor: '#ef444415' }]}>
              <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              FAQ could not be loaded
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              {error}
            </Text>
          </View>
        ) : items.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '14' }]}>
              <Ionicons name="chatbox-ellipses-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No published questions yet
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              The current Sarajevo Expats Q&A page does not list any questions yet. Once the backend exposes FAQ data, this screen can show it without changing the UI structure.
            </Text>
          </View>
        ) : (
          items.map((item) => {
            const isOpen = openId === item.id;

            return (
              <View
                key={item.id}
                style={[
                  styles.faqCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  style={styles.faqTrigger}
                  onPress={() => setOpenId(isOpen ? null : item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.faqQuestion, { color: colors.foreground }]}>
                    {item.question}
                  </Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.mutedForeground}
                  />
                </TouchableOpacity>

                {isOpen && (
                  <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>
                    {item.answer}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
  faqCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  faqTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  faqAnswer: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
  },
});
