import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@geocode:';
const NOMINATIM_DELAY_MS = 1100;
let lastNominatimAt = 0;

function cacheKey(address: string): string {
	return `${CACHE_PREFIX}${address.trim().toLowerCase()}`;
}

async function waitForRateLimit(): Promise<void> {
	const elapsed = Date.now() - lastNominatimAt;
	if (elapsed < NOMINATIM_DELAY_MS) {
		await new Promise((r) => setTimeout(r, NOMINATIM_DELAY_MS - elapsed));
	}
	lastNominatimAt = Date.now();
}

/** OpenStreetMap Nominatim — free, no API key. Results cached on device. */
export async function geocodeAddressCached(
	address: string,
): Promise<{ latitude: number; longitude: number } | null> {
	const normalized = address.trim();
	if (!normalized) return null;

	const key = cacheKey(normalized);
	try {
		const cached = await AsyncStorage.getItem(key);
		if (cached) {
			const parsed = JSON.parse(cached) as { lat: number; lng: number };
			if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)) {
				return { latitude: parsed.lat, longitude: parsed.lng };
			}
		}
	} catch {
		/* ignore cache read errors */
	}

	await waitForRateLimit();

	try {
		const withRegion = /sarajevo|bosnia/i.test(normalized)
			? normalized
			: `${normalized}, Sarajevo, Bosnia`;
		const query = encodeURIComponent(withRegion);
		const res = await fetch(
			`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
			{ headers: { 'User-Agent': 'SarajevoExpatsApp/1.0' } },
		);
		const data = (await res.json()) as { lat: string; lon: string }[];
		if (!Array.isArray(data) || data.length === 0) return null;

		const latitude = Number.parseFloat(data[0].lat);
		const longitude = Number.parseFloat(data[0].lon);
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

		await AsyncStorage.setItem(key, JSON.stringify({ lat: latitude, lng: longitude }));
		return { latitude, longitude };
	} catch {
		return null;
	}
}
