import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { unwrapApiEntity } from '../utils/apiUnwrap';

export interface PickableImage {
  uri: string;
  name?: string;
  mimeType?: string;
}

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3030').replace(/\/$/, '');

/** Normalize to JPEG file URI for reliable multipart upload (iOS HEIC, Android content://). */
export async function preparePickableImage(file: PickableImage): Promise<PickableImage> {
  if (Platform.OS === 'web') {
    let name = file.name ?? 'upload.jpg';
    if (!name.includes('.')) name = 'upload.jpg';
    return {
      uri: file.uri,
      name,
      mimeType: file.mimeType ?? 'image/jpeg',
    };
  }

  try {
    const manipulated = await ImageManipulator.manipulateAsync(
      file.uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG },
    );
    return {
      uri: manipulated.uri,
      name: 'upload.jpg',
      mimeType: 'image/jpeg',
    };
  } catch {
    return {
      uri: file.uri,
      name: file.name?.includes('.') ? file.name : 'upload.jpg',
      mimeType: file.mimeType ?? 'image/jpeg',
    };
  }
}

function extractUrl(data: unknown): string | null {
  const entity = unwrapApiEntity<Record<string, unknown>>(data);
  if (entity && typeof entity === 'object') {
    for (const k of ['url', 'secure_url', 'secureUrl', 'path', 'location', 'displayUrl', 'imageUrl']) {
      const v = entity[k];
      if (typeof v === 'string' && v.length > 0) return v;
    }
  }
  if (typeof data === 'string' && data.length > 0 && (data.startsWith('http') || data.startsWith('/'))) {
    return data;
  }
  if (data && typeof data === 'object') {
    const r = data as Record<string, unknown>;
    for (const k of ['url', 'secure_url', 'secureUrl', 'path', 'location', 'displayUrl', 'imageUrl']) {
      const v = r[k];
      if (typeof v === 'string' && v.length > 0) return v;
    }
    const inner = r.data;
    if (typeof inner === 'string' && inner.length > 0) return inner;
    if (inner && typeof inner === 'object') {
      const ir = inner as Record<string, unknown>;
      for (const k of ['url', 'secure_url', 'path', 'displayUrl']) {
        const v = ir[k];
        if (typeof v === 'string' && v.length > 0) return v;
      }
    }
  }
  return null;
}

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

function parseResponseError(status: number, text: string): string {
  let json: Record<string, unknown> | null = null;
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    json = null;
  }
  const msg =
    json &&
    (typeof json.message === 'string'
      ? json.message
      : typeof json.error === 'string'
        ? json.error
        : typeof json.msg === 'string'
          ? json.msg
          : null);
  if (msg) return msg;
  if (status === 401) return 'Session expired. Please log in again.';
  if (status === 403) return 'You are not allowed to upload files (upload permission).';
  if (status === 413) return 'Image is too large. Try a smaller photo.';
  return text?.trim() || `Upload failed (HTTP ${status})`;
}

async function appendFileToForm(form: FormData, ready: PickableImage, fieldName: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = await fetch(ready.uri).then((r) => r.blob());
    form.append(fieldName, blob, ready.name ?? 'upload.jpg');
    return;
  }
  form.append(
    fieldName,
    {
      uri: ready.uri,
      name: ready.name ?? 'upload.jpg',
      type: ready.mimeType ?? 'image/jpeg',
    } as unknown as Blob,
  );
}

async function postMultipart(path: string, form: FormData): Promise<unknown> {
  const token = await AsyncStorage.getItem('auth_token');
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
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
    throw new Error(parseResponseError(res.status, text));
  }
  return json;
}

/** POST /api/upload */
export const uploadService = {
  async uploadImage(file: PickableImage): Promise<string> {
    const ready = await preparePickableImage(file);
    const form = new FormData();
    await appendFileToForm(form, ready, 'file');

    const json = await postMultipart('/api/upload', form);
    const url = extractUrl(json);
    if (!url) {
      console.log('[upload] unexpected response', JSON.stringify(json)?.slice(0, 500));
      throw new Error('Upload succeeded but no image URL was returned.');
    }
    return url;
  },

  async uploadMultiple(files: PickableImage[]): Promise<string[]> {
    if (files.length === 0) return [];

    const form = new FormData();
    const prepared = await Promise.all(files.map((f) => preparePickableImage(f)));
    for (let i = 0; i < prepared.length; i++) {
      await appendFileToForm(form, prepared[i], 'files');
    }

    const json = await postMultipart('/api/upload/multiple', form);
    const urls = extractUrls(json);
    if (urls.length === 0) {
      console.log('[upload/multiple] unexpected response', JSON.stringify(json)?.slice(0, 500));
      throw new Error('Upload succeeded but no image URLs were returned.');
    }
    return urls;
  },
};
