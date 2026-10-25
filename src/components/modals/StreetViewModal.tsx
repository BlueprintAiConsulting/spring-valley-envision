import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MapPin, Search, RotateCcw, RotateCw, ChevronUp, ChevronDown, 
  ZoomIn, ZoomOut, Camera, Loader2, AlertCircle, Sparkles, Check,
  Repeat, Compass, Navigation, Crosshair
} from 'lucide-react';
import { loadGoogleMaps, DEFAULT_GOOGLE_MAPS_KEY } from '../../utils/maps';

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const PRESET_ADDRESSES = [
  { label: 'West Chester, PA', address: '120 E Market St, West Chester, PA 19382' },
  { label: 'Pottstown, PA', address: '300 High St, Pottstown, PA 19464' },
  { label: 'Phoenixville, PA', address: '100 N Main St, Phoenixville, PA 19460' },
  { label: 'Downingtown, PA', address: '100 E Lancaster Ave, Downingtown, PA 19335' },
];

export const StreetViewModal: React.FC<StreetViewModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [address, setAddress] = useState('');
  const [isLoadingSdk, setIsLoadingSdk] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isShutterActive, setIsShutterActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasPanorama, setHasPanorama] = useState(false);
  const [telemetry, setTelemetry] = useState<{ heading: number; pitch: number; zoom: number }>({
    heading: 45,
    pitch: 10,
    zoom: 1,
  });

  const panoContainerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const getCardinalDirection = (heading: number) => {
    const normalized = ((Math.round(heading) % 360) + 360) % 360;
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(normalized / 45) % 8;
    return dirs[idx];
  };

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

          panoramaRef.current.addListener('pov_changed', () => {
            const pov = panoramaRef.current?.getPov();
            if (pov) {
              const rawHeading = Math.round(((pov.heading % 360) + 360) % 360);
              const rawPitch = Math.round(pov.pitch);
              setTelemetry((prev) => ({
                ...prev,
                heading: rawHeading,
                pitch: rawPitch,
              }));
            }
          });

          panoramaRef.current.addListener('zoom_changed', () => {
            const z = panoramaRef.current?.getZoom() || 1;
            setTelemetry((prev) => ({
              ...prev,
              zoom: Math.round(z * 10) / 10,
            }));
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

  // Initialize Google Places Autocomplete on input
  useEffect(() => {
    if (!isOpen) {
      if (autocompleteRef.current && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      autocompleteRef.current = null;
      return;
    }

    let timer: NodeJS.Timeout;

    const attachAutocomplete = () => {
      if (!inputRef.current || !(window as any).google?.maps?.places?.Autocomplete) {
        timer = setTimeout(attachAutocomplete, 100);
        return;
      }

      try {
        const autocomplete = new (window as any).google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['geometry', 'formatted_address', 'name', 'address_components'],
          }
        );
        autocompleteRef.current = autocomplete;

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place && place.geometry?.location) {
            handlePlaceResolved(place.geometry.location, place.formatted_address || place.name);
          }
        });
      } catch (err) {
        console.warn('Google Places Autocomplete initialization deferred:', err);
      }
    };

    attachAutocomplete();

    return () => {
      if (timer) clearTimeout(timer);
      if (autocompleteRef.current && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      autocompleteRef.current = null;
    };
  }, [isOpen]);

  const handlePlaceResolved = (houseLocation: any, displayAddress?: string) => {
    if (displayAddress) {
      setAddress(displayAddress);
    }
    setIsSearching(true);
    setErrorMessage(null);
    setStatusMessage('Aligning camera angle with front facade…');

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
          const heading = (window as any).google.maps.geometry.spherical.computeHeading(
            panoLocation,
            houseLocation
          );
          const roundedHeading = Math.round(((heading % 360) + 360) % 360);

          if (panoramaRef.current) {
            panoramaRef.current.setPosition(panoLocation);
            panoramaRef.current.setPov({ heading: roundedHeading, pitch: 10 });
            panoramaRef.current.setZoom(1);
          }
          setTelemetry({ heading: roundedHeading, pitch: 10, zoom: 1 });
          setHasPanorama(true);
          setStatusMessage('Target locked onto front facade! Drag or use adjustments to perfect framing.');
        } else {
          if (panoramaRef.current) {
            panoramaRef.current.setPosition(houseLocation);
            panoramaRef.current.setPov({ heading: 0, pitch: 10 });
          }
          setTelemetry({ heading: 0, pitch: 10, zoom: 1 });
          setHasPanorama(true);
          setStatusMessage('Location loaded. Adjust angle toward the front facade.');
        }
      }
    );
  };

  const handleSearchAddress = (overrideText?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = (overrideText !== undefined ? overrideText : address).trim();
    if (!query) return;

    if (!(window as any).google?.maps) {
      setErrorMessage('Google Maps SDK is not loaded yet. Please wait a moment.');
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    setStatusMessage('Locating address & calculating street view angle…');

    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ address: query }, (results: any[], status: string) => {
      if (status !== 'OK' || !results || !results[0]) {
        setIsSearching(false);
        setStatusMessage(null);
        setErrorMessage(`Could not locate address "${query}". Please check spelling and include city & state.`);
        return;
      }

      const houseLocation = results[0].geometry.location;
      const formattedAddress = results[0].formatted_address;
      handlePlaceResolved(houseLocation, formattedAddress);
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
        
        // Trigger realistic camera shutter flash animation
        setIsShutterActive(true);
        setTimeout(() => {
          onCapture(file);
          setIsCapturing(false);
          setIsShutterActive(false);
          onClose();
        }, 320);
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

            {/* Address Search Form with Google Places Autocomplete */}
            <div className="p-4 bg-[#0D1520] border-b border-[#1E293B] shrink-0">
              <form onSubmit={(e) => handleSearchAddress(undefined, e)} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-[#18A9D9] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Search house address with Google autofill…"
                    className="w-full bg-[#080D14] border border-[#223448] focus:border-[#18A9D9] rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-[#475569] outline-none transition-all shadow-inner"
                    autoComplete="off"
                  />
                  {address.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddress('');
                        inputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white p-1 rounded-md transition-colors"
                      title="Clear address"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
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

              {/* Quick Territory Preset Chips */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 text-[11px] no-scrollbar">
                <span className="text-[#64748B] text-[10px] uppercase font-bold tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#18A9D9]" /> Presets:
                </span>
                {PRESET_ADDRESSES.map((preset) => (
                  <button
                    key={preset.address}
                    type="button"
                    onClick={() => {
                      setAddress(preset.address);
                      handleSearchAddress(preset.address);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#131F2E] hover:bg-[#1E293B] border border-[#223448] hover:border-[#18A9D9]/50 text-[#94A3B8] hover:text-white shrink-0 transition-all text-[11px]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

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

              {/* Camera Shutter Flash Animation */}
              <AnimatePresence>
                {isShutterActive && (
                  <motion.div
                    initial={{ opacity: 0.95 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="absolute inset-0 bg-white z-40 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              {/* Viewfinder Reticle & HUD Overlay */}
              {hasPanorama && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-3 sm:p-5">
                  {/* Live Telemetry HUD (Top-Left) */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-20">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 border border-[#18A9D9]/40 backdrop-blur-md shadow-lg">
                      <Navigation 
                        className="w-3.5 h-3.5 text-[#18A9D9] transition-transform duration-200" 
                        style={{ transform: `rotate(${telemetry.heading}deg)` }} 
                      />
                      <span className="text-[11px] font-mono font-bold text-white tracking-wide">
                        {telemetry.heading}° {getCardinalDirection(telemetry.heading)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 border border-[#223448] backdrop-blur-md text-[11px] font-mono text-[#94A3B8]">
                      <span>Pitch:</span>
                      <span className="text-white font-semibold">
                        {telemetry.pitch > 0 ? `+${telemetry.pitch}°` : `${telemetry.pitch}°`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 border border-[#223448] backdrop-blur-md text-[11px] font-mono text-[#94A3B8]">
                      <span>Zoom:</span>
                      <span className="text-white font-semibold">{telemetry.zoom}x</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-[#18A9D9]/15 border border-[#18A9D9]/30 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#18A9D9]">
                      <Crosshair className="w-3 h-3 animate-pulse" />
                      <span>Target Lock</span>
                    </div>
                  </div>

                  {/* Viewfinder Bounding Box with Corner Reticle Brackets */}
                  <div className="relative w-[85%] h-[80%] max-w-[700px] border border-white/20 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.30)] flex flex-col justify-between p-3.5">
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#18A9D9] rounded-tl-xl -mt-0.5 -ml-0.5" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#18A9D9] rounded-tr-xl -mt-0.5 -mr-0.5" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#18A9D9] rounded-bl-xl -mb-0.5 -ml-0.5" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#18A9D9] rounded-br-xl -mb-0.5 -mr-0.5" />

                    {/* Center Crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                      <div className="w-6 h-0.5 bg-white/60" />
                      <div className="h-6 w-0.5 bg-white/60 absolute" />
                    </div>

                    {/* Viewfinder Label Pill */}
                    <div className="self-end">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#18A9D9] bg-black/70 border border-[#18A9D9]/30 px-2.5 py-0.5 rounded-full backdrop-blur-sm shadow">
                        Facade Framing
                      </span>
                    </div>

                    {/* Guide Caption */}
                    <div className="self-center">
                      <span className="text-[10px] sm:text-xs font-medium text-white/90 bg-black/75 border border-white/10 px-3.5 py-1 rounded-full backdrop-blur-md shadow-lg text-center inline-block">
                        Center roof and siding inside viewfinder · Drag to rotate
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panorama Fine-Tuning Controls Bar */}
            <div className="px-4 py-3 bg-[#0E1622] border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => adjustHeading(-15)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#162334] hover:bg-[#1E2F45] text-white flex items-center gap-1 text-[11px] font-medium transition-colors border border-[#223448] min-h-[38px]"
                  title="Rotate Left 15°"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#18A9D9]" /> -15°
                </button>
                <button
                  type="button"
                  onClick={() => adjustHeading(15)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#162334] hover:bg-[#1E2F45] text-white flex items-center gap-1 text-[11px] font-medium transition-colors border border-[#223448] min-h-[38px]"
                  title="Rotate Right 15°"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#18A9D9]" /> +15°
                </button>
                <button
                  type="button"
                  onClick={() => adjustHeading(180)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#162334] hover:bg-[#1E2F45] text-white flex items-center gap-1.5 text-[11px] font-medium transition-colors border border-[#223448] min-h-[38px]"
                  title="Turn Around 180°"
                >
                  <Repeat className="w-3.5 h-3.5 text-[#38BDF8]" /> 180° Flip
                </button>
                <button
                  type="button"
                  onClick={() => adjustPitch(5)}
                  className="px-2 py-1.5 rounded-lg bg-[#162334] hover:bg-[#1E2F45] text-white flex items-center gap-1 text-[11px] font-medium transition-colors border border-[#223448] min-h-[38px]"
                  title="Tilt Up 5°"
                >
                  <ChevronUp className="w-3.5 h-3.5" /> Up
                </button>
                <button
                  type="button"
                  onClick={() => adjustPitch(-5)}
                  className="px-2 py-1.5 rounded-lg bg-[#162334] hover:bg-[#1E2F45] text-white flex items-center gap-1 text-[11px] font-medium transition-colors border border-[#223448] min-h-[38px]"
                  title="Tilt Down 5°"
                >
                  <ChevronDown className="w-3.5 h-3.5" /> Down
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (panoramaRef.current) {
                      const pov = panoramaRef.current.getPov();
                      panoramaRef.current.setPov({ ...pov, pitch: 0 });
                    }
                  }}
                  className="px-2 py-1.5 rounded-lg bg-[#162334] hover:bg-[#1E2F45] text-white flex items-center gap-1 text-[11px] font-medium transition-colors border border-[#223448] min-h-[38px]"
                  title="Reset Level (0° Pitch)"
                >
                  <Compass className="w-3.5 h-3.5 text-[#34D399]" /> Level
                </button>
                <div className="flex items-center gap-1 border-l border-[#223448] pl-1.5">
                  <button
                    type="button"
                    onClick={() => adjustZoom(1)}
                    className="p-1.5 rounded-lg bg-[#162334] hover:bg-[#1E2F45] text-white transition-colors border border-[#223448] min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#18A9D9]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustZoom(-1)}
                    className="p-1.5 rounded-lg bg-[#162334] hover:bg-[#1E2F45] text-white transition-colors border border-[#223448] min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white bg-[#131F2E] hover:bg-[#1E293B] border border-[#223448] transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={isCapturing || !hasPanorama}
                  className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#83C248] hover:bg-[#93D553] active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(131,194,72,0.45)] flex items-center justify-center gap-2 min-h-[44px]"
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
