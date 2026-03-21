import React, { useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { FAQ_SOURCE_URL, faqs } from '../data/faqs';
import { useTheme } from '../contexts/ThemeContext';

interface FAQScreenProps {
  onBack: () => void;
}

export default function FAQScreen({ onBack }: FAQScreenProps) {
  const { colors } = useTheme();
  const [openId, setOpenId] = useState<string | null>(null);

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
        <View
          style={[
            styles.sourceCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.sourceTop}>
            <View style={[styles.sourceIcon, { backgroundColor: colors.primary + '14' }]}>
              <Ionicons name="globe-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sourceTitle, { color: colors.foreground }]}>
                Sarajevo Expats Q&A
              </Text>
              <Text style={[styles.sourceDesc, { color: colors.mutedForeground }]}>
                This section is wired to mirror the website FAQ structure once live data is available.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.sourceLink, { borderColor: colors.border }]}
            onPress={() => Linking.openURL(FAQ_SOURCE_URL)}
          >
            <Text style={[styles.sourceLinkText, { color: colors.primary }]}>
              Open source page
            </Text>
            <Ionicons name="open-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {faqs.length === 0 ? (
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
              The current Sarajevo Expats Q&A page does not list any questions yet. As soon as the real API is connected, this screen can render them without changing the UI structure.
            </Text>
          </View>
        ) : (
          faqs.map((item) => {
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
  sourceCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  sourceTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sourceDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  sourceLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sourceLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
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
