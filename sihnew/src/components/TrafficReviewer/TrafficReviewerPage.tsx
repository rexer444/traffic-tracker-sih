import React, { useState } from 'react';
import { CitySectorTraffic, TrafficActionOption } from '../../types';
import { CITY_SECTORS, TRAFFIC_ACTION_OPTIONS } from '../../data/mockData';
import { ComingSoonModal } from '../ComingSoonModal';
import { 
  Building2, 
  Activity, 
  AlertTriangle, 
  Gauge, 
  Cpu, 
  Siren, 
  Compass, 
  Plane, 
  ShieldAlert, 
  Sparkles, 
  MapPin, 
  Car, 
  TrendingUp, 
  ArrowRight,
  Sliders,
  Layers,
  Lock,
  FileText
} from 'lucide-react';

interface TrafficReviewerPageProps {
  currentCity: string;
  onSelectCity: (city: string) => void;
}

export const TrafficReviewerPage: React.FC<TrafficReviewerPageProps> = ({
  currentCity,
  onSelectCity,
}) => {
  const [selectedSector, setSelectedSector] = useState<CitySectorTraffic | null>(CITY_SECTORS[0]);
  const [activeActionOption, setActiveActionOption] = useState<TrafficActionOption | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const CITIES = [
    { id: 'Metropolis Central', name: 'Metropolis Central', state: 'Capital Urban Grid', cameras: 1420 },
    { id: 'Neo-Bay Maritime Zone', name: 'Neo-Bay Maritime Zone', state: 'Port & Coastal Ring', cameras: 980 },
    { id: 'Cyberabad Tech Grid', name: 'Cyberabad Tech Grid', state: 'Hi-Tech Expressway', cameras: 1150 },
    { id: 'Greater Bengaluru Corridor', name: 'Greater Bengaluru Corridor', state: 'Southern Metro', cameras: 1680 },
  ];

  const avgCityCongestion = Math.round(
    CITY_SECTORS.reduce((acc, s) => acc + s.congestionIndex, 0) / CITY_SECTORS.length
  );
  const totalVehiclesHour = CITY_SECTORS.reduce((acc, s) => acc + s.vehicleCountPerHour, 0);
  const totalIncidents = CITY_SECTORS.reduce((acc, s) => acc + s.incidentsReported, 0);

  const filteredOptions = categoryFilter === 'All'
    ? TRAFFIC_ACTION_OPTIONS
    : TRAFFIC_ACTION_OPTIONS.filter((o) => o.category === categoryFilter);

  const renderOptionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-[#0b3c61]" />;
      case 'Siren': return <Siren className="w-5 h-5 text-red-600" />;
      case 'Compass': return <Compass className="w-5 h-5 text-amber-600" />;
      case 'Plane': return <Plane className="w-5 h-5 text-sky-600" />;
      case 'Gauge': return <Gauge className="w-5 h-5 text-indigo-600" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-red-600" />;
      default: return <Sliders className="w-5 h-5 text-[#0b3c61]" />;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Breadcrumb Navigation */}
      <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 py-1">
        <span className="text-[#0b3c61] font-bold">Portal Home</span>
        <span>/</span>
        <span>Urban Mobility Analytics</span>
        <span>/</span>
        <span className="text-slate-800 font-bold">City Traffic Density Reviewer & Control Options</span>
      </div>

      {/* Top Banner / City Selector */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-200">
                MODULE 03: URBAN DENSITY MATRIX & AI DISPATCH
              </span>
              <span className="text-xs font-hindi text-slate-600 font-semibold">
                नगर यातायात घनत्व समीक्षा एवं नियंत्रण
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0b3c61]">
              City Traffic Density Reviewer & Mitigation Protocols
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Continuous sector congestion scoring, primary bottleneck diagnostic, and forthcoming autonomous grid intervention options.
            </p>
          </div>

          {/* City Selector Pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs font-mono text-slate-600 font-semibold">Select Urban Region:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {CITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCity(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                    currentCity === c.id
                      ? 'bg-[#0b3c61] text-white border-[#07263e] shadow-sm'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* City-Wide KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Mean Congestion Index */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between border-b border-slate-100 pb-1">
              <span>CONGESTION DENSITY INDEX</span>
              <Activity className="w-3.5 h-3.5 text-amber-600" />
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-amber-700">
                {avgCityCongestion}%
              </span>
              <span className="text-xs font-mono font-bold text-amber-800">
                HIGH DENSITY
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
                style={{ width: `${avgCityCongestion}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] font-mono text-slate-600 flex items-center justify-between border-t border-slate-200">
            <span>Peak Window:</span>
            <span className="font-bold text-slate-900">08:00 – 11:00 AM</span>
          </div>
        </div>

        {/* Metric 2: Vehicles Per Hour */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between border-b border-slate-100 pb-1">
              <span>MONITORED HOURLY VEHICLES</span>
              <Car className="w-3.5 h-3.5 text-[#0b3c61]" />
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-slate-900">
                {totalVehiclesHour.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-slate-600">VEH/HR</span>
            </div>

            <div className="mt-1.5 text-xs text-slate-600 font-sans">
              Monitored via High-Speed ANPR Checkposts across Expressways
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] font-mono text-slate-600 flex items-center justify-between border-t border-slate-200">
            <span>Daily Volume Trend:</span>
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12.4% vs Avg
            </span>
          </div>
        </div>

        {/* Metric 3: Active CCTV Cameras */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between border-b border-slate-100 pb-1">
              <span>ACTIVE ANPR CAMERAS</span>
              <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-slate-900">
                250+
              </span>
              <span className="text-xs font-mono text-emerald-700 font-bold">ONLINE</span>
            </div>

            <div className="mt-1.5 text-xs text-slate-600 font-sans">
              Multi-Lane Gantry CCTVs with Optical ANPR Edge Units
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] font-mono text-slate-600 flex items-center justify-between border-t border-slate-200">
            <span>Sensor Calibration:</span>
            <span className="text-emerald-700 font-bold">99.8% Online</span>
          </div>
        </div>

        {/* Metric 4: Active Chokepoints */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between border-b border-slate-100 pb-1">
              <span>ACTIVE BOTTLENECK CHOKEPOINTS</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-red-700">
                {totalIncidents}
              </span>
              <span className="text-xs font-mono text-slate-600">SECTORS FLAGGED</span>
            </div>

            <div className="mt-1.5 text-xs text-slate-600 font-sans">
              Civic Plaza Flyover & Port Cargo Inbound Gates
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] font-mono text-slate-600 flex items-center justify-between border-t border-slate-200">
            <span>Dispatch Advisory:</span>
            <span className="text-amber-800 font-bold">Traffic Diversion Active</span>
          </div>
        </div>
      </div>

      {/* SECTION: SECTOR DENSITY MATRIX & DIAGNOSTIC RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Sector Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-100 p-3.5 border-b border-slate-300 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0b3c61] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#0b3c61]" />
                Urban Sector Density Matrix // नगर खंड घनत्व मैट्रिक्स
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Click any sector to inspect camera units and bottleneck diagnostics
              </p>
            </div>
            <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-700">
              {CITY_SECTORS.length} Urban Sectors
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {CITY_SECTORS.map((sec) => {
              const isSelected = sec.id === selectedSector?.id;
              const isGridlock = sec.congestionIndex >= 80;
              const isCongested = sec.congestionIndex >= 60 && sec.congestionIndex < 80;

              return (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSector(sec)}
                  className={`p-3.5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-amber-50/80 border-l-4 border-l-amber-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {sec.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                          {sec.code}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isGridlock
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : isCongested
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {sec.status}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-slate-600 mt-1 flex items-center gap-1.5">
                        <span className="text-slate-500">Bottleneck:</span>
                        <span className="text-slate-800 font-medium truncate max-w-sm">{sec.primaryBottleneck}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end text-xs font-mono">
                      <div className="text-right">
                        <div className="text-slate-700">
                          Avg: <strong>{sec.averageSpeed} km/h</strong>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Limit: {sec.speedLimit} km/h
                        </div>
                      </div>

                      <div className="w-16 text-center">
                        <span
                          className={`text-base font-black ${
                            isGridlock ? 'text-red-700' : isCongested ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {sec.congestionIndex}%
                        </span>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
                          <div
                            className={`h-full ${
                              isGridlock ? 'bg-red-600' : isCongested ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${sec.congestionIndex}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Sector Diagnostic (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0b3c61] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                Sector Radar Diagnostic // खंड रडार निदान
              </h3>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-300">
                {selectedSector?.code}
              </span>
            </div>

            {selectedSector && (
              <div className="space-y-3">
                {/* Sector radar graphical display */}
                <div className="relative h-40 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden">
                  <div className="w-32 h-32 rounded-full border border-slate-300 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border border-slate-400 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full border border-[#0b3c61] bg-blue-50"></div>
                    </div>
                  </div>

                  <div className="relative text-center z-10">
                    <span className="text-3xl font-black font-mono text-[#0b3c61] block">
                      {selectedSector.congestionIndex}%
                    </span>
                    <span className="text-xs font-mono text-slate-700 font-bold uppercase">
                      {selectedSector.name}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Hourly Throughput:</span>
                    <span className="font-bold text-slate-800">{selectedSector.vehicleCountPerHour.toLocaleString()} vehicles/hr</span>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Active Cameras in Sector:</span>
                    <span className="font-bold text-[#0b3c61]">{selectedSector.activeSurveillanceCameras} Units</span>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Active Incident Flags:</span>
                    <span className={selectedSector.incidentsReported > 0 ? 'text-red-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {selectedSector.incidentsReported} Active Incidents
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-800 font-bold block mb-0.5">PRIMARY BOTTLENECK DIAGNOSTIC</span>
                    <p className="text-slate-800 text-xs font-sans leading-relaxed">
                      {selectedSector.primaryBottleneck}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 text-[10px] font-mono text-slate-500 text-center">
            Automated ANPR Sensor Polling Rate: 1000ms
          </div>
        </div>
      </div>

      {/* SECTION: PERFORMANCE OPTIONS GRID WITH MANDATORY "COMING SOON..." TRIGGER */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-base sm:text-lg font-bold text-[#0b3c61]">
                Autonomous Urban Traffic Control & Mitigation Options
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Available performance options for dispatch intervention (All options trigger advance Phase II notification)
            </p>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Signal Control', 'Fleet & Drone', 'Eco & Dynamic', 'Enforcement'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#0b3c61] text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Action Option Cards - CLICKING SHOWS "COMING SOON..." (CRITICAL USER REQUIREMENT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => setActiveActionOption(option)}
              className="group p-4 rounded-xl bg-slate-50 border border-slate-300 hover:border-[#0b3c61] hover:bg-blue-50/40 transition-all cursor-pointer flex flex-col justify-between relative shadow-sm"
            >
              {/* Coming soon corner badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Lock className="w-2.5 h-2.5" />
                  COMING SOON
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-2 rounded-lg bg-white border border-slate-300 group-hover:border-[#0b3c61] transition-colors shadow-xs">
                    {renderOptionIcon(option.iconName)}
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                      {option.category}
                    </span>
                    <span className="text-xs font-mono text-[#0b3c61] font-bold">
                      {option.badge}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0b3c61] transition-colors mb-1.5 leading-snug">
                  {option.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-3 mb-3">
                  {option.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">PROJECTED IMPACT:</span>
                  <span className="text-emerald-700 font-bold">{option.projectedImpact}</span>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0b3c61] group-hover:underline">
                    Perform Action <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* THE "COMING SOON" MODAL */}
      <ComingSoonModal
        option={activeActionOption}
        onClose={() => setActiveActionOption(null)}
        cityName={currentCity}
      />
    </div>
  );
};
