import React, { useState } from 'react';
import { FieldPricingConfig } from '../../types/fieldEstimate';
import { X, DollarSign, RotateCcw, Check } from 'lucide-react';
import { DEFAULT_FIELD_PRICING } from '../../constants/fieldPricingDefaults';

interface Props {
  pricing: FieldPricingConfig;
  onSave: (newPricing: FieldPricingConfig) => void;
  onClose: () => void;
}

export const PricingSettingsModal: React.FC<Props> = ({ pricing, onSave, onClose }) => {
  const [formState, setFormState] = useState<FieldPricingConfig>({ ...pricing });

  const handleChange = (key: keyof FieldPricingConfig, val: string) => {
    const num = parseFloat(val) || 0;
    setFormState((prev) => ({ ...prev, [key]: num }));
  };

  const handleResetDefaults = () => {
    setFormState({ ...DEFAULT_FIELD_PRICING });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#131F2E] border border-[#223448] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#223448] flex items-center justify-between bg-[#0E1620]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#18A9D9]/20 border border-[#18A9D9]/30 flex items-center justify-center text-[#18A9D9]">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Client Pricing & Rate Settings</h2>
              <p className="text-xs text-[#9BA8B8]">Adjust installed rates per square, accessory fees, and waste allowance.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9BA8B8] hover:text-white p-2 rounded-lg hover:bg-[#1A2838] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Siding Products Installed / Square */}
          <div>
            <h3 className="text-xs font-bold text-[#18A9D9] uppercase tracking-wider mb-3">
              Siding Rates (Materials + Labor / Square Installed)
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#D0D7DE] mb-1.5">
                  Tier 1: MainStreet ($/Sq):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#69727D]">$</span>
                  <input
                    type="number"
                    value={formState.sidingTier1InstalledSq}
                    onChange={(e) => handleChange('sidingTier1InstalledSq', e.target.value)}
                    className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:border-[#18A9D9] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D0D7DE] mb-1.5">
                  Tier 2: Monogram Premium ($/Sq):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#69727D]">$</span>
                  <input
                    type="number"
                    value={formState.sidingTier2InstalledSq}
                    onChange={(e) => handleChange('sidingTier2InstalledSq', e.target.value)}
                    className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:border-[#18A9D9] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D0D7DE] mb-1.5">
                  Tier 3: Cedar Impressions Shakes ($/Sq):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#69727D]">$</span>
                  <input
                    type="number"
                    value={formState.sidingTier3InstalledSq}
                    onChange={(e) => handleChange('sidingTier3InstalledSq', e.target.value)}
                    className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:border-[#18A9D9] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D0D7DE] mb-1.5">
                  CedarBoards Board & Batten ($/Sq):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#69727D]">$</span>
                  <input
                    type="number"
                    value={formState.sidingBoardBattenInstalledSq}
                    onChange={(e) => handleChange('sidingBoardBattenInstalledSq', e.target.value)}
                    className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:border-[#18A9D9] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Roofing Rates */}
          <div className="border-t border-[#223448] pt-5">
            <h3 className="text-xs font-bold text-[#83C248] uppercase tracking-wider mb-3">
              Roofing Rates (Materials + Labor / Square Installed)
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#D0D7DE] mb-1.5">
                  Landmark Architectural ($/Sq):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#69727D]">$</span>
                  <input
                    type="number"
                    value={formState.roofingInstalledSq}
                    onChange={(e) => handleChange('roofingInstalledSq', e.target.value)}
                    className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:border-[#83C248] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D0D7DE] mb-1.5">
                  Landmark PRO Max Def ($/Sq):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#69727D]">$</span>
                  <input
                    type="number"
                    value={formState.roofingProInstalledSq}
                    onChange={(e) => handleChange('roofingProInstalledSq', e.target.value)}
                    className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:border-[#83C248] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trim, Accessories & Site Fees */}
          <div className="border-t border-[#223448] pt-5">
            <h3 className="text-xs font-bold text-[#D0D7DE] uppercase tracking-wider mb-3">
              Trim, Accessories & Site Disposal
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#9BA8B8] mb-1">
                  Corner Post (ea):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#69727D]">$</span>
                  <input
                    type="number"
                    value={formState.cornerPostEach}
                    onChange={(e) => handleChange('cornerPostEach', e.target.value)}
                    className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:border-[#18A9D9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9BA8B8] mb-1">
                  Soffit/Fascia Wrap ($/ft):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#69727D]">$</span>
                  <input
                    type="number"
                    value={formState.soffitFasciaLinearFoot}
                    onChange={(e) => handleChange('soffitFasciaLinearFoot', e.target.value)}
                    className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:border-[#18A9D9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9BA8B8] mb-1">
                  Shutters ($/pair):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#69727D]">$</span>
                  <input
                    type="number"
                    value={formState.shutterPairInstalled}
                    onChange={(e) => handleChange('shutterPairInstalled', e.target.value)}
                    className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:border-[#18A9D9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9BA8B8] mb-1">
                  Seamless Gutters ($/ft):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#69727D]">$</span>
                  <input
                    type="number"
                    value={formState.gutterLinearFoot}
                    onChange={(e) => handleChange('gutterLinearFoot', e.target.value)}
                    className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:border-[#18A9D9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9BA8B8] mb-1">
                  Tear-off & Dumpster ($):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#69727D]">$</span>
                  <input
                    type="number"
                    value={formState.tearOffDisposalDumpster}
                    onChange={(e) => handleChange('tearOffDisposalDumpster', e.target.value)}
                    className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-2 pl-7 pr-3 text-sm text-white focus:border-[#18A9D9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9BA8B8] mb-1">
                  Waste Allowance (%):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formState.wasteFactorPercent}
                    onChange={(e) => handleChange('wasteFactorPercent', e.target.value)}
                    className="w-full bg-[#0B131E] border border-[#223448] rounded-lg py-2 px-3 text-sm text-white focus:border-[#18A9D9] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-[#223448] flex items-center justify-between bg-[#0E1620]">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-[#9BA8B8] hover:text-white px-3 py-2 rounded-lg hover:bg-[#1A2838] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Spring Valley Defaults
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#9BA8B8] hover:text-white bg-[#1A2838] hover:bg-[#223448] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#18A9D9] to-[#0DA7E3] hover:from-[#42C2ED] hover:to-[#18A9D9] transition-all shadow-md"
            >
              <Check className="w-4 h-4" /> Save Rates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
