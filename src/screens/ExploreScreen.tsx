import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, TextInput, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { placesService, Place } from '../services/placesService';
import { realEstateService, RealEstate } from '../services/realEstateService';
import { servicesService, Service } from '../services/servicesService';
import { tripsService, Trip } from '../services/tripsService';
import { placeTypesService, PlaceType } from '../services/placeTypesService';
import { serviceTypesService, ServiceType } from '../services/serviceTypesService';

type ExploreTab = 'places' | 'realEstate' | 'services' | 'trips';

interface ExploreScreenProps {
  onPlacePress: (id: string) => void;
  onRealEstatePress: (id: string) => void;
  onServicePress: (id: string) => void;
  onTripPress: (id: string) => void;
}

const getTitle = (item: any): string =>
  (item.name ?? item.title ?? (item.content ?? '').split('\n')[0].trim()) || 'Item';

const getImage = (item: any): string | null =>
  item.displayUrl ?? item.pictures?.[0] ?? null;

const TABS: { key: ExploreTab; label: string; icon: string }[] = [
  { key: 'places',     label: 'Places',      icon: 'location-outline' },
  { key: 'realEstate', label: 'Real Estate', icon: 'home-outline' },
  { key: 'services',   label: 'Services',    icon: 'briefcase-outline' },
  { key: 'trips',      label: 'Trips',       icon: 'airplane-outline' },
];

const TAB_COLORS: Record<ExploreTab, string> = {
  places:     '#f97316',
  realEstate: '#10b981',
  services:   '#8b5cf6',
  trips:      '#0ea5e9',
};

const ExploreScreen = ({ onPlacePress, onRealEstatePress, onServicePress, onTripPress }: ExploreScreenProps) => {
  const { colors } = useTheme();
  const [tab, setTab] = useState<ExploreTab>('places');
  const [search, setSearch] = useState('');

  const [places,      setPlaces]      = useState<Place[]>([]);
  const [realEstate,  setRealEstate]  = useState<RealEstate[]>([]);
  const [services,    setServices]    = useState<Service[]>([]);
  const [trips,       setTrips]       = useState<Trip[]>([]);

  const [placeTypes,   setPlaceTypes]   = useState<PlaceType[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);

  const [loading, setLoading] = useState<Record<ExploreTab, boolean>>({
    places: true, realEstate: false, services: false, trips: false,
  });
  const [errors, setErrors] = useState<Record<ExploreTab, string | null>>({
    places: null, realEstate: null, services: null, trips: null,
  });

  // Hangi sekmelerin daha önce yüklendiğini takip eden cache seti
  const [loaded, setLoaded] = useState<Set<ExploreTab>>(new Set());

  useEffect(() => {
    // Daha önce yüklendiyse tekrar fetch etme (cache hit)
    if (loaded.has(tab)) return;

    const loadTab = async <T,>(
      key: ExploreTab,
      fetcher: () => Promise<T[]>,
      setter: (v: T[]) => void,
    ) => {
      setLoading((prev) => ({ ...prev, [key]: true }));
      try {
        const data = await fetcher();
        setter(data);
        setLoaded((prev) => new Set(prev).add(key));
      } catch (e: any) {
        setErrors((prev) => ({ ...prev, [key]: e.message ?? 'Failed to load.' }));
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }));
      }
    };

    // Sadece aktif sekmeyi yükle
    switch (tab) {
      case 'places':
        loadTab('places', placesService.getAll.bind(placesService), setPlaces);
        // Filtre tipleri places ile birlikte yüklenir
        placeTypesService.getAll().then(setPlaceTypes).catch(() => {});
        break;
      case 'realEstate':
        loadTab('realEstate', realEstateService.getAll.bind(realEstateService), setRealEstate);
        break;
      case 'services':
        loadTab('services', servicesService.getAll.bind(servicesService), setServices);
        serviceTypesService.getAll().then(setServiceTypes).catch(() => {});
        break;
      case 'trips':
        loadTab('trips', tripsService.getAll.bind(tripsService), setTrips);
        break;
    }
  }, [tab]);  // tab değiştiğinde tetiklenir

  const dataMap: Record<ExploreTab, any[]> = {
    places: places, realEstate: realEstate, services: services, trips: trips,
  };

  const filtered = dataMap[tab].filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      getTitle(item).toLowerCase().includes(q) ||
      (item.address ?? item.location ?? item.destination ?? '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTypeFilter) {
      if (tab === 'places') {
        const typeId = typeof item.placeType === 'object' ? item.placeType?._id : item.placeType;
        if (typeId !== activeTypeFilter) return false;
      }
      if (tab === 'services') {
        const typeId = typeof item.serviceType === 'object' ? item.serviceType?._id : item.serviceType;
        if (typeId !== activeTypeFilter) return false;
      }
    }

    return true;
  });

  // Aktif tab için gösterilecek filtre tipleri
  const activeTypes = tab === 'places' ? placeTypes : tab === 'services' ? serviceTypes : [];

  const onPressMap: Record<ExploreTab, (id: string) => void> = {
    places: onPlacePress,
    realEstate: onRealEstatePress,
    services: onServicePress,
    trips: onTripPress,
  };

  const accentColor = TAB_COLORS[tab];

  const renderCard = ({ item }: { item: any }) => {
    const title = getTitle(item);
    const image = getImage(item);
    const subtitle = item.address ?? item.location ?? item.destination ?? item.description ?? null;
    const badge = (() => {
      if (tab === 'places') return typeof item.placeType === 'object' ? item.placeType?.name : item.placeType;
      if (tab === 'realEstate') return typeof item.realEstateType === 'object' ? item.realEstateType?.name : item.type;
      if (tab === 'services') return typeof item.serviceType === 'object' ? item.serviceType?.name : item.serviceType;
      if (tab === 'trips') return item.destination ?? null;
      return null;
    })();
    const price = item.price ?? item.priceLabel ?? null;
    const spotsLeft = item.capacity != null && item.currentApplicants != null
      ? item.capacity - item.currentApplicants : null;

    return (
      <TouchableOpacity
        onPress={() => onPressMap[tab](item._id)}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.85}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons
              name={TABS.find(t => t.key === tab)?.icon as any ?? 'grid-outline'}
              size={36}
              color={colors.mutedForeground}
            />
          </View>
        )}

        {badge ? (
          <View style={[styles.badge, { backgroundColor: accentColor }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}

        {price ? (
          <View style={[styles.priceBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.priceBadgeText}>
              {typeof price === 'number' ? `€${price}` : price}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>
            {title}
          </Text>

          {subtitle ? (
            <View style={styles.metaRow}>
              <Ionicons
                name={tab === 'trips' ? 'location-outline' : 'location-outline'}
                size={12}
                color={accentColor}
              />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
          ) : null}

          {/* Trip extras */}
          {tab === 'trips' && (
            <View style={styles.metaRow}>
              {item.duration ? (
                <View style={styles.chip}>
                  <Ionicons name="time-outline" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.chipText, { color: colors.mutedForeground }]}>
                    {typeof item.duration === 'number' ? `${item.duration}d` : item.duration}
                  </Text>
                </View>
              ) : null}
              {spotsLeft !== null ? (
                <View style={styles.chip}>
                  <Ionicons name="people-outline" size={11} color={spotsLeft <= 0 ? '#ef4444' : colors.mutedForeground} />
                  <Text style={[styles.chipText, { color: spotsLeft <= 0 ? '#ef4444' : colors.mutedForeground }]}>
                    {spotsLeft <= 0 ? 'Full' : `${spotsLeft} spots`}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Real estate extras */}
          {tab === 'realEstate' && (item.rooms || item.bathrooms || item.area) ? (
            <View style={styles.metaRow}>
              {item.rooms ?     <View style={styles.chip}><Ionicons name="bed-outline"    size={11} color={colors.mutedForeground} /><Text style={[styles.chipText, { color: colors.mutedForeground }]}>{item.rooms}</Text></View>    : null}
              {item.bathrooms ? <View style={styles.chip}><Ionicons name="water-outline"  size={11} color={colors.mutedForeground} /><Text style={[styles.chipText, { color: colors.mutedForeground }]}>{item.bathrooms}</Text></View> : null}
              {item.area ?      <View style={styles.chip}><Ionicons name="square-outline" size={11} color={colors.mutedForeground} /><Text style={[styles.chipText, { color: colors.mutedForeground }]}>{item.area}m²</Text></View>   : null}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            placeholder={`Search ${TABS.find(t => t.key === tab)?.label.toLowerCase()}…`}
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = tab === t.key;
          const color = TAB_COLORS[t.key];
          return (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.tabBtn,
                active && { backgroundColor: color + '15', borderColor: color, borderWidth: 1.5 },
                !active && { borderColor: colors.border, borderWidth: 1 },
                { backgroundColor: active ? color + '15' : colors.card },
              ]}
              onPress={() => { setTab(t.key); setSearch(''); setActiveTypeFilter(null); }}
            >
              <Ionicons name={t.icon as any} size={14} color={active ? color : colors.mutedForeground} />
              <Text style={[styles.tabText, { color: active ? color : colors.mutedForeground }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Count */}
      {!loading[tab] && !errors[tab] && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            <Text style={{ fontWeight: '700', color: colors.foreground }}>{filtered.length}</Text>
            {' '}{TABS.find(t => t.key === tab)?.label.toLowerCase()} found
          </Text>
        </View>
      )}

      {/* Type filter chips — only for places and services */}
      {activeTypes.length > 0 && !loading[tab] && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              !activeTypeFilter
                ? { backgroundColor: accentColor, borderColor: accentColor }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => setActiveTypeFilter(null)}
          >
            <Text style={[styles.filterChipText, { color: !activeTypeFilter ? '#fff' : colors.mutedForeground }]}>
              All
            </Text>
          </TouchableOpacity>
          {activeTypes.map((type) => {
            const active = activeTypeFilter === type._id;
            return (
              <TouchableOpacity
                key={type._id}
                style={[
                  styles.filterChip,
                  active
                    ? { backgroundColor: accentColor, borderColor: accentColor }
                    : { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setActiveTypeFilter(active ? null : type._id)}
              >
                <Text style={[styles.filterChipText, { color: active ? '#fff' : colors.mutedForeground }]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* List */}
      {loading[tab] ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : errors[tab] ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontSize: 14, textAlign: 'center' }}>
            {errors[tab]}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name={TABS.find(t => t.key === tab)?.icon as any} size={40} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
                No {TABS.find(t => t.key === tab)?.label.toLowerCase()} found.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
  },
  searchInput: { flex: 1, fontSize: 14 },
  tabBar: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingBottom: 10,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, borderRadius: 10,
  },
  tabText: { fontSize: 11, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },
  card: {
    borderRadius: 16, overflow: 'hidden', borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  cardImage: { width: '100%', height: 180 },
  badge: {
    position: 'absolute', top: 10, left: 10,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  priceBadge: {
    position: 'absolute', top: 10, right: 10,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  priceBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  cardBody: { padding: 14, gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  metaText: { fontSize: 12, flex: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 3, marginRight: 8 },
  chipText: { fontSize: 11 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 60 },
  filterChips: { paddingHorizontal: 16, paddingBottom: 10, gap: 8, flexDirection: 'row', alignItems: 'center' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  filterChipText: { fontSize: 12, fontWeight: '700' },
});

export default ExploreScreen;
