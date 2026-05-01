import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { eventService } from '../services/eventService';
import { contentToPlainLines } from '../utils/eventPresentation';

interface MyEventsScreenProps {
  onBack: () => void;
  onEventPress: (id: string) => void;
}

const MyEventsScreen = ({ onBack, onEventPress }: MyEventsScreenProps) => {
  const { colors } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await eventService.getMyRsvpEvents();
      setEvents(list);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const renderItem = ({ item }: { item: any }) => {
    const title = contentToPlainLines(item.content)[0] ?? 'Event';
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onEventPress(String(item._id))}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {item.displayUrl ? (
          <Image source={{ uri: item.displayUrl }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="calendar-outline" size={36} color={colors.mutedForeground} />
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>
            {title}
          </Text>
          {item.date ? (
            <View style={styles.meta}>
              <Ionicons name="calendar-outline" size={14} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.date}</Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Events</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No events yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Join events from Home or Calendar — RSVP is saved here after you tap “Join event”.
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
};

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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 19, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardImage: { width: 72, height: 72, borderRadius: 10 },
  cardBody: { flex: 1, gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12 },
});

export default MyEventsScreen;
