import React, { useState, useRef } from 'react';
import {
  ElevationData,
  ElevationSide,
  FieldPricingConfig,
} from '../../types/fieldEstimate';
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
  Check,
  ChevronRight,
  RotateCcw,
  Palette,
  Eye,
  Building2,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  onBackToStudio?: () => void;
  activeSidingColorName?: string;
  activeRoofingColorName?: string;
}

export const FieldEstimateMode: React.FC<Props> = ({
  onBackToStudio,
  activeSidingColorName = 'Monogram Flagstone',
  activeRoofingColorName = 'Landmark Moire Black',
}) => {
  const [elevations, setElevations] = useState<ElevationData[]>(INITIAL_ELEVATIONS);
  const [activeSide, setActiveSide] = useState<ElevationSide>('front');
  const [pricing, setPricing] = useState<FieldPricingConfig>(DEFAULT_FIELD_PRICING);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeElevation =
    elevations.find((e) => e.side === activeSide) || elevations[0];

  const currentTakeoff = calculateElevationTakeoff(
    activeElevation,
    pricing.wasteFactorPercent
  );
  const projectSummary = calculateProjectSummary(elevations, pricing);

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
        renderedUrl: prev.photoUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      }));
    }, 1200);
  };

  // Load sample photos for all 4 sides with 1 click
  const handleLoadSampleHome = () => {
    const samples = [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    ];

    setElevations((prev) =>
      prev.map((el, i) => ({
        ...el,
        photoUrl: samples[i % samples.length],
        renderedUrl: samples[i % samples.length],
      }))
    );
  };

  const capturedCount = elevations.filter((e) => e.photoUrl !== null).length;

  return (
    <div className="min-h-screen bg-[#0B131E] text-white flex flex-col font-sans pb-24 selection:bg-[#18A9D9] selection:text-white">
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
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              4-Sided House Dimension & Material Takeoff Estimator
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadSampleHome}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#D0D7DE] bg-[#0B131E] hover:bg-[#1A2838] border border-[#223448] transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-[#18A9D9]" /> Load 4-Side Sample Home
            </button>
            <button
              onClick={() => setShowPricingModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#D0D7DE] bg-[#0B131E] hover:bg-[#1A2838] border border-[#223448] transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-[#83C248]" /> Pricing Rates
            </button>
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
                  <Camera className="w-3.5 h-3.5 text-[#18A9D9]" /> Change Photo
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
                    className="w-full h-full object-cover"
                  />
                  {activeElevation.isGenerating && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                      <div className="w-10 h-10 border-3 border-[#18A9D9] border-t-transparent rounded-full animate-spin mb-3" />
                      <div className="text-sm font-bold text-white">Rendering CertainTeed Exterior AI...</div>
                      <div className="text-xs text-[#9BA8B8] mt-1">Applying {activeSidingColorName} & {activeRoofingColorName}</div>
                    </div>
                  )}
                  {activeElevation.renderedUrl && !activeElevation.isGenerating && (
                    <div className="absolute top-3 left-3 bg-[#0B131E]/80 backdrop-blur-md border border-[#223448] px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#83C248] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#83C248]" /> AI CertainTeed Rendered
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
                <span className="font-semibold text-white">Active Design:</span>
                <span className="text-[#42C2ED]">{activeSidingColorName}</span> · <span className="text-[#83C248]">{activeRoofingColorName}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleVisualizeElevation}
                  disabled={!activeElevation.photoUrl || activeElevation.isGenerating}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                    !activeElevation.photoUrl
                      ? 'bg-[#1A2838] text-[#69727D] cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#83C248] to-[#72AD3C] hover:from-[#93D553] hover:to-[#83C248]'
                  }`}
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
                      value={activeElevation.dimensions.wallWidthFeet}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          dimensions: { ...p.dimensions, wallWidthFeet: val },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Eaves Height (ft):</label>
                    <input
                      type="number"
                      value={activeElevation.dimensions.wallHeightFeet}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          dimensions: { ...p.dimensions, wallHeightFeet: val },
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
                      value={activeElevation.dimensions.gableWidthFeet}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          dimensions: { ...p.dimensions, gableWidthFeet: val },
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
                      value={activeElevation.dimensions.gableHeightFeet}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          dimensions: { ...p.dimensions, gableHeightFeet: val },
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
                      <option value="same">Same as Main (Monogram Lap Siding)</option>
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
                      value={activeElevation.openings.windowsCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          openings: { ...p.openings, windowsCount: val },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Doors (21 sq ft):</label>
                    <input
                      type="number"
                      value={activeElevation.openings.doorsCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          openings: { ...p.openings, doorsCount: val },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Garage Doors:</label>
                    <input
                      type="number"
                      value={activeElevation.openings.garageDoorsCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          openings: { ...p.openings, garageDoorsCount: val },
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
                  4. Roofing & Accessories
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Roof (Squares):</label>
                    <input
                      type="number"
                      value={activeElevation.features.roofSquares}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          features: { ...p.features, roofSquares: val },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#83C248] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Gutters (lin ft):</label>
                    <input
                      type="number"
                      value={activeElevation.features.guttersLinearFeet}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          features: { ...p.features, guttersLinearFeet: val },
                        }));
                      }}
                      className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#18A9D9] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#9BA8B8] mb-1">Shutters (pairs):</label>
                    <input
                      type="number"
                      value={activeElevation.features.shuttersPairs}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        updateActiveElevation((p) => ({
                          ...p,
                          features: { ...p.features, shuttersPairs: val },
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
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E1620]/95 backdrop-blur-xl border-t border-[#223448] px-6 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#83C248] animate-pulse" />
              <span className="font-bold text-white">4-Side House Total:</span>
            </div>
            <div className="font-mono text-sm">
              <span className="text-[#18A9D9] font-bold">{projectSummary.totalSidingSquares} Sq Siding</span>
              <span className="text-[#69727D] mx-2">|</span>
              <span className="text-[#83C248] font-bold">{projectSummary.totalRoofSquares} Sq Roof</span>
              <span className="text-[#69727D] mx-2">|</span>
              <span className="text-white font-extrabold">Est. {formatDollar(projectSummary.targetTotalCost)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPricingModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#D0D7DE] bg-[#131F2E] hover:bg-[#1A2838] border border-[#223448] transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-[#83C248]" /> Rates
            </button>
            <button
              onClick={() => setShowSummaryModal(true)}
              className="bg-gradient-to-r from-[#83C248] to-[#72AD3C] hover:from-[#93D553] hover:to-[#83C248] text-white px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-[0_0_20px_rgba(131,194,72,0.3)] flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Full 4-Side Takeoff & Estimate <ChevronRight className="w-4 h-4" />
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
        />
      )}
    </div>
  );
};
