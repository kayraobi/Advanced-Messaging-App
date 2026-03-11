export interface NewsArticle {
  id: string;
  title: string;
  snippet: string;
  date: string;
  image: string;
  featured?: boolean;
}

export const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Best International Restaurants You Have to Try in Sarajevo',
    snippet: 'From hidden gems to popular hotspots, discover the best international dining experiences the city has to offer for expats and locals alike.',
    date: 'March 5, 2026',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    featured: true,
  },
  {
    id: '2',
    title: 'A Complete Guide to Public Transport in Sarajevo',
    snippet: 'Everything you need to know about trams, buses, and getting around the city efficiently as a newcomer.',
    date: 'March 3, 2026',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    featured: true,
  },
  {
    id: '3',
    title: 'Top 10 Coworking Spaces for Digital Nomads',
    snippet: 'Sarajevo is quickly becoming a hub for remote workers. Here are the best coworking spaces to boost your productivity.',
    date: 'March 1, 2026',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    featured: true,
  },
  {
    id: '4',
    title: 'How to Open a Bank Account as a Foreigner in Bosnia',
    snippet: 'A step-by-step guide to navigating the banking system and getting your finances set up in Sarajevo.',
    date: 'February 28, 2026',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  },
  {
    id: '5',
    title: 'Weekend Getaways: Day Trips from Sarajevo You Can\'t Miss',
    snippet: 'Explore stunning nature, historic towns, and hidden waterfalls just a short drive from the capital.',
    date: 'February 25, 2026',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
  {
    id: '6',
    title: 'Learning Bosnian: Best Resources and Language Schools',
    snippet: 'Whether you prefer apps, tutors, or classroom settings, here\'s how to start learning the local language.',
    date: 'February 22, 2026',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
  },
  {
    id: '7',
    title: "Sarajevo's Best Cafés for Work and Socializing",
    snippet: 'Coffee culture runs deep in Sarajevo. These are the top spots to enjoy a cup while meeting fellow expats.',
    date: 'February 18, 2026',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
  },
  {
    id: '8',
    title: 'Healthcare in Bosnia: What Expats Need to Know',
    snippet: 'From registering with a local clinic to understanding insurance options, your complete healthcare guide.',
    date: 'February 15, 2026',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
  },
];
