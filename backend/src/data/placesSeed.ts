import { PLACE_TYPES_SEED } from './placeTypesSeed';

export const PLACES_SEED = [
	{
		_id: 'place_sebilj',
		name: 'Sebilj Fountain',
		description: 'Historic wooden fountain — classic Baščaršija meeting point.',
		displayUrl:
			'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=900&q=80',
		address: 'Baščaršija, Sarajevo',
		location: '43.8599,18.4314',
		featured: true,
		approved: true,
		placeType: PLACE_TYPES_SEED[0],
		createdAt: '2026-01-10T12:00:00.000Z',
	},
	{
		_id: 'place_yellow',
		name: 'Žuto Ladje Riverside',
		description: 'Coffee spots along the Miljacka with skyline views.',
		displayUrl:
			'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=900&q=80',
		address: 'Obala Kulina Bana, Sarajevo',
		featured: false,
		approved: true,
		placeType: PLACE_TYPES_SEED[1],
		createdAt: '2026-02-01T12:00:00.000Z',
	},
];
