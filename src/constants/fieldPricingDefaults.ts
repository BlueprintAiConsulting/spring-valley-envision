import { FieldPricingConfig, ElevationData } from '../types/fieldEstimate';

/**
 * Spring Valley Roofing — Certified Contractor Benchmark Pricing Defaults
 * (West Chester & Pottstown, PA Region)
 */
export const DEFAULT_FIELD_PRICING: FieldPricingConfig = {
  // Siding installed rate per square (Materials + Labor + Warranty)
  sidingTier1InstalledSq: 480,       // CertainTeed MainStreet
  sidingTier2InstalledSq: 590,       // CertainTeed Monogram Premium
  sidingTier3InstalledSq: 880,       // CertainTeed Cedar Impressions Shakes
  sidingBoardBattenInstalledSq: 720, // CertainTeed CedarBoards Board & Batten

  // Roofing installed rate per square (CertainTeed Integrity Roof System)
  roofingInstalledSq: 495,           // CertainTeed Landmark
  roofingProInstalledSq: 565,        // CertainTeed Landmark PRO

  // Trim, corners & accessories
  cornerPostEach: 35,
  soffitFasciaLinearFoot: 14,
  shutterPairInstalled: 185,
  gutterLinearFoot: 18,

  // General & site fees
  tearOffDisposalDumpster: 950,
  permitFeeAllowance: 350,

  // Standard siding cut waste allowance
  wasteFactorPercent: 10,
};

/**
 * Initial empty template for all 4 elevations of a house
 */
export const INITIAL_ELEVATIONS: ElevationData[] = [
  {
    side: 'front',
    label: 'Front Elevation',
    compassLabel: 'North / Street View',
    photoUrl: null,
    renderedUrl: null,
    isGenerating: false,
    dimensions: {
      stories: 2,
      wallWidthFeet: 36,
      wallHeightFeet: 18,
      gableCount: 1,
      gableWidthFeet: 20,
      gableHeightFeet: 7,
    },
    openings: {
      windowsCount: 6,
      doorsCount: 1,
      garageDoorsCount: 0,
    },
    features: {
      gableSidingStyle: 'shake',
      cornerPostsCount: 2,
      soffitFasciaFeet: 36,
      shuttersPairs: 4,
      guttersLinearFeet: 36,
      roofSquares: 8,
      roofPitch: '6/12',
    },
  },
  {
    side: 'right',
    label: 'Right Elevation',
    compassLabel: 'East / Side View',
    photoUrl: null,
    renderedUrl: null,
    isGenerating: false,
    dimensions: {
      stories: 2,
      wallWidthFeet: 28,
      wallHeightFeet: 18,
      gableCount: 1,
      gableWidthFeet: 28,
      gableHeightFeet: 8,
    },
    openings: {
      windowsCount: 3,
      doorsCount: 0,
      garageDoorsCount: 1,
    },
    features: {
      gableSidingStyle: 'same',
      cornerPostsCount: 2,
      soffitFasciaFeet: 28,
      shuttersPairs: 0,
      guttersLinearFeet: 28,
      roofSquares: 7,
      roofPitch: '6/12',
    },
  },
  {
    side: 'rear',
    label: 'Rear Elevation',
    compassLabel: 'South / Backyard View',
    photoUrl: null,
    renderedUrl: null,
    isGenerating: false,
    dimensions: {
      stories: 2,
      wallWidthFeet: 36,
      wallHeightFeet: 18,
      gableCount: 0,
      gableWidthFeet: 0,
      gableHeightFeet: 0,
    },
    openings: {
      windowsCount: 5,
      doorsCount: 1,
      garageDoorsCount: 0,
    },
    features: {
      gableSidingStyle: 'same',
      cornerPostsCount: 2,
      soffitFasciaFeet: 36,
      shuttersPairs: 2,
      guttersLinearFeet: 36,
      roofSquares: 8,
      roofPitch: '6/12',
    },
  },
  {
    side: 'left',
    label: 'Left Elevation',
    compassLabel: 'West / Side View',
    photoUrl: null,
    renderedUrl: null,
    isGenerating: false,
    dimensions: {
      stories: 2,
      wallWidthFeet: 28,
      wallHeightFeet: 18,
      gableCount: 1,
      gableWidthFeet: 28,
      gableHeightFeet: 8,
    },
    openings: {
      windowsCount: 2,
      doorsCount: 1,
      garageDoorsCount: 0,
    },
    features: {
      gableSidingStyle: 'same',
      cornerPostsCount: 2,
      soffitFasciaFeet: 28,
      shuttersPairs: 0,
      guttersLinearFeet: 28,
      roofSquares: 7,
      roofPitch: '6/12',
    },
  },
];
