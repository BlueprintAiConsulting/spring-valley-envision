import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sparkles, Shield, ChevronRight, Check, ArrowRight,
  Eye, Palette, Camera, Phone, Menu, X,
  Layers, MapPin, Calculator, Smartphone, Award, CheckCircle2,
  SlidersHorizontal, Compass, ArrowUpRight, Clock, Home
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────── */
/*  SPRING VALLEY SHOWCASE PALETTES FOR HERO INTERACTIVE HOTSPOTS   */
/* ─────────────────────────────────────────────────────────────── */
const HERO_PALETTES = [
  {
    id: 'modern-slate',
    label: 'Landmark® Moire Black & Flagstone',
    image: 'demo-render-charcoal.png',
    roof: {
      line: 'Landmark® PRO Shingles',
      color: 'Moire Black',
      spec: 'Max Def Dual-Layer Shingle',
      hex: '#1E232A',
      tag: '50-Year Warranty',
      price: 'SureStart™ PLUS'
    },
    siding: {
      line: 'Monogram® D4 Siding',
      color: 'Flagstone Gray',
      spec: 'TrueTexture™ Rough Cedar Finish',
      hex: '#5A626C',
      tag: 'Class A Fire Rated',
      price: 'Hurricane Rated'
    },
    trim: {
      line: 'Restoration Millwork®',
      color: 'Colonial White',
      spec: 'Moisture-Proof Engineered PVC',
      hex: '#F8FAFC',
      tag: 'Zero Maintenance',
      price: 'Factory Sealed'
    }
  },
  {
    id: 'heritage-wood',
    label: 'Weathered Wood & Colonial White',
    image: 'demo-pa-colonial.png',
    roof: {
      line: 'Landmark® Architectural',
      color: 'Weathered Wood',
      spec: 'High-Definition Color Blend',
      hex: '#4A423B',
      tag: 'Class A Fire',
      price: 'Certified Install'
    },
    siding: {
      line: 'Monogram® D4',
      color: 'Colonial White',
      spec: 'Heavy-Duty .046" Rigid Vinyl',
      hex: '#EDE8DF',
      tag: 'Colorfast Guarantee',
      price: 'Clean Finish'
    },
    trim: {
      line: 'Precision Fascia & Soffit',
      color: 'Moire Accent',
      spec: 'Beaded Aluminum Ventilation',
      hex: '#2B2D31',
      tag: 'Lifetime Seal',
      price: 'Heavy Gauge'
    }
  },
  {
    id: 'artisan-red',
    label: 'Pewterwood & Heritage Red',
    image: 'demo-render-red.png',
    roof: {
      line: 'Landmark® Premium',
      color: 'Pewterwood',
      spec: 'Max Def Shadow Accent Band',
      hex: '#3E4249',
      tag: 'Algae Resistance',
      price: 'StreakFighter®'
    },
    siding: {
      line: 'Cedar Impressions®',
      color: 'Savanna Wicker',
      spec: 'Individual Polymer Cedar Shakes',
      hex: '#D7C7B0',
      tag: '220mph Wind Rated',
      price: 'Deep Wood Grain'
    },
    trim: {
      line: 'Restoration Millwork®',
      color: 'Colonial White',
      spec: 'Window & Corner Surrounds',
      hex: '#F8FAFC',
      tag: 'Water-Tight Flashing',
      price: 'Seamless Joint'
    }
  }
];

/* ─────────────────────────────────────────────────────────────── */
/*  ACCORDION FEATURE SHOWCASE DATA                                */
/* ─────────────────────────────────────────────────────────────── */
const ACCORDION_FEATURES = [
  {
    id: 'ai-renders',
    title: 'Photorealistic CertainTeed AI Renders',
    subtitle: 'See your real home transformed in 30 seconds',
    description: 'Our proprietary Gemini vision AI preserves your exact roof pitch, dormers, window trim, and natural ambient sunlight. Test authentic CertainTeed Landmark and Monogram palettes with real shadow depth before committing.',
    stat: '30s Render Time',
    statLabel: 'Gemini AI Vision',
    badge: 'CertainTeed® Certified'
  },
  {
    id: 'multi-zone',
    title: 'Independent Roofing & Siding Customization',
    subtitle: 'Mix and match shingles, siding profiles, and trim colors',
    description: 'Experiment freely with dual-layer architectural shingles on your main roof, contrasting shake textures on your front gables, and heavy-gauge Monogram siding on your walls.',
    stat: '8 Color Zones',
    statLabel: 'Total Customization',
    badge: 'Multi-Surface Engine'
  },
  {
    id: 'street-view',
    title: 'Instant Street View Property Ingestion',
    subtitle: 'Look up any home across Chester & Montgomery Counties',
    description: 'Enter your Pennsylvania address to pull high-resolution Street View imagery directly into the visualizer, or snap a photo from your driveway with your smartphone camera.',
    stat: 'Instant Lookup',
    statLabel: 'Zero Setup Friction',
    badge: 'Driveway Camera or Street View'
  },
  {
    id: 'field-takeoff',
    title: '4-Side Field Takeoff & Transparent Pricing',
    subtitle: 'Accurate square footage and material requirements on site',
    description: 'Chris and Tricia Booth’s team uses our precision takeoff system to verify wall elevations, roof squares, and waste factors — ensuring your estimate is guaranteed and fully itemized.',
    stat: 'Guaranteed Pricing',
    statLabel: 'No Surprise Charges',
    badge: 'Itemized Transparency'
  },
  {
    id: 'guarantee',
    title: 'SureStart™ PLUS 50-Year Warranty',
    subtitle: 'Backed by CertainTeed and Spring Valley Roofing',
    description: 'As a credentialed CertainTeed 5-Star Contractor, Spring Valley provides full manufacturer-backed labor and material warranties, giving you decades of leak-free protection.',
    stat: '50-Year Coverage',
    statLabel: 'Non-Prorated Warranty',
    badge: '5-Star Credentials'
  }
];

/* ─────────────────────────────────────────────────────────────── */
/*  THREE ROLLOUT STEPS                                            */
/* ─────────────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    title: 'Snap, Upload, or Street View',
    subtitle: 'Fast and frictionless',
    description: 'Type your address for instant Google Street View imagery, or take a quick photo of your house with your smartphone.'
  },
  {
    num: '02',
    title: 'Explore CertainTeed Colors Live',
    subtitle: 'Interactive material customization',
    description: 'Swap between Landmark Moire Black, Weathered Wood, and Monogram siding colors in real time with our before/after comparison slider.'
  },
  {
    num: '03',
    title: 'Get Your Guaranteed Estimate',
    subtitle: 'Direct local consultation',
    description: 'Click Request Quote to send your design packet directly to Chris Booth at Spring Valley Roofing for an in-person, 21-point exterior inspection.'
  }
];

/* ─────────────────────────────────────────────────────────────── */
/*  FAQS                                                           */
/* ─────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'How does the Spring Valley AI Visualizer work?',
    a: 'Simply upload a photo of your house or type your Pennsylvania address. Our Gemini AI engine detects your roof, siding zones, trim, and accents, then accurately applies authentic CertainTeed colors with realistic lighting and shadows so you can see the finished result before work begins.'
  },
  {
    q: 'Is the visualizer really 100% free?',
    a: 'Yes! There is zero cost, no credit card required, and no obligation. We provide this tool so homeowners in West Chester, Pottstown, and across Chester & Montgomery Counties can make confident exterior design choices.'
  },
  {
    q: 'What CertainTeed products can I test?',
    a: 'You can test CertainTeed Landmark® & Landmark® PRO architectural shingles, Monogram® vinyl siding, Cedar Impressions® polymer shakes, CedarBoards™ board & batten, plus 12 designer trim and shutter colors.'
  },
  {
    q: 'How do I schedule an in-person roof or siding inspection?',
    a: 'Once you customize your design, click "Request Free Quote" inside the visualizer, or give our Pottstown office a call directly at (610) 948-5207. Chris Booth or one of our senior specialists will perform a comprehensive 21-point exterior inspection.'
  },
  {
    q: 'What areas in Pennsylvania does Spring Valley Roofing serve?',
    a: 'We proudly serve Pottstown, West Chester, Exton, Phoenixville, Collegeville, Gilbertsville, King of Prussia, Royersford, and throughout Chester, Montgomery, and Berks Counties (PA HIC #PA149822).'
  }
];

interface LandingProps {
  onLaunchStudio?: () => void;
}

export default function Landing({ onLaunchStudio }: LandingProps) {
  const navigate = useNavigate();
  const [activePaletteIndex, setActivePaletteIndex] = useState(0);
  const [activeAccordionId, setActiveAccordionId] = useState('ai-renders');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const base = import.meta.env.BASE_URL || '/';
  const assetPath = (path: string) => `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const currentPalette = HERO_PALETTES[activePaletteIndex];
  const activeAccordion = ACCORDION_FEATURES.find(f => f.id === activeAccordionId) || ACCORDION_FEATURES[0];

  const handleLaunch = () => {
    if (onLaunchStudio) {
      onLaunchStudio();
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-[#060B18] text-[#E2E8F0] selection:bg-[#18A9D9] selection:text-white relative">
      
      {/* ──────── TOP ANNOUNCEMENT BAR ──────── */}
      <div className="bg-gradient-to-r from-[#0B131E] via-[#18A9D9]/20 to-[#0B131E] border-b border-[#223448] py-2 px-4 text-center text-xs font-medium text-[#9BA8B8]">
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#83C248] animate-pulse" />
          <strong className="text-white">PA HIC #PA149822:</strong> Certified CertainTeed Contractor serving West Chester, Pottstown & Chester County.
          <a href="tel:6109485207" className="hidden sm:inline text-[#18A9D9] font-bold hover:underline">| Call (610) 948-5207</a>
        </span>
      </div>

      {/* ──────── MINIMALIST STICKY HEADER (ARCWAY STYLE) ──────── */}
      <header className="sticky top-0 z-50 bg-[#060B18]/85 backdrop-blur-xl border-b border-[#1E293B]/70 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Wordmark & Blueprint Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src={`${base}logo-mark.png`}
              alt="Blueprint"
              className="h-9 sm:h-10 w-auto rounded-xl object-contain drop-shadow-[0_0_16px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center leading-none">
                BLUEPRINT<span className="text-[#3B82F6]">ENVISION</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#18A9D9] mt-1">
                CertainTeed® Visualizer
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-9 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#guarantee" className="hover:text-white transition-colors">5-Star Promise</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="tel:6109485207" className="text-[#83C248] font-bold hover:underline">📞 (610) 948-5207</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={handleLaunch}
              className="bg-[#83C248] hover:bg-[#93D553] text-[#060B18] px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(131,194,72,0.35)] hover:shadow-[0_0_30px_rgba(131,194,72,0.5)] flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Palette className="w-4 h-4 text-[#060B18]" />
              <span>Launch Visualizer</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#94A3B8] hover:text-white rounded-lg border border-[#1E293B]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0B131E] border-b border-[#1E293B] px-6 py-5 space-y-4">
            <a href="#how-it-works" className="block text-sm font-semibold text-[#94A3B8] hover:text-white" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#capabilities" className="block text-sm font-semibold text-[#94A3B8] hover:text-white" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
            <a href="#guarantee" className="block text-sm font-semibold text-[#94A3B8] hover:text-white" onClick={() => setMobileMenuOpen(false)}>5-Star Promise</a>
            <a href="#faq" className="block text-sm font-semibold text-[#94A3B8] hover:text-white" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <a href="tel:6109485207" className="block text-sm font-bold text-[#83C248]">📞 Call (610) 948-5207</a>
            <div className="pt-3 border-t border-[#1E293B]">
              <button
                onClick={() => { setMobileMenuOpen(false); handleLaunch(); }}
                className="w-full bg-[#83C248] text-[#060B18] py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                Launch Studio Visualizer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ──────── HERO SECTION: EDITORIAL HEADLINE & CENTERPIECE SHOWCASE ──────── */}
        <section className="pt-20 pb-24 px-4 sm:px-6 relative">
          <div className="max-w-6xl mx-auto text-center">
            
            {/* Pill Kicker */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0F172A] border border-[#223448] shadow-inner mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#83C248] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#18A9D9]">
                Instant CertainTeed AI Exterior Preview
              </span>
            </motion.div>

            {/* Editorial Serif Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif-editorial text-4xl sm:text-6xl md:text-7xl font-normal text-white leading-[1.08] tracking-[-0.02em] max-w-4xl mx-auto mb-6"
            >
              See your dream roof and siding <span className="italic text-[#18A9D9]">before we drive a single nail</span>.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-[#94A3B8] font-light max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Preview genuine CertainTeed Landmark® shingles, Monogram® siding, and designer trim on your actual Pennsylvania home in 30 seconds.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16"
            >
              <button
                onClick={handleLaunch}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#83C248] hover:bg-[#93D553] text-[#060B18] font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_24px_rgba(131,194,72,0.4)] hover:shadow-[0_0_36px_rgba(131,194,72,0.6)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Launch Free Visualizer</span>
                <ArrowRight className="w-4 h-4 text-[#060B18]" />
              </button>

              <a
                href="tel:6109485207"
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#0F172A] hover:bg-[#131F2E] text-white border border-[#223448] hover:border-[#18A9D9] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#83C248]" />
                <span>Call (610) 948-5207</span>
              </a>
            </motion.div>
          </div>

          {/* ──────── ARCWAY SIGNATURE: CENTERPIECE ARCHITECTURAL SHOWCASE WITH HOTSPOTS ──────── */}
          <div className="max-w-6xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="arc-frame rounded-3xl p-2.5 sm:p-4 relative"
            >
              {/* Inner Showcase Wrapper */}
              <div className="relative rounded-2xl overflow-hidden bg-[#0A0E17] border border-[#223448] shadow-2xl min-h-[420px] sm:min-h-[580px] lg:min-h-[640px] flex items-center justify-center">
                
                {/* Active Render Image */}
                <img
                  src={assetPath(currentPalette.image)}
                  alt="Spring Valley CertainTeed Architectural Render"
                  className="w-full h-full object-cover max-h-[720px] filter brightness-[0.96] contrast-[1.04] transition-all duration-700"
                  onError={(e) => {
                    e.currentTarget.src = assetPath('og-preview.png');
                  }}
                />

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060B18]/90 via-transparent to-black/30 pointer-events-none" />

                {/* Top-Left Live Status Pill */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B131E]/85 backdrop-blur-md border border-white/10 text-[11px] font-medium text-[#E2E8F0] shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#83C248] animate-ping" />
                  <span>Spring Valley Roofing · 5-Star Credentialed</span>
                  <span className="text-[#64748B]">·</span>
                  <span className="text-[#18A9D9] font-semibold">{currentPalette.roof.color} applied</span>
                </div>

                {/* Top-Right Architecture HUD Badge */}
                <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B131E]/85 backdrop-blur-md border border-white/10 text-[11px] font-medium text-[#94A3B8] shadow-lg">
                  <Compass className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>CertainTeed® Integrity Roof System</span>
                </div>

                {/* ── HOTSPOT 1: ROOF (TOP/CENTER) ── */}
                <div className="absolute top-[22%] sm:top-[26%] left-[48%] -translate-x-1/2 z-20 group">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <span className="w-7 h-7 rounded-full bg-[#3B82F6]/30 animate-ping absolute" />
                    <span className="w-5 h-5 rounded-full bg-[#3B82F6] border-2 border-white flex items-center justify-center shadow-[0_0_15px_#3B82F6]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>

                  {/* Hotspot Floating Card */}
                  <div className="arc-hotspot absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3.5 rounded-xl transition-all duration-300 pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#3B82F6]">
                        ROOF ZONE · CERTAINTEED
                      </span>
                      <span className="text-[9px] font-bold text-[#83C248] px-1.5 py-0.5 rounded bg-[#83C248]/15 border border-[#83C248]/30">
                        {currentPalette.roof.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-white/20 shrink-0 shadow-inner"
                        style={{ backgroundColor: currentPalette.roof.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{currentPalette.roof.line}</div>
                        <div className="text-[10px] text-[#94A3B8]">{currentPalette.roof.color}</div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">Warranty Tier:</span>
                      <span className="font-bold text-[#83C248]">{currentPalette.roof.price}</span>
                    </div>
                  </div>
                </div>

                {/* ── HOTSPOT 2: SIDING (MIDDLE/LEFT) ── */}
                <div className="absolute top-[58%] sm:top-[56%] left-[28%] sm:left-[32%] z-20 group">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <span className="w-7 h-7 rounded-full bg-[#18A9D9]/30 animate-ping absolute" />
                    <span className="w-5 h-5 rounded-full bg-[#18A9D9] border-2 border-white flex items-center justify-center shadow-[0_0_15px_#18A9D9]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>

                  {/* Hotspot Floating Card */}
                  <div className="arc-hotspot absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3.5 rounded-xl transition-all duration-300 pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#18A9D9]">
                        SIDING ZONE · MAIN ELEVATION
                      </span>
                      <span className="text-[9px] font-bold text-[#60A5FA] px-1.5 py-0.5 rounded bg-[#3B82F6]/15 border border-[#3B82F6]/30">
                        {currentPalette.siding.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-white/20 shrink-0 shadow-inner"
                        style={{ backgroundColor: currentPalette.siding.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{currentPalette.siding.line}</div>
                        <div className="text-[10px] text-[#94A3B8]">{currentPalette.siding.color}</div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">Durability:</span>
                      <span className="font-bold text-white">{currentPalette.siding.price}</span>
                    </div>
                  </div>
                </div>

                {/* ── HOTSPOT 3: GABLE / TRIM (TOP/RIGHT) ── */}
                <div className="absolute top-[42%] right-[22%] sm:right-[26%] z-20 group hidden sm:block">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <span className="w-7 h-7 rounded-full bg-[#83C248]/30 animate-ping absolute" />
                    <span className="w-5 h-5 rounded-full bg-[#83C248] border-2 border-white flex items-center justify-center shadow-[0_0_15px_#83C248]">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>

                  {/* Hotspot Floating Card */}
                  <div className="arc-hotspot absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-60 p-3.5 rounded-xl transition-all duration-300 pointer-events-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#83C248]">
                        TRIM & SOFFIT ZONE
                      </span>
                      <span className="text-[9px] font-bold text-[#83C248] px-1.5 py-0.5 rounded bg-[#83C248]/15 border border-[#83C248]/30">
                        {currentPalette.trim.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-white/20 shrink-0 shadow-inner"
                        style={{ backgroundColor: currentPalette.trim.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{currentPalette.trim.line}</div>
                        <div className="text-[10px] text-[#94A3B8]">{currentPalette.trim.color}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Interactive Palette Switcher Bar */}
                <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 z-20">
                  <div className="bg-[#0B131E]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-white shrink-0">
                      <SlidersHorizontal className="w-4 h-4 text-[#18A9D9]" />
                      <span className="hidden sm:inline">CertainTeed Color Blend:</span>
                      <span className="sm:hidden">Colors:</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                      {HERO_PALETTES.map((palette, idx) => (
                        <button
                          key={palette.id}
                          onClick={() => setActivePaletteIndex(idx)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activePaletteIndex === idx
                              ? 'bg-[#18A9D9] text-white shadow-[0_0_16px_rgba(24,169,217,0.5)] border border-white/20'
                              : 'bg-[#131F2E] text-[#94A3B8] hover:text-white hover:bg-[#1A2838] border border-transparent'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                            style={{ backgroundColor: palette.siding.hex }}
                          />
                          <span className="truncate max-w-[110px] text-[11px]">{palette.label}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleLaunch}
                      className="hidden md:flex items-center gap-1.5 text-xs font-extrabold text-[#83C248] hover:text-[#93D553] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Open in Studio</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </section>

        {/* ──────── EDITORIAL STATEMENT BANNER (ARCWAY STYLE) ──────── */}
        <section className="border-y border-[#1E293B]/80 py-20 px-6 bg-[#080E1E] relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="text-xs uppercase tracking-[0.28em] font-extrabold text-[#18A9D9]">
              WEST CHESTER · POTTSTOWN · CHESTER & MONTGOMERY COUNTIES
            </div>
            <p className="font-serif-editorial text-2xl sm:text-4xl md:text-5xl font-normal text-white leading-tight">
              “Choosing a new roof or siding shouldn’t feel like an expensive gamble. We let you see the finished home before you make a commitment.”
            </p>
            <div className="text-xs font-semibold text-[#64748B] tracking-wide">
              Chris & Tricia Booth · Owners, Spring Valley Roofing (PA HIC #PA149822)
            </div>
          </div>
        </section>

        {/* ──────── THREE-STEP WORKFLOW ──────── */}
        <section className="py-24 px-6 max-w-7xl mx-auto" id="how-it-works">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#18A9D9]">
              HOW IT WORKS
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-white">
              Three simple steps to your dream exterior.
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8] font-light">
              No downloads, no logins, no sales pressure. Try unlimited color combinations directly from your smartphone or tablet.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, idx) => (
              <div
                key={step.num}
                className="relative bg-[#0B131E] border border-[#1E293B] rounded-2xl p-8 hover:border-[#18A9D9]/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="text-5xl font-black text-[#1E293B] mb-6 font-mono">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <div className="text-xs font-semibold text-[#18A9D9] mb-4">{step.subtitle}</div>
                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-bold text-[#64748B]">
                  <span>Step {idx + 1} of 3</span>
                  <span className="text-[#83C248]">Instant Preview</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ──────── INTERACTIVE ACCORDION SHOWCASE ──────── */}
        <section className="py-24 px-6 bg-[#080E1E] border-y border-[#1E293B]/80" id="capabilities">
          <div className="max-w-7xl mx-auto">
            
            <div className="max-w-3xl mb-16">
              <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#18A9D9] mb-3">
                CERTAINTEED CAPABILITIES
              </div>
              <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-white leading-tight">
                Engineering excellence meets AI visualization.
              </h2>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Accordion Menu */}
              <div className="lg:col-span-6 space-y-3">
                {ACCORDION_FEATURES.map((feat) => {
                  const isOpen = activeAccordionId === feat.id;
                  return (
                    <div
                      key={feat.id}
                      onClick={() => setActiveAccordionId(feat.id)}
                      className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                        isOpen
                          ? 'bg-[#0F172A] border-[#18A9D9]/60 shadow-[0_0_24px_rgba(24,169,217,0.12)]'
                          : 'bg-[#0B131E] border-[#1E293B] hover:border-[#334155]'
                      }`}
                    >
                      <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#18A9D9]">
                            {feat.badge}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white">
                            {feat.title}
                          </h3>
                        </div>
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isOpen ? 'border-[#18A9D9] bg-[#18A9D9]/20 text-[#18A9D9]' : 'border-[#223448] text-[#64748B]'
                        }`}>
                          {isOpen ? '—' : '+'}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="px-5 sm:px-6 pb-6 pt-0 space-y-4 text-xs sm:text-sm text-[#94A3B8] leading-relaxed border-t border-[#1E293B]/60 mt-1">
                          <p className="pt-3">{feat.description}</p>
                          <div className="flex items-center gap-6 pt-2">
                            <div>
                              <div className="text-sm font-extrabold text-white">{feat.stat}</div>
                              <div className="text-[10px] text-[#64748B] uppercase tracking-wider">{feat.statLabel}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-4">
                  <button
                    onClick={handleLaunch}
                    className="w-full py-4 rounded-xl bg-[#83C248] hover:bg-[#93D553] text-[#060B18] font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(131,194,72,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Launch Studio Visualizer</span>
                    <ArrowRight className="w-4 h-4 text-[#060B18]" />
                  </button>
                </div>
              </div>

              {/* Display Stage */}
              <div className="lg:col-span-6 sticky top-28">
                <div className="arc-frame rounded-3xl p-3 sm:p-4 bg-[#0B131E] border border-[#223448] shadow-2xl">
                  <div className="rounded-2xl overflow-hidden bg-[#060B18] border border-[#1E293B] p-6 space-y-6">
                    
                    <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                          Active Feature: {activeAccordion.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#18A9D9] px-2 py-0.5 rounded bg-[#18A9D9]/10 border border-[#18A9D9]/20">
                        {activeAccordion.badge}
                      </span>
                    </div>

                    <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-[#0F172A] border border-[#223448] shadow-inner">
                      <img
                        src={assetPath('demo-pa-two-story.png')}
                        alt="Feature preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                        <div className="bg-[#0B131E]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white font-semibold">
                          {activeAccordion.subtitle}
                        </div>
                        <div className="bg-[#83C248] text-[#060B18] font-extrabold px-3 py-1.5 rounded-lg shadow-lg">
                          Live Active
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-[#0B131E] border border-[#1E293B]">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Performance Metric</div>
                        <div className="text-base font-bold text-white mt-0.5">{activeAccordion.stat}</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#0B131E] border border-[#1E293B]">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Spring Valley Standard</div>
                        <div className="text-base font-bold text-[#18A9D9] mt-0.5">{activeAccordion.statLabel}</div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ──────── THE 5-STAR SPRING VALLEY PROMISE ──────── */}
        <section className="py-24 px-6 max-w-7xl mx-auto" id="guarantee">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#18A9D9]">
              THE SPRING VALLEY PROMISE
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-white">
              Why Pennsylvania homeowners trust our team.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="arc-frame rounded-2xl p-6 bg-[#0B131E] border border-[#1E293B] space-y-3">
              <Award className="w-8 h-8 text-[#18A9D9]" />
              <h3 className="text-lg font-bold text-white">CertainTeed 5-Star Credential</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Only the top 1% of roofing contractors qualify for CertainTeed 5-Star status. Our crews are certified in full Integrity Roof System® specifications.
              </p>
            </div>
            <div className="arc-frame rounded-2xl p-6 bg-[#0B131E] border border-[#83C248]/40 space-y-3 shadow-[0_0_24px_rgba(131,194,72,0.15)]">
              <Shield className="w-8 h-8 text-[#83C248]" />
              <h3 className="text-lg font-bold text-white">SureStart™ PLUS 50-Year Coverage</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Your roof is backed by 50-year non-prorated manufacturer warranty protection against defects, wind damage, and algae discoloration.
              </p>
            </div>
            <div className="arc-frame rounded-2xl p-6 bg-[#0B131E] border border-[#1E293B] space-y-3">
              <Home className="w-8 h-8 text-[#18A9D9]" />
              <h3 className="text-lg font-bold text-white">Local Family Ownership</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Chris and Tricia Booth personally oversee every project. We live where we work, maintaining a 5.0-star reputation across Chester County.
              </p>
            </div>
          </div>
        </section>

        {/* ──────── FAQ ACCORDION ──────── */}
        <section className="py-24 px-6 bg-[#080E1E] border-t border-[#1E293B]/80" id="faq">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#18A9D9]">
                FREQUENTLY ASKED QUESTIONS
              </div>
              <h2 className="font-serif-editorial text-3xl sm:text-5xl font-normal text-white">
                Exterior visualization answered.
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-[#0B131E] border border-[#1E293B] rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#131F2E]/40"
                    >
                      <span className="text-sm sm:text-base font-bold text-white pr-4">{faq.q}</span>
                      <ChevronRight className={`w-4 h-4 text-[#18A9D9] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 border-t border-[#1E293B]/60">
                        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed font-light">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────── BOTTOM HERO BANNER ──────── */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="arc-frame rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-[#0F172A] via-[#0B131E] to-[#060B18] border border-[#18A9D9]/40 relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18A9D9]/15 border border-[#18A9D9]/30 text-[#18A9D9] text-xs font-extrabold uppercase tracking-widest">
                ZERO SALES PRESSURE · 100% FREE
              </div>
              <h2 className="font-serif-editorial text-3xl sm:text-5xl md:text-6xl font-normal text-white leading-tight">
                Design your home’s new exterior right now.
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-light">
                Launch the studio visualizer in seconds, pick your favorite CertainTeed colors, and see your transformed home with instant before-and-after clarity.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleLaunch}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#83C248] hover:bg-[#93D553] text-[#060B18] font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_24px_rgba(131,194,72,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Launch Free Visualizer</span>
                  <ArrowRight className="w-4 h-4 text-[#060B18]" />
                </button>
                <a
                  href="tel:6109485207"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#131F2E] hover:bg-[#1A2838] text-white border border-[#223448] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#83C248]" />
                  <span>Call (610) 948-5207</span>
                </a>
              </div>
            </div>

            {/* Background Watermark */}
            <div className="absolute right-[-4%] bottom-[-15%] font-serif-editorial text-[140px] sm:text-[200px] font-normal text-white/[0.03] select-none pointer-events-none tracking-tighter">
              SPRING VALLEY
            </div>
          </div>
        </section>

      </main>

      {/* ──────── ARCHITECTURAL MINIMALIST FOOTER ──────── */}
      <footer className="border-t border-[#1E293B] bg-[#060B18] py-14 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={`${base}assets/logo.png`}
                  alt="Spring Valley Roofing"
                  className="h-8 w-auto object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-sm">
                Certified CertainTeed 5-Star Contractor serving Chester, Montgomery, and Berks Counties (PA HIC #PA149822). Powered by BlueprintEnvision AI.
              </p>
              <div className="text-[11px] text-[#475569]">
                Spring Valley Roofing · All rights reserved.
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">Contact & Office</h4>
              <ul className="space-y-2 text-xs text-[#94A3B8]">
                <li><a href="tel:6109485207" className="hover:text-white transition-colors">Phone: (610) 948-5207</a></li>
                <li><a href="https://springvalleyroofing.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">springvalleyroofing.com</a></li>
                <li>Serving West Chester, Pottstown, Exton</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">CertainTeed Products</h4>
              <ul className="space-y-2 text-xs text-[#64748B]">
                <li>Landmark® Architectural Shingles</li>
                <li>Monogram® Premium Siding</li>
                <li>Integrity Roof System®</li>
                <li>SureStart™ PLUS 50-Year Coverage</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-[#1E293B] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#475569]">
            <p>© {new Date().getFullYear()} Spring Valley Roofing · Powered by Blueprint AI Consulting Co.</p>
            <p>CertainTeed®, Landmark®, and Monogram® are registered trademarks of CertainTeed LLC.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
