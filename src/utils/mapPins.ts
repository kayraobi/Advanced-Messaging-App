import { extractAddressFromItem, parseItemCoordinates } from './mapCoordinates';

export interface MapPin {
	id: string;
	title: string;
	address: string;
	image: string;
	badge: string;
	lat: number;
	lng: number;
	itemId: string;
	/** True when coords are estimated (no lat/lng on server). */
	approximate: boolean;
}

/** Adres yoksa Saraybosna etrafında altın açı ile dağıt */
export function fallbackLatLng(index: number): { latitude: number; longitude: number } {
	const angle = index * 2.39996;
	const r = 0.01 + (index % 5) * 0.006;
	return {
		latitude: 43.8476 + Math.sin(angle) * r,
		longitude: 18.3564 + Math.cos(angle) * r,
	};
}

export function buildPinFromItem(
	item: Record<string, unknown>,
	index: number,
	type: 'places' | 'realEstate',
): MapPin {
	const title = String(item.name ?? item.title ?? 'Item');
	const address = extractAddressFromItem(item);
	const image = String(item.displayUrl ?? (item.pictures as string[])?.[0] ?? '');
	const badge =
		type === 'places'
			? String(
					typeof item.placeType === 'object'
						? (item.placeType as { name?: string })?.name
						: item.placeType ?? item.type ?? '',
				)
			: String(
					typeof item.realEstateType === 'object'
						? (item.realEstateType as { name?: string })?.name
						: item.realEstateType ?? item.type ?? '',
				);

	const parsed = parseItemCoordinates(item);
	const coords = parsed ?? fallbackLatLng(index);
	const itemId = String(item._id ?? index);

	return {
		id: `${itemId}-${index}`,
		title,
		address: address || 'Sarajevo',
		image,
		badge,
		lat: coords.latitude,
		lng: coords.longitude,
		itemId,
		approximate: !parsed,
	};
}
