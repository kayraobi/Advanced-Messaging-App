import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import type { Event } from '../data/events';

const categoryColors: Record<string, string> = {
  Social: '#f97316',
  Sports: '#10b981',
  Culture: '#8b5cf6',
  'Food & Drink': '#f43f5e',
};

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

const EventCard = ({ event, onPress }: EventCardProps) => {
  const { colors } = useTheme();
  const fillPercent = Math.round((event.filled / event.capacity) * 100);
  const isFull = event.filled >= event.capacity;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.image} />
        <View
          style={[
            styles.badge,
            { backgroundColor: categoryColors[event.category] ?? colors.primary },
          ]}
        >
          <Text style={styles.badgeText}>{event.category}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.cardForeground }]} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={13} color={colors.primary} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {event.date} · {event.time}
          </Text>
        </View>
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={13} color={colors.primary} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${fillPercent}%` as any,
                  },
                ]}
              />
            </View>
            <Text style={[styles.capacity, { color: colors.mutedForeground }]}>
              {event.filled}/{event.capacity} filled
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.joinBtn,
              isFull
                ? { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'transparent' }
                : { backgroundColor: colors.primary },
            ]}
            onPress={onPress}
          >
            <Text
              style={[
                styles.joinText,
                { color: isFull ? colors.primary : colors.primaryForeground },
              ]}
            >
              {isFull ? 'Waitlist' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    padding: 14,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  capacity: {
    fontSize: 11,
    marginTop: 3,
  },
  joinBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  joinText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default EventCard;
