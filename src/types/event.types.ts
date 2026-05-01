import { MongoDocument } from './common.types';

// Swagger'daki gerçek Event şeması —
// Instagram'dan çekildiği için title/location değil content/url var
export interface Event extends MongoDocument {
  content: string[];
  images: string[];
  videos: string[];
  url: string[];
  timestamp: string;
  pinned?: boolean;
}
