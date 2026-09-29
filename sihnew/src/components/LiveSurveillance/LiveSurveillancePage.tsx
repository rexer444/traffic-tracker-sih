import React, { useState, useEffect } from 'react';
import { LIVE_ANPR_STREAM, CITY_CAMERAS } from '../../data/mockData';
import { LiveANPRDetection } from '../../types';
import { PlateBadge } from '../PlateBadge';
import { 
  Video, 
  Camera, 
  Radio, 
  AlertTriangle, 
  Scan, 
  Gauge, 
  RefreshCw, 
  ArrowRight,
  Eye,
  CheckCircle2,
  Car
} from 'lucide-react';

interface LiveSurveillancePageProps {
  onNavigateToJourney: (plate: string) => void;
  onNavigateToIdentifier: (plate: string) => void;
}

export const LiveSurveillancePage: React.FC<LiveSurveillancePageProps> = ({
  onNavigateToJourney,
  onNavigateToIdentifier,
}) => {
  const [selectedCameraId, setSelectedCameraId] = useState(CITY_CAMERAS[4].id);
  const [liveStream, setLiveStream] = useState<LiveANPRDetection[]>(LIVE_ANPR_STREAM);
  const [autoSimulate, setAutoSimulate] = useState(true);
  const [cameraFrame, setCameraFrame] = useState(0);

  const selectedCam = CITY_CAMERAS.find((c) => c.id === selectedCameraId) || CITY_CAMERAS[0];

  useEffect(() => {
    const frameInterval = setInterval(() => {
      setCameraFrame((f) => (f + 1) % 100);
    }, 2000);
    return () => clearInterval(frameInterval);
  }, []);

  useEffect(() => {
    if (!autoSimulate) return;

    const streamInterval = setInterval(() => {
      const randomSpeed = Math.floor(Math.random() * 80) + 40;
      const isOverspeed = randomSpeed > selectedCam.limit;
      const newDetection: LiveANPRDetection = {
        id: `DET-${Date.now().toString().slice(-4)}`,
        plateNumber: ['MH-12-DE-4491', 'DL-01-AB-9821', 'KA-03-NZ-1002', 'TS-09-EQ-7744', 'MH-02-CD-5520', 'KA-05-MM-3319'][
          Math.floor(Math.random() * 6)
        ],
        cameraId: selectedCam.id,
        cameraName: selectedCam.name,
        sector: selectedCam.sector,
        timestamp: new Date().toLocaleTimeString(),
        speed: randomSpeed,
        speedLimit: selectedCam.limit,
        confidence: +(98.5 + Math.random() * 1.4).toFixed(1),
        vehicleModel: ['Porsche Taycan', 'BMW M3', 'Tesla Model Y', 'Toyota Fortuner', 'Mercedes S-Class', 'Volvo XC90'][
          Math.floor(Math.random() * 6)
        ],
        vehicleColor: ['Blue', 'Green', 'White', 'Black', 'Silver'][Math.floor(Math.random() * 5)],
        isBlacklisted: Math.random() > 0.6,
        isOverspeed,
      };

      setLiveStream((prev) => [newDetection, ...prev.slice(0, 14)]);
    }, 3500);

    return () => clearInterval(streamInterval);
  }, [autoSimulate, selectedCam]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Breadcrumb Navigation */}
      <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 py-1">
        <span className="text-[#0b3c61] font-bold">Portal Home</span>
        <span>/</span>
        <span>Surveillance Feeds</span>
        <span>/</span>
        <span className="text-slate-800 font-bold">Live Highway CCTV & Optical ANPR Detection Stream</span>
      </div>

      {/* Top Banner / Feed Controls */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0b3c61] text-[10px] font-mono font-bold border border-blue-200">
                MODULE 04: REAL-TIME OPTICAL CCTV STREAM
              </span>
              <span className="text-xs font-hindi text-slate-600 font-semibold">
                प्रत्यक्ष कैमरा फीड एवं रडार पहचान
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0b3c61]">
              Live Highway CCTV & ANPR Detection Stream
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Automated computer vision plate detection, real-time Doppler radar reading, and instant warrant matching.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAutoSimulate(!autoSimulate)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border ${
                autoSimulate
                  ? 'bg-red-50 text-red-700 border-red-300'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {autoSimulate ? 'LIVE FEED ACTIVE' : 'FEED PAUSED'}
            </button>

            <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              OCR ENGINE: ONLINE
            </span>
          </div>
        </div>

        {/* Camera Selector Pills */}
        <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-mono text-slate-600 font-semibold shrink-0">Select Checkpost:</span>
          {CITY_CAMERAS.slice(0, 6).map((cam) => (
            <button
              key={cam.id}
              onClick={() => setSelectedCameraId(cam.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 border ${
                cam.id === selectedCameraId
                  ? 'bg-[#0b3c61] text-white border-[#07263e] shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <Video className="w-3 h-3 inline mr-1 text-slate-500" />
              {cam.id} • {cam.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Section: Video View & Live OCR Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: CCTV View (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-300 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-xs font-mono font-bold text-slate-900 uppercase">
                  CHECKPOST: {selectedCam.id}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  [{selectedCam.sector}]
                </span>
              </div>
              <span className="text-[10px] font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                1080p 60FPS • EDGE-ANPR
              </span>
            </div>

            {/* Video Box */}
            <div className="relative aspect-video rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-400 shadow-inner">
              <div className="absolute inset-0 bg-portal-grid opacity-20 pointer-events-none"></div>

              {/* Road lane graphics */}
              <div className="absolute inset-0 flex justify-center pointer-events-none opacity-20">
                <div className="w-64 h-full border-x-2 border-slate-600 flex justify-around">
                  <div className="w-[1px] h-full border-r border-dashed border-slate-400"></div>
                  <div className="w-[1px] h-full border-r border-dashed border-slate-400"></div>
                </div>
              </div>

              {/* Detection Box 1 */}
              <div
                className="absolute transition-all duration-1000 border-2 border-cyan-400 rounded p-1"
                style={{
                  top: `${35 + (cameraFrame % 20)}%`,
                  left: `${25 + (cameraFrame % 15)}%`,
                  width: '150px',
                  height: '100px',
                }}
              >
                <div className="absolute -top-5 left-0 bg-[#0b3c61] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                  ANPR: MH-12-DE-4491 [99.7%]
                </div>
                <div className="absolute -bottom-5 left-0 bg-red-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                  RADAR: 158 km/h (LIMIT {selectedCam.limit})
                </div>
              </div>

              {/* OSD Overlay */}
              <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-200 bg-black/70 px-2 py-0.5 rounded">
                CAM: {selectedCam.name}
              </div>
              <div className="absolute top-2 right-2 text-[10px] font-mono text-red-400 bg-black/70 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                LIVE REC ● {new Date().toLocaleTimeString()}
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/75 px-2.5 py-1 rounded">
                <span>FPS: 59.94 • LATENCY: 14ms</span>
                <span>POST SPEED LIMIT: {selectedCam.limit} KM/H</span>
                <span>DOPPLER RADAR: 77GHz</span>
              </div>
            </div>

            {/* Checkpost Specs */}
            <div className="grid grid-cols-3 gap-2.5 text-xs font-mono mt-3 pt-2.5 border-t border-slate-200">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">SECTOR LOCATION</span>
                <span className="font-bold text-slate-800">{selectedCam.sector}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">RADAR CALIBRATION</span>
                <span className="font-bold text-emerald-700">Certified ±0.5%</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">ANPR MODEL</span>
                <span className="font-bold text-[#0b3c61]">Optical OCR v4.2</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Automated Checkpost Surveillance Core</span>
            <span className="text-[#0b3c61] font-bold">Audit Feed Active</span>
          </div>
        </div>

        {/* Right: Real-time ANPR OCR Detections Stream (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="bg-[#0b3c61] text-white p-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Scan className="w-4 h-4 text-amber-300" />
                  Live ANPR OCR Detection Stream // प्रत्यक्ष एएनपीआर धारा
                </h3>
                <p className="text-[10px] text-blue-200 font-mono">
                  Incoming vehicle plates identified at camera checkposts
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold">
                REAL-TIME
              </span>
            </div>

            {/* List of detections */}
            <div className="p-3.5 space-y-2.5 max-h-[480px] overflow-y-auto">
              {liveStream.map((det) => (
                <div
                  key={det.id}
                  className={`p-2.5 rounded-lg border transition-all text-xs font-mono flex flex-col gap-1.5 ${
                    det.isBlacklisted
                      ? 'bg-red-50 border-red-400'
                      : det.isOverspeed
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <PlateBadge
                      plateNumber={det.plateNumber}
                      size="sm"
                      isBlacklisted={det.isBlacklisted}
                    />

                    <div className="text-right">
                      <span
                        className={`font-bold font-mono text-sm ${
                          det.isOverspeed ? 'text-red-700' : 'text-emerald-700'
                        }`}
                      >
                        {det.speed} km/h
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Limit {det.speedLimit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                    <span>
                      {det.vehicleModel} ({det.vehicleColor})
                    </span>
                    <span className="text-emerald-800 font-bold">
                      OCR: {det.confidence}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500">
                      {det.timestamp} • {det.cameraId}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigateToJourney(det.plateNumber)}
                        className="text-[11px] font-bold text-[#0b3c61] hover:underline"
                      >
                        Map Trajectory →
                      </button>
                      <button
                        onClick={() => onNavigateToIdentifier(det.plateNumber)}
                        className="text-[11px] font-bold text-emerald-800 hover:underline"
                      >
                        Owner Info →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-500 text-center">
            Buffer Capacity: 15 / 15 • Auto-purged as new checkposts trigger
          </div>
        </div>
      </div>
    </div>
  );
};
