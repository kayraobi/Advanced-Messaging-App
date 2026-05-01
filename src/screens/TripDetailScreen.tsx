import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { tripsService, Trip, TripApplication } from '../services/tripsService';
import { authService } from '../services/authService';

interface TripDetailScreenProps {
  tripId: string;
  onBack: () => void;
}

const TripDetailScreen = ({ tripId, onBack }: TripDetailScreenProps) => {
  const { colors } = useTheme();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isGm, setIsGm] = useState(false);
  const [applications, setApplications] = useState<TripApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  useEffect(() => {
    tripsService.getById(tripId)
      .then(setTrip)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => {
    authService.getStoredUser().then((u) => setIsGm(u?.type === 'GM'));
  }, []);

  useEffect(() => {
    if (!isGm || !tripId) return;
    setApplicationsLoading(true);
    tripsService
      .getApplications(tripId)
      .then(setApplications)
      .catch(() => setApplications([]))
      .finally(() => setApplicationsLoading(false));
  }, [isGm, tripId]);

  const handleApply = async () => {
    if (!trip) return;
    Alert.alert(
      'Apply for Trip',
      `Do you want to apply for "${trip.title ?? trip.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            try {
              setApplying(true);
              await tripsService.apply(tripId);
              Alert.alert('Success', 'Your application has been submitted!');
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Failed to apply.');
            } finally {
              setApplying(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="airplane-outline" size={48} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground }}>Trip not found.</Text>
      </View>
    );
  }

  const title = trip.title ?? trip.name ?? 'Trip';
  const coverImage = trip.displayUrl ?? trip.pictures?.[0] ?? null;
  const price = trip.price ?? null;
  const spotsLeft = trip.capacity != null && trip.currentApplicants != null
    ? trip.capacity - trip.currentApplicants
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Cover */}
        <View style={styles.cover}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="airplane-outline" size={60} color={colors.mutedForeground} />
            </View>
          )}
          <View style={styles.coverOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
          {price ? (
            <View style={[styles.priceBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.priceBadgeText}>
                {typeof price === 'number' ? `€${price}` : price}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>

          {/* Meta info */}
          <View style={[styles.metaGrid, { backgroundColor: colors.muted }]}>
            {trip.destination ? (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <Text style={[styles.metaValue, { color: colors.foreground }]}>{trip.destination}</Text>
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Destination</Text>
              </View>
            ) : null}
            {trip.duration ? (
              <View style={[styles.metaItem, trip.destination ? styles.metaBorder : null, { borderColor: colors.border }]}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={[styles.metaValue, { color: colors.foreground }]}>
                  {typeof trip.duration === 'number' ? `${trip.duration}d` : trip.duration}
                </Text>
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Duration</Text>
              </View>
            ) : null}
            {spotsLeft !== null ? (
              <View style={[styles.metaItem, styles.metaBorder, { borderColor: colors.border }]}>
                <Ionicons name="people-outline" size={18} color={isFull ? '#ef4444' : colors.primary} />
                <Text style={[styles.metaValue, { color: isFull ? '#ef4444' : colors.foreground }]}>
                  {isFull ? 'Full' : spotsLeft}
                </Text>
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>
                  {isFull ? 'No spots' : 'Spots left'}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Dates */}
          {(trip.startDate ?? trip.endDate) ? (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {[trip.startDate, trip.endDate].filter(Boolean).join(' → ')}
              </Text>
            </View>
          ) : null}

          {/* Description */}
          {trip.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About this trip</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>
                {trip.description}
              </Text>
            </View>
          ) : null}

          {isGm ? (
            <View style={[styles.section, { backgroundColor: colors.muted, padding: 14, borderRadius: 14 }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Applications (GET /api/trips/id/applications)
              </Text>
              {applicationsLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
              ) : applications.length === 0 ? (
                <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>No applications yet.</Text>
              ) : (
                applications.map((app, idx) => {
                  const u = app.user;
                  const label =
                    typeof u === 'object' && u && 'username' in u
                      ? String((u as { username?: string }).username ?? '?')
                      : typeof u === 'string'
                        ? u
                        : 'Applicant';
                  return (
                    <Text key={app._id ?? idx} style={{ color: colors.foreground, marginTop: 6, fontSize: 14 }}>
                      • {label}
                      {app.status ? ` — ${app.status}` : ''}
                    </Text>
                  );
                })
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Apply button */}
      <View style={[styles.applyBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.applyBtn,
            isFull
              ? { backgroundColor: colors.muted }
              : { backgroundColor: colors.primary },
          ]}
          onPress={handleApply}
          disabled={isFull || applying}
        >
          <Text style={[styles.applyBtnText, { color: isFull ? colors.mutedForeground : '#fff' }]}>
            {applying ? 'Applying…' : isFull ? 'Trip Full' : 'Apply for This Trip'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  cover: { position: 'relative', height: 280 },
  coverImage: { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  backBtn: {
    position: 'absolute', top: 48, left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  priceBadge: {
    position: 'absolute', bottom: 16, right: 16,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12,
  },
  priceBadgeText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  body: { padding: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 30 },
  metaGrid: {
    flexDirection: 'row', borderRadius: 14,
    padding: 16, justifyContent: 'space-around',
  },
  metaItem: { alignItems: 'center', gap: 4, flex: 1 },
  metaBorder: { borderLeftWidth: 1 },
  metaValue: { fontSize: 14, fontWeight: '700' },
  metaLabel: { fontSize: 11 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 14 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 22 },
  applyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, borderTopWidth: 1,
  },
  applyBtn: {
    height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { fontSize: 15, fontWeight: '700' },
});

export default TripDetailScreen;
