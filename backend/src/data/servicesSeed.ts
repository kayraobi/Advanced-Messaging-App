import { SERVICE_TYPES_SEED } from './serviceTypesSeed';

export const SERVICES_SEED = [
	{
		_id: 'svc_guide_eng',
		name: 'Sarajevo Walking Tours EN',
		description: 'Licensed guides — Old Town & Tunnel museum combos.',
		displayUrl:
			'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80',
		serviceType: SERVICE_TYPES_SEED[0],
		priceLabel: 'From €25',
		contact: '+387 61 000 111',
		popular: true,
		address: 'Meet at Sebilj',
		createdAt: '2026-02-10T12:00:00.000Z',
	},
	{
		_id: 'svc_clean',
		name: 'Spotless Home Cleaning',
		description: 'Weekly / deep clean for apartments.',
		displayUrl:
			'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80',
		serviceType: SERVICE_TYPES_SEED[1],
		priceLabel: '€40 / visit',
		popular: false,
		address: 'City-wide',
		createdAt: '2026-02-20T12:00:00.000Z',
	},
];
