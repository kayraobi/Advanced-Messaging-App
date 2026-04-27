import { MongoDocument } from './common.types';

export interface News extends MongoDocument {
  title: string;
  content: string;
  pictures: string[];
  pictureDescription?: string;
  sources: string;
  showInSlider: boolean;
  slidePriority: number | null;
}

export interface NewsListResponse {
  data: News[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
