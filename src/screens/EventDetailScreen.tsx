import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { eventService } from '../services/eventService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EventDetailScreenProps {
  eventId: string;
  onBack: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const EventDetailScreen = ({ eventId, onBack }: EventDetailScreenProps) => {
  const { colors } = useTheme();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const previewRef = useRef<FlatList>(null);

  useEffect(() => {
    eventService.getById(eventId)
      .then(setEvent)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Event not found.</Text>
      </View>
    );
  }

  const lines = (event.content ?? '').split('\n').filter((l: string) => l.trim());
  const title = lines[0] ?? 'Event';
  const description = lines.slice(1).join('\n').trim();
  const images = (event.childPosts ?? []).filter((p: any) => p.displayUrl);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Cover Image */}
        <View style={styles.cover}>
          {event.displayUrl ? (
            <Image source={{ uri: event.displayUrl }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="calendar-outline" size={56} color={colors.mutedForeground} />
            </View>
          )}
          <View style={styles.coverGradient} />
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>

          {/* Title */}
          <Text style={[styles.eventTitle, { color: colors.foreground }]}>{title}</Text>

          {/* Date */}
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{event.date}</Text>
          </View>

          {/* Instagram link */}
          {event.url ? (
            <TouchableOpacity
              style={[styles.linkBtn, { borderColor: colors.primary + '40' }]}
              onPress={() => Linking.openURL(event.url)}
            >
              <Ionicons name="logo-instagram" size={16} color={colors.primary} />
              <Text style={[styles.linkBtnText, { color: colors.primary }]}>View on Instagram</Text>
            </TouchableOpacity>
          ) : null}

          {/* Description */}
          {description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
            </View>
          ) : null}

          {/* Media Gallery */}
          {images.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Photos & Videos</Text>
            </View>
          ) : null}
        </View>

        {/* Horizontal carousel — outside body padding */}
        {images.length > 0 ? (
          <FlatList
            data={images}
            keyExtractor={(_, i) => String(i)}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH - 80 + 12}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity activeOpacity={0.9} onPress={() => setPreviewIndex(index)}>
                <Image
                  source={{ uri: item.displayUrl }}
                  style={[styles.carouselImage, { backgroundColor: colors.muted }]}
                />
              </TouchableOpacity>
            )}
          />
        ) : null}

        {/* Full-screen preview modal */}
        <Modal
          visible={previewIndex !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewIndex(null)}
          statusBarTranslucent
        >
          <StatusBar hidden />
          <View style={styles.previewBg}>
            <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewIndex(null)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <FlatList
              ref={previewRef}
              data={images}
              keyExtractor={(_, i) => String(i)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={previewIndex ?? 0}
              getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
              onLayout={() => {
                if (previewIndex !== null && previewIndex > 0) {
                  previewRef.current?.scrollToIndex({ index: previewIndex, animated: false });
                }
              }}
              renderItem={({ item }) => (
                <View style={styles.previewSlide}>
                  <Image
                    source={{ uri: item.displayUrl }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            />
          </View>
        </Modal>

        <View style={{ height: 40 }} />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cover: { position: 'relative', height: 260 },
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
  eventTitle: { fontSize: 20, fontWeight: '800', lineHeight: 28 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 14 },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  linkBtnText: { fontSize: 13, fontWeight: '600' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 22 },
  carouselImage: { width: SCREEN_WIDTH - 80, height: 220, borderRadius: 14 },
  previewBg: { flex: 1, backgroundColor: '#000' },
  previewClose: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    padding: 4,
  },
  previewSlide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: { width: SCREEN_WIDTH, height: '100%' },
});

export default EventDetailScreen;
