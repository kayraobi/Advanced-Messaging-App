/** Sarajevo center — default map focus & quick-fill for submissions */
export const SARAJEVO_CENTER = { latitude: 43.8563, longitude: 18.4131 } as const;

const TEXT_FIELDS_FOR_COORDS = [
	'content',
	'description',
	'link',
	'website',
	'url',
] as const;

function normalizeCoordPair(
	lat: number,
	lng: number,
): { latitude: number; longitude: number } | null {
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
	if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

	// Common mistake: lng/lat swapped (Bosnia ~43°N, ~18°E)
	const looksSwapped =
		lat >= 15 && lat <= 20 && lng >= 42 && lng <= 46;
	if (looksSwapped) {
		return { latitude: lng, longitude: lat };
	}

	return { latitude: lat, longitude: lng };
}

/** Pull lat/lng from Google Maps URLs inside HTML or plain text */
export function extractCoordinatesFromText(
	text: string,
): { latitude: number; longitude: number } | null {
	if (!text?.trim()) return null;

	const patterns: Array<RegExp> = [
		/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
		/3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i,
		/[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
		/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
	];

	for (const pattern of patterns) {
		const match = text.match(pattern);
		if (!match) continue;
		const lat = Number.parseFloat(match[1]);
		const lng = Number.parseFloat(match[2]);
		const normalized = normalizeCoordPair(lat, lng);
		if (normalized) return normalized;
	}

	return null;
}

/** Best-effort street/place label for geocoding & map popups */
export function extractAddressFromItem(item: Record<string, unknown>): string {
	const direct = String(item.address ?? '').trim();
	if (direct) return direct;

	if (typeof item.location === 'string' && item.location.trim()) {
		return item.location.trim();
	}

	const content = String(item.content ?? item.description ?? '');
	const locationAnchor = content.match(
		/Location\s*:?\s*<a[^>]*>([^<]+)<\/a>/i,
	);
	if (locationAnchor?.[1]?.trim()) return locationAnchor[1].trim();

	const mapsAnchor = content.match(
		/<a[^>]*href="[^"]*google\.com\/maps[^"]*"[^>]*>([^<]+)<\/a>/i,
	);
	if (mapsAnchor?.[1]?.trim()) return mapsAnchor[1].trim();

	const plainLocation = content.match(
		/Location\s*:?\s*([^<\n]+?)(?:<|$)/i,
	);
	if (plainLocation?.[1]?.trim()) {
		return plainLocation[1].replace(/&nbsp;/g, ' ').trim();
	}

	return String(item.title ?? item.name ?? '').trim();
}

/** Query string for Nominatim when API has no lat/lng fields */
export function buildGeocodeQuery(item: Record<string, unknown>): string {
	const address = extractAddressFromItem(item);
	const title = String(item.title ?? item.name ?? '').trim();
	if (address && title && address !== title) {
		return `${title}, ${address}, Sarajevo, Bosnia`;
	}
	if (address) return `${address}, Sarajevo, Bosnia`;
	if (title) return `${title}, Sarajevo, Bosnia`;
	return '';
}

/** API item (place, listing, event) latitude/longitude okuma */
export function parseItemCoordinates(
	item: Record<string, unknown>,
): { latitude: number; longitude: number } | null {
	const latRaw =
		item.latitude ??
		item.lat ??
		(item.location as { lat?: unknown; latitude?: unknown })?.lat ??
		(item.location as { latitude?: unknown })?.latitude;
	const lngRaw =
		item.longitude ??
		item.lng ??
		(item.location as { lng?: unknown; longitude?: unknown })?.lng ??
		(item.location as { longitude?: unknown })?.longitude;

	const latitude =
		typeof latRaw === 'number'
			? latRaw
			: typeof latRaw === 'string'
				? Number.parseFloat(latRaw)
				: NaN;
	const longitude =
		typeof lngRaw === 'number'
			? lngRaw
			: typeof lngRaw === 'string'
				? Number.parseFloat(lngRaw)
				: NaN;

	if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
		return normalizeCoordPair(latitude, longitude);
	}

	const coords = Array.isArray(item.coordinates) ? item.coordinates : null;
	if (coords && coords.length >= 2) {
		const a = Number(coords[0]);
		const b = Number(coords[1]);
		if (Number.isFinite(a) && Number.isFinite(b)) {
			// GeoJSON is [lng, lat]; detect by Bosnia-ish bounds
			if (a >= 15 && a <= 20 && b >= 42 && b <= 46) {
				return normalizeCoordPair(b, a);
			}
			return normalizeCoordPair(a, b);
		}
	}

	for (const field of TEXT_FIELDS_FOR_COORDS) {
		const fromText = extractCoordinatesFromText(String(item[field] ?? ''));
		if (fromText) return fromText;
	}

	return null;
}

/** @deprecated Use parseItemCoordinates — kept for event tests */
export const parseEventCoordinates = parseItemCoordinates;

/** Form alanlarından lat/lng doğrulama */
export function parseCoordinateFields(
	latitudeRaw: string,
	longitudeRaw: string,
): { latitude: number; longitude: number } | null {
	return parseItemCoordinates({
		latitude: latitudeRaw.trim(),
		longitude: longitudeRaw.trim(),
	});
}
