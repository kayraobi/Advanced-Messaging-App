import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { events } from '../data/events';
import EventCard from '../components/EventCard';

const rsvpEventIds = ['1', '3', '5', '7'];

interface MyEventsScreenProps {
  onBack: () => void;
  onEventPress: (id: string) => void;
}

const MyEventsScreen = ({ onBack, onEventPress }: MyEventsScreenProps) => {
  const { colors } = useTheme();
  const myEvents = events.filter((e) => rsvpEventIds.includes(e.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Events</Text>
        <View style={{ width: 40 }} />
      </View>

      {myEvents.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No events yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Join events from the Home or Calendar tabs to see them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={myEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => onEventPress(item.id)} />
          )}
          showsVerticalScrollIndicator={false}
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 19, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

export default MyEventsScreen;
