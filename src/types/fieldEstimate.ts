/**
 * Types for 4-Sided Field Estimate & Takeoff Engine
 */

export type ElevationSide = 'front' | 'right' | 'rear' | 'left';

export interface ElevationDimensions {
  wallWidthFeet: number;    // e.g. 40
  wallHeightFeet: number;   // e.g. 18 (eaves height)
  gableCount: number;       // 0, 1, 2
  gableWidthFeet: number;   // e.g. 24
  gableHeightFeet: number;  // e.g. 8 (peak above eaves)
}

export interface ElevationOpenings {
  windowsCount: number;     // ~15 sq ft per standard window
  doorsCount: number;       // ~21 sq ft per door
  garageDoorsCount: number; // ~72 sq ft per single garage door
}

export interface ElevationFeatures {
  gableSidingStyle: 'same' | 'shake' | 'board-batten';
  cornerPostsCount: number;    // outside + inside corner posts
  soffitFasciaFeet: number;    // linear feet of fascia & soffit wrap
  shuttersPairs: number;       // pairs of decorative shutters
  guttersLinearFeet: number;   // linear feet of gutters
  roofSquares: number;         // roofing squares for this facet
  roofPitch: string;           // e.g. "6/12"
}

export interface ElevationData {
  side: ElevationSide;
  label: string;
  compassLabel: string;
  photoUrl: string | null;
  renderedUrl: string | null;
  isGenerating: boolean;
  dimensions: ElevationDimensions;
  openings: ElevationOpenings;
  features: ElevationFeatures;
}

export interface ElevationTakeoffResult {
  side: ElevationSide;
  label: string;
  grossWallSqFt: number;
  openingsDeductionSqFt: number;
  netWallSqFt: number;
  mainWallSquares: number;
  gableShakeSquares: number;
  totalSidingSquares: number;
  roofSquares: number;
  cornersCount: number;
  soffitFasciaFeet: number;
  shuttersPairs: number;
  guttersFeet: number;
}

export interface FieldPricingConfig {
  // Selected product tiers
  selectedSidingTier: 1 | 2 | 3;
  selectedRoofingTier: 'standard' | 'pro';

  // Siding materials (installed / square)
  sidingTier1InstalledSq: number;      // CertainTeed MainStreet ($480)
  sidingTier2InstalledSq: number;      // CertainTeed Monogram ($590)
  sidingTier3InstalledSq: number;      // CertainTeed Cedar Impressions Shakes ($880)
  sidingBoardBattenInstalledSq: number;// CertainTeed CedarBoards B&B ($720)
  
  // Roofing installed / square
  roofingInstalledSq: number;          // CertainTeed Landmark ($495)
  roofingProInstalledSq: number;       // CertainTeed Landmark PRO ($565)

  // Accessories & trim
  cornerPostEach: number;              // $35
  soffitFasciaLinearFoot: number;      // $14
  shutterPairInstalled: number;        // $185
  gutterLinearFoot: number;            // $18

  // General & site fees
  tearOffDisposalDumpster: number;     // $950
  permitFeeAllowance: number;          // $350

  // Waste factor percentage
  wasteFactorPercent: number;          // 10% or 15%
}

export interface ProjectTakeoffSummary {
  elevations: ElevationTakeoffResult[];
  totalMainSidingSquares: number;
  totalGableShakeSquares: number;
  totalSidingSquares: number;
  totalRoofSquares: number;
  totalCornersCount: number;
  totalSoffitFasciaFeet: number;
  totalShuttersPairs: number;
  totalGuttersFeet: number;

  // Cost breakdown (cents / dollars)
  mainSidingCost: number;
  gableShakeCost: number;
  roofingCost: number;
  cornersCost: number;
  soffitFasciaCost: number;
  shuttersCost: number;
  guttersCost: number;
  siteFeesCost: number;

  // Total estimate range
  targetTotalCost: number;
  lowEstimateCost: number;
  highEstimateCost: number;
}
