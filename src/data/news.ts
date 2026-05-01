export interface NewsArticle {
  id: string;
  title: string;
  snippet: string;
  date: string;
  image: string;
  featured: boolean;
}

export const newsArticles: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'City Hall opens a new support desk for international residents',
    snippet:
      'Sarajevo expands in-person guidance for residency paperwork, local registration, and community orientation.',
    date: 'May 1, 2026',
    image:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    featured: true,
  },
  {
    id: 'news-2',
    title: 'Weekend walking tour adds extra capacity after early sign-ups',
    snippet:
      'Organizers added more places to the old town community walk after the first batch of reservations filled quickly.',
    date: 'April 30, 2026',
    image:
      'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&q=80',
    featured: true,
  },
  {
    id: 'news-3',
    title: 'Community language exchange now meets every Wednesday evening',
    snippet:
      'The weekly meetup continues with a larger venue and a rotating host schedule for newcomers and long-term members.',
    date: 'April 29, 2026',
    image:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80',
    featured: false,
  },
  {
    id: 'news-4',
    title: 'Volunteer network launches a shared resource board for arrivals',
    snippet:
      'Housing tips, healthcare guidance, neighborhood notes, and practical checklists are now collected in one place.',
    date: 'April 28, 2026',
    image:
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80',
    featured: false,
  },
  {
    id: 'news-5',
    title: 'Spring social calendar updated with food, sports, and family events',
    snippet:
      'The next round of community programming includes open-air meetups, kid-friendly plans, and collaborative dinners.',
    date: 'April 27, 2026',
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
    featured: false,
  },
];
