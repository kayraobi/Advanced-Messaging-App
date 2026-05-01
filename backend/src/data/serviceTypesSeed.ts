export interface ServiceTypeRow {
	_id: string;
	name: string;
	icon?: string;
}

export const SERVICE_TYPES_SEED: ServiceTypeRow[] = [
	{ _id: 'st_tours', name: 'Tours & guides', icon: 'walk' },
	{ _id: 'st_home', name: 'Home services', icon: 'hammer' },
];
