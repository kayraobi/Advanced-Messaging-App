import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import type { NewsArticle } from '../data/news';

interface NewsCardProps {
  article: NewsArticle;
  onPress?: () => void;
}

const NewsCard = ({ article, onPress }: NewsCardProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: article.image }}
        style={styles.image}
        fadeDuration={200}
      />
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[styles.snippet, { color: colors.mutedForeground }]} numberOfLines={2}>
          {article.snippet}
        </Text>
        <View style={styles.date}>
          <Ionicons name="calendar-outline" size={11} color={colors.mutedForeground} />
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>{article.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    padding: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 10,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  snippet: {
    fontSize: 11,
    lineHeight: 15,
  },
  date: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
  },
});

export default NewsCard;
