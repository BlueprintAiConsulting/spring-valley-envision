/**
 * BlueprintEnvision — Tenant Configuration
 *
 * All white-label branding lives here. When onboarding a new contractor,
 * update these values and re-deploy — no other files need editing.
 */
export const TENANT = {
  companyName: 'Spring Valley Roofing',
  appName: 'Spring Valley Roofing Envision',
  /** Display name for the installing contractor shown in UI & emails */
  installerName: 'Spring Valley Roofing',
  defaultLeadEmail: 'info@springvalleyroofing.com',
  sidingTiers: {
    good:   { label: 'Good',   displayName: 'Horizon™',        material: 'Vinyl Siding' },
    better: { label: 'Better', displayName: 'Prestige™',       material: 'Premium Vinyl Siding' },
    best:   { label: 'Best',   displayName: 'Artisan Cedar™',  material: 'Polymer Shakes & Shingles' },
    bb:     { label: 'B&B',    displayName: 'Vertical Plank™', material: 'Insulated Board & Batten Vinyl' },
  },
  disclaimerText: 'Color swatches are representative approximations — physical samples are the authoritative reference. Availability varies by region and installer.',
  repConsultCopy: '',
  footerAttribution: 'Powered by Blueprint AI',
};
// Spring Valley tenant deploy trigger
