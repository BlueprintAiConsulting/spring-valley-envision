import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MapPin, Search, RotateCcw, RotateCw, ChevronUp, ChevronDown, 
  ZoomIn, ZoomOut, Camera, Loader2, AlertCircle, Sparkles, Check
} from 'lucide-react';
import { loadGoogleMaps, DEFAULT_GOOGLE_MAPS_KEY } from '../../utils/maps';

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const StreetViewModal: React.FC<StreetViewModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [address, setAddress] = useState('');
  const [isLoadingSdk, setIsLoadingSdk] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasPanorama, setHasPanorama] = useState(false);

  const panoContainerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<any>(null);

  // Initialize or re-attach panorama when modal opens
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setStatusMessage(null);
      return;
    }

    let isMounted = true;
    setIsLoadingSdk(true);

    loadGoogleMaps()
      .then(() => {
        if (!isMounted || !panoContainerRef.current) return;
        setIsLoadingSdk(false);

        // Default location: Chester County, PA (Spring Valley Roofing territory)
        const initialPos = { lat: 39.9587, lng: -75.6053 };

        if (!panoramaRef.current) {
          panoramaRef.current = new (window as any).google.maps.StreetViewPanorama(
            panoContainerRef.current,
            {
              position: initialPos,
              pov: { heading: 45, pitch: 10 },
              zoom: 1,
              addressControl: false,
              showRoadLabels: false,
              motionTracking: false,
              motionTrackingControl: false,
              fullscreenControl: false,
            }
          );

          panoramaRef.current.addListener('status_changed', () => {
            const status = panoramaRef.current.getStatus();
            if (status === 'OK') {
              setHasPanorama(true);
              setErrorMessage(null);
            } else {
              setHasPanorama(false);
              setErrorMessage('No Google Street View imagery available at this specific spot. Try an address on a public street.');
            }
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsLoadingSdk(false);
        setErrorMessage(err.message || 'Failed to initialize Google Maps. Check your network or API key.');
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleSearchAddress = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!address.trim()) return;

    if (!(window as any).google?.maps) {
      setErrorMessage('Google Maps SDK is not loaded yet. Please wait a moment.');
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    setStatusMessage('Locating address & calculating street view angle…');

    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ address: address.trim() }, (results: any[], status: string) => {
      if (status !== 'OK' || !results || !results[0]) {
        setIsSearching(false);
        setStatusMessage(null);
        setErrorMessage(`Could not locate address "${address}". Please check spelling and include city & state.`);
        return;
      }

      const houseLocation = results[0].geometry.location;
      const formattedAddress = results[0].formatted_address;
      setAddress(formattedAddress);

      // Search for nearest street view panorama to find camera car location
      const svService = new (window as any).google.maps.StreetViewService();
      svService.getPanorama(
        {
          location: houseLocation,
          radius: 65,
          source: (window as any).google.maps.StreetViewSource.OUTDOOR,
        },
        (data: any, svStatus: string) => {
          setIsSearching(false);
          setStatusMessage(null);

          if (svStatus === (window as any).google.maps.StreetViewStatus.OK && data?.location?.latLng) {
            const panoLocation = data.location.latLng;
            // Automatically calculate angle facing directly at the house from the camera!
            const heading = (window as any).google.maps.geometry.spherical.computeHeading(
              panoLocation,
              houseLocation
            );

            if (panoramaRef.current) {
              panoramaRef.current.setPosition(panoLocation);
              panoramaRef.current.setPov({ heading: Math.round(heading), pitch: 10 });
              panoramaRef.current.setZoom(1);
            }
            setHasPanorama(true);
            setStatusMessage('Centered on front of property! Use controls below or drag to fine-tune framing.');
          } else {
            // Fallback: place directly at house geocode coordinates
            if (panoramaRef.current) {
              panoramaRef.current.setPosition(houseLocation);
              panoramaRef.current.setPov({ heading: 0, pitch: 10 });
            }
          }
        }
      );
    });
  };

  // POV Quick adjustments
  const adjustHeading = (delta: number) => {
    if (!panoramaRef.current) return;
    const pov = panoramaRef.current.getPov();
    panoramaRef.current.setPov({
      ...pov,
      heading: (pov.heading + delta + 360) % 360,
    });
  };

  const adjustPitch = (delta: number) => {
    if (!panoramaRef.current) return;
    const pov = panoramaRef.current.getPov();
    panoramaRef.current.setPov({
      ...pov,
      pitch: Math.max(-80, Math.min(80, pov.pitch + delta)),
    });
  };

  const adjustZoom = (delta: number) => {
    if (!panoramaRef.current) return;
    const currentZoom = panoramaRef.current.getZoom() || 1;
    panoramaRef.current.setZoom(Math.max(0, Math.min(3, currentZoom + delta)));
  };

  const handleCapture = async () => {
    if (!panoramaRef.current) return;
    setIsCapturing(true);
    setErrorMessage(null);

    try {
      const pos = panoramaRef.current.getPosition();
      const pov = panoramaRef.current.getPov();
      if (!pos) throw new Error('No Street View position detected.');

      const lat = pos.lat();
      const lng = pos.lng();
      const heading = Math.round(pov.heading || 0);
      const pitch = Math.round(pov.pitch || 0);
      const zoom = panoramaRef.current.getZoom() || 1;
      const fov = Math.round(Math.max(25, Math.min(110, 180 / Math.pow(2, zoom))));

      // High-resolution Street View Static URL
      const staticUrl = `https://maps.googleapis.com/maps/api/streetview?size=1024x768&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${DEFAULT_GOOGLE_MAPS_KEY}`;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Static Street View image could not be downloaded. Check if "Street View Static API" is enabled in Google Cloud Console.'));
        img.src = staticUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width || 1024;
      canvas.height = img.height || 768;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to initialize canvas for Street View extraction.');

      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          setIsCapturing(false);
          setErrorMessage('Failed to extract JPEG image from Street View.');
          return;
        }

        const cleanName = address ? address.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30) : 'streetview-house';
        const file = new File([blob], `${cleanName}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        setIsCapturing(false);
        onClose();
      }, 'image/jpeg', 0.92);

    } catch (err: any) {
      setIsCapturing(false);
      setErrorMessage(
        err.message || 'Unable to capture Street View snapshot. You can also take a screenshot of the view above and upload it.'
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0B131E] border border-[#223448] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#1E293B] bg-[#0E1620] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#18A9D9]/20 border border-[#18A9D9]/40 flex items-center justify-center text-[#18A9D9] shadow-[0_0_15px_rgba(24,169,217,0.25)]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Google Street View Capture
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#18A9D9]/20 text-[#18A9D9] border border-[#18A9D9]/30">
                      Live
                    </span>
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Enter any house address to automatically pull the front facade into the visualizer.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-[#131F2E] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors border border-[#223448] min-h-[44px] min-w-[44px]"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address Search Form */}
            <div className="p-4 bg-[#0F172A] border-b border-[#1E293B] shrink-0">
              <form onSubmit={handleSearchAddress} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-[#18A9D9] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter street address (e.g. 200 E Market St, West Chester, PA)"
                    className="w-full bg-[#080D14] border border-[#223448] focus:border-[#18A9D9] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#475569] outline-none transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !address.trim()}
                  className="px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#18A9D9] hover:bg-[#1596C2] active:scale-95 disabled:opacity-50 text-white shadow-[0_0_15px_rgba(24,169,217,0.35)] flex items-center justify-center gap-2 transition-all min-h-[44px]"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span className="hidden sm:inline">Search</span>
                </button>
              </form>

              {/* Status / Feedback Banner */}
              {statusMessage && (
                <div className="mt-2 text-xs text-[#34D399] flex items-center gap-1.5 font-medium animate-in fade-in">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Street View Container */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[380px] bg-black overflow-hidden flex items-center justify-center">
              {isLoadingSdk && (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <Loader2 className="w-8 h-8 text-[#18A9D9] animate-spin" />
                  <p className="text-sm font-bold text-white">Loading Google Street View Engine…</p>
                  <p className="text-xs text-[#94A3B8]">Connecting to Google Maps Platform</p>
                </div>
              )}

              {/* The interactive Street View Panorama element */}
              <div
                ref={panoContainerRef}
                className="w-full h-full absolute inset-0"
                style={{ visibility: isLoadingSdk ? 'hidden' : 'visible' }}
              />

              {/* Aiming Reticle Overlay for Framing the Roof/House */}
              {hasPanorama && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="border border-white/20 rounded-2xl w-4/5 h-4/5 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)] flex flex-col justify-between p-3">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 bg-black/50 px-2 py-0.5 rounded self-start backdrop-blur-sm">
                      Framing Target
                    </span>
                    <span className="text-[10px] font-medium text-white/70 bg-black/60 px-3 py-1 rounded-full self-center backdrop-blur-sm">
                      Align roof and siding within box · Drag to rotate
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Panorama Fine-Tuning Controls Bar */}
            <div className="px-4 py-2.5 bg-[#0F172A] border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <span className="hidden sm:inline font-bold uppercase tracking-wider text-[10px] text-[#64748B] mr-1">
                  Adjust View:
                </span>
                <button
                  type="button"
                  onClick={() => adjustHeading(-15)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white flex items-center gap-1 text-[11px] font-medium transition-colors min-h-[36px]"
                  title="Rotate Left"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> -15°
                </button>
                <button
                  type="button"
                  onClick={() => adjustHeading(15)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white flex items-center gap-1 text-[11px] font-medium transition-colors min-h-[36px]"
                  title="Rotate Right"
                >
                  <RotateCw className="w-3.5 h-3.5" /> +15°
                </button>
                <button
                  type="button"
                  onClick={() => adjustPitch(5)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white flex items-center gap-1 text-[11px] font-medium transition-colors min-h-[36px]"
                  title="Tilt Up"
                >
                  <ChevronUp className="w-3.5 h-3.5" /> Tilt Up
                </button>
                <button
                  type="button"
                  onClick={() => adjustPitch(-5)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white flex items-center gap-1 text-[11px] font-medium transition-colors min-h-[36px]"
                  title="Tilt Down"
                >
                  <ChevronDown className="w-3.5 h-3.5" /> Tilt Down
                </button>
                <button
                  type="button"
                  onClick={() => adjustZoom(1)}
                  className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustZoom(-1)}
                  className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white bg-[#131F2E] hover:bg-[#1E293B] border border-[#223448] transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={isCapturing || !hasPanorama}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#83C248] hover:bg-[#93D553] active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(131,194,72,0.45)] flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Capturing House…
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Use This Street View
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreetViewModal;
