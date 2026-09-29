import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PlateBadgeProps {
  plateNumber: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isBlacklisted?: boolean;
  showStatusIndicator?: boolean;
  className?: string;
}

export const PlateBadge: React.FC<PlateBadgeProps> = ({
  plateNumber,
  size = 'md',
  isBlacklisted = false,
  showStatusIndicator = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 tracking-wider border',
    md: 'text-sm px-3 py-1 tracking-widest border-2',
    lg: 'text-base sm:text-lg px-4 py-1.5 tracking-widest font-bold border-2',
    xl: 'text-xl sm:text-2xl px-5 py-2 tracking-widest font-black border-2 sm:border-[2.5px]',
  };

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      {/* High Security Registration Plate (HSRP) format */}
      <div
        className={`relative inline-flex items-center bg-white text-slate-900 font-mono font-bold rounded shadow-sm select-all overflow-hidden border-slate-700 ${
          sizeStyles[size]
        } ${isBlacklisted ? 'ring-2 ring-red-600 bg-red-50/40' : 'ring-1 ring-slate-400'}`}
      >
        {/* Blue IND left strip with Chakra indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-3.5 sm:w-4 bg-[#0a3882] flex flex-col items-center justify-between py-0.5 text-[7px] text-white font-mono leading-none select-none">
          <span className="text-[6px] text-amber-300 font-bold">★</span>
          <span className="text-[6.5px] tracking-tighter scale-75 origin-center font-bold">IND</span>
        </div>

        {/* Laser etched chromium hologram simulation */}
        <div className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-400 border border-slate-400 opacity-80"></div>

        {/* Plate characters */}
        <span className="ml-2.5 sm:ml-3 font-mono font-bold tracking-widest uppercase text-slate-950">
          {plateNumber}
        </span>
      </div>

      {showStatusIndicator && (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
            isBlacklisted
              ? 'bg-red-100 text-red-800 border-red-300'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
          }`}
        >
          {isBlacklisted ? (
            <>
              <AlertTriangle className="w-3 h-3 text-red-700" />
              BLACKLISTED / INTERCEPT
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              RECORD CLEAR
            </>
          )}
        </span>
      )}
    </div>
  );
};
