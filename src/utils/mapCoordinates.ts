/** API'den gelen etkinlik için latitude/longitude okuma */
export function parseEventCoordinates(
	event: Record<string, unknown>,
): { latitude: number; longitude: number } | null {
	const latRaw =
		event.latitude ?? event.lat ?? (event.location as { lat?: unknown })?.lat;
	const lngRaw =
		event.longitude ??
		event.lng ??
		(event.location as { lng?: unknown })?.lng;

	const latitude =
		typeof latRaw === "number"
			? latRaw
			: typeof latRaw === "string"
				? Number.parseFloat(latRaw)
				: NaN;
	const longitude =
		typeof lngRaw === "number"
			? lngRaw
			: typeof lngRaw === "string"
				? Number.parseFloat(lngRaw)
				: NaN;

	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
	if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
		return null;
	return { latitude, longitude };
}
