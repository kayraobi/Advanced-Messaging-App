export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_SOURCE_URL = 'https://sarajevoexpats.com/qaas';

// The current Sarajevo Expats Q&A page has no published questions yet.
// Keep this shape aligned with the future API response so we can swap the
// source without changing the screen component.
export const faqs: FaqItem[] = [];
