import React, { useState } from 'react';
import { CameraCheckpoint } from '../../types';
import { Camera, AlertTriangle, ZoomIn, ZoomOut, RotateCcw, MapPin, Compass } from 'lucide-react';

interface InteractiveTrajectoryMapProps {
  checkpoints: CameraCheckpoint[];
  selectedCheckpointId?: string | null;
  onSelectCheckpoint: (checkpoint: CameraCheckpoint) => void;
  highestSpeed: number;
  highestSpeedLocation: string;
  playbackProgress?: number; // 0 to 1
  isPlaying?: boolean;
}

export const InteractiveTrajectoryMap: React.FC<InteractiveTrajectoryMapProps> = ({
  checkpoints,
  selectedCheckpointId,
  onSelectCheckpoint,
  highestSpeed,
  playbackProgress = 0,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Generate SVG path string from checkpoints
  const pathD = checkpoints.reduce((acc, cp, index) => {
    return `${acc} ${index === 0 ? 'M' : 'L'} ${cp.coordinates.x} ${cp.coordinates.y}`;
  }, '');

  // Calculate current playback vehicle position
  const getPlaybackPosition = () => {
    if (checkpoints.length === 0) return { x: 500, y: 400 };
    if (checkpoints.length === 1) return checkpoints[0].coordinates;

    const totalSegments = checkpoints.length - 1;
    const progressSegment = playbackProgress * totalSegments;
    const currentIndex = Math.min(Math.floor(progressSegment), totalSegments - 1);
    const segmentFraction = progressSegment - currentIndex;

    const start = checkpoints[currentIndex].coordinates;
    const end = checkpoints[currentIndex + 1].coordinates;

    return {
      x: start.x + (end.x - start.x) * segmentFraction,
      y: start.y + (end.y - start.y) * segmentFraction,
    };
  };

  const vehiclePos = getPlaybackPosition();

  // Find checkpoint with highest speed
  const maxSpeedCheckpoint = checkpoints.reduce((prev, curr) => 
    (curr.recordedSpeed > prev.recordedSpeed) ? curr : prev
  , checkpoints[0] || null);

  return (
    <div className="relative w-full h-[520px] bg-[#f8fafc] rounded-xl overflow-hidden border border-slate-300 shadow-sm select-none">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-md">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))}
          className="p-1.5 text-slate-700 hover:text-[#0b3c61] hover:bg-slate-100 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
          className="p-1.5 text-slate-700 hover:text-[#0b3c61] hover:bg-slate-100 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoomLevel(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="p-1.5 text-slate-700 hover:text-[#0b3c61] hover:bg-slate-100 rounded transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Telemetry HUD Badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        <span className="px-3 py-1 rounded bg-white/95 border border-slate-300 text-xs font-mono font-bold text-[#0b3c61] flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          GIS SURVEILLANCE RADAR GRID // भू-स्थानिक निगरानी ग्रिड
        </span>
        <span className="px-2.5 py-1 rounded bg-white/95 border border-slate-300 text-xs font-mono text-slate-700 shadow-sm">
          CAMERAS LOGGED: <strong className="text-blue-900">{checkpoints.length}</strong>
        </span>
      </div>

      {/* Main SVG Vector Canvas */}
      <div
        className="w-full h-full cursor-crosshair transition-transform duration-200"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox="0 0 1000 800"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Waterway gradient */}
            <linearGradient id="river-gis-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
          </defs>

          {/* Topographic Background Roads, River, Sectors */}
          <g>
            {/* River corridor */}
            <path
              d="M 500 0 Q 560 300 700 480 T 1000 700 L 1000 800 L 750 800 Q 580 520 440 250 T 400 0 Z"
              fill="url(#river-gis-gradient)"
              stroke="#38bdf8"
              strokeWidth="2"
              opacity="0.8"
            />
            <text x="590" y="240" fill="#0284c7" fontSize="12" fontFamily="Noto Sans" fontStyle="italic" opacity="0.8">Yamuna Riverfront Corridor</text>

            {/* Arterial Highways (Yellow & Slate standard GIS styling) */}
            {/* North Orbital Bypass */}
            <path d="M 50 120 Q 500 80 950 120" stroke="#cbd5e1" strokeWidth="16" fill="none" />
            <path d="M 50 120 Q 500 80 950 120" stroke="#fcd34d" strokeWidth="10" fill="none" />
            <path d="M 50 120 Q 500 80 950 120" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 8" fill="none" />

            {/* Downtown Expressway NH-48 */}
            <path d="M 120 700 L 400 350 L 850 350" stroke="#cbd5e1" strokeWidth="16" fill="none" />
            <path d="M 120 700 L 400 350 L 850 350" stroke="#fcd34d" strokeWidth="10" fill="none" />
            <path d="M 120 700 L 400 350 L 850 350" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 8" fill="none" />

            {/* Grand River Suspension Flyover */}
            <path d="M 350 480 L 850 480" stroke="#cbd5e1" strokeWidth="14" fill="none" />
            <path d="M 350 480 L 850 480" stroke="#fed7aa" strokeWidth="8" fill="none" />

            {/* South Perimeter Ring Road */}
            <path d="M 80 720 Q 500 660 920 720" stroke="#cbd5e1" strokeWidth="16" fill="none" />
            <path d="M 80 720 Q 500 660 920 720" stroke="#fcd34d" strokeWidth="10" fill="none" />
            <path d="M 80 720 Q 500 660 920 720" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 8" fill="none" />

            {/* Sector / Zone Landmark Labels in official style */}
            <text x="210" y="65" fill="#475569" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">NORTH ORBITAL TOLL SECTOR</text>
            <text x="350" y="270" fill="#475569" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">CENTRAL CBD INTERCHANGE</text>
            <text x="730" y="230" fill="#475569" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">TECH CITY CYBER CORRIDOR</text>
            <text x="820" y="600" fill="#475569" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">AIRPORT EXPRESS TERMINAL</text>
            <text x="180" y="620" fill="#475569" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">HARBOR PORT GATEWAY</text>
            <text x="450" y="750" fill="#475569" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">SOUTH INDUSTRIAL RING</text>
          </g>

          {/* Surveillance Trajectory Path Line */}
          {checkpoints.length > 1 && (
            <>
              {/* Outer shadow */}
              <path
                d={pathD}
                fill="none"
                stroke="#0b3c61"
                strokeWidth="8"
                strokeOpacity="0.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Core trajectory line in Official Navy Blue & Crimson */}
              <path
                d={pathD}
                fill="none"
                stroke="#0b3c61"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Animated Dashed Tracker */}
              <path
                d={pathD}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="6 8"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Camera Checkpoint Nodes */}
          {checkpoints.map((cp, idx) => {
            const isHighest = cp.id === maxSpeedCheckpoint?.id;
            const isSelected = cp.id === selectedCheckpointId;
            const isOverspeed = cp.recordedSpeed > cp.speedLimit;

            return (
              <g
                key={cp.id}
                className="cursor-pointer transition-transform duration-150 hover:scale-110"
                onClick={() => onSelectCheckpoint(cp)}
              >
                {/* Radar Ring for Highest Speed Checkpoint */}
                {isHighest && (
                  <circle
                    cx={cp.coordinates.x}
                    cy={cp.coordinates.y}
                    r="28"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-spin"
                    style={{ transformOrigin: `${cp.coordinates.x}px ${cp.coordinates.y}px`, animationDuration: '8s' }}
                  />
                )}

                {/* Selected Outer Circle */}
                {isSelected && (
                  <circle
                    cx={cp.coordinates.x}
                    cy={cp.coordinates.y}
                    r="22"
                    fill="none"
                    stroke="#0b3c61"
                    strokeWidth="2"
                  />
                )}

                {/* Base camera circle */}
                <circle
                  cx={cp.coordinates.x}
                  cy={cp.coordinates.y}
                  r="13"
                  fill={isHighest ? '#dc2626' : isOverspeed ? '#d97706' : '#0b3c61'}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="shadow-sm"
                />

                {/* Checkpoint Order Number */}
                <text
                  x={cp.coordinates.x}
                  y={cp.coordinates.y + 4}
                  fill="#ffffff"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {idx + 1}
                </text>

                {/* Speed HUD Tag Above Camera */}
                <g transform={`translate(${cp.coordinates.x}, ${cp.coordinates.y - 18})`}>
                  <rect
                    x="-32"
                    y="-16"
                    width="64"
                    height="18"
                    rx="3"
                    fill={isHighest ? '#b91c1c' : isOverspeed ? '#b45309' : '#0b3c61'}
                    stroke="#ffffff"
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="-4"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {cp.recordedSpeed} km/h
                  </text>
                </g>

                {/* Highest Speed Alert Callout Box */}
                {isHighest && (
                  <g transform={`translate(${cp.coordinates.x + 28}, ${cp.coordinates.y - 36})`}>
                    <rect
                      x="0"
                      y="0"
                      width="160"
                      height="38"
                      rx="4"
                      fill="#ffffff"
                      stroke="#dc2626"
                      strokeWidth="1.5"
                      className="shadow-md"
                    />
                    <text x="8" y="14" fill="#b91c1c" fontSize="8.5" fontFamily="JetBrains Mono" fontWeight="bold">
                      ★ उच्चतम गति दर्ज / PEAK SPEED
                    </text>
                    <text x="8" y="28" fill="#1e293b" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">
                      {cp.recordedSpeed} KM/H <tspan fill="#dc2626" fontSize="9">(Limit {cp.speedLimit})</tspan>
                    </text>
                  </g>
                )}

                {/* Camera Name Label Below */}
                <text
                  x={cp.coordinates.x}
                  y={cp.coordinates.y + 24}
                  fill={isSelected ? '#0b3c61' : '#334155'}
                  fontSize="9.5"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="select-none"
                >
                  {cp.id}
                </text>
              </g>
            );
          })}

          {/* Animated Replay Vehicle Pin */}
          {checkpoints.length > 0 && (
            <g
              transform={`translate(${vehiclePos.x}, ${vehiclePos.y})`}
              className="pointer-events-none transition-all duration-75"
            >
              <circle r="16" fill="rgba(11, 60, 97, 0.15)" stroke="#0b3c61" strokeWidth="1.5" />
              <circle r="8" fill="#0b3c61" stroke="#ffffff" strokeWidth="2" />
              <circle r="3" fill="#f59e0b" />
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-mono text-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0b3c61]"></span>
            <span>Speed Limit Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Over-Speed Recorded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span className="text-red-700 font-bold">Highest Speed On Path</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-sans">
          Click any camera node to view optical ANPR image & radar verification
        </div>
      </div>
    </div>
  );
};
