export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_SOURCE_URL = 'https://sarajevoexpats.com/qaas';

// Mock FAQ content used until the real Sarajevo Expats FAQ endpoint is ready.
// Keep this shape aligned with the future API response so the screen can switch
// from mock to live data by only changing EXPO_PUBLIC_USE_MOCK.
export const faqs: FaqItem[] = [
  {
    id: '1',
    question: 'What is Sarajevo Expats?',
    answer:
      'Sarajevo Expats is a community platform for expats and internationals in Sarajevo. It combines community updates, event discovery, and communication in one place.',
  },
  {
    id: '2',
    question: 'Who can join the Sarajevo Expats community?',
    answer:
      'The platform is intended for expats, international students, remote workers, and people who want to connect with the Sarajevo international community.',
  },
  {
    id: '3',
    question: 'How do I find upcoming events?',
    answer:
      'You can browse the Calendar and Home tabs to see featured and upcoming events, then open any event card to view details such as date, location, attendance, and countdown.',
  },
  {
    id: '4',
    question: 'How does RSVP work?',
    answer:
      'Each event has a detail page with RSVP capability. When capacity is full, the flow can later be extended to support a waitlist system without changing the FAQ UI.',
  },
  {
    id: '5',
    question: 'What is the difference between Global Chat and event chats?',
    answer:
      'Global Chat is the shared room for the whole community. Event chats are tied to specific events so participants can coordinate before and during activities.',
  },
  {
    id: '6',
    question: 'Will this FAQ use real data later?',
    answer:
      'Yes. The screen is designed to read from mock data while EXPO_PUBLIC_USE_MOCK is true, and from a backend FAQ endpoint when it is false.',
  },
];
