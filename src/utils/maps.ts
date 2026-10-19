/**
 * Google Maps SDK Dynamic Loader
 * Loads Maps JavaScript API with Street View & Geometry libraries on-demand.
 */

export const DEFAULT_GOOGLE_MAPS_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCKEyf2cQlYHXyLVA7Q4-nC39pWz06ENL8';

let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(apiKey: string = DEFAULT_GOOGLE_MAPS_KEY): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if ((window as any).google?.maps) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-script');
    if (existing) {
      if ((window as any).google?.maps) {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (err) => reject(err));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Google Maps SDK. Please check your network connection or API key.'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
