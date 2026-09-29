import React, { useState } from 'react';
import { TrafficActionOption } from '../types';
import { X, AlertCircle, Cpu, CheckCircle2, BellRing, Lock, FileText, ArrowRight } from 'lucide-react';

interface ComingSoonModalProps {
  option: TrafficActionOption | null;
  onClose: () => void;
  cityName?: string;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  option,
  onClose,
  cityName = 'Metropolis Central',
}) => {
  const [requestedAccess, setRequestedAccess] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  if (!option) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tricolor top stripe */}
        <div className="gov-tricolor-bar w-full"></div>

        {/* Modal Header */}
        <div className="bg-[#0b3c61] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-blue-900/60 border border-blue-400/40">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider text-amber-300 font-bold block uppercase">
                ADVANCE PUBLIC NOTICE // आगामी प्रणाली अद्यतन
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {option.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded hover:bg-blue-800/80 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Official "COMING SOON" Status Callout */}
          <div className="p-4 rounded-lg bg-amber-50 border-l-4 border-amber-500 mb-5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>शीघ्र उपलब्ध // COMING SOON — PHASE II STAGING</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              This automated traffic intervention module is currently undergoing trial-run validation under the Urban Autonomous Mobility Framework. Operational control will be commissioned in the upcoming cycle.
            </p>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-5">
            {option.description}
          </p>

          {/* Technical Specifications Grid in Indian Portal Tabular Style */}
          <div className="border border-slate-200 rounded-lg overflow-hidden mb-5 text-xs">
            <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700 border-b border-slate-200 flex items-center justify-between">
              <span>TECHNICAL SPECIFICATIONS & PROJECTION</span>
              <span className="text-[10px] font-mono text-slate-500">{option.category}</span>
            </div>
            <div className="divide-y divide-slate-200">
              <div className="grid grid-cols-2 p-3 bg-white">
                <span className="text-slate-500 font-medium">Projected Congestion Impact:</span>
                <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {option.projectedImpact}
                </span>
              </div>
              <div className="grid grid-cols-2 p-3 bg-slate-50/50">
                <span className="text-slate-500 font-medium">AI Algorithm Processing Latency:</span>
                <span className="font-bold text-[#0b3c61] font-mono flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  {option.estimatedLatency}
                </span>
              </div>
              <div className="grid grid-cols-2 p-3 bg-white">
                <span className="text-slate-500 font-medium">Target Deployment Hub:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {cityName} Urban Traffic Control
                </span>
              </div>
            </div>
          </div>

          {/* Citizen / Officer Early Alert Subscription Form */}
          {requestedAccess ? (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-center animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <div className="text-sm font-bold text-emerald-800">
                अभिलेख दर्ज किया गया // Official Notification Registered
              </div>
              <div className="text-xs text-slate-600 mt-1">
                You will receive deployment circulars for {option.title}.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Register for Deployment Notification / Pilot Access:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="official.email@transit-portal.org"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0b3c61]"
                />
                <button
                  onClick={() => setRequestedAccess(true)}
                  className="px-4 py-2 bg-[#0b3c61] hover:bg-[#07263e] text-white font-medium text-xs rounded flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-300" />
                  Submit Request
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">
              Reference: Circular #URBAN-TRF-2026/09
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
            >
              बंद करें // Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
