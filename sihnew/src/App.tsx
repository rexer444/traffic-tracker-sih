import React, { useState } from 'react';
import { MOCK_VEHICLES } from './data/mockData';
import { Vehicle } from './types';
import { Navbar } from './components/Navbar';
import { JourneyMapPage } from './components/JourneyMap/JourneyMapPage';
import { VehicleIdentifierPage } from './components/VehicleIdentifier/VehicleIdentifierPage';
import { TrafficReviewerPage } from './components/TrafficReviewer/TrafficReviewerPage';
import { LiveSurveillancePage } from './components/LiveSurveillance/LiveSurveillancePage';
import { ShieldCheck, Phone, Mail, Clock, ExternalLink, HelpCircle, FileCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'journey' | 'identifier' | 'reviewer' | 'live'>('journey');
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string>('MH-12-DE-4491');
  const [selectedCity, setSelectedCity] = useState<string>('Metropolis Central');

  const handleToggleBlacklist = (plateNumber: string, reason?: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.plateNumber === plateNumber) {
          const nextStatus = !v.isBlacklisted;
          return {
            ...v,
            isBlacklisted: nextStatus,
            blacklistReason: nextStatus ? (reason || 'Automated Transit Enforcement Notice Issued') : undefined,
            blacklistSeverity: nextStatus ? 'Critical' : undefined,
            flagDate: nextStatus ? '29 Sep 2026 (Live)' : undefined,
            flaggedByAgency: nextStatus ? 'Metropolitan Traffic Enforcement Division' : undefined,
          };
        }
        return v;
      })
    );
  };

  const navigateToJourney = (plate: string) => {
    setSelectedVehiclePlate(plate);
    setActiveTab('journey');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToIdentifier = (plate: string) => {
    setSelectedVehiclePlate(plate);
    setActiveTab('identifier');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col font-sans selection:bg-amber-500/30 selection:text-[#0b3c61]">
      {/* 1. Indian Government Portal Header & Primary Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedCity={selectedCity}
      />

      {/* 2. Main Portal Content Section */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Page 1: Journey Map */}
        {activeTab === 'journey' && (
          <JourneyMapPage
            vehicles={vehicles}
            selectedVehiclePlate={selectedVehiclePlate}
            onSelectVehiclePlate={setSelectedVehiclePlate}
            onNavigateToIdentifier={navigateToIdentifier}
          />
        )}

        {/* Page 2: Vehicle Identifier */}
        {activeTab === 'identifier' && (
          <VehicleIdentifierPage
            vehicles={vehicles}
            selectedVehiclePlate={selectedVehiclePlate}
            onSelectVehiclePlate={setSelectedVehiclePlate}
            onNavigateToJourneyMap={navigateToJourney}
            onToggleBlacklist={handleToggleBlacklist}
          />
        )}

        {/* Page 3: Traffic Reviewer */}
        {activeTab === 'reviewer' && (
          <TrafficReviewerPage
            currentCity={selectedCity}
            onSelectCity={setSelectedCity}
          />
        )}

        {/* Page 4: Live Surveillance & ANPR Feeds Hub */}
        {activeTab === 'live' && (
          <LiveSurveillancePage
            onNavigateToJourney={navigateToJourney}
            onNavigateToIdentifier={navigateToIdentifier}
          />
        )}
      </main>

      {/* 3. Authentic Indian Portal Footer */}
      <footer className="mt-auto border-t border-slate-300 bg-white">
        {/* Top Tricolor Bar Accent */}
        <div className="gov-tricolor-bar w-full"></div>

        {/* Primary Footer Links (Deep Navy Background #0b3c61) */}
        <div className="bg-[#0b3c61] text-slate-200 py-8 px-4 sm:px-6 lg:px-8 border-b border-blue-900 text-xs">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Col 1: Portal About */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white text-[#0b3c61] font-bold flex items-center justify-center text-xs border border-amber-400">
                  ★
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    National Transit Portal
                  </h4>
                  <span className="text-[10px] text-amber-300 font-hindi">
                    राष्ट्रीय पारगमन पोर्टल
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Centralized automated multi-camera surveillance trajectory mapping, citizen vehicle registration intelligence, and urban traffic density analytics platform.
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                System Version: v4.2.8 • Server Build: 2026.09
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5 pb-1 border-b border-blue-800">
                Portal Services // पोर्टल सेवाएं
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li>
                  <button onClick={() => setActiveTab('journey')} className="hover:text-amber-300 transition-colors">
                    • Vehicle Journey Map & Speed Profiler
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('identifier')} className="hover:text-amber-300 transition-colors">
                    • Vehicle Identifier & Owner Particulars
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('reviewer')} className="hover:text-amber-300 transition-colors">
                    • City Traffic Density Reviewer & AI Options
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('live')} className="hover:text-amber-300 transition-colors">
                    • Live Highway CCTV & ANPR Detection Feeds
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Guidelines & Policies */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5 pb-1 border-b border-blue-800">
                Policies & Charters // नीतियां
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="hover:text-amber-300 cursor-pointer">• Website Policies & Hyperlinking Policy</li>
                <li className="hover:text-amber-300 cursor-pointer">• Privacy Policy & Citizen Data Security</li>
                <li className="hover:text-amber-300 cursor-pointer">• Citizen Charter & Redressal Mechanism</li>
                <li className="hover:text-amber-300 cursor-pointer">• Help, FAQ & User Manual for Citizen Services</li>
                <li className="hover:text-amber-300 cursor-pointer">• Copyright & Disclaimer Notice</li>
              </ul>
            </div>

            {/* Col 4: Helpdesk & Control Room */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5 pb-1 border-b border-blue-800">
                Contact & Control Room // नियंत्रण कक्ष
              </h4>
              <div className="text-[11px] text-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Toll Free Helpline: <strong>1800-180-2026</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Support: <strong>helpdesk@transit-portal.org</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>24x7 Real-time Surveillance Helpdesk</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-blue-950 text-emerald-300 px-2.5 py-1 rounded border border-blue-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  STQC / W3C Level-AA Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-footer Copyright & Portal Metadata (#07263e) */}
        <div className="bg-[#07263e] text-slate-400 py-3.5 px-4 sm:px-6 lg:px-8 text-[11px] font-mono border-t border-blue-950">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 text-center md:text-left">
            <div>
              <p>
                Website Designed, Developed and Maintained by <strong>Autonomous Digital Transport Infrastructure & Urban Mobility Grid</strong>.
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                All rights reserved. Contents of this portal are managed by the Integrated Traffic Surveillance Authority.
              </p>
            </div>

            <div className="shrink-0 text-slate-400 text-[10px]">
              <div>Portal Last Updated: <strong>29 September 2026</strong></div>
              <div>Today's ANPR Scans: <strong>2,418,920 Verified</strong></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
