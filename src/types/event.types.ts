/** Instagram carousel item from GET /api/events/{id} (see Swagger Event schema). */
export interface EventChildPost {
	type?: string;
	displayUrl?: string | null;
	videoUrl?: string | null;
	alt?: string | null;
}

/**
 * Event document from GET /api/events/{id} — production uses string `content`, optional `childPosts`.
 */
export interface Event {
	_id: string;
	content: string | string[];
	displayUrl?: string;
	url?: string | string[];
	date?: string;
	childPosts?: EventChildPost[];
	pinned?: boolean;
	priority?: number;
	__v?: number;
}
