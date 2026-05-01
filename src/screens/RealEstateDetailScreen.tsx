import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { realEstateService, RealEstate } from '../services/realEstateService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RealEstateDetailScreenProps {
  listingId: string;
  onBack: () => void;
}

const RealEstateDetailScreen = ({ listingId, onBack }: RealEstateDetailScreenProps) => {
  const { colors } = useTheme();
  const [listing, setListing] = useState<RealEstate | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const previewRef = useRef<FlatList>(null);

  useEffect(() => {
    realEstateService.getById(listingId)
      .then(setListing)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [listingId]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="home-outline" size={48} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground }}>Listing not found.</Text>
      </View>
    );
  }

  const title = listing.title ?? listing.name ?? (listing.content ?? '').split('\n')[0].trim() ?? 'Listing';
  const description = listing.description ?? listing.content ?? '';
  const coverImage = listing.displayUrl ?? listing.pictures?.[0] ?? null;
  const gallery: string[] = listing.pictures ?? (coverImage ? [coverImage] : []);
  const typeLabel = typeof listing.realEstateType === 'object'
    ? listing.realEstateType?.name
    : listing.type ?? listing.realEstateType;
  const price = listing.price ?? listing.priceLabel ?? null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Cover */}
        <View style={styles.cover}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="home-outline" size={60} color={colors.mutedForeground} />
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

          {/* Type badge */}
          {typeLabel ? (
            <View style={[styles.badge, { backgroundColor: '#10b981' + '1A' }]}>
              <Text style={[styles.badgeText, { color: '#10b981' }]}>{typeLabel}</Text>
            </View>
          ) : null}

          {/* Title */}
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>

          {/* Address */}
          {(listing.address ?? listing.location) ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {listing.address ?? listing.location}
              </Text>
            </View>
          ) : null}

          {/* Specs */}
          {(listing.rooms || listing.bathrooms || listing.area) ? (
            <View style={[styles.specsRow, { backgroundColor: colors.muted }]}>
              {listing.rooms ? (
                <View style={styles.specItem}>
                  <Ionicons name="bed-outline" size={20} color={colors.primary} />
                  <Text style={[styles.specValue, { color: colors.foreground }]}>{listing.rooms}</Text>
                  <Text style={[styles.specLabel, { color: colors.mutedForeground }]}>Rooms</Text>
                </View>
              ) : null}
              {listing.bathrooms ? (
                <View style={[styles.specItem, (listing.rooms && listing.area) ? styles.specBorder : null, { borderColor: colors.border }]}>
                  <Ionicons name="water-outline" size={20} color={colors.primary} />
                  <Text style={[styles.specValue, { color: colors.foreground }]}>{listing.bathrooms}</Text>
                  <Text style={[styles.specLabel, { color: colors.mutedForeground }]}>Bathrooms</Text>
                </View>
              ) : null}
              {listing.area ? (
                <View style={[styles.specItem, listing.rooms ? styles.specBorder : null, { borderColor: colors.border }]}>
                  <Ionicons name="square-outline" size={20} color={colors.primary} />
                  <Text style={[styles.specValue, { color: colors.foreground }]}>{listing.area} m²</Text>
                  <Text style={[styles.specLabel, { color: colors.mutedForeground }]}>Area</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Description */}
          {description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>
                {description}
              </Text>
            </View>
          ) : null}

          {gallery.length > 1 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Photos</Text>
            </View>
          ) : null}
        </View>

        {/* Gallery */}
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

      {/* Full-screen preview */}
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
  priceBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  priceBadgeText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  body: { padding: 20, gap: 14 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 30 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 14, flex: 1 },
  specsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 16,
    justifyContent: 'space-around',
  },
  specItem: { alignItems: 'center', gap: 4, flex: 1 },
  specBorder: { borderLeftWidth: 1 },
  specValue: { fontSize: 15, fontWeight: '700' },
  specLabel: { fontSize: 11 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 22 },
  galleryImage: { width: SCREEN_WIDTH - 80, height: 220, borderRadius: 14 },
  previewBg: { flex: 1, backgroundColor: '#000' },
  previewClose: { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 4 },
  previewSlide: { width: SCREEN_WIDTH, flex: 1, justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: SCREEN_WIDTH, height: '100%' },
});

export default RealEstateDetailScreen;
