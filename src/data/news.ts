/** Home / Explore news card shape — always filled from API (`newsService`), not local mocks. */
export interface NewsArticle {
	id: string;
	title: string;
	snippet: string;
	/** Plain text from API (HTML stripped). */
	content: string;
	date: string;
	image: string;
	featured: boolean;
	sources?: string;
}
