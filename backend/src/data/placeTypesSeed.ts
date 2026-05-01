export interface PlaceTypeRow {
	_id: string;
	name: string;
	icon?: string;
}

export const PLACE_TYPES_SEED: PlaceTypeRow[] = [
	{ _id: 'pt_landmark', name: 'Landmark', icon: 'business' },
	{ _id: 'pt_food', name: 'Food & Drink', icon: 'restaurant' },
];
