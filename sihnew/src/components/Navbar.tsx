import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Search, 
  BarChart3, 
  Video, 
  Clock, 
  Phone, 
  Globe, 
  HelpCircle, 
  FileText, 
  Radio, 
  Eye, 
  CheckCircle2, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'journey' | 'identifier' | 'reviewer' | 'live';
  onSelectTab: (tab: 'journey' | 'identifier' | 'reviewer' | 'live') => void;
  selectedCity: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  selectedCity,
}) => {
  const [timeString, setTimeString] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0); // -1, 0, 1
  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'HI'>('EN');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-IN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateString(
        now.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'journey' as const,
      label: 'Journey Map',
      hindiLabel: 'वाहन यात्रा मानचित्र',
      subtext: 'Trajectory & Peak Speed',
      icon: Map,
    },
    {
      id: 'identifier' as const,
      label: 'Vehicle Identifier',
      hindiLabel: 'वाहन एवं स्वामी विवरण',
      subtext: 'Owner Info & Blacklist Log',
      icon: Search,
    },
    {
      id: 'reviewer' as const,
      label: 'Traffic Reviewer',
      hindiLabel: 'यातायात घनत्व समीक्षक',
      subtext: 'City Density & AI Options',
      icon: BarChart3,
    },
    {
      id: 'live' as const,
      label: 'Live Surveillance',
      hindiLabel: 'प्रत्यक्ष कैमरा निगरानी',
      subtext: 'CCTV Feeds & OCR Stream',
      icon: Video,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-300 shadow-sm">
      {/* 1. Indian Portal Top Accessibility & Utility Bar */}
      <div className="bg-[#0b2b48] text-slate-200 text-xs py-1 px-4 sm:px-6 lg:px-8 border-b border-blue-900/60 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Date & Time in IST */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-slate-300">
              {dateString || 'Tuesday, 29 September 2026'}
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="flex items-center gap-1 text-amber-300 font-bold">
              <Clock className="w-3 h-3 text-amber-400" />
              {timeString || '18:30:00'} IST
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <Phone className="w-3 h-3 text-emerald-400" />
              Helpline: <strong>1800-180-2026 (Toll Free 24x7)</strong>
            </span>
          </div>

          {/* Right: Accessibility Font Sizer, Screen Reader, Language Toggle */}
          <div className="flex items-center gap-3 text-[11px] ml-auto">
            <a href="#main-content" className="hover:text-amber-300 hidden lg:inline underline">
              Skip to Main Content
            </a>
            <span className="text-slate-500 hidden lg:inline">|</span>

            {/* Font Sizer */}
            <div className="flex items-center gap-1 bg-slate-900/70 px-1.5 py-0.5 rounded border border-slate-700 select-none">
              <button
                onClick={() => setFontSizeLevel(-1)}
                className={`px-1 hover:text-white ${fontSizeLevel === -1 ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
                title="Decrease Font Size"
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeLevel(0)}
                className={`px-1 hover:text-white ${fontSizeLevel === 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
                title="Default Font Size"
              >
                A
              </button>
              <button
                onClick={() => setFontSizeLevel(1)}
                className={`px-1 hover:text-white ${fontSizeLevel === 1 ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
                title="Increase Font Size"
              >
                A+
              </button>
            </div>

            <span className="text-slate-500">|</span>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 text-xs">
              <Globe className="w-3 h-3 text-cyan-400" />
              <button
                onClick={() => setSelectedLanguage('EN')}
                className={`hover:underline font-semibold ${selectedLanguage === 'EN' ? 'text-amber-300' : 'text-slate-400'}`}
              >
                English
              </button>
              <span className="text-slate-500">/</span>
              <button
                onClick={() => setSelectedLanguage('HI')}
                className={`hover:underline font-semibold font-hindi ${selectedLanguage === 'HI' ? 'text-amber-300' : 'text-slate-400'}`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Distinctive Indian Tricolor Top Ribbon */}
      <div className="gov-tricolor-bar w-full"></div>

      {/* 3. Main Portal Header with Bilingual Branding (NO GOVT LOGO OR NAMES) */}
      <div className="bg-white py-3 sm:py-4 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Custom Geometric Civic Transit Emblem & Titles */}
          <div className="flex items-center gap-3.5">
            {/* Custom Abstract Public Sector Seal / Emblem (Camera Lens + Highway Intersect, NO Lion Capital) */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#0b3c61] to-[#1a5b8c] p-0.5 shadow-md flex items-center justify-center shrink-0 border-2 border-amber-500/80">
              <div className="w-full h-full rounded-full border border-amber-300/40 flex flex-col items-center justify-center text-white">
                {/* Abstract geometric transit radar crest */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white flex items-center justify-center relative">
                  <div className="absolute inset-0 border border-dashed border-amber-300 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  {/* Cardinal road vectors */}
                  <div className="absolute top-0 bottom-0 w-[1.5px] bg-white/70"></div>
                  <div className="absolute left-0 right-0 h-[1.5px] bg-white/70"></div>
                </div>
              </div>
            </div>

            <div>
              {/* Hindi Title */}
              <div className="text-[12px] sm:text-[14px] font-hindi font-bold text-slate-700 leading-tight">
                राष्ट्रीय स्वचालित वाहन गति एवं मार्ग निगरानी पोर्टल
              </div>
              {/* English Primary Title */}
              <h1 className="text-lg sm:text-2xl font-extrabold text-[#0b3c61] tracking-tight leading-tight">
                National Transit & ANPR Trajectory Portal
              </h1>
              {/* Sub-tagline */}
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-wide">
                Unified Autonomous Urban Traffic Intelligence & Multi-Camera Enforcement System
              </p>
            </div>
          </div>

          {/* Right: Portal Certification & City Badges */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="hidden sm:flex flex-col items-end text-right border-r border-slate-300 pr-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase">ACTIVE SECTOR COMMAND</span>
              <span className="text-xs font-bold text-[#0b3c61] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                {selectedCity}
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded text-left">
              <span className="text-[9px] font-mono font-bold text-blue-900 block leading-none">
                AI ENGINE VERIFIED
              </span>
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ISO 39001 COMPLIANT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Classic Indian Government Primary Nav Bar (Deep Navy Blue #0b3c61) */}
      <nav className="gov-navy-bg text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-stretch overflow-x-auto gap-0 text-sm font-medium">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 text-left transition-all border-r border-blue-800/80 shrink-0 flex items-center gap-2.5 relative select-none ${
                    isActive
                      ? 'bg-[#07263e] text-amber-300 font-bold shadow-inner'
                      : 'text-slate-100 hover:bg-[#0f4e7d] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-blue-200'}`} />
                  <div>
                    <div className="text-xs sm:text-sm leading-snug">
                      {item.label}
                    </div>
                    <div className="text-[10px] font-hindi text-slate-300 opacity-90 leading-none mt-0.5">
                      {item.hindiLabel}
                    </div>
                  </div>

                  {/* Saffron bottom highlight bar for active tab */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 5. Indian Portal News/Notice Marquee Bar */}
      <div className="bg-amber-50 border-b border-amber-200 py-1.5 px-4 sm:px-6 lg:px-8 text-xs text-amber-900 flex items-center overflow-hidden">
        <div className="shrink-0 flex items-center gap-1 font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded text-[11px] mr-3">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          <span>सूचना / NOTICE:</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-marquee inline-block font-medium">
            ★ Real-time 24x7 Multi-Camera High-Speed Radar Intercept is active on all Expressways & Ring Flyovers. Speed limits are strictly monitored via Automated Optical ANPR Checkpoints. Over-speeding & blacklisted vehicle warrants are logged with microsecond timestamps.
          </div>
        </div>
      </div>
    </header>
  );
};
