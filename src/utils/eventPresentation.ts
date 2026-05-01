import { parseISO, isValid, parse } from "date-fns";

/** Şablonsuz API etkinlikleri için döngüsel görsel havuzu */
export const EVENT_FALLBACK_IMAGES = [
	"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
	"https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
	"https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80",
	"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
];

export function pickEventPlaceholderImage(seed: string): string {
	const n = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
	return EVENT_FALLBACK_IMAGES[Math.abs(n) % EVENT_FALLBACK_IMAGES.length];
}

/** ISO (`2024-05-20`) veya uzun metin tarihleri */
export function parseFlexibleEventDate(dateStr: unknown): Date | null {
	if (typeof dateStr !== "string" || !dateStr.trim()) return null;
	const iso = parseISO(dateStr);
	if (isValid(iso)) return iso;
	const longFmt = parse(dateStr, "MMMM d, yyyy 'at' h:mm a", new Date());
	if (isValid(longFmt)) return longFmt;
	return null;
}

export function contentToPlainLines(content: unknown): string[] {
	const s =
		typeof content === "string"
			? content
			: Array.isArray(content)
				? content.join("\n")
				: "";
	return s.split("\n").map((l) => l.trim()).filter(Boolean);
}

/** Swagger Event.url — string or string[] (Instagram). */
export function eventInstagramUrl(url: unknown): string | null {
	if (typeof url === "string" && url.startsWith("http")) return url;
	if (
		Array.isArray(url) &&
		url.length > 0 &&
		typeof url[0] === "string" &&
		url[0].startsWith("http")
	) {
		return url[0];
	}
	return null;
}
