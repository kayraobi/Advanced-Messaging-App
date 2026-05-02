import React, { useEffect, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { placesService, Place } from '../services/placesService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PlaceDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RootStackScreenProps<'PlaceDetail'>['route']>();
  const { placeId } = route.params;
  const { colors } = useTheme();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const previewRef = useRef<FlatList>(null);

  useEffect(() => {
    placesService.getById(placeId)
      .then(setPlace)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [placeId]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="location-outline" size={48} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground }}>Place not found.</Text>
      </View>
    );
  }

  const title = place.name ?? place.title ?? (place.content ?? '').split('\n')[0].trim() ?? 'Place';
  const description = place.description ?? place.content ?? '';
  const coverImage = place.displayUrl ?? place.pictures?.[0] ?? null;
  const gallery: string[] = place.pictures ?? (coverImage ? [coverImage] : []);
  const typeLabel = typeof place.placeType === 'object' ? place.placeType?.name : place.placeType;
  const tags: string[] = (place.tags ?? []).map((t: any) =>
    typeof t === 'object' ? t.name : t
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Cover */}
        <View style={styles.cover}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="location-outline" size={60} color={colors.mutedForeground} />
            </View>
          )}
          <View style={styles.coverOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>

          {/* Type badge */}
          {typeLabel ? (
            <View style={[styles.badge, { backgroundColor: colors.primary + '1A' }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>{typeLabel}</Text>
            </View>
          ) : null}

          {/* Title */}
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>

          {/* Address */}
          {(place.address ?? place.location) ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {place.address ?? place.location}
              </Text>
            </View>
          ) : null}

          {/* Tags */}
          {tags.length > 0 ? (
            <View style={styles.tags}>
              {tags.map((tag, i) => (
                <View key={i} style={[styles.tag, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.tagText, { color: colors.foreground }]}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Description */}
          {description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>
                {description}
              </Text>
            </View>
          ) : null}

          {/* Gallery header */}
          {gallery.length > 1 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Photos</Text>
            </View>
          ) : null}
        </View>

        {/* Gallery carousel */}
        {gallery.length > 1 ? (
          <FlatList
            data={gallery}
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
                  source={{ uri: item }}
                  style={[styles.galleryImage, { backgroundColor: colors.muted }]}
                />
              </TouchableOpacity>
            )}
          />
        ) : null}
      </ScrollView>

      {/* Full-screen image preview */}
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
            data={gallery}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={previewIndex ?? 0}
            getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
            renderItem={({ item }) => (
              <View style={styles.previewSlide}>
                <Image source={{ uri: item }} style={styles.previewImage} resizeMode="contain" />
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  cover: { position: 'relative', height: 280 },
  coverImage: { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
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
  body: { padding: 20, gap: 14 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 30 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 14, flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  tagText: { fontSize: 12, fontWeight: '600' },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 22 },
  galleryImage: { width: SCREEN_WIDTH - 80, height: 220, borderRadius: 14 },
  previewBg: { flex: 1, backgroundColor: '#000' },
  previewClose: { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 4 },
  previewSlide: { width: SCREEN_WIDTH, flex: 1, justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: SCREEN_WIDTH, height: '100%' },
});

export default PlaceDetailScreen;
