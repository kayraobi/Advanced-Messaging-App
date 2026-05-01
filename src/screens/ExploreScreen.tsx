import React, { useState, useEffect, useRef } from 'react';
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
  onSubmitPlace?: () => void;
  onSubmitRealEstate?: () => void;
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

const ExploreScreen = ({
  onPlacePress,
  onRealEstatePress,
  onServicePress,
  onTripPress,
  onSubmitPlace,
  onSubmitRealEstate,
}: ExploreScreenProps) => {
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

  const [reMode, setReMode] = useState<'all' | 'featured'>('all');
  const [reTypeSlug, setReTypeSlug] = useState<string | null>(null);
  const [reTypes, setReTypes] = useState<string[]>([]);

  const [loading, setLoading] = useState<Record<ExploreTab, boolean>>({
    places: true, realEstate: false, services: false, trips: false,
  });
  const [errors, setErrors] = useState<Record<ExploreTab, string | null>>({
    places: null, realEstate: null, services: null, trips: null,
  });

  // Hangi sekmelerin daha önce yüklendiğini takip eden cache seti
  const [loaded, setLoaded] = useState<Set<ExploreTab>>(new Set());
  /** Places "All" chip / tip filtresinden önceki tam liste ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Place%20Types/get_api_placeTypes__id_) ile chip seçiminde yenilenir) */
  const placesBaselineRef = useRef<Place[]>([]);
  const servicesBaselineRef = useRef<Service[]>([]);

  useEffect(() => {
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

    switch (tab) {
      case 'places':
        setLoading((prev) => ({ ...prev, places: true }));
        (async () => {
          try {
            let flat: Place[] = [];
            let chips: PlaceType[] = [];
            try {
              const grouped = await placeTypesService.getWithPlaces();
              chips = grouped.map((g) => ({
                _id: g._id,
                name: g.name ?? '',
                icon: g.icon,
              }));
              flat = grouped.flatMap((g) =>
                (Array.isArray(g.places) ? g.places : []).map((p) => ({
                  ...p,
                  placeType: { _id: g._id, name: g.name ?? '' },
                })),
              );
            } catch {
              chips = await placeTypesService.getAll().catch(() => []);
            }
            if (flat.length === 0) {
              flat = await placesService.getAll();
              if (chips.length === 0) {
                chips = await placeTypesService.getAll().catch(() => []);
              }
            }
            setPlaceTypes(chips);
            placesBaselineRef.current = flat;
            setPlaces(flat);
            setLoaded((prev) => new Set(prev).add('places'));
            setErrors((prev) => ({ ...prev, places: null }));
          } catch (e: any) {
            setErrors((prev) => ({ ...prev, places: e.message ?? 'Failed to load.' }));
          } finally {
            setLoading((prev) => ({ ...prev, places: false }));
          }
        })();
        break;
      case 'services':
        setLoading((prev) => ({ ...prev, services: true }));
        (async () => {
          try {
            let flat: Service[] = [];
            let chips: ServiceType[] = [];
            try {
              const grouped = await serviceTypesService.getWithServices();
              chips = grouped.map((g) => ({
                _id: g._id,
                name: g.name ?? '',
                icon: g.icon,
              }));
              flat = grouped.flatMap((g) =>
                (Array.isArray(g.services) ? g.services : []).map((s) => ({
                  ...s,
                  serviceType: { _id: g._id, name: g.name ?? '' },
                })),
              );
            } catch {
              chips = await serviceTypesService.getAll().catch(() => []);
            }
            if (flat.length === 0) {
              flat = await servicesService.getAll();
              if (chips.length === 0) {
                chips = await serviceTypesService.getAll().catch(() => []);
              }
            }
            setServiceTypes(chips);
            servicesBaselineRef.current = flat;
            setServices(flat);
            setLoaded((prev) => new Set(prev).add('services'));
            setErrors((prev) => ({ ...prev, services: null }));
          } catch (e: any) {
            setErrors((prev) => ({ ...prev, services: e.message ?? 'Failed to load.' }));
          } finally {
            setLoading((prev) => ({ ...prev, services: false }));
          }
        })();
        break;
      case 'trips':
        loadTab('trips', tripsService.getAll.bind(tripsService), setTrips);
        break;
      default:
        break;
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== 'realEstate') return;
    let cancelled = false;
    (async () => {
      setLoading((prev) => ({ ...prev, realEstate: true }));
      setErrors((prev) => ({ ...prev, realEstate: null }));
      try {
        let data: RealEstate[];
        if (reMode === 'featured') {
          data = await realEstateService.getFeatured();
          if (!cancelled) setReTypes([]);
        } else if (reTypeSlug) {
          data = await realEstateService.getByType(reTypeSlug);
        } else {
          data = await realEstateService.getAll();
          if (!cancelled) {
            const u = new Set<string>();
            data.forEach((item) => {
              const t =
                typeof item.realEstateType === 'string'
                  ? item.realEstateType
                  : item.realEstateType?.name ?? item.type;
              if (t && typeof t === 'string') u.add(t);
            });
            setReTypes([...u].sort());
          }
        }
        if (!cancelled) setRealEstate(data);
      } catch (e: any) {
        if (!cancelled) {
          setErrors((prev) => ({
            ...prev,
            realEstate: e.message ?? 'Failed to load.',
          }));
        }
      } finally {
        if (!cancelled) setLoading((prev) => ({ ...prev, realEstate: false }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, reMode, reTypeSlug]);

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
      if (tab === 'realEstate') {
        return typeof item.realEstateType === 'object'
          ? item.realEstateType?.name
          : item.realEstateType ?? item.type;
      }
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
              onPress={() => {
                if (tab === 'places' && t.key !== 'places') {
                  setPlaces(placesBaselineRef.current);
                }
                if (tab === 'services' && t.key !== 'services') {
                  setServices(servicesBaselineRef.current);
                }
                setTab(t.key);
                setSearch('');
                setActiveTypeFilter(null);
                setReMode('all');
                setReTypeSlug(null);
              }}
            >
              <Ionicons name={t.icon as any} size={14} color={active ? color : colors.mutedForeground} />
              <Text style={[styles.tabText, { color: active ? color : colors.mutedForeground }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {(tab === 'places' && onSubmitPlace) || (tab === 'realEstate' && onSubmitRealEstate) ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, paddingBottom: 8 }}>
          {tab === 'places' && onSubmitPlace ? (
            <TouchableOpacity
              onPress={onSubmitPlace}
              style={[styles.quickLink, { borderColor: TAB_COLORS.places, backgroundColor: TAB_COLORS.places + '12' }]}
            >
              <Ionicons name="add-circle-outline" size={18} color={TAB_COLORS.places} />
              <Text style={[styles.quickLinkText, { color: TAB_COLORS.places }]}>Suggest a place</Text>
            </TouchableOpacity>
          ) : null}
          {tab === 'realEstate' && onSubmitRealEstate ? (
            <TouchableOpacity
              onPress={onSubmitRealEstate}
              style={[styles.quickLink, { borderColor: TAB_COLORS.realEstate, backgroundColor: TAB_COLORS.realEstate + '12' }]}
            >
              <Ionicons name="home-outline" size={18} color={TAB_COLORS.realEstate} />
              <Text style={[styles.quickLinkText, { color: TAB_COLORS.realEstate }]}>Post a listing</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {/* Count */}
      {!loading[tab] && !errors[tab] && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            <Text style={{ fontWeight: '700', color: colors.foreground }}>{filtered.length}</Text>
            {' '}{TABS.find(t => t.key === tab)?.label.toLowerCase()} found
          </Text>
        </View>
      )}

      {/* Real estate: all vs featured + by-type ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Real%20Estate/get_api_realEstate_by_type__type_)) */}
      {tab === 'realEstate' && !loading[tab] && !errors[tab] && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              reMode === 'all' && !reTypeSlug
                ? { backgroundColor: accentColor, borderColor: accentColor }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => {
              setReMode('all');
              setReTypeSlug(null);
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: reMode === 'all' && !reTypeSlug ? '#fff' : colors.mutedForeground },
              ]}
            >
              All listings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              reMode === 'featured'
                ? { backgroundColor: accentColor, borderColor: accentColor }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => {
              setReMode('featured');
              setReTypeSlug(null);
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: reMode === 'featured' ? '#fff' : colors.mutedForeground },
              ]}
            >
              Featured
            </Text>
          </TouchableOpacity>
          {reMode === 'all' &&
            reTypes.map((slug) => {
              const active = reTypeSlug === slug;
              return (
                <TouchableOpacity
                  key={slug}
                  style={[
                    styles.filterChip,
                    active
                      ? { backgroundColor: accentColor, borderColor: accentColor }
                      : { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => setReTypeSlug(active ? null : slug)}
                >
                  <Text
                    style={[styles.filterChipText, { color: active ? '#fff' : colors.mutedForeground }]}
                  >
                    {slug}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      )}

      {/* Type filter chips — only for places and services */}
      {activeTypes.length > 0 && !loading[tab] && tab !== 'realEstate' && (
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
            onPress={() => {
              setActiveTypeFilter(null);
              if (tab === 'places') {
                setPlaces(placesBaselineRef.current);
              }
              if (tab === 'services') {
                setServices(servicesBaselineRef.current);
              }
            }}
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
                onPress={() => {
                  if (tab === 'services') {
                    const nextId = active ? null : type._id;
                    setActiveTypeFilter(nextId);
                    if (!nextId) {
                      setServices(servicesBaselineRef.current);
                      return;
                    }
                    setLoading((prev) => ({ ...prev, services: true }));
                    void (async () => {
                      try {
                        const st = await serviceTypesService.getById(nextId);
                        const flat = (Array.isArray(st.services) ? st.services : []).map((s) => ({
                          ...s,
                          serviceType: { _id: st._id, name: st.name ?? '' },
                        }));
                        setServices(flat);
                      } catch {
                        setServices(servicesBaselineRef.current);
                        setActiveTypeFilter(nextId);
                      } finally {
                        setLoading((prev) => ({ ...prev, services: false }));
                      }
                    })();
                    return;
                  }
                  if (tab !== 'places') return;
                  const nextId = active ? null : type._id;
                  setActiveTypeFilter(nextId);
                  if (!nextId) {
                    setPlaces(placesBaselineRef.current);
                    return;
                  }
                  setLoading((prev) => ({ ...prev, places: true }));
                  void (async () => {
                    try {
                      const pt = await placeTypesService.getById(nextId);
                      const flat = (Array.isArray(pt.places) ? pt.places : []).map((p) => ({
                        ...p,
                        placeType: { _id: pt._id, name: pt.name ?? '' },
                      }));
                      setPlaces(flat);
                    } catch {
                      setPlaces(placesBaselineRef.current);
                      setActiveTypeFilter(nextId);
                    } finally {
                      setLoading((prev) => ({ ...prev, places: false }));
                    }
                  })();
                }}
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
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  quickLinkText: { fontSize: 13, fontWeight: '700' },
});

export default ExploreScreen;
