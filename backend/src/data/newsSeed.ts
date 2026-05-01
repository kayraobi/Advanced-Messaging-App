/** In-memory news seed — replace with DB when ready */

export interface NewsRecord {
	_id: string;
	title: string;
	content: string;
	pictures: string[];
	pictureDescription?: string;
	sources: string;
	showInSlider: boolean;
	slidePriority: number | null;
	createdAt: string;
	updatedAt: string;
}

const now = new Date().toISOString();

export const NEWS_SEED: NewsRecord[] = [
	{
		_id: "507f1f77bcf86cd799439011",
		title: "Best International Restaurants You Have to Try in Sarajevo",
		content:
			"<p>From hidden gems to popular hotspots, discover the best international dining experiences the city has to offer.</p>",
		pictures: [
			"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
		],
		pictureDescription: "Restaurant interior",
		sources: "sarajevoexpats.com",
		showInSlider: true,
		slidePriority: 1,
		createdAt: now,
		updatedAt: now,
	},
	{
		_id: "507f1f77bcf86cd799439012",
		title: "A Complete Guide to Public Transport in Sarajevo",
		content:
			"<p>Trams, buses, and tickets — everything newcomers need to know.</p>",
		pictures: [
			"https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
		],
		sources: "sarajevoexpats.com",
		showInSlider: true,
		slidePriority: 2,
		createdAt: now,
		updatedAt: now,
	},
	{
		_id: "507f1f77bcf86cd799439013",
		title: "How to Open a Bank Account as a Foreigner in Bosnia",
		content:
			"<p>A practical checklist for documents and branch visits.</p>",
		pictures: [],
		sources: "sarajevoexpats.com",
		showInSlider: false,
		slidePriority: null,
		createdAt: now,
		updatedAt: now,
	},
	{
		_id: "507f1f77bcf86cd799439014",
		title: "Best Cafes for Remote Work in Sarajevo",
		content:
			"<p>These cafes offer stable Wi-Fi, good coffee, and quiet corners for focused work sessions.</p>",
		pictures: [
			"https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
		],
		sources: "sarajevoexpats.com",
		showInSlider: false,
		slidePriority: null,
		createdAt: now,
		updatedAt: now,
	},
	{
		_id: "507f1f77bcf86cd799439015",
		title: "Weekend Nature Trips Near Sarajevo",
		content:
			"<p>From Vrelo Bosne to Trebevic viewpoints, these short trips are perfect for a quick reset.</p>",
		pictures: [
			"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
		],
		sources: "sarajevoexpats.com",
		showInSlider: false,
		slidePriority: null,
		createdAt: now,
		updatedAt: now,
	},
	{
		_id: "507f1f77bcf86cd799439016",
		title: "Healthcare Basics for New Expats",
		content:
			"<p>How to register with local clinics, what documents you need, and when private care is useful.</p>",
		pictures: [
			"https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
		],
		sources: "sarajevoexpats.com",
		showInSlider: false,
		slidePriority: null,
		createdAt: now,
		updatedAt: now,
	},
];
