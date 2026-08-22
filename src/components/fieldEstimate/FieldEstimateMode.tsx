import React, { useState, useRef, useEffect } from 'react';
import {
  ElevationData,
  ElevationSide,
  FieldPricingConfig,
} from '../../types/fieldEstimate';
import { SpringValleyRole, ROLE_PERMISSIONS } from '../../types/auth';
import {
  INITIAL_ELEVATIONS,
  DEFAULT_FIELD_PRICING,
} from '../../constants/fieldPricingDefaults';
import {
  calculateElevationTakeoff,
  calculateProjectSummary,
  formatDollar,
} from '../../utils/takeoffEngine';
import { PricingSettingsModal } from './PricingSettingsModal';
import { TakeoffSummaryModal } from './TakeoffSummaryModal';
import {
  Camera,
  Upload,
  Sparkles,
  Settings,
  FileSpreadsheet,
  ChevronRight,
  RotateCcw,
  Palette,
  Building2,
  Layers,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'sv-field-estimate-draft';

const createElevationPlaceholderSvg = (label: string, compass: string, color: string = '#18A9D9') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="#0B131E">
    <rect width="800" height="600" fill="#0B131E"/>
    <defs>
      <pattern id="grid-${label.replace(/\s+/g, '')}" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A2838" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="600" fill="url(#grid-${label.replace(/\s+/g, '')})" />
    <!-- Roof Gable -->
    <polygon points="400,110 140,290 660,290" fill="#131F2E" stroke="${color}" stroke-width="3"/>
    <!-- House Main Elevation Wall -->
    <rect x="170" y="290" width="460" height="230" fill="#131F2E" stroke="${color}" stroke-width="3"/>
    <!-- Windows -->
    <rect x="220" y="330" width="65" height="75" fill="#0B131E" stroke="${color}" stroke-width="2" rx="4"/>
    <rect x="515" y="330" width="65" height="75" fill="#0B131E" stroke="${color}" stroke-width="2" rx="4"/>
    <!-- Center Door or Accent -->
    <rect x="365" y="380" width="70" height="140" fill="#0B131E" stroke="${color}" stroke-width="2" rx="4"/>
    <!-- Dimension Marker Lines -->
    <line x1="170" y1="540" x2="630" y2="540" stroke="#69727D" stroke-width="1.5" stroke-dasharray="4"/>
    <!-- Labels -->
    <text x="400" y="570" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
      ${label} (${compass}) — Field Elevation Model
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

interface Props {
  onBackToStudio?: () => void;
  activeSidingColorName?: string;
  activeRoofingColorName?: string;
  activeRole?: SpringValleyRole;
}

export const FieldEstimateMode: React.FC<Props> = ({
  onBackToStudio,
  activeSidingColorName = 'Monogram Flagstone',
  activeRoofingColorName = 'Landmark Moire Black',
  activeRole = 'Owner',
}) => {
  const [restoredFromDraft, setRestoredFromDraft] = useState(false);

  // Initialize elevations from localStorage if available
  const [elevations, setElevations] = useState<ElevationData[]>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.elevations && Array.isArray(parsed.elevations) && parsed.elevations.length === 4) {
          return parsed.elevations;
        }
      }
    } catch (e) {
      // Fallback
    }
    return INITIAL_ELEVATIONS;
  });

  const [activeSide, setActiveSide] = useState<ElevationSide>('front');

  // Initialize pricing from localStorage if available
  const [pricing, setPricing] = useState<FieldPricingConfig>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pricing) {
          return { ...DEFAULT_FIELD_PRICING, ...parsed.pricing };
        }
      }
    } catch (e) {
      // Fallback
    }
    return DEFAULT_FIELD_PRICING;
  });

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check on mount if restored from draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        setRestoredFromDraft(true);
        const timer = setTimeout(() => setRestoredFromDraft(false), 3500);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, []);

  // Save changes to localStorage (stripping large image URLs to stay safely within localStorage limits)
  useEffect(() => {
    try {
      const strippedElevations = elevations.map(({ photoUrl, renderedUrl, ...rest }) => ({
        ...rest,
        photoUrl: photoUrl && photoUrl.startsWith('data:image/svg') ? photoUrl : null,
        renderedUrl: renderedUrl && renderedUrl.startsWith('data:image/svg') ? renderedUrl : null,
      }));
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          elevations: strippedElevations,
          pricing,
          updatedAt: Date.now(),
        })
      );
    } catch (e) {
      // Ignore quota errors
    }
  }, [elevations, pricing]);

  const activeElevation =
    elevations.find((e) => e.side === activeSide) || elevations[0];

  const currentTakeoff = calculateElevationTakeoff(
    activeElevation,
    pricing.wasteFactorPercent
  );
  const projectSummary = calculateProjectSummary(elevations, pricing);
  const permissions = ROLE_PERMISSIONS[activeRole];

  // Update specific fields on active elevation
  const updateActiveElevation = (updater: (prev: ElevationData) => ElevationData) => {
    setElevations((prev) =>
      prev.map((el) => (el.side === activeSide ? updater(el) : el))
    );
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      updateActiveElevation((prev) => ({
        ...prev,
        photoUrl: url,
        renderedUrl: null, // Reset rendered until visualized
      }));
    };
    reader.readAsDataURL(file);
  };

  // Trigger Mock or AI Visualization for this elevation
  const handleVisualizeElevation = () => {
    updateActiveElevation((prev) => ({ ...prev, isGenerating: true }));

    setTimeout(() => {
      updateActiveElevation((prev) => ({
        ...prev,
        isGenerating: false,
        renderedUrl:
          prev.photoUrl ||
          createElevationPlaceholderSvg(prev.label, prev.compassLabel, '#83C248'),
      }));
    }, 900);
  };

  // Load sample data for all 4 sides without external image dependencies
  const handleLoadSampleHome = () => {
    const sampleElevations: ElevationData[] = [
      {
        side: 'front',
        label: 'Front Elevation',
        compassLabel: 'North Facing',
        photoUrl: createElevationPlaceholderSvg('Front Elevation', 'North Facing', '#18A9D9'),
        renderedUrl: createElevationPlaceholderSvg('Front Elevation', 'North Facing', '#83C248'),
        isGenerating: false,
        dimensions: {
          wallWidthFeet: 40,
          wallHeightFeet: 18,
          gableCount: 1,
          gableWidthFeet: 20,
          gableHeightFeet: 8,
        },
        openings: {
          windowsCount: 4,
          doorsCount: 1,
          garageDoorsCount: 0,
        },
        features: {
          roofSquares: 14,
          roofPitch: '6/12',
          cornerPostsCount: 4,
          soffitFasciaFeet: 80,
          shuttersPairs: 4,
          guttersLinearFeet: 40,
          gableSidingStyle: 'shake',
        },
      },
      {
        side: 'right',
        label: 'Right Elevation',
        compassLabel: 'East Facing',
        photoUrl: createElevationPlaceholderSvg('Right Elevation', 'East Facing', '#18A9D9'),
        renderedUrl: createElevationPlaceholderSvg('Right Elevation', 'East Facing', '#83C248'),
        isGenerating: false,
        dimensions: {
          wallWidthFeet: 30,
          wallHeightFeet: 18,
          gableCount: 0,
          gableWidthFeet: 0,
          gableHeightFeet: 0,
        },
        openings: {
          windowsCount: 2,
          doorsCount: 0,
          garageDoorsCount: 0,
        },
        features: {
          roofSquares: 8,
          roofPitch: '6/12',
          cornerPostsCount: 2,
          soffitFasciaFeet: 60,
          shuttersPairs: 0,
          guttersLinearFeet: 30,
          gableSidingStyle: 'same',
        },
      },
      {
        side: 'rear',
        label: 'Rear Elevation',
        compassLabel: 'South Facing',
        photoUrl: createElevationPlaceholderSvg('Rear Elevation', 'South Facing', '#18A9D9'),
        renderedUrl: createElevationPlaceholderSvg('Rear Elevation', 'South Facing', '#83C248'),
        isGenerating: false,
        dimensions: {
          wallWidthFeet: 40,
          wallHeightFeet: 18,
          gableCount: 1,
          gableWidthFeet: 18,
          gableHeightFeet: 7,
        },
        openings: {
          windowsCount: 6,
          doorsCount: 1,
          garageDoorsCount: 0,
        },
        features: {
          roofSquares: 14,
          roofPitch: '6/12',
          cornerPostsCount: 4,
          soffitFasciaFeet: 80,
          shuttersPairs: 0,
          guttersLinearFeet: 40,
          gableSidingStyle: 'same',
        },
      },
      {
        side: 'left',
        label: 'Left Elevation',
        compassLabel: 'West Facing',
        photoUrl: createElevationPlaceholderSvg('Left Elevation', 'West Facing', '#18A9D9'),
        renderedUrl: createElevationPlaceholderSvg('Left Elevation', 'West Facing', '#83C248'),
        isGenerating: false,
        dimensions: {
          wallWidthFeet: 30,
          wallHeightFeet: 18,
          gableCount: 0,
          gableWidthFeet: 0,
          gableHeightFeet: 0,
        },
        openings: {
          windowsCount: 1,
          doorsCount: 0,
          garageDoorsCount: 1,
        },
        features: {
          roofSquares: 8,
          roofPitch: '6/12',
          cornerPostsCount: 2,
          soffitFasciaFeet: 60,
          shuttersPairs: 0,
          guttersLinearFeet: 30,
          gableSidingStyle: 'same',
        },
      },
    ];

    setElevations(sampleElevations);
  };

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}
    setElevations(INITIAL_ELEVATIONS);
    setPricing(DEFAULT_FIELD_PRICING);
  };

  return (
    <div className="min-h-screen bg-[#0B131E] text-white flex flex-col font-sans pb-28 selection:bg-[#18A9D9] selection:text-white">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ──────── TOP BANNER & PROGRESS ──────── */}
      <div className="bg-[#131F2E] border-b border-[#223448] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#18A9D9]/20 border border-[#18A9D9]/40 text-[#42C2ED] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Field Takeoff Mode
              </span>
              <span className="text-xs text-[#9BA8B8]">
                PA HIC #PA149822 · CertainTeed Certified
              </span>
              {restoredFromDraft && (
                <span className="bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-fade-in flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Draft restored
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              4-Sided House Dimension & Material Takeoff Estimator
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleLoadSampleHome}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#D0D7DE] bg-[#0B131E] hover:bg-[#1A2838] border border-[#223448] transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-[#18A9D9]" /> Load 4-Side Sample
            </button>
            <button
              onClick={handleClearDraft}
              title="Reset all measurements to defaults"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#9BA8B8] hover:text-[#E5534B] bg-[#0B131E] hover:bg-[#1A2838] border border-[#223448] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Draft
            </button>
            {permissions.canEditEstimates && (
              <button
                onClick={() => setShowPricingModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#D0D7DE] bg-[#0B131E] hover:bg-[#1A2838] border border-[#223448] transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-[#83C248]" /> Pricing Rates
              </button>
            )}
            {onBackToStudio && (
              <button
                onClick={onBackToStudio}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#18A9D9] hover:bg-[#0DA7E3] transition-colors shadow-md"
              >
                <Palette className="w-3.5 h-3.5" /> Studio Visualizer
              </button>
            )}
          </div>
        </div>

        {/* 4 Elevations Navigation Bar */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-[#223448]/60 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {elevations.map((el) => {
            const isActive = el.side === activeSide;
            const hasPhoto = el.photoUrl !== null;
            return (
              <button
                key={el.side}
                onClick={() => setActiveSide(el.side)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between ${
                  isActive
                    ? 'bg-[#18A9D9]/15 border-[#18A9D9] shadow-[0_0_15px_rgba(24,169,217,0.2)]'
                    : 'bg-[#0B131E]/80 border-[#223448] hover:border-[#334D6B]'
                }`}
              >
                <div>
                  <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    {el.label}
                    {hasPhoto && <CheckCircle2 className="w-3.5 h-3.5 text-[#83C248]" />}
                  </div>
                  <div className="text-[11px] text-[#9BA8B8]">{el.compassLabel}</div>
                </div>
                <span className="text-lg opacity-80">
                  {el.side === 'front' ? '🏠' : el.side === 'rear' ? '🌳' : '📐'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────── MAIN SPLIT WORKSPACE ──────── */}
      <div className="max-w-7xl mx-auto px-6 py-6 w-full grid lg:grid-cols-12 gap-6 flex-1">
        
        {/* LEFT COLUMN: Elevation Photo & Visualizer (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#131F2E] border border-[#223448] rounded-2xl p-5 flex flex-col flex-1 shadow-lg">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#18A9D9]" />
                <h2 className="text-base font-extrabold text-white">{activeElevation.label}</h2>
                <span className="text-xs text-[#9BA8B8]">({activeElevation.compassLabel})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#D0D7DE] bg-[#0B131E] hover:bg-[#1A2838] border border-[#223448] transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-[#18A9D9]" /> {activeElevation.photoUrl ? 'Replace Photo' : 'Upload Photo'}
                </button>
              </div>
            </div>

            {/* Visualizer Canvas Area */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0B131E] border border-[#223448] flex items-center justify-center group mb-4">
              {activeElevation.photoUrl ? (
                <>
                  <img
                    src={activeElevation.renderedUrl || activeElevation.photoUrl}
                    alt={activeElevation.label}
                    className="w-full h-full object-contain"
                  />
                  {activeElevation.isGenerating && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                      <div className="w-10 h-10 border-3 border-[#18A9D9] border-t-transparent rounded-full animate-spin mb-3" />
                      <div className="text-sm font-bold text-white">Rendering CertainTeed Exterior...</div>
                      <div className="text-xs text-[#9BA8B8] mt-1">Applying {activeSidingColorName} & {activeRoofingColorName}</div>
                    </div>
                  )}
                  {activeElevation.renderedUrl && !activeElevation.isGenerating && (
                    <div className="absolute top-3 left-3 bg-[#0B131E]/90 backdrop-blur-md border border-[#223448] px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#83C248] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#83C248]" /> CertainTeed Visualized
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-8 max-w-sm">
                  <div className="w-16 h-16 rounded-2xl bg-[#131F2E] border border-[#223448] flex items-center justify-center text-[#18A9D9] mx-auto mb-4">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Upload {activeElevation.label} Photo
                  </h3>
                  <p className="text-xs text-[#9BA8B8] mb-4 leading-relaxed">
                    Snap a photo of the {activeElevation.compassLabel.toLowerCase()} on-site or choose from your device gallery.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#18A9D9] hover:bg-[#0DA7E3] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Upload Photo
                  </button>
                </div>
              )}
            </div>

            {/* Visualizer Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-[#9BA8B8]">
                <span className="font-semibold text-white">Active Palette:</span>
                <span className="text-[#42C2ED]">{activeSidingColorName}</span> · <span className="text-[#83C248]">{activeRoofingColorName}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleVisualizeElevation}
                  disabled={activeElevation.isGenerating}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md bg-gradient-to-r from-[#18A9D9] to-[#0DA7E3] hover:from-[#42C2ED] hover:to-[#18A9D9]"
                >
                  <Sparkles className="w-4 h-4" /> Visualize This Side
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Dimension & Feature Takeoff Editor (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#131F2E] border border-[#223448] rounded-2xl p-5 flex flex-col flex-1 shadow-lg overflow-y-auto">
            
            <div className="flex items-center justify-between mb-4 border-b border-[#223448] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white">Elevation Dimensions & Features</h3>
                <p className="text-[11px] text-[#9BA8B8]">Adjust measurements to calculate exact square footage.</p>
              </div>
              <div className="bg-[#18A9D9]/15 border border-[#18A9D9]/30 text-[#42C2ED] text-xs font-bold px-2.5 py-1 rounded-lg">
                {currentTakeoff.totalSidingSquares} Sq Siding
              </div>
            </div>

            {/* Step 1: Base Wall Dimensions */}
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-[#18A9D9] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> 1. Base Wall Geometry
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Wall Width (ft):</label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={activeElevation.dimensions.wallWidthFeet}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          dimensions: { ...p.dimensions, wallWidthFeet: Math.max(0, Math.min(200, val)) },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Eaves Height (ft):</label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={activeElevation.dimensions.wallHeightFeet}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          dimensions: { ...p.dimensions, wallHeightFeet: Math.max(0, Math.min(200, val)) },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Upper Gables & Dormers */}
              <div className="border-t border-[#223448] pt-3.5">
                <div className="text-xs font-bold text-[#18A9D9] uppercase tracking-wider mb-2.5">
                  2. Upper Gables & Accent Siding
                </div>
                <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Gable Count:</label>
                    <select
                      value={activeElevation.dimensions.gableCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          dimensions: { ...p.dimensions, gableCount: val },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-2 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    >
                      <option value={0}>0 (Flat / Hip)</option>
                      <option value={1}>1 Gable</option>
                      <option value={2}>2 Gables</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Gable Width (ft):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={activeElevation.dimensions.gableWidthFeet}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          dimensions: { ...p.dimensions, gableWidthFeet: Math.max(0, Math.min(100, val)) },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-2 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                      disabled={activeElevation.dimensions.gableCount === 0}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Peak Height (ft):</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={activeElevation.dimensions.gableHeightFeet}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          dimensions: { ...p.dimensions, gableHeightFeet: Math.max(0, Math.min(50, val)) },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-2 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                      disabled={activeElevation.dimensions.gableCount === 0}
                    />
                  </div>
                </div>

                {activeElevation.dimensions.gableCount > 0 && (
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Gable Siding Style:</label>
                    <select
                      value={activeElevation.features.gableSidingStyle}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        updateActiveElevation((p) => ({
                          ...p,
                          features: { ...p.features, gableSidingStyle: val },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-[#83C248] font-semibold focus:border-[#83C248] focus:outline-none"
                    >
                      <option value="same">Same as Main (Lap Siding)</option>
                      <option value="shake">Cedar Impressions® Shakes Accent</option>
                      <option value="board-batten">CedarBoards™ Board & Batten Accent</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Step 3: Openings Deductions */}
              <div className="border-t border-[#223448] pt-3.5">
                <div className="text-xs font-bold text-[#E5534B] uppercase tracking-wider mb-2.5">
                  3. Openings & Deductions
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Windows (15 sq ft):</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={activeElevation.openings.windowsCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          openings: { ...p.openings, windowsCount: Math.max(0, Math.min(20, val)) },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Doors (21 sq ft):</label>
                    <input
                      type="number"
                      min="0"
                      max="6"
                      value={activeElevation.openings.doorsCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          openings: { ...p.openings, doorsCount: Math.max(0, Math.min(6, val)) },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Garage Doors:</label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      value={activeElevation.openings.garageDoorsCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          openings: { ...p.openings, garageDoorsCount: Math.max(0, Math.min(4, val)) },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Trim, Gutters & Roofing Facets */}
              <div className="border-t border-[#223448] pt-3.5">
                <div className="text-xs font-bold text-[#83C248] uppercase tracking-wider mb-2.5">
                  4. Roofing & Trim Accessories
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Roof (Squares):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={activeElevation.features.roofSquares}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          features: { ...p.features, roofSquares: Math.max(0, Math.min(100, val)) },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#83C248] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Corner Posts (ea):</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={activeElevation.features.cornerPostsCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          features: { ...p.features, cornerPostsCount: Math.max(0, Math.min(20, val)) },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Soffit/Fascia (ft):</label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={activeElevation.features.soffitFasciaFeet}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          features: { ...p.features, soffitFasciaFeet: Math.max(0, Math.min(500, val)) },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Gutters (lin ft):</label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={activeElevation.features.guttersLinearFeet}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          features: { ...p.features, guttersLinearFeet: Math.max(0, Math.min(500, val)) },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Shutters (pairs):</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={activeElevation.features.shuttersPairs}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          features: { ...p.features, shuttersPairs: Math.max(0, Math.min(20, val)) },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Side Summary Strip */}
              <div className="bg-[#0B131E] border border-[#223448] rounded-xl p-3.5 mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-[10px] text-[#9BA8B8]">Gross Wall Area</div>
                  <div className="font-bold text-white">{currentTakeoff.grossWallSqFt} sq ft</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#E5534B]">Deductions</div>
                  <div className="font-bold text-[#E5534B]">-{currentTakeoff.openingsDeductionSqFt} sq ft</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#18A9D9]">Takeoff Siding</div>
                  <div className="font-black text-[#18A9D9]">{currentTakeoff.totalSidingSquares} Sq</div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* ──────── BOTTOM FLOATING ACTION BAR ──────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E1620]/95 backdrop-blur-xl border-t border-[#223448] px-6 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* House Totals */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#83C248] animate-pulse" />
              <span className="font-bold text-white">4-Side Totals:</span>
            </div>
            <div className="font-mono text-xs flex items-center gap-2">
              <span className="text-[#18A9D9] font-bold">{projectSummary.totalSidingSquares} Sq Siding</span>
              <span className="text-[#69727D]">|</span>
              <span className="text-[#83C248] font-bold">{projectSummary.totalRoofSquares} Sq Roof</span>
              {permissions.canViewFinancials && (
                <>
                  <span className="text-[#69727D]">|</span>
                  <span className="text-white font-extrabold">Est. {formatDollar(projectSummary.targetTotalCost)}</span>
                </>
              )}
            </div>
          </div>

          {/* Product Tier Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-[#131F2E] border border-[#223448] rounded-xl px-2.5 py-1">
              <span className="text-[10px] uppercase font-bold text-[#18A9D9] whitespace-nowrap">Siding:</span>
              <select
                value={pricing.selectedSidingTier || 2}
                onChange={(e) => {
                  const val = parseInt(e.target.value) as 1 | 2 | 3;
                  setPricing((prev) => ({ ...prev, selectedSidingTier: val }));
                }}
                className="bg-[#0B131E] border border-[#223448] text-white text-xs rounded-lg px-2 py-1 font-medium focus:border-[#18A9D9] focus:outline-none"
              >
                <option value={1}>MainStreet (Tier 1 · $480/Sq)</option>
                <option value={2}>Monogram Premium (Tier 2 · $590/Sq)</option>
                <option value={3}>Cedar Impressions (Tier 3 · $880/Sq)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#131F2E] border border-[#223448] rounded-xl px-2.5 py-1">
              <span className="text-[10px] uppercase font-bold text-[#83C248] whitespace-nowrap">Roof:</span>
              <select
                value={pricing.selectedRoofingTier || 'standard'}
                onChange={(e) => {
                  const val = e.target.value as 'standard' | 'pro';
                  setPricing((prev) => ({ ...prev, selectedRoofingTier: val }));
                }}
                className="bg-[#0B131E] border border-[#223448] text-white text-xs rounded-lg px-2 py-1 font-medium focus:border-[#83C248] focus:outline-none"
              >
                <option value="standard">CertainTeed Landmark ($495/Sq)</option>
                <option value="pro">Landmark PRO Max Def ($565/Sq)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {permissions.canEditEstimates && (
              <button
                onClick={() => setShowPricingModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#D0D7DE] bg-[#131F2E] hover:bg-[#1A2838] border border-[#223448] transition-colors flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5 text-[#83C248]" /> Rates
              </button>
            )}
            <button
              onClick={() => setShowSummaryModal(true)}
              className="bg-gradient-to-r from-[#83C248] to-[#72AD3C] hover:from-[#93D553] hover:to-[#83C248] text-white px-5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-[0_0_20px_rgba(131,194,72,0.3)] flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" /> Full 4-Side Takeoff <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Modals */}
      {showPricingModal && (
        <PricingSettingsModal
          pricing={pricing}
          onSave={(newRates) => setPricing(newRates)}
          onClose={() => setShowPricingModal(false)}
        />
      )}

      {showSummaryModal && (
        <TakeoffSummaryModal
          elevations={elevations}
          summary={projectSummary}
          pricing={pricing}
          onClose={() => setShowSummaryModal(false)}
          activeRole={activeRole}
        />
      )}
    </div>
  );
};
