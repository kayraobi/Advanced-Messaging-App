import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { newsService } from '../services/newsService';
import type { News } from '../types/news.types';

interface NewsDetailScreenProps {
  newsId: string;
  onBack: () => void;
}

const stripHtml = (html: string): string =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const NewsDetailScreen = ({ newsId, onBack }: NewsDetailScreenProps) => {
  const { colors } = useTheme();
  const [item, setItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    newsService
      .getById(newsId)
      .then((n) => {
        if (!cancelled) setItem(n);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Could not load article.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [newsId]);

  const plainBody = item ? stripHtml(item.content || '') : '';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityRole="button">
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          Article
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: '#ef4444', textAlign: 'center', paddingHorizontal: 24 }}>{error}</Text>
        </View>
      ) : item ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Image
            source={{
              uri:
                item.pictures?.[0] ??
                'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80',
            }}
            style={styles.hero}
          />
          <View style={styles.body}>
            <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
            {item.createdAt ? (
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{item.createdAt}</Text>
            ) : null}
            <Text style={[styles.content, { color: colors.mutedForeground }]}>
              {plainBody || item.title}
            </Text>
            {item.sources?.trim() ? (
              <Text style={[styles.source, { color: colors.mutedForeground }]}>
                Source: {item.sources.trim()}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <Text style={{ color: colors.mutedForeground }}>Article not found.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { width: '100%', height: 220 },
  body: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 30 },
  date: { fontSize: 13 },
  content: { fontSize: 15, lineHeight: 24 },
  source: { fontSize: 14, fontStyle: 'italic', marginTop: 8 },
});

export default NewsDetailScreen;
