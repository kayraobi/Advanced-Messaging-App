export interface Event {
  id: string;
  title: string;
  // Prefer this field once the real API is connected.
  startsAt?: string;
  date: string;
  time: string;
  location: string;
  category: 'Social' | 'Sports' | 'Culture' | 'Food & Drink';
  capacity: number;
  filled: number;
  image: string;
}

export const events: Event[] = [
  {
    id: '1',
    title: 'Coffee & Connect at Kibe Mahala',
    date: 'Mar 15, 2026',
    time: '10:00 AM',
    location: 'Kibe Mahala, Baščaršija',
    category: 'Social',
    capacity: 30,
    filled: 24,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=200&fit=crop',
  },
  {
    id: '2',
    title: 'Hiking Trebević Mountain',
    date: 'Mar 18, 2026',
    time: '8:00 AM',
    location: 'Trebević Cable Car Station',
    category: 'Sports',
    capacity: 25,
    filled: 19,
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=200&fit=crop',
  },
  {
    id: '3',
    title: 'Language Exchange Night',
    date: 'Mar 20, 2026',
    time: '7:00 PM',
    location: 'Trezor Pub, Ferhadija',
    category: 'Culture',
    capacity: 40,
    filled: 32,
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=200&fit=crop',
  },
  {
    id: '4',
    title: 'Ćevapi Crawl: Best in Town',
    date: 'Mar 22, 2026',
    time: '12:00 PM',
    location: 'Meeting at Sebilj Fountain',
    category: 'Food & Drink',
    capacity: 20,
    filled: 18,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop',
  },
  {
    id: '5',
    title: 'Weekend Football Match',
    date: 'Mar 25, 2026',
    time: '4:00 PM',
    location: 'Koševo Stadium Fields',
    category: 'Sports',
    capacity: 22,
    filled: 14,
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=200&fit=crop',
  },
  {
    id: '6',
    title: 'Sarajevo Film Night',
    date: 'Mar 28, 2026',
    time: '8:00 PM',
    location: 'Cinema Meeting Point',
    category: 'Culture',
    capacity: 35,
    filled: 27,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=200&fit=crop',
  },
  {
    id: '7',
    title: 'Yoga in Vrelo Bosne Park',
    date: 'Apr 1, 2026',
    time: '9:00 AM',
    location: 'Vrelo Bosne, Ilidža',
    category: 'Sports',
    capacity: 20,
    filled: 8,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop',
  },
  {
    id: '8',
    title: 'Expat Brunch at Park Prinčeva',
    date: 'Apr 3, 2026',
    time: '11:00 AM',
    location: 'Park Prinčeva Restaurant',
    category: 'Food & Drink',
    capacity: 30,
    filled: 30,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=200&fit=crop',
  },
];
