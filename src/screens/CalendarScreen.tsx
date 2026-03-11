import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { events } from '../data/events';
import { parse, isAfter, isBefore, startOfDay, format } from 'date-fns';

type StatusFilter = 'all' | 'open' | 'almost-full' | 'full';

interface CalendarScreenProps {
  onEventPress: (id: string) => void;
}

const CalendarScreen = ({ onEventPress }: CalendarScreenProps) => {
  const { colors } = useTheme();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'open', label: 'Open' },
    { value: 'almost-full', label: 'Almost Full' },
    { value: 'full', label: 'Full' },
  ];

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const pct = (e.filled / e.capacity) * 100;
      if (status === 'open' && pct >= 80) return false;
      if (status === 'almost-full' && (pct < 80 || pct >= 100)) return false;
      if (status === 'full' && pct < 100) return false;
      const eventDate = parse(e.date, 'MMM d, yyyy', new Date());
      if (fromDate && isBefore(startOfDay(eventDate), startOfDay(fromDate))) return false;
      if (toDate && isAfter(startOfDay(eventDate), startOfDay(toDate))) return false;
      return true;
    });
  }, [status, fromDate, toDate]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
      {/* Filters */}
      <View style={styles.filters}>
        {/* Status picker */}
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowStatusPicker(true)}
        >
          <Text style={[styles.filterBtnText, { color: colors.foreground }]}>
            {statusOptions.find((o) => o.value === status)?.label}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* From / To date chips */}
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.filterBtnText, { color: fromDate ? colors.foreground : colors.mutedForeground }]}>
            {fromDate ? format(fromDate, 'MMM d') : 'From'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.filterBtnText, { color: toDate ? colors.foreground : colors.mutedForeground }]}>
            {toDate ? format(toDate, 'MMM d') : 'To'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          <Text style={{ fontWeight: '700', color: colors.foreground }}>{filtered.length}</Text>{' '}
          {filtered.length === 1 ? 'event' : 'events'} found
        </Text>
      </View>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={40} color={colors.primary} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No events match your filters.</Text>
          </View>
        ) : (
          filtered.map((event) => {
            const pct = Math.round((event.filled / event.capacity) * 100);
            return (
              <TouchableOpacity
                key={event.id}
                onPress={() => onEventPress(event.id)}
                style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.85}
              >
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                <View style={styles.eventBody}>
                  <View style={styles.eventTitleRow}>
                    <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <View style={[styles.catBadge, { backgroundColor: colors.primary + '1A' }]}>
                      <Text style={[styles.catText, { color: colors.primary }]}>{event.category}</Text>
                    </View>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.location}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      {event.date} · {event.time}
                    </Text>
                  </View>
                  <View style={styles.capacityRow}>
                    <Ionicons name="people-outline" size={12} color={colors.mutedForeground} />
                    <View style={[styles.progressBg, { backgroundColor: colors.muted, flex: 1 }]}>
                      <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${pct}%` as any }]} />
                    </View>
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      {event.filled}/{event.capacity}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Status Picker Modal */}
      <Modal visible={showStatusPicker} transparent animationType="fade" onRequestClose={() => setShowStatusPicker(false)}>
        <TouchableOpacity style={styles.backdrop} onPress={() => setShowStatusPicker(false)} activeOpacity={1}>
          <View style={[styles.picker, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {statusOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                onPress={() => { setStatus(opt.value); setShowStatusPicker(false); }}
              >
                <Text style={[styles.pickerText, { color: colors.foreground }]}>{opt.label}</Text>
                {status === opt.value && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexWrap: 'wrap',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterBtnText: { fontSize: 13, fontWeight: '500' },
  count: { fontSize: 13, marginBottom: 8 },
  list: { paddingHorizontal: 16, gap: 14, paddingBottom: 40 },
  eventCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImage: { width: '100%', height: 160 },
  eventBody: { padding: 14, gap: 6 },
  eventTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  eventTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { fontSize: 10, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12 },
  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, gap: 8 },
  emptyText: { fontSize: 14 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 32 },
  picker: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  pickerText: { fontSize: 15 },
});

export default CalendarScreen;
