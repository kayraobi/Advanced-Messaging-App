import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { events } from '../data/events';

const categoryColors: Record<string, string> = {
  Social: '#f97316',
  Sports: '#10b981',
  Culture: '#8b5cf6',
  'Food & Drink': '#f59e0b',
};

const mockAttendees = [
  { initials: 'AK', name: 'Amar Kovačević' },
  { initials: 'HB', name: 'Hana Begović' },
  { initials: 'KT', name: 'Kayra Tanović' },
  { initials: 'MR', name: 'Mirza Redžić' },
  { initials: 'SB', name: 'Sara Bašić' },
  { initials: 'JD', name: 'Jasmin Delić' },
  { initials: 'LP', name: 'Lejla Pašić' },
  { initials: 'NV', name: 'Nihad Velić' },
  { initials: 'CT', name: 'Čedomir Tadić' },
  { initials: 'RW', name: 'Rijad Wehrle' },
  { initials: 'EH', name: 'Emina Hadžić' },
  { initials: 'FK', name: 'Faruk Kapić' },
  { initials: 'DM', name: 'Dina Mujić' },
  { initials: 'TI', name: 'Tarik Ibrahimović' },
  { initials: 'AN', name: 'Amra Nuhanović' },
  { initials: 'BK', name: 'Benjamin Kurtović' },
  { initials: 'ZS', name: 'Zlatan Selimović' },
  { initials: 'IM', name: 'Irma Mehmedović' },
  { initials: 'OK', name: 'Omar Kapetanović' },
  { initials: 'VL', name: 'Vedad Lončarević' },
];

interface EventDetailScreenProps {
  eventId: string;
  onBack: () => void;
}

const EventDetailScreen = ({ eventId, onBack }: EventDetailScreenProps) => {
  const { colors } = useTheme();
  const event = events.find((e) => e.id === eventId);
  const [isJoined, setIsJoined] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');

  if (!event) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Event not found.</Text>
      </View>
    );
  }

  const fillPercent = Math.round((event.filled / event.capacity) * 100);
  const isFull = event.filled >= event.capacity;
  const attendees = mockAttendees.slice(0, event.filled);
  const catColor = categoryColors[event.category] ?? colors.primary;

  const perPerson =
    totalAmount && Number(totalAmount) > 0
      ? (Number(totalAmount) / event.filled).toFixed(2)
      : '0.00';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Cover Image */}
        <View style={styles.cover}>
          <Image source={{ uri: event.image }} style={styles.coverImage} />
          <View style={styles.coverGradient} />
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Category + Title */}
          <View style={[styles.catBadge, { backgroundColor: catColor + '1A', borderColor: catColor + '40' }]}>
            <Text style={[styles.catText, { color: catColor }]}>{event.category}</Text>
          </View>
          <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>

          {/* Meta */}
          <View style={styles.metaList}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.date}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.time}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.location}</Text>
            </View>
          </View>

          {/* Map Placeholder */}
          <View style={[styles.mapPlaceholder, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="map-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.mapText, { color: colors.mutedForeground }]}>{event.location}</Text>
          </View>

          <TouchableOpacity
            style={[styles.directionsBtn, { borderColor: colors.primary + '40' }]}
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location + ', Sarajevo')}`)}
          >
            <Ionicons name="navigate-outline" size={16} color={colors.primary} />
            <Text style={[styles.directionsBtnText, { color: colors.primary }]}>Get Directions</Text>
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              Join fellow expats and locals for a wonderful experience at {event.location}. This is a great opportunity to meet new people, explore the city, and create lasting memories. Whether you're new to Sarajevo or a long-time resident, everyone is welcome!
            </Text>
          </View>

          {/* Attendees */}
          <View style={styles.section}>
            <TouchableOpacity onPress={() => setShowAttendees(true)}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Attendees ({event.filled}/{event.capacity}){' '}
                <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>· Tap to view all</Text>
              </Text>
            </TouchableOpacity>
            <View style={styles.avatarRow}>
              {attendees.slice(0, 6).map((a, i) => (
                <View
                  key={i}
                  style={[
                    styles.attendeeAvatar,
                    { backgroundColor: colors.primary + '1A', borderColor: colors.background, marginLeft: i === 0 ? 0 : -10 },
                  ]}
                >
                  <Text style={[styles.attendeeInitials, { color: colors.primary }]}>{a.initials}</Text>
                </View>
              ))}
              {event.filled > 6 && (
                <View
                  style={[
                    styles.attendeeAvatar,
                    styles.overflowAvatar,
                    { backgroundColor: colors.muted, borderColor: colors.background, marginLeft: -10 },
                  ]}
                >
                  <Text style={[styles.attendeeInitials, { color: colors.mutedForeground }]}>+{event.filled - 6}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Split Costs */}
          <TouchableOpacity
            style={[styles.splitBtn, { borderColor: colors.primary + '50' }]}
            onPress={() => setShowSplit(true)}
          >
            <Ionicons name="receipt-outline" size={16} color={colors.primary} />
            <Text style={[styles.splitBtnText, { color: colors.primary }]}>Split Costs</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Join Button */}
      <View style={[styles.joinBarWrap, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.joinBtn,
            isJoined
              ? { borderWidth: 2, borderColor: '#10b981', backgroundColor: 'transparent' }
              : { backgroundColor: colors.primary },
          ]}
          onPress={() => {
            const joining = !isJoined;
            setIsJoined(joining);
            Alert.alert(
              joining ? '🎉 Joined!' : 'RSVP Cancelled',
              joining
                ? isFull ? "You've been added to the waitlist." : "You're going to this event!"
                : 'Your RSVP has been removed.'
            );
          }}
        >
          <Text style={[styles.joinBtnText, { color: isJoined ? '#10b981' : '#fff' }]}>
            {isJoined
              ? isFull ? '✅ On Waitlist' : '✅ Joined'
              : isFull ? 'Join Waitlist' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Attendees Modal */}
      <Modal visible={showAttendees} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAttendees(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>All Attendees</Text>
              <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>{event.filled} participants</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAttendees(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={attendees}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{ padding: 12 }}
            renderItem={({ item: a }) => (
              <View style={[styles.attendeeRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.attendeeAvatarLg, { backgroundColor: colors.primary + '1A' }]}>
                  <Text style={[styles.attendeeInitialsLg, { color: colors.primary }]}>{a.initials}</Text>
                </View>
                <Text style={[styles.attendeeName, { color: colors.foreground }]}>{a.name}</Text>
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Split Costs Modal */}
      <Modal visible={showSplit} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowSplit(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Split Event Costs</Text>
            <TouchableOpacity onPress={() => setShowSplit(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={styles.splitContent}>
            <Text style={[styles.splitLabel, { color: colors.foreground }]}>Total Amount (BAM)</Text>
            <TextInput
              value={totalAmount}
              onChangeText={setTotalAmount}
              keyboardType="numeric"
              placeholder="e.g. 190"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.splitInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            />
            <Text style={[styles.splitBy, { color: colors.mutedForeground }]}>
              Divided by: <Text style={{ fontWeight: '700', color: colors.foreground }}>{event.filled} Attendees</Text>
            </Text>
            <View style={[styles.splitResult, { backgroundColor: colors.primary + '0D' }]}>
              <Text style={[styles.splitResultLabel, { color: colors.mutedForeground }]}>COST PER PERSON</Text>
              <Text style={[styles.splitResultValue, { color: colors.primary }]}>
                {perPerson} <Text style={{ fontSize: 18 }}>BAM</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.splitSendBtn,
                { backgroundColor: !totalAmount || Number(totalAmount) <= 0 ? colors.muted : colors.primary },
              ]}
              disabled={!totalAmount || Number(totalAmount) <= 0}
              onPress={() => {
                Alert.alert('💸 Payment request sent!', `Requested ${perPerson} BAM from ${event.filled} people.`);
                setShowSplit(false);
              }}
            >
              <Ionicons name="send-outline" size={16} color={!totalAmount || Number(totalAmount) <= 0 ? colors.mutedForeground : '#fff'} />
              <Text style={[styles.splitSendText, { color: !totalAmount || Number(totalAmount) <= 0 ? colors.mutedForeground : '#fff' }]}>
                Send Request to Chat
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cover: { position: 'relative', height: 220 },
  coverImage: { width: '100%', height: '100%' },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 20, gap: 16 },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  catText: { fontSize: 12, fontWeight: '700' },
  eventTitle: { fontSize: 22, fontWeight: '800', lineHeight: 28 },
  metaList: { gap: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaText: { fontSize: 14 },
  mapPlaceholder: {
    height: 140,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapText: { fontSize: 13 },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  directionsBtnText: { fontSize: 13, fontWeight: '600' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionHint: { fontSize: 12, fontWeight: '400' },
  description: { fontSize: 14, lineHeight: 22 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  attendeeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  overflowAvatar: {},
  attendeeInitials: { fontSize: 11, fontWeight: '700' },
  splitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderRadius: 12,
  },
  splitBtnText: { fontSize: 14, fontWeight: '600' },
  joinBarWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  joinBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: { fontSize: 16, fontWeight: '800' },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSub: { fontSize: 12, marginTop: 2 },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  attendeeAvatarLg: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  attendeeInitialsLg: { fontSize: 13, fontWeight: '700' },
  attendeeName: { fontSize: 14, fontWeight: '500' },
  splitContent: { padding: 24, gap: 16 },
  splitLabel: { fontSize: 14, fontWeight: '600' },
  splitInput: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  splitBy: { fontSize: 13, textAlign: 'center' },
  splitResult: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  splitResultLabel: { fontSize: 11, letterSpacing: 1, fontWeight: '600', textTransform: 'uppercase' },
  splitResultValue: { fontSize: 42, fontWeight: '900' },
  splitSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
  },
  splitSendText: { fontSize: 15, fontWeight: '700' },
});

export default EventDetailScreen;
