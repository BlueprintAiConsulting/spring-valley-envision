import {
  ElevationData,
  ElevationTakeoffResult,
  FieldPricingConfig,
  ProjectTakeoffSummary,
} from '../types/fieldEstimate';

/**
 * Computes architectural dimensions and takeoff squares for a single elevation.
 */
export function calculateElevationTakeoff(
  elevation: ElevationData,
  wastePercent: number = 10
): ElevationTakeoffResult {
  const { dimensions, openings, features } = elevation;

  // 1. Rectangular base wall area
  const baseWallSqFt = (dimensions.wallWidthFeet || 0) * (dimensions.wallHeightFeet || 0);

  // 2. Triangular gables area: 0.5 * Width * Height * Count
  const gablesSqFt =
    (dimensions.gableCount || 0) *
    0.5 *
    (dimensions.gableWidthFeet || 0) *
    (dimensions.gableHeightFeet || 0);

  const grossWallSqFt = baseWallSqFt + gablesSqFt;

  // 3. Deductions: standard window (15 sq ft), door (21 sq ft), garage door (72 sq ft)
  const windowDeduction = (openings.windowsCount || 0) * 15;
  const doorDeduction = (openings.doorsCount || 0) * 21;
  const garageDeduction = (openings.garageDoorsCount || 0) * 72;
  const openingsDeductionSqFt = windowDeduction + doorDeduction + garageDeduction;

  // 4. Net Wall Area
  const netWallSqFt = Math.max(0, grossWallSqFt - openingsDeductionSqFt);

  // 5. Waste multiplier (e.g. 10% = 1.10)
  const wasteMultiplier = 1 + (wastePercent || 10) / 100;
  const totalSidingSquares = parseFloat(((netWallSqFt * wasteMultiplier) / 100).toFixed(1));

  // 6. Separate Gable Accent Shakes vs Main Wall Siding
  let gableShakeSquares = 0;
  let mainWallSquares = totalSidingSquares;

  if (features.gableSidingStyle === 'shake' || features.gableSidingStyle === 'board-batten') {
    const rawGableSquares = (gablesSqFt * wasteMultiplier) / 100;
    gableShakeSquares = parseFloat(Math.min(totalSidingSquares, rawGableSquares).toFixed(1));
    mainWallSquares = parseFloat(Math.max(0, totalSidingSquares - gableShakeSquares).toFixed(1));
  }

  return {
    side: elevation.side,
    label: elevation.label,
    grossWallSqFt: Math.round(grossWallSqFt),
    openingsDeductionSqFt: Math.round(openingsDeductionSqFt),
    netWallSqFt: Math.round(netWallSqFt),
    mainWallSquares,
    gableShakeSquares,
    totalSidingSquares,
    roofSquares: features.roofSquares || 0,
    cornersCount: features.cornerPostsCount || 0,
    soffitFasciaFeet: features.soffitFasciaFeet || 0,
    shuttersPairs: features.shuttersPairs || 0,
    guttersFeet: features.guttersLinearFeet || 0,
  };
}

/**
 * Aggregates all 4 elevations and computes exact price estimate based on client rates.
 */
export function calculateProjectSummary(
  elevations: ElevationData[],
  pricing: FieldPricingConfig
): ProjectTakeoffSummary {
  const takeoffResults = elevations.map((el) =>
    calculateElevationTakeoff(el, pricing.wasteFactorPercent)
  );

  let totalMainSidingSquares = 0;
  let totalGableShakeSquares = 0;
  let totalSidingSquares = 0;
  let totalRoofSquares = 0;
  let totalCornersCount = 0;
  let totalSoffitFasciaFeet = 0;
  let totalShuttersPairs = 0;
  let totalGuttersFeet = 0;

  takeoffResults.forEach((res) => {
    totalMainSidingSquares += res.mainWallSquares;
    totalGableShakeSquares += res.gableShakeSquares;
    totalSidingSquares += res.totalSidingSquares;
    totalRoofSquares += res.roofSquares;
    totalCornersCount += res.cornersCount;
    totalSoffitFasciaFeet += res.soffitFasciaFeet;
    totalShuttersPairs += res.shuttersPairs;
    totalGuttersFeet += res.guttersFeet;
  });

  totalMainSidingSquares = parseFloat(totalMainSidingSquares.toFixed(1));
  totalGableShakeSquares = parseFloat(totalGableShakeSquares.toFixed(1));
  totalSidingSquares = parseFloat(totalSidingSquares.toFixed(1));

  // Itemized costs
  const mainSidingCost = Math.round(totalMainSidingSquares * pricing.sidingTier2InstalledSq); // Default Monogram Premium
  const gableShakeCost = Math.round(totalGableShakeSquares * pricing.sidingTier3InstalledSq); // Cedar Impressions Shakes
  const roofingCost = Math.round(totalRoofSquares * pricing.roofingInstalledSq); // Landmark
  const cornersCost = Math.round(totalCornersCount * pricing.cornerPostEach);
  const soffitFasciaCost = Math.round(totalSoffitFasciaFeet * pricing.soffitFasciaLinearFoot);
  const shuttersCost = Math.round(totalShuttersPairs * pricing.shutterPairInstalled);
  const guttersCost = Math.round(totalGuttersFeet * pricing.gutterLinearFoot);
  const siteFeesCost = Math.round(pricing.tearOffDisposalDumpster + pricing.permitFeeAllowance);

  const targetTotalCost =
    mainSidingCost +
    gableShakeCost +
    roofingCost +
    cornersCost +
    soffitFasciaCost +
    shuttersCost +
    guttersCost +
    siteFeesCost;

  // Approximate confidence range (+/- 8%)
  const lowEstimateCost = Math.round(targetTotalCost * 0.92);
  const highEstimateCost = Math.round(targetTotalCost * 1.08);

  return {
    elevations: takeoffResults,
    totalMainSidingSquares,
    totalGableShakeSquares,
    totalSidingSquares,
    totalRoofSquares,
    totalCornersCount,
    totalSoffitFasciaFeet,
    totalShuttersPairs,
    totalGuttersFeet,
    mainSidingCost,
    gableShakeCost,
    roofingCost,
    cornersCost,
    soffitFasciaCost,
    shuttersCost,
    guttersCost,
    siteFeesCost,
    targetTotalCost,
    lowEstimateCost,
    highEstimateCost,
  };
}

export function formatDollar(valInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format((valInCents || 0) / 100);
}
