import { MongoDocument } from './common.types';

export interface News extends MongoDocument {
  title: string;
  content: string;
  pictures: string[];
  pictureDescription?: string;
  sources: string;
  showInSlider: boolean;
  slidePriority: number;
}
