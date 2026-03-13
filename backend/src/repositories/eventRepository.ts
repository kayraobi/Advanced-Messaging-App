// Sahte Veritabanı (Mock Database)
let mockEvents = [
  { id: 1, title: 'Sarajevo Dağ Yürüyüşü', date: '2024-05-20', capacity: 100, currentRSVP: 99 },
  { id: 2, title: 'Balkan Tech Meetup', date: '2024-05-22', capacity: 50, currentRSVP: 20 },
  { id: 3, title: 'Cevapi Tasting Tour', date: '2024-05-25', capacity: 20, currentRSVP: 20 }
];
let nextId = 4;

// İleride buradaki .getAll(), .create() fonksiyonların içeriğini PostgreSQL ile değiştireceğiz.
export const eventRepository = {
  getAll: async () => {
    return mockEvents;
  },

  getById: async (id: number) => {
    return mockEvents.find(e => e.id === id);
  },

  create: async (eventData: any) => {
    const newEvent = { id: nextId++, currentRSVP: 0, ...eventData };
    mockEvents.push(newEvent);
    return newEvent;
  },

  incrementRSVP: async (id: number) => {
    const eventIndex = mockEvents.findIndex(e => e.id === id);
    if (eventIndex === -1) return null;
    
    mockEvents[eventIndex].currentRSVP += 1;
    return mockEvents[eventIndex];
  }
};
