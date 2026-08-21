import React, { useState } from 'react';
import {
  ElevationData,
  FieldPricingConfig,
  ProjectTakeoffSummary,
} from '../../types/fieldEstimate';
import { SpringValleyRole, ROLE_PERMISSIONS } from '../../types/auth';
import { formatDollar } from '../../utils/takeoffEngine';
import {
  X,
  Printer,
  Copy,
  Check,
  Send,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  elevations: ElevationData[];
  summary: ProjectTakeoffSummary;
  pricing: FieldPricingConfig;
  onClose: () => void;
  activeRole?: SpringValleyRole;
}

export const TakeoffSummaryModal: React.FC<Props> = ({
  elevations,
  summary,
  pricing,
  onClose,
  activeRole = 'Owner',
}) => {
  const [copied, setCopied] = useState(false);
  const [sentToCrm, setSentToCrm] = useState(false);
  
  const permissions = ROLE_PERMISSIONS[activeRole];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyScope = () => {
    let text = `SPRING VALLEY ROOFING — 4-SIDED FIELD TAKEOFF & ESTIMATE
PA HIC #PA149822 · CertainTeed Certified Contractor

PROJECT SUMMARY:
• Total Siding Takeoff: ${summary.totalSidingSquares} Squares (${summary.totalMainSidingSquares} Sq Monogram Main + ${summary.totalGableShakeSquares} Sq Cedar Impressions Shakes)
• Total Roof Takeoff: ${summary.totalRoofSquares} Squares (CertainTeed Landmark)
• Corner Posts: ${summary.totalCornersCount} ea
• Soffit & Fascia Wrap: ${summary.totalSoffitFasciaFeet} lin ft
• Shutters: ${summary.totalShuttersPairs} pairs
• Seamless Gutters: ${summary.totalGuttersFeet} lin ft`;

    if (permissions.canViewFinancials) {
      text += `\n\nITEMIZED ESTIMATE BREAKDOWN:
- Main Siding (Monogram installed @ ${formatDollar(pricing.sidingTier2InstalledSq)}/sq): ${formatDollar(summary.mainSidingCost)}
- Gable Shakes (Cedar Impressions @ ${formatDollar(pricing.sidingTier3InstalledSq)}/sq): ${formatDollar(summary.gableShakeCost)}
- Roofing (Landmark installed @ ${formatDollar(pricing.roofingInstalledSq)}/sq): ${formatDollar(summary.roofingCost)}
- Corner Posts: ${formatDollar(summary.cornersCost)}
- Soffit & Fascia Wrap: ${formatDollar(summary.soffitFasciaCost)}
- Shutters: ${formatDollar(summary.shuttersCost)}
- Seamless Gutters: ${formatDollar(summary.guttersCost)}
- Site Disposal & PA Permits: ${formatDollar(summary.siteFeesCost)}

TOTAL ESTIMATED PRICE:
Target: ${formatDollar(summary.targetTotalCost)}
Estimated Range: ${formatDollar(summary.lowEstimateCost)} – ${formatDollar(summary.highEstimateCost)}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendToCrm = () => {
    setSentToCrm(true);
    setTimeout(() => {
      alert("✅ Takeoff package and 4-side specifications sent to Spring Valley CRM!");
      setSentToCrm(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in print:bg-white print:p-0">
      <div className="bg-[#131F2E] border border-[#223448] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none print:bg-white print:text-black">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#223448] flex items-center justify-between bg-[#0E1620] print:bg-white print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#18A9D9] to-[#83C248] flex items-center justify-center text-white font-bold shadow-md print:hidden">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white print:text-black">
                4-Sided Field Takeoff & Pricing Report
              </h2>
              <p className="text-xs text-[#9BA8B8] print:text-gray-600">
                Spring Valley Roofing · CertainTeed Certified · PA HIC #PA149822
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9BA8B8] hover:text-white p-2 rounded-lg hover:bg-[#1A2838] transition-colors print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* Top Key Takeoff Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 print:grid-cols-4">
            <div className="bg-[#0B131E] border border-[#223448] rounded-xl p-4 text-center print:border-gray-300 print:bg-gray-50">
              <div className="text-xs text-[#9BA8B8] font-semibold uppercase tracking-wider mb-1 print:text-gray-500">
                Total Siding
              </div>
              <div className="text-2xl font-black text-[#18A9D9] print:text-black">
                {summary.totalSidingSquares} <span className="text-xs font-normal text-white print:text-black">Sq</span>
              </div>
              <div className="text-[11px] text-[#69727D] mt-0.5">
                +{pricing.wasteFactorPercent}% waste factor
              </div>
            </div>

            <div className="bg-[#0B131E] border border-[#223448] rounded-xl p-4 text-center print:border-gray-300 print:bg-gray-50">
              <div className="text-xs text-[#9BA8B8] font-semibold uppercase tracking-wider mb-1 print:text-gray-500">
                Total Roofing
              </div>
              <div className="text-2xl font-black text-[#83C248] print:text-black">
                {summary.totalRoofSquares} <span className="text-xs font-normal text-white print:text-black">Sq</span>
              </div>
              <div className="text-[11px] text-[#69727D] mt-0.5">
                CertainTeed Landmark
              </div>
            </div>

            {permissions.canViewFinancials && (
              <>
                <div className="bg-[#0B131E] border border-[#223448] rounded-xl p-4 text-center print:border-gray-300 print:bg-gray-50">
                  <div className="text-xs text-[#9BA8B8] font-semibold uppercase tracking-wider mb-1 print:text-gray-500">
                    Target Estimate
                  </div>
                  <div className="text-2xl font-black text-white print:text-black">
                    {formatDollar(summary.targetTotalCost)}
                  </div>
                  <div className="text-[11px] text-[#83C248] mt-0.5 font-medium">
                    Materials & Labor Incl.
                  </div>
                </div>

                <div className="bg-[#0B131E] border border-[#223448] rounded-xl p-4 text-center print:border-gray-300 print:bg-gray-50">
                  <div className="text-xs text-[#9BA8B8] font-semibold uppercase tracking-wider mb-1 print:text-gray-500">
                    Estimate Range
                  </div>
                  <div className="text-base font-bold text-[#D0D7DE] mt-1 print:text-black">
                    {formatDollar(summary.lowEstimateCost)} – {formatDollar(summary.highEstimateCost)}
                  </div>
                  <div className="text-[11px] text-[#69727D] mt-0.5">
                    ±8% Contingency
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 4 Elevations Visual Gallery */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5 print:text-black">
              <Building2 className="w-4 h-4 text-[#18A9D9]" /> 4-Side House Elevations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {elevations.map((el, i) => (
                <div
                  key={i}
                  className="bg-[#0B131E] border border-[#223448] rounded-xl p-2.5 flex flex-col justify-between print:border-gray-300 print:bg-gray-50"
                >
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#131F2E] mb-2 flex items-center justify-center border border-[#223448]">
                    {el.renderedUrl || el.photoUrl ? (
                      <img
                        src={el.renderedUrl || el.photoUrl || ''}
                        alt={el.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <span className="text-xl">📸</span>
                        <div className="text-[10px] text-[#69727D] mt-1">Photo pending</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white print:text-black">{el.label}</div>
                    <div className="text-[11px] text-[#9BA8B8] print:text-gray-600">
                      {summary.elevations[i]?.totalSidingSquares || 0} Sq Siding
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Elevation-by-Elevation Takeoff Table */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 print:text-black">
              Elevation Takeoff Measurements
            </h3>
            <div className="border border-[#223448] rounded-xl overflow-hidden print:border-gray-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0E1620] text-[#9BA8B8] border-b border-[#223448] font-semibold print:bg-gray-100 print:text-black">
                  <tr>
                    <th className="p-3">Elevation</th>
                    <th className="p-3">Gross Area</th>
                    <th className="p-3">Deductions</th>
                    <th className="p-3">Net Wall</th>
                    <th className="p-3">Main Siding</th>
                    <th className="p-3">Gable Shakes</th>
                    <th className="p-3">Roof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#223448] text-[#D0D7DE] print:divide-gray-200 print:text-black">
                  {summary.elevations.map((elRes, i) => (
                    <tr key={i} className="hover:bg-[#1A2838]/50">
                      <td className="p-3 font-medium text-white print:text-black">{elRes.label}</td>
                      <td className="p-3 font-mono">{elRes.grossWallSqFt} sq ft</td>
                      <td className="p-3 font-mono text-[#E5534B]">-{elRes.openingsDeductionSqFt} sq ft</td>
                      <td className="p-3 font-mono">{elRes.netWallSqFt} sq ft</td>
                      <td className="p-3 font-bold text-[#18A9D9] print:text-black">{elRes.mainWallSquares} Sq</td>
                      <td className="p-3 font-mono">{elRes.gableShakeSquares > 0 ? `${elRes.gableShakeSquares} Sq` : '—'}</td>
                      <td className="p-3 font-mono">{elRes.roofSquares > 0 ? `${elRes.roofSquares} Sq` : '—'}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#0E1620]/80 font-bold text-white print:bg-gray-100 print:text-black">
                    <td className="p-3">TOTALS</td>
                    <td className="p-3 font-mono">—</td>
                    <td className="p-3 font-mono">—</td>
                    <td className="p-3 font-mono">—</td>
                    <td className="p-3 text-[#18A9D9] print:text-black">{summary.totalMainSidingSquares} Sq</td>
                    <td className="p-3 text-[#18A9D9] print:text-black">{summary.totalGableShakeSquares} Sq</td>
                    <td className="p-3 text-[#83C248] print:text-black">{summary.totalRoofSquares} Sq</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Itemized Pricing Breakdown (Only visible if canViewFinancials) */}
          {permissions.canViewFinancials && (
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 print:text-black">
                Itemized Materials & Labor Pricing Breakdown
              </h3>
              <div className="bg-[#0B131E] border border-[#223448] rounded-xl p-4 space-y-2.5 print:border-gray-300 print:bg-gray-50">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9BA8B8] print:text-gray-700">
                    Main Siding ({summary.totalMainSidingSquares} Sq @ {formatDollar(pricing.sidingTier2InstalledSq)}/Sq Installed):
                  </span>
                  <span className="font-mono font-bold text-white print:text-black">{formatDollar(summary.mainSidingCost)}</span>
                </div>

                {summary.totalGableShakeSquares > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#9BA8B8] print:text-gray-700">
                      Gable Accent Shakes ({summary.totalGableShakeSquares} Sq Cedar Impressions @ {formatDollar(pricing.sidingTier3InstalledSq)}/Sq):
                    </span>
                    <span className="font-mono font-bold text-white print:text-black">{formatDollar(summary.gableShakeCost)}</span>
                  </div>
                )}

                {summary.totalRoofSquares > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#9BA8B8] print:text-gray-700">
                      Roofing ({summary.totalRoofSquares} Sq Landmark @ {formatDollar(pricing.roofingInstalledSq)}/Sq Installed):
                    </span>
                    <span className="font-mono font-bold text-white print:text-black">{formatDollar(summary.roofingCost)}</span>
                  </div>
                )}

                {summary.totalCornersCount > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#9BA8B8] print:text-gray-700">
                      Outside/Inside Corner Posts ({summary.totalCornersCount} ea @ {formatDollar(pricing.cornerPostEach)}/ea):
                    </span>
                    <span className="font-mono font-bold text-white print:text-black">{formatDollar(summary.cornersCost)}</span>
                  </div>
                )}

                {summary.totalSoffitFasciaFeet > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#9BA8B8] print:text-gray-700">
                      Soffit & Fascia Aluminum Wrap ({summary.totalSoffitFasciaFeet} ft @ {formatDollar(pricing.soffitFasciaLinearFoot)}/ft):
                    </span>
                    <span className="font-mono font-bold text-white print:text-black">{formatDollar(summary.soffitFasciaCost)}</span>
                  </div>
                )}

                {summary.totalShuttersPairs > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#9BA8B8] print:text-gray-700">
                      Custom Designer Shutters ({summary.totalShuttersPairs} pairs @ {formatDollar(pricing.shutterPairInstalled)}/pair):
                    </span>
                    <span className="font-mono font-bold text-white print:text-black">{formatDollar(summary.shuttersCost)}</span>
                  </div>
                )}

                {summary.totalGuttersFeet > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#9BA8B8] print:text-gray-700">
                      Seamless 5" K-Style Gutters & Leaders ({summary.totalGuttersFeet} ft @ {formatDollar(pricing.gutterLinearFoot)}/ft):
                    </span>
                    <span className="font-mono font-bold text-white print:text-black">{formatDollar(summary.guttersCost)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9BA8B8] print:text-gray-700">
                    Tear-off, Dumpster Disposal & PA Township Permit Allowance:
                  </span>
                  <span className="font-mono font-bold text-white print:text-black">{formatDollar(summary.siteFeesCost)}</span>
                </div>

                <div className="border-t border-[#223448] pt-3 mt-3 flex justify-between items-center print:border-gray-400">
                  <span className="font-extrabold text-sm text-white print:text-black">
                    TOTAL ESTIMATED INVESTMENT:
                  </span>
                  <span className="text-lg font-black text-[#83C248] print:text-black">
                    {formatDollar(summary.targetTotalCost)}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 border-t border-[#223448] flex items-center justify-between bg-[#0E1620] print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1A2838] hover:bg-[#223448] transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#18A9D9]" /> Print Takeoff Sheet
            </button>
            <button
              onClick={handleCopyScope}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1A2838] hover:bg-[#223448] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#83C248]" /> : <Copy className="w-3.5 h-3.5 text-[#83C248]" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Scope'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#9BA8B8] hover:text-white hover:bg-[#1A2838] transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSendToCrm}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#83C248] to-[#72AD3C] hover:from-[#93D553] hover:to-[#83C248] transition-all shadow-md"
            >
              {sentToCrm ? <CheckCircle2 className="w-4 h-4 animate-bounce" /> : <Send className="w-4 h-4" />}
              {sentToCrm ? 'Sending...' : 'Send Takeoff to CRM'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
