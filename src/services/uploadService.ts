import AsyncStorage from '@react-native-async-storage/async-storage';
import { unwrapApiEntity } from '../utils/apiUnwrap';

export interface PickableImage {
  uri: string;
  name?: string;
  mimeType?: string;
}

function extractUrl(data: unknown): string | null {
  const entity = unwrapApiEntity<{ url?: string; path?: string; secure_url?: string }>(data);
  if (entity && typeof entity === 'object') {
    const u = entity.url ?? entity.secure_url ?? entity.path;
    if (typeof u === 'string' && u.length > 0) return u;
  }
  if (data && typeof data === 'object') {
    const r = data as Record<string, unknown>;
    for (const k of ['url', 'secure_url', 'path', 'location']) {
      const v = r[k];
      if (typeof v === 'string' && v.length > 0) return v;
    }
    const inner = r.data;
    if (inner && typeof inner === 'object') {
      const ir = inner as Record<string, unknown>;
      for (const k of ['url', 'secure_url', 'path']) {
        const v = ir[k];
        if (typeof v === 'string' && v.length > 0) return v;
      }
    }
  }
  return null;
}

/** Parses typical multi-upload responses: string[], { urls }, { data: [...] }, array of { url }. */
function extractUrls(payload: unknown): string[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) {
    const out: string[] = [];
    for (const item of payload) {
      if (typeof item === 'string' && item.length > 0) out.push(item);
      else if (item && typeof item === 'object' && 'url' in item) {
        const u = String((item as { url: unknown }).url ?? '');
        if (u) out.push(u);
      }
    }
    return out;
  }
  if (typeof payload === 'object') {
    const r = payload as Record<string, unknown>;
    for (const key of ['urls', 'files', 'locations']) {
      const arr = r[key];
      if (Array.isArray(arr)) return extractUrls(arr);
    }
    const data = r.data;
    if (Array.isArray(data)) return extractUrls(data);
    const single = extractUrl(payload);
    return single ? [single] : [];
  }
  return [];
}

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3030').replace(/\/$/, '');

async function parseFetchError(res: Response, text: string): Promise<string> {
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }
  return json && typeof json === 'object' && 'message' in json
    ? String((json as { message: unknown }).message)
    : text || `Upload failed (${res.status})`;
}

/** POST /api/upload ([Swagger](https://test.sarajevoexpats.com/api/api-docs/#/Upload/post_api_upload)) */
export const uploadService = {
  async uploadImage(file: PickableImage): Promise<string> {
    const form = new FormData();
    form.append('file', {
      uri: file.uri,
      name: file.name ?? 'upload.jpg',
      type: file.mimeType ?? 'image/jpeg',
    } as unknown as Blob);

    const token = await AsyncStorage.getItem('auth_token');
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers,
      body: form,
    });

    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      throw new Error(await parseFetchError(res, text));
    }

    const url = extractUrl(json);
    if (!url) throw new Error('Upload succeeded but no image URL was returned.');
    return url;
  },

  /** POST /api/upload/multiple — append each part as `files` (adjust field name if your backend differs). */
  async uploadMultiple(files: PickableImage[]): Promise<string[]> {
    if (files.length === 0) return [];

    const form = new FormData();
    files.forEach((f, i) => {
      form.append(
        'files',
        {
          uri: f.uri,
          name: f.name ?? `upload_${i}.jpg`,
          type: f.mimeType ?? 'image/jpeg',
        } as unknown as Blob,
      );
    });

    const token = await AsyncStorage.getItem('auth_token');
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/api/upload/multiple`, {
      method: 'POST',
      headers,
      body: form,
    });

    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      throw new Error(await parseFetchError(res, text));
    }

    const urls = extractUrls(json);
    if (urls.length === 0) {
      throw new Error('Upload succeeded but no image URLs were returned.');
    }
    return urls;
  },
};
