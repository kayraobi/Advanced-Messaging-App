/**
 * Normalizes typical Sarajevo Expats API envelopes:
 * raw entity, `{ data }`, `{ data: { data } }`, or `{ user }`.
 */
export function unwrapApiEntity<T>(axiosResponseData: unknown): T | null {
	if (axiosResponseData == null) return null;
	if (typeof axiosResponseData !== 'object') {
		return axiosResponseData as T;
	}
	const root = axiosResponseData as Record<string, unknown>;

	if ('user' in root && root.user != null && typeof root.user === 'object') {
		return root.user as T;
	}

	if ('data' in root && root.data != null) {
		const inner = root.data;
		if (typeof inner === 'object' && inner !== null && 'data' in inner) {
			const nested = (inner as Record<string, unknown>).data;
			if (nested != null) return nested as T;
		}
		return inner as T;
	}

	return axiosResponseData as T;
}

/** Featured / pinned lists: plain array or `{ data: [] }`. */
export function unwrapApiList<T>(axiosResponseData: unknown): T[] {
	if (axiosResponseData == null) return [];
	if (Array.isArray(axiosResponseData)) return axiosResponseData as T[];
	if (typeof axiosResponseData === 'object') {
		const d = (axiosResponseData as Record<string, unknown>).data;
		if (Array.isArray(d)) return d as T[];
	}
	return [];
}
