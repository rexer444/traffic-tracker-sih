import React, { useState, useEffect, useRef } from 'react';
import { Vehicle, CameraCheckpoint } from '../../types';
import { InteractiveTrajectoryMap } from './InteractiveTrajectoryMap';
import { PlateBadge } from '../PlateBadge';
import { 
  Gauge, 
  Play, 
  Pause, 
  RotateCcw, 
  Search, 
  Camera, 
  MapPin, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Car,
  FileText,
  Printer,
  ShieldAlert,
  Info,
  Download
} from 'lucide-react';

interface JourneyMapPageProps {
  vehicles: Vehicle[];
  selectedVehiclePlate: string;
  onSelectVehiclePlate: (plate: string) => void;
  onNavigateToIdentifier?: (plate: string) => void;
}

export const JourneyMapPage: React.FC<JourneyMapPageProps> = ({
  vehicles,
  selectedVehiclePlate,
  onSelectVehiclePlate,
  onNavigateToIdentifier,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CameraCheckpoint | null>(null);
  
  // Replay playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const playbackTimerRef = useRef<number | null>(null);

  // Active vehicle
  const currentVehicle = vehicles.find((v) => v.plateNumber === selectedVehiclePlate) || vehicles[0];
  const journey = currentVehicle.currentJourney;
  const checkpoints = journey?.checkpoints || [];

  // Find checkpoint with highest speed
  const maxCheckpoint = checkpoints.reduce((max, cp) => 
    (cp.recordedSpeed > max.recordedSpeed ? cp : max), 
    checkpoints[0] || null
  );

  const highestSpeed = journey?.highestSpeed || maxCheckpoint?.recordedSpeed || 0;
  const highestSpeedLocation = journey?.highestSpeedLocation || maxCheckpoint?.name || 'Surveillance Grid';

  useEffect(() => {
    if (maxCheckpoint) {
      setSelectedCheckpoint(maxCheckpoint);
    } else if (checkpoints.length > 0) {
      setSelectedCheckpoint(checkpoints[0]);
    }
    setPlaybackProgress(0);
    setIsPlaying(false);
  }, [selectedVehiclePlate]);

  useEffect(() => {
    if (isPlaying) {
      const intervalTime = 50;
      const step = (0.01 * playbackSpeed) / (checkpoints.length || 1);

      playbackTimerRef.current = window.setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 1) {
            setIsPlaying(false);
            return 1;
          }
          const next = prev + step;
          if (checkpoints.length > 1) {
            const currentIdx = Math.min(Math.floor(next * checkpoints.length), checkpoints.length - 1);
            setSelectedCheckpoint(checkpoints[currentIdx]);
          }
          return next;
        });
      }, intervalTime);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, playbackSpeed, checkpoints]);

  const filteredVehicles = vehicles.filter((v) =>
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Official Breadcrumb Bar */}
      <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 py-1">
        <span className="text-[#0b3c61] font-bold">Portal Home</span>
        <span>/</span>
        <span>Transit Surveillance Services</span>
        <span>/</span>
        <span className="text-slate-800 font-bold">Vehicle Journey Map & Speed Profiler</span>
      </div>

      {/* Top Banner / Plate Selector Card */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0b3c61] text-[10px] font-mono font-bold border border-blue-200">
                MODULE 01: TRAJECTORY & RADAR INTELLIGENCE
              </span>
              <span className="text-xs font-hindi text-slate-600 font-semibold">
                वाहन यात्रा मानचित्र एवं गति निगरानी
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0b3c61]">
              Multi-Camera ANPR Journey Map & Speed Profiler
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Reconstructing automated multi-camera surveillance trajectory and verified radar speed metrics for selected vehicle.
            </p>
          </div>

          {/* Quick Vehicle Plate Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Plate (e.g. MH-12...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0b3c61] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {filteredVehicles.map((v) => (
                <button
                  key={v.plateNumber}
                  onClick={() => onSelectVehiclePlate(v.plateNumber)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 border ${
                    v.plateNumber === currentVehicle.plateNumber
                      ? 'bg-[#0b3c61] text-white border-[#07263e] shadow-sm'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {v.plateNumber}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Target Vehicle Spec & HIGHEST SPEED Callout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Selected Car & Plate Details */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span>VEHICLE IDENTIFIER</span>
              <Car className="w-3.5 h-3.5 text-[#0b3c61]" />
            </div>
            <PlateBadge
              plateNumber={currentVehicle.plateNumber}
              size="md"
              isBlacklisted={currentVehicle.isBlacklisted}
              showStatusIndicator={true}
            />
            <div className="mt-2.5">
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {currentVehicle.make} {currentVehicle.model}
              </h3>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                Model: {currentVehicle.year} • {currentVehicle.color} • {currentVehicle.fuelType}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600">
              Reg. Owner: <strong className="text-slate-800">{currentVehicle.owner.name.split(' ')[0]}...</strong>
            </span>
            {onNavigateToIdentifier && (
              <button
                onClick={() => onNavigateToIdentifier(currentVehicle.plateNumber)}
                className="text-[#0b3c61] hover:underline font-bold inline-flex items-center gap-0.5"
              >
                View RC <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Card 2: THE USER-REQUESTED HIGHEST SPEED ACHIEVED SPECIFIC FOR THIS CAR */}
        <div className="bg-white border-2 border-red-500 rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl">
            PLATE SPECIFIC
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-red-700 font-bold mb-1">
              <Gauge className="w-4 h-4 text-red-600" />
              <span>HIGHEST SPEED ACHIEVED</span>
            </div>
            <div className="text-[10px] font-hindi text-slate-500 mb-1.5">
              वाहन की दर्ज उच्चतम गति
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono tracking-tight text-red-600">
                {highestSpeed}
              </span>
              <span className="text-sm font-bold font-mono text-slate-600">
                KM/H
              </span>
            </div>

            <div className="mt-2 text-xs">
              <div className="font-mono text-red-700 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                {maxCheckpoint ? (
                  highestSpeed > maxCheckpoint.speedLimit ? (
                    <span>EXCEEDED LIMIT BY +{highestSpeed - maxCheckpoint.speedLimit} KM/H</span>
                  ) : (
                    <span className="text-emerald-700 font-bold">WITHIN SPEED LIMIT</span>
                  )
                ) : (
                  <span>RECORDED MAXIMUM</span>
                )}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5 font-mono truncate">
                📍 {highestSpeedLocation}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between">
            <span>Timestamp:</span>
            <span className="text-slate-900 font-bold">{maxCheckpoint?.timestamp || 'N/A'}</span>
          </div>
        </div>

        {/* Card 3: Journey Distance & Transit Duration */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span>SURVEILLANCE SPAN</span>
              <Activity className="w-3.5 h-3.5 text-amber-600" />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <span className="text-2xl font-bold font-mono text-[#0b3c61]">
                  {journey?.totalDistanceKm.toFixed(1) || '0.0'}
                </span>
                <span className="text-[11px] font-mono text-slate-500 block">Total km Traveled</span>
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-[#0b3c61]">
                  {journey?.durationMinutes || '0'}
                </span>
                <span className="text-[11px] font-mono text-slate-500 block">Transit Minutes</span>
              </div>
            </div>

            <div className="mt-2.5 text-xs text-slate-700 space-y-0.5 font-mono">
              <div className="truncate text-slate-600">
                Start: <strong className="text-slate-900">{journey?.startLocation}</strong>
              </div>
              <div className="truncate text-slate-600">
                End: <strong className="text-slate-900">{journey?.destination}</strong>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between">
            <span>Mean Velocity:</span>
            <span className="text-[#0b3c61] font-bold">{journey?.averageSpeed || 0} km/h</span>
          </div>
        </div>

        {/* Card 4: Multi-Camera Checkpost Hits */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span>CHECKPOST AUDIT</span>
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-slate-900">
                {checkpoints.length}
              </span>
              <span className="text-xs font-mono text-slate-600">CCTV NODES LOGGED</span>
            </div>

            <div className="mt-2.5 space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-600">
                <span>Mean OCR Confidence:</span>
                <span className="text-emerald-700 font-bold">
                  {checkpoints.length > 0
                    ? (checkpoints.reduce((acc, c) => acc + c.ocrConfidence, 0) / checkpoints.length).toFixed(1)
                    : '0'}%
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Speeding Alerts:</span>
                <span className="text-red-700 font-bold">
                  {checkpoints.filter((c) => c.recordedSpeed > c.speedLimit).length} Checkposts
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between">
            <span>Enforcement Clearance:</span>
            <span className={`font-bold ${currentVehicle.isBlacklisted ? 'text-red-700' : 'text-emerald-700'}`}>
              {currentVehicle.isBlacklisted ? 'INTERCEPT NOTICE' : 'CLEAR PASS'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Trajectory Map + Playback Controls */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#0b3c61] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-600" />
              Automated Surveillance Route Mapping // स्वचालित निगरानी मार्ग मानचित्रण
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Vector trajectory across urban checkpoints with radar speed profiling and replay simulation.
            </p>
          </div>

          {/* Replay Controls */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-300">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1 rounded bg-[#0b3c61] hover:bg-[#07263e] text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'PAUSE' : 'REPLAY ROUTE'}
            </button>

            <button
              onClick={() => {
                setPlaybackProgress(0);
                setIsPlaying(false);
                if (checkpoints.length > 0) setSelectedCheckpoint(checkpoints[0]);
              }}
              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>

            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    playbackSpeed === spd ? 'bg-white text-[#0b3c61] border border-slate-400' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The GIS Map */}
        <InteractiveTrajectoryMap
          checkpoints={checkpoints}
          selectedCheckpointId={selectedCheckpoint?.id}
          onSelectCheckpoint={(cp) => setSelectedCheckpoint(cp)}
          highestSpeed={highestSpeed}
          highestSpeedLocation={highestSpeedLocation}
          playbackProgress={playbackProgress}
          isPlaying={isPlaying}
        />

        {/* Timeline Scrubber */}
        <div className="pt-2 border-t border-slate-200 flex items-center gap-3 text-xs font-mono text-slate-600">
          <Clock className="w-3.5 h-3.5 text-[#0b3c61]" />
          <span>Timeline Progress:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={playbackProgress}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setPlaybackProgress(val);
              if (checkpoints.length > 0) {
                const idx = Math.min(Math.floor(val * checkpoints.length), checkpoints.length - 1);
                setSelectedCheckpoint(checkpoints[idx]);
              }
            }}
            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0b3c61]"
          />
          <span className="font-bold text-[#0b3c61]">
            {Math.round(playbackProgress * 100)}%
          </span>
        </div>
      </div>

      {/* Split Section: Chronological Audit Table & Checkpoint Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Official Chronological Checkpoint Table (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-100 p-3.5 border-b border-slate-300 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0b3c61]">
                Chronological ANPR Camera Audit Trail // कालानुक्रमिक कैमरा ऑडिट
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Order of camera checkpoints triggered along the journey path
              </p>
            </div>
            <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-700">
              {checkpoints.length} Checkposts Logged
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {checkpoints.map((cp, idx) => {
              const isSelected = cp.id === selectedCheckpoint?.id;
              const isHighest = cp.id === maxCheckpoint?.id;
              const isOverspeed = cp.recordedSpeed > cp.speedLimit;

              return (
                <div
                  key={cp.id}
                  onClick={() => setSelectedCheckpoint(cp)}
                  className={`p-3 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-4 border-l-[#0b3c61]'
                      : isHighest
                      ? 'bg-red-50/60 border-l-4 border-l-red-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                        isHighest
                          ? 'bg-red-600 text-white'
                          : isSelected
                          ? 'bg-[#0b3c61] text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {cp.name}
                        </span>
                        {isHighest && (
                          <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 text-[10px] font-bold border border-red-300">
                            ★ HIGHEST SPEED RECORDED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>ID: {cp.id}</span>
                        <span>•</span>
                        <span>{cp.sector}</span>
                        <span>•</span>
                        <span>{cp.lane}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-9 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <div className="text-slate-600">{cp.timestamp}</div>
                      <div className="text-[10px] text-emerald-700 font-bold">OCR: {cp.ocrConfidence}%</div>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded text-right min-w-[85px] border ${
                        isHighest
                          ? 'bg-red-100 text-red-900 border-red-300 font-bold'
                          : isOverspeed
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                          : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-bold">
                        {cp.recordedSpeed} <span className="text-[10px] font-normal">km/h</span>
                      </div>
                      <div className="text-[9px] text-slate-500">
                        Limit: {cp.speedLimit}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Camera Detail Inspection (1 col) */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0b3c61] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-700" />
                Optical ANPR Radar Evidence
              </h3>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                AUDIT VERIFIED
              </span>
            </div>

            {selectedCheckpoint ? (
              <div className="space-y-3">
                {/* Simulated ANPR camera image box in light government portal style */}
                <div className="relative aspect-video rounded-lg bg-slate-900 text-white overflow-hidden flex items-center justify-center border border-slate-400">
                  <div className="absolute inset-0 bg-portal-grid opacity-20 pointer-events-none"></div>

                  <div className="relative flex flex-col items-center">
                    <Car className="w-16 h-16 text-slate-500" />
                    <div className="mt-1 px-2.5 py-0.5 rounded bg-white text-slate-950 font-mono font-bold text-xs border border-blue-900 shadow">
                      {currentVehicle.plateNumber}
                    </div>
                  </div>

                  <div className="absolute top-2 left-2 text-[10px] font-mono bg-black/70 px-1.5 py-0.5 rounded text-slate-200">
                    {selectedCheckpoint.id}
                  </div>
                  <div className="absolute top-2 right-2 text-[10px] font-mono bg-emerald-900/80 px-1.5 py-0.5 rounded text-emerald-200">
                    OCR: {selectedCheckpoint.ocrConfidence}%
                  </div>
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/70 px-1.5 py-0.5 rounded text-slate-200">
                    {selectedCheckpoint.timestamp}
                  </div>
                </div>

                {/* Telemetry rows */}
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Camera Checkpost:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[170px]">{selectedCheckpoint.name}</span>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Recorded Radar Speed:</span>
                    <span
                      className={`font-bold ${
                        selectedCheckpoint.recordedSpeed > selectedCheckpoint.speedLimit
                          ? 'text-red-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {selectedCheckpoint.recordedSpeed} km/h (Limit: {selectedCheckpoint.speedLimit})
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Corridor Sector:</span>
                    <span className="font-bold text-slate-800">{selectedCheckpoint.sector}</span>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500">Lane & Direction:</span>
                    <span className="text-slate-800">{selectedCheckpoint.lane} • {selectedCheckpoint.direction}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 font-mono">
                Select a checkpoint node to view evidence
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 text-[10px] font-mono text-slate-500 text-center">
            Certified Record Generated from Automated Radar Checkpost Log
          </div>
        </div>
      </div>
    </div>
  );
};
