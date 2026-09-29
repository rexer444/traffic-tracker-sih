import React, { useState } from 'react';
import { Vehicle, Journey } from '../../types';
import { PlateBadge } from '../PlateBadge';
import { 
  Search, 
  User, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Car, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  History, 
  CheckCircle2, 
  Flag,
  Printer,
  FileCheck,
  CreditCard,
  Building
} from 'lucide-react';

interface VehicleIdentifierPageProps {
  vehicles: Vehicle[];
  selectedVehiclePlate: string;
  onSelectVehiclePlate: (plate: string) => void;
  onNavigateToJourneyMap: (plate: string) => void;
  onToggleBlacklist: (plateNumber: string, reason?: string) => void;
}

export const VehicleIdentifierPage: React.FC<VehicleIdentifierPageProps> = ({
  vehicles,
  selectedVehiclePlate,
  onSelectVehiclePlate,
  onNavigateToJourneyMap,
  onToggleBlacklist,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [newReason, setNewReason] = useState('');

  const currentVehicle = vehicles.find((v) => v.plateNumber === selectedVehiclePlate) || vehicles[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = vehicles.find(
      (v) =>
        v.plateNumber.toLowerCase().replace(/[\s-]/g, '') ===
          searchInput.toLowerCase().replace(/[\s-]/g, '') ||
        v.owner.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        v.rfidTag.toLowerCase().includes(searchInput.toLowerCase())
    );
    if (found) {
      onSelectVehiclePlate(found.plateNumber);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Breadcrumb Navigation */}
      <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 py-1">
        <span className="text-[#0b3c61] font-bold">Portal Home</span>
        <span>/</span>
        <span>Vehicle Registration Services</span>
        <span>/</span>
        <span className="text-slate-800 font-bold">Vehicle Identifier & Owner Particulars (RC Status)</span>
      </div>

      {/* Top Banner / Search Header */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold border border-emerald-200">
                MODULE 02: CITIZEN VEHICLE REGISTRY & RC AUDIT
              </span>
              <span className="text-xs font-hindi text-slate-600 font-semibold">
                वाहन पहचान, पंजीयन एवं स्वामी विवरण
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0b3c61]">
              Vehicle Registration (RC) & Owner Intelligence Dossier
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Online Verification of Vehicle Ownership, Blacklist Intercept Notices, Fitness, and Historical Journey Records.
            </p>
          </div>

          {/* Quick Registry Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono text-slate-500">Quick Select:</span>
            {vehicles.map((v) => (
              <button
                key={v.plateNumber}
                onClick={() => onSelectVehiclePlate(v.plateNumber)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border ${
                  v.plateNumber === currentVehicle.plateNumber
                    ? 'bg-[#0b3c61] text-white border-[#07263e] shadow-sm'
                    : v.isBlacklisted
                    ? 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {v.plateNumber} {v.isBlacklisted && '⚠️'}
              </button>
            ))}
          </div>
        </div>

        {/* Global Plate / Owner Search Form */}
        <form onSubmit={handleSearchSubmit} className="mt-4 pt-3 border-t border-slate-200 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Registration Number (e.g. MH-12-DE-4491), Owner Name, or FASTag ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0b3c61] focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0b3c61] hover:bg-[#07263e] text-white font-mono font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
          >
            Search RC Record
          </button>
        </form>
      </div>

      {/* SECTION: BLACKLIST / WANTED STATUS BANNER (CRITICAL REQUIREMENT) */}
      {currentVehicle.isBlacklisted ? (
        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 sm:p-5 shadow-sm text-slate-900">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-red-600 text-white shrink-0 mt-0.5 shadow-sm">
                <ShieldAlert className="w-7 h-7" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-black bg-red-600 text-white tracking-wider">
                    ★ अभिलेख स्थिति: ब्लैकलिस्टेड // BLACKLIST INTERCEPT WARRANT
                  </span>
                  <span className="text-xs font-mono font-bold text-red-900 bg-red-200/80 px-2 py-0.5 rounded border border-red-300">
                    SEVERITY: {currentVehicle.blacklistSeverity || 'CRITICAL'}
                  </span>
                  <span className="text-xs font-mono text-slate-600">
                    FLAGGED ON: {currentVehicle.flagDate || 'Recent'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-red-950 font-sans">
                  Enforcement Notice Issued by {currentVehicle.flaggedByAgency || 'State Highway Traffic Police'}
                </h3>

                <p className="text-xs sm:text-sm text-red-900 font-mono mt-1 leading-relaxed bg-white/80 p-2.5 rounded border border-red-300">
                  {currentVehicle.blacklistReason}
                </p>
              </div>
            </div>

            {/* Toggle Status Action */}
            <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2 pt-2 md:pt-0">
              <button
                onClick={() => onToggleBlacklist(currentVehicle.plateNumber)}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold transition-colors shadow-sm"
              >
                Clear Blacklist Notice
              </button>
              <span className="text-[10px] font-mono text-slate-500">
                Official Audit Log Synced
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-400 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-950">
                  अभिलेख स्थिति: वैध // RECORD STATUS: ACTIVE & CLEAR
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900">
                  NO ADVERSE NOTICES
                </span>
              </div>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                No active police warrants, pending impound orders, or unpaid e-challans against this registration mark.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBlacklistModal(true)}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-700 border border-red-300 text-xs font-mono font-semibold transition-colors shrink-0 flex items-center gap-1 shadow-sm"
          >
            <Flag className="w-3.5 h-3.5" />
            Flag / Issue Notice
          </button>
        </div>
      )}

      {/* Flag / Blacklist Dialog Modal */}
      {showBlacklistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-red-400 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <div className="gov-tricolor-bar w-full -mt-5 mb-4 rounded-t-xl"></div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Issue Notice / Flag Registration: {currentVehicle.plateNumber}
            </h3>
            <p className="text-xs text-slate-600 mb-3 font-mono">
              Enter official FIR reference, e-challan violation order, or bench warrant reference.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Speed evasion on NH-48 toll plaza, bench warrant ref..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBlacklistModal(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-800 text-xs font-mono rounded hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onToggleBlacklist(currentVehicle.plateNumber, newReason || 'Automated Transit Enforcement Flag');
                  setShowBlacklistModal(false);
                  setNewReason('');
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold rounded"
              >
                Confirm Blacklist Flag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dossier Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Owner Particulars & RC Specs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* OWNER PARTICULARS (CRITICAL USER REQUIREMENT) */}
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#0b3c61] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-300" />
                <h3 className="text-sm font-bold">
                  Registered Vehicle Owner Credentials // पंजीकृत वाहन स्वामी का विवरण
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-blue-900 px-2 py-0.5 rounded border border-blue-400/40 text-amber-300 font-bold">
                AADHAAR / PAN VERIFIED
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">LEGAL REGISTERED OWNER</span>
                <span className="text-sm font-bold text-slate-900 font-sans">{currentVehicle.owner.name}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">DRIVING LICENSE NUMBER</span>
                <span className="font-bold text-slate-800">{currentVehicle.owner.licenseNumber}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Valid Till: {currentVehicle.owner.licenseValidity}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">NATIONAL CITIZEN IDENTIFIER</span>
                <span className="font-bold text-slate-800">{currentVehicle.owner.nationalId}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">DEMERIT PENALTY POINTS</span>
                <span className={`font-bold text-sm ${currentVehicle.owner.penaltyPoints >= 8 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {currentVehicle.owner.penaltyPoints} / 12 Points
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {currentVehicle.owner.penaltyPoints >= 8 ? '(Action Threshold Exceeded)' : '(Clean Record)'}
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#0b3c61]" /> REGISTERED TELEPHONE
                </span>
                <span className="font-bold text-slate-800">{currentVehicle.owner.phone}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#0b3c61]" /> REGISTERED EMAIL
                </span>
                <span className="font-bold text-slate-800 truncate block">{currentVehicle.owner.email}</span>
              </div>

              <div className="sm:col-span-2 p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-600" /> PERMANENT RESIDENTIAL ADDRESS (AS PER RC)
                </span>
                <span className="text-slate-800 font-sans font-medium">{currentVehicle.owner.address}</span>
              </div>

              <div className="sm:col-span-2 p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">EMERGENCY CONTACT PERSON</span>
                <span className="text-slate-800 font-sans">{currentVehicle.owner.emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* VEHICLE REGISTRATION PARTICULARS */}
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-100 p-3.5 border-b border-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-[#0b3c61]" />
                <h3 className="text-sm font-bold text-[#0b3c61]">
                  Vehicle Technical & Registration Particulars // वाहन विवरण
                </h3>
              </div>
              <PlateBadge
                plateNumber={currentVehicle.plateNumber}
                size="sm"
                isBlacklisted={currentVehicle.isBlacklisted}
              />
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">MAKER & MODEL</span>
                <span className="font-bold text-slate-900">{currentVehicle.make} {currentVehicle.model}</span>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">REGISTRATION YEAR</span>
                <span className="font-bold text-slate-800">{currentVehicle.year}</span>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">BODY COLOR</span>
                <span className="font-bold text-slate-800">{currentVehicle.color}</span>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">CHASSIS / VIN #</span>
                <span className="font-bold text-slate-800 truncate block">{currentVehicle.vin}</span>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">ENGINE NUMBER</span>
                <span className="font-bold text-slate-800 truncate block">{currentVehicle.engineNumber}</span>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">FUEL TYPE</span>
                <span className="font-bold text-blue-900">{currentVehicle.fuelType}</span>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">FASTAG RFID TAG ID</span>
                <span className="font-bold text-amber-800">{currentVehicle.rfidTag}</span>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">INSURANCE STATUS</span>
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {currentVehicle.insuranceStatus}
                </span>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">FITNESS CERTIFICATE</span>
                <span className="font-bold text-slate-800">{currentVehicle.fitnessExpiry}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: PREVIOUS JOURNEY PATH HISTORY (CRITICAL REQUIREMENT) (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="bg-[#0b3c61] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-300" />
                <h3 className="text-sm font-bold">
                  Previous Journey Path History // पूर्व यात्रा इतिहास
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-blue-900 text-amber-300 px-2 py-0.5 rounded border border-blue-400/40 font-bold">
                {currentVehicle.previousJourneys.length + (currentVehicle.currentJourney ? 1 : 0)} Total Logs
              </span>
            </div>

            {/* Current Active Journey Card */}
            {currentVehicle.currentJourney && (
              <div className="p-4 border-b border-slate-200 bg-blue-50/60">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-[#0b3c61] text-white font-bold text-[10px]">
                    LATEST TRAVEL RECORD
                  </span>
                  <span className="text-slate-600 font-bold">{currentVehicle.currentJourney.date}</span>
                </div>

                <div className="text-sm font-bold text-slate-900 mb-1">
                  {currentVehicle.currentJourney.startLocation} → {currentVehicle.currentJourney.destination}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono mt-2.5 pt-2 border-t border-blue-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block">DISTANCE</span>
                    <span className="text-slate-900 font-bold">{currentVehicle.currentJourney.totalDistanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">TIME</span>
                    <span className="text-slate-900 font-bold">{currentVehicle.currentJourney.durationMinutes} min</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-red-700 block">PEAK SPEED</span>
                    <span className="text-red-700 font-bold">{currentVehicle.currentJourney.highestSpeed} km/h</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToJourneyMap(currentVehicle.plateNumber)}
                  className="mt-3 w-full py-2 bg-[#0b3c61] hover:bg-[#07263e] text-white font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-300" />
                  Load Route into Interactive Journey Map
                </button>
              </div>
            )}

            {/* Previous Journeys List */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
              {currentVehicle.previousJourneys.length > 0 ? (
                currentVehicle.previousJourneys.map((prevJrn) => (
                  <div
                    key={prevJrn.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-300 hover:border-slate-400 transition-colors text-xs font-mono"
                  >
                    <div className="flex items-center justify-between text-slate-600 mb-1">
                      <span className="text-slate-800 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#0b3c61]" />
                        {prevJrn.date}
                      </span>
                      <span>
                        {prevJrn.startTime} – {prevJrn.endTime}
                      </span>
                    </div>

                    <div className="text-slate-900 font-bold text-sm mb-1.5 font-sans">
                      {prevJrn.startLocation} → {prevJrn.destination}
                    </div>

                    {/* Route checkpoints */}
                    <div className="flex items-center gap-1 overflow-x-auto py-1 text-[10px] text-slate-600">
                      {prevJrn.checkpoints.map((cp, idx) => (
                        <React.Fragment key={cp.id}>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-slate-300 shrink-0 font-medium">
                            {cp.id} ({cp.recordedSpeed}k)
                          </span>
                          {idx < prevJrn.checkpoints.length - 1 && <span>→</span>}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[11px]">
                      <span className="text-slate-600">
                        Span: <strong>{prevJrn.totalDistanceKm}km</strong> ({prevJrn.durationMinutes}m)
                      </span>
                      <span className="text-red-700 font-bold">
                        Peak: {prevJrn.highestSpeed} km/h
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-lg bg-slate-50 border border-dashed border-slate-300 text-xs font-mono text-slate-500">
                  No additional archival journey paths on record for this registration mark within 30 days.
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-500 text-center">
              Official Transport Registry Data • Retention: 30 Days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
