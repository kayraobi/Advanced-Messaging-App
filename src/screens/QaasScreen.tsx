import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { qaasService, QaA } from '../services/qaasService';

interface QaasScreenProps {
  onBack: () => void;
}

const QaasScreen = ({ onBack }: QaasScreenProps) => {
  const { colors } = useTheme();
  const [qaas, setQaas] = useState<QaA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    qaasService.getAll()
      .then(setQaas)
      .catch((e) => setError(e.message ?? 'Failed to load Q&As.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = qaas.filter((q) =>
    q.question.toLowerCase().includes(search.toLowerCase()) ||
    q.answer.toLowerCase().includes(search.toLowerCase())
  );

  // Kategorilere göre grupla
  const categories = Array.from(new Set(filtered.map((q) => q.category ?? 'General')));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>FAQ</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>{error}</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Search */}
          <View style={styles.searchWrap}>
            <View style={[styles.searchBox, { backgroundColor: colors.muted }]}>
              <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
              <TextInput
                placeholder="Search questions…"
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
                style={[styles.searchInput, { color: colors.foreground }]}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="help-circle-outline" size={40} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>No results found.</Text>
            </View>
          ) : (
            categories.map((category) => {
              const items = filtered.filter((q) => (q.category ?? 'General') === category);
              return (
                <View key={category} style={styles.section}>
                  <Text style={[styles.categoryLabel, { color: colors.mutedForeground }]}>
                    {category.toUpperCase()}
                  </Text>
                  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {items.map((qa, idx) => {
                      const isOpen = openId === qa._id;
                      return (
                        <View key={qa._id}>
                          <TouchableOpacity
                            style={[
                              styles.questionRow,
                              { borderBottomColor: colors.border },
                              (isOpen || idx === items.length - 1) && { borderBottomWidth: 0 },
                            ]}
                            onPress={() => setOpenId(isOpen ? null : qa._id)}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.question, { color: colors.foreground, flex: 1 }]}>
                              {qa.question}
                            </Text>
                            <Ionicons
                              name={isOpen ? 'chevron-up' : 'chevron-down'}
                              size={18}
                              color={colors.mutedForeground}
                            />
                          </TouchableOpacity>

                          {isOpen && (
                            <View style={[styles.answerWrap, { borderBottomColor: colors.border }, idx < items.length - 1 && { borderBottomWidth: 1 }]}>
                              <Text style={[styles.answer, { color: colors.mutedForeground }]}>
                                {qa.answer}
                              </Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 60 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
  },
  searchInput: { flex: 1, fontSize: 14 },
  section: { paddingHorizontal: 16, paddingTop: 20, gap: 8 },
  categoryLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, paddingLeft: 2 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  questionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  question: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  answerWrap: { paddingHorizontal: 16, paddingVertical: 14 },
  answer: { fontSize: 14, lineHeight: 22 },
});

export default QaasScreen;
