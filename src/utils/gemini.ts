/**
 * Gemini access — routed through our own backend.
 *
 * This file used to call the Google GenAI SDK straight from the browser, which
 * meant VITE_GEMINI_API_KEY was compiled into the public bundle: anyone could
 * open devtools, lift the key, and bill generations to us.
 *
 * Now every call goes to the Cloud Function in functions/src/index.ts, which
 * holds the key as a Firebase secret. The browser never receives one. The
 * prompts live server-side too, so the endpoint can only do the one job it was
 * built for — it can't be repurposed as a general Gemini proxy.
 *
 * Exported signatures are unchanged, so App.tsx needs no edits.
 */

import { API_BASE } from './apiConfig';

const toRaw = (b64: string) => (b64.includes(',') ? b64.split(',')[1] : b64);

/** POST JSON to an API route and surface the server's error text on failure. */
async function post<T>(route: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Network-level failure (offline, DNS, CORS preflight rejected).
    throw new Error('Could not reach the image service. Check your connection and try again.');
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body — fall through to the status check */
  }

  if (!res.ok) {
    // friendlyError() in utils/errors.ts maps these to customer-safe copy.
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export interface QuickZoneData {
  name: string;
  lineName: string;
  colorName: string;
  colorHex: string;
  hue: string;
  style?: 'horizontal' | 'vertical';
  textureStyle?: string;
}

export const detectSections = async (imageBase64: string, mimeType: string = 'image/jpeg') => {
  return post<any>('/detect-sections', {
    imageBase64: toRaw(imageBase64),
    mimeType,
  });
};

export const quickRender = async (
  imageBase64: string,
  mimeType: string,
  zones: QuickZoneData[],
): Promise<string> => {
  const { resultImage } = await post<{ resultImage: string }>('/quick-render', {
    imageBase64: toRaw(imageBase64),
    mimeType: mimeType || 'image/jpeg',
    zones,
  });
  if (!resultImage) throw new Error('AI model did not return an image. Please try again.');
  return resultImage;
};

export const roofQuickRender = async (
  imageBase64: string,
  mimeType: string,
  zones: any[],
): Promise<string> => {
  const { resultImage } = await post<{ resultImage: string }>('/roof-quick-render', {
    imageBase64: toRaw(imageBase64),
    mimeType: mimeType || 'image/jpeg',
    zones,
  });
  if (!resultImage) throw new Error('AI model did not return an image. Please try again.');
  return resultImage;
};

export const enhanceImage = async (imageBase64: string, mimeType: string = 'image/jpeg') => {
  return post<{ enhancedImageBase64?: string; mimeType?: string }>('/enhance-image', {
    imageBase64: toRaw(imageBase64),
    mimeType,
  });
};
