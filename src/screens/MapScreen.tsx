import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackScreenProps } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { placesService } from '../services/placesService';
import { realEstateService } from '../services/realEstateService';

// Nominatim geocoding — OpenStreetMap, ücretsiz, API key yok
async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const query = encodeURIComponent(`${address}, Sarajevo`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { 'User-Agent': 'SarajevoExpatsApp/1.0' } },
    );
    const data = await res.json();
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch { /* sessizce geç */ }
  return null;
}

// Adres yoksa Saraybosna etrafında altın açı ile dağıt
function fallbackLatLng(index: number): [number, number] {
  const angle = index * 2.39996; // golden angle radians
  const r = 0.01 + (index % 5) * 0.006;
  return [43.8476 + Math.sin(angle) * r, 18.3564 + Math.cos(angle) * r];
}

interface Pin {
  id: string;
  title: string;
  address: string;
  image: string;
  badge: string;
  lat: number;
  lng: number;
  itemId: string;
}

function buildLeafletHTML(pins: Pin[], accentColor: string): string {
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
</style>
</head>
<body>
<div id="map"></div>
<script>
  const map = L.map('map', { zoomControl: true }).setView([43.8476, 18.3564], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  const pins = ${pinsJson};

  if (pins.length > 0) {
    const bounds = [];
    pins.forEach(pin => {
      const icon = L.divIcon({
        className: '',
        html: '<div class="dot-marker">' + (pin.badge ? pin.badge.charAt(0) : '📍') + '</div>',
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

      const popupContent =
        '<div>' +
        imgHtml +
        '<div class="popup-body">' +
        badgeHtml +
        '<div class="popup-title">' + pin.title + '</div>' +
        '<div class="popup-addr">' + pin.address + '</div>' +
        '<button class="popup-btn" onclick="window.ReactNativeWebView.postMessage(\\'' + pin.itemId + '\\')">View Details →</button>' +
        '</div></div>';

      const marker = L.marker([pin.lat, pin.lng], { icon })
        .bindPopup(popupContent, { className: 'custom-popup', maxWidth: 220, minWidth: 220 })
        .addTo(map);

      bounds.push([pin.lat, pin.lng]);
    });

    try {
      map.fitBounds(bounds, { padding: [60, 40] });
    } catch(e) {}
  }
</script>
</body>
</html>`;
}

const MapScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RootStackScreenProps<'MapView'>['route']>();
  const { type } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [htmlReady, setHtmlReady] = useState(false);

  const accentColor = type === 'places' ? '#f97316' : '#10b981';
  const screenTitle = type === 'places' ? 'Places Map' : 'Real Estate Map';

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const items = type === 'places'
          ? await placesService.getAll()
          : await realEstateService.getAll();

        if (cancelled) return;
        setTotal(items.length);

        const result: Pin[] = [];
        for (let i = 0; i < items.length; i++) {
          if (cancelled) return;
          const item = items[i] as any;
          const title = item.name ?? item.title ?? 'Item';
          const address = item.address ?? item.location ?? '';
          const image = item.displayUrl ?? item.pictures?.[0] ?? '';
          const badge = type === 'places'
            ? (typeof item.placeType === 'object' ? item.placeType?.name : item.placeType) ?? ''
            : (typeof item.realEstateType === 'object' ? item.realEstateType?.name : item.realEstateType ?? item.type) ?? '';

          let coords: [number, number] | null = null;
          if (item.latitude && item.longitude) {
            coords = [parseFloat(item.latitude), parseFloat(item.longitude)];
          } else if (address) {
            coords = await geocodeAddress(address);
            await new Promise(r => setTimeout(r, 250)); // Nominatim rate limit
          }
          if (!coords) coords = fallbackLatLng(i);

          result.push({ id: item._id + i, title, address: address || 'Sarajevo', image, badge, lat: coords[0], lng: coords[1], itemId: item._id });
          if (!cancelled) setProgress(i + 1);
        }
        if (!cancelled) {
          setPins(result);
          setHtmlReady(true);
        }
      } catch { /* show what we have */ }
      finally { if (!cancelled) setLoading(false); }
    };
    run();
    return () => { cancelled = true; };
  }, [type]);

  const handleMessage = (event: any) => {
    const itemId = event.nativeEvent.data;
    if (!itemId) return;
    if (type === 'places') {
      navigation.navigate('PlaceDetail', { placeId: itemId });
    } else {
      navigation.navigate('RealEstateDetail', { realEstateId: itemId });
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      {htmlReady && (
        <WebView
          ref={webViewRef}
          style={styles.map}
          source={{ html: buildLeafletHTML(pins, accentColor) }}
          onMessage={handleMessage}
          originWhitelist={['*']}
          javaScriptEnabled
        />
      )}

      {/* Header — float above map */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>

        <View style={styles.titlePill}>
          <Text style={styles.titleText}>{screenTitle}</Text>
          {!loading && (
            <View style={[styles.countBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.countText}>{pins.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={styles.loadingTitle}>
              {total === 0 ? 'Fetching locations…' : `Geocoding ${progress} / ${total}`}
            </Text>
            {total > 0 && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { backgroundColor: accentColor, width: `${Math.round((progress / total) * 100)}%` as any }]} />
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8e0d8' },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 10,
  },
  circleBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.93)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 5,
  },
  titlePill: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 5,
  },
  titleText: { fontSize: 14, fontWeight: '700', color: '#111' },
  countBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  countText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.30)',
    alignItems: 'center', justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: '#fff', borderRadius: 18,
    padding: 28, alignItems: 'center', gap: 14, minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 14, elevation: 10,
  },
  loadingTitle: { fontSize: 14, color: '#444', fontWeight: '600' },
  progressTrack: {
    width: 180, height: 5, borderRadius: 3,
    backgroundColor: '#eee', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
});

export default MapScreen;
