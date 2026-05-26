import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { placesService } from '../services/placesService';
import { realEstateService } from '../services/realEstateService';
import { geocodeAddressCached } from '../services/geocodeService';
import { buildPinFromItem, type MapPin } from '../utils/mapPins';
import {
  buildGeocodeQuery,
  extractAddressFromItem,
  parseItemCoordinates,
} from '../utils/mapCoordinates';

/** Nominatim rate limit ~1/s; cap background jobs for large lists */
const MAX_BACKGROUND_GEOCODE = 24;

function buildLeafletHTML(pins: MapPin[], accentColor: string): string {
  const pinsJson = JSON.stringify(pins);
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #map { width: 100%; height: 100%; }
  .custom-popup .leaflet-popup-content-wrapper {
    border-radius: 14px; padding: 0; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.18);
    border: none;
  }
  .custom-popup .leaflet-popup-content-wrapper { border-radius: 14px; }
  .custom-popup .leaflet-popup-tip { background: #fff; }
  .popup-img { width: 100%; height: 110px; object-fit: cover; background: #eee; }
  .popup-img-placeholder {
    width: 100%; height: 110px; background: #f5f5f5;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
  }
  .popup-body { padding: 10px 12px 12px; }
  .popup-badge {
    display: inline-block; border-radius: 6px;
    padding: 2px 8px; font-size: 10px; font-weight: 700;
    color: #fff; margin-bottom: 4px;
    background: ${accentColor};
  }
  .popup-title { font-size: 13px; font-weight: 700; color: #111; margin-bottom: 2px; }
  .popup-addr { font-size: 11px; color: #888; margin-bottom: 6px; }
  .popup-approx { font-size: 10px; color: #b45309; margin-bottom: 6px; font-weight: 600; }
  .popup-btn {
    width: 100%; padding: 7px; border: none; border-radius: 8px;
    background: ${accentColor}; color: #fff; font-size: 12px;
    font-weight: 700; cursor: pointer;
  }
  .dot-marker {
    width: 28px; height: 28px; border-radius: 50%;
    background: ${accentColor}; border: 3px solid #fff;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    font-size: 13px;
  }
  .dot-marker.approx { border-color: #fbbf24; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  const map = L.map('map', { zoomControl: true }).setView([43.8476, 18.3564], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(map);

  const pins = ${pinsJson};

  if (pins.length > 0) {
    const bounds = [];
    pins.forEach(pin => {
      const icon = L.divIcon({
        className: '',
        html: '<div class="dot-marker' + (pin.approximate ? ' approx' : '') + '">' + (pin.badge ? pin.badge.charAt(0) : '📍') + '</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      const imgHtml = pin.image
        ? '<img class="popup-img" src="' + pin.image + '" onerror="this.parentNode.innerHTML=\\'<div class=popup-img-placeholder>📍</div>\\'" />'
        : '<div class="popup-img-placeholder">📍</div>';

      const badgeHtml = pin.badge
        ? '<span class="popup-badge">' + pin.badge + '</span><br/>'
        : '';

      const approxHtml = pin.approximate
        ? '<div class="popup-approx">~ approximate location</div>'
        : '';

      const popupContent =
        '<div>' + imgHtml +
        '<div class="popup-body">' + badgeHtml +
        '<div class="popup-title">' + pin.title + '</div>' +
        '<div class="popup-addr">' + pin.address + '</div>' +
        approxHtml +
        '<button class="popup-btn" onclick="window.ReactNativeWebView.postMessage(\\'' + pin.itemId + '\\')">View Details →</button>' +
        '</div></div>';

      L.marker([pin.lat, pin.lng], { icon })
        .bindPopup(popupContent, { className: 'custom-popup', maxWidth: 220, minWidth: 220 })
        .addTo(map);

      bounds.push([pin.lat, pin.lng]);
    });

    try { map.fitBounds(bounds, { padding: [60, 40] }); } catch(e) {}
  }
</script>
</body>
</html>`;
}

function MapWebUnsupported({ onBack, insetsTop }: { onBack: () => void; insetsTop: number }) {
  return (
    <View style={styles.unsupportedRoot}>
      <View style={[styles.header, { paddingTop: insetsTop + 8 }]}>
        <TouchableOpacity style={styles.circleBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>
        <View style={styles.titlePill}>
          <Text style={styles.titleText}>Map</Text>
        </View>
      </View>
      <View style={styles.unsupportedBody}>
        <Ionicons name="phone-portrait-outline" size={48} color="#888" />
        <Text style={styles.unsupportedTitle}>Map needs a phone</Text>
        <Text style={styles.unsupportedText}>
          The interactive map uses WebView and does not work in the browser (npm run web).
          Open the app in Expo Go on your phone or in an Android/iOS simulator.
        </Text>
      </View>
    </View>
  );
}

const MapScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RootStackScreenProps<'MapView'>['route']>();
  const { type } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [pins, setPins] = useState<MapPin[]>([]);
  const [mapKey, setMapKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [geocodingBg, setGeocodingBg] = useState(0);
  const [approximateCount, setApproximateCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const accentColor = type === 'places' ? '#f97316' : '#10b981';
  const screenTitle = type === 'places' ? 'Places Map' : 'Real Estate Map';

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const items =
          type === 'places'
            ? await placesService.getAll()
            : await realEstateService.getAll();

        if (cancelled) return;

        const initialPins = items.map((item, i) =>
          buildPinFromItem(item as Record<string, unknown>, i, type),
        );
        const approx = initialPins.filter((p) => p.approximate).length;

        setPins(initialPins);
        setApproximateCount(approx);
        setMapKey((k) => k + 1);
        setLoading(false);

        const toGeocode = items
          .map((item, index) => ({ item: item as Record<string, unknown>, index }))
          .filter(({ item }) => !parseItemCoordinates(item))
          .filter(({ item }) => buildGeocodeQuery(item).length > 0)
          .slice(0, MAX_BACKGROUND_GEOCODE);

        if (toGeocode.length === 0 || cancelled) return;

        setGeocodingBg(toGeocode.length);
        const updated = [...initialPins];

        for (let j = 0; j < toGeocode.length; j++) {
          if (cancelled) return;
          const { item, index } = toGeocode[j];
          const query = buildGeocodeQuery(item);
          const coords = await geocodeAddressCached(query);
          if (coords) {
            updated[index] = {
              ...updated[index],
              lat: coords.latitude,
              lng: coords.longitude,
              approximate: false,
              address: extractAddressFromItem(item) || updated[index].address,
            };
            setPins([...updated]);
            setApproximateCount(updated.filter((p) => p.approximate).length);
            setMapKey((k) => k + 1);
          }
          if (!cancelled) setGeocodingBg(toGeocode.length - j - 1);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Could not load map data');
          setLoading(false);
        }
      } finally {
        if (!cancelled) setGeocodingBg(0);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [type]);

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    const itemId = event.nativeEvent.data;
    if (!itemId) return;
    if (type === 'places') {
      navigation.navigate('PlaceDetail', { placeId: itemId });
    } else {
      navigation.navigate('RealEstateDetail', { realEstateId: itemId });
    }
  };

  if (Platform.OS === 'web') {
    return (
      <MapWebUnsupported
        onBack={() => navigation.goBack()}
        insetsTop={insets.top}
      />
    );
  }

  const exactCount = pins.length - approximateCount;

  return (
    <View style={styles.container}>
      {!loading && pins.length > 0 && (
        <WebView
          key={mapKey}
          ref={webViewRef}
          style={styles.map}
          source={{ html: buildLeafletHTML(pins, accentColor) }}
          onMessage={handleMessage}
          originWhitelist={['*']}
          javaScriptEnabled
        />
      )}

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>

        <View style={styles.titlePill}>
          <Text style={styles.titleText}>{screenTitle}</Text>
          {!loading && pins.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.countText}>{pins.length}</Text>
            </View>
          )}
        </View>
      </View>

      {geocodingBg > 0 && (
        <View style={[styles.bgBanner, { top: insets.top + 58 }]}>
          <ActivityIndicator size="small" color={accentColor} />
          <Text style={styles.bgBannerText}>
            Improving {geocodingBg} location{geocodingBg > 1 ? 's' : ''}…
          </Text>
        </View>
      )}

      {!loading && approximateCount > 0 && geocodingBg === 0 && (
        <View style={[styles.hintBanner, { top: insets.top + 58 }]}>
          <Text style={styles.hintBannerText}>
            {exactCount} exact · {approximateCount} approximate — add latitude/longitude in listings for faster maps
          </Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={styles.loadingTitle}>Loading map…</Text>
            <Text style={styles.loadingSub}>Pins with coordinates appear instantly</Text>
          </View>
        </View>
      )}

      {!loading && loadError && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
            <Text style={styles.loadingTitle}>{loadError}</Text>
          </View>
        </View>
      )}

      {!loading && !loadError && pins.length === 0 && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <Ionicons name="map-outline" size={40} color="#888" />
            <Text style={styles.loadingTitle}>No locations to show</Text>
            <Text style={styles.loadingSub}>Add places or listings with addresses first</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8e0d8' },
  map: { flex: 1 },
  unsupportedRoot: { flex: 1, backgroundColor: '#f5f5f5' },
  unsupportedBody: {
    flex: 1,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  unsupportedTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  unsupportedText: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 10,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  titlePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  titleText: { fontSize: 14, fontWeight: '700', color: '#111' },
  countBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  countText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  bgBanner: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bgBannerText: { fontSize: 12, color: '#444', fontWeight: '600' },
  hintBanner: {
    position: 'absolute',
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255,251,235,0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  hintBannerText: { fontSize: 11, color: '#92400e', lineHeight: 16 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    minWidth: 220,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
  },
  loadingTitle: { fontSize: 14, color: '#444', fontWeight: '600', textAlign: 'center' },
  loadingSub: { fontSize: 12, color: '#888', textAlign: 'center' },
});

export default MapScreen;
