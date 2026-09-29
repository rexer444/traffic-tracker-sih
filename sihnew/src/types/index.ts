export interface CameraCheckpoint {
  id: string;
  name: string;
  sector: string;
  coordinates: { x: number; y: number }; // Relative coordinates 0-1000 for high-res map
  speedLimit: number; // km/h
  lane: string;
  direction: string;
  timestamp: string;
  recordedSpeed: number; // km/h
  ocrConfidence: number; // e.g. 98.7%
  snapshotUrl?: string;
  status: 'normal' | 'overspeed' | 'alert';
}

export interface Journey {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  startLocation: string;
  destination: string;
  totalDistanceKm: number;
  durationMinutes: number;
  highestSpeed: number;
  highestSpeedLocation: string;
  averageSpeed: number;
  status: 'completed' | 'in_progress' | 'flagged';
  checkpoints: CameraCheckpoint[];
}

export interface VehicleOwner {
  name: string;
  licenseNumber: string;
  nationalId: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  penaltyPoints: number;
  licenseValidity: string;
}

export interface Vehicle {
  plateNumber: string;
  rfidTag: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vehicleType: 'Sedan' | 'SUV' | 'Sports Coupe' | 'Hatchback' | 'Truck' | 'Motorcycle' | 'EV';
  vin: string;
  engineNumber: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  registrationDate: string;
  fitnessExpiry: string;
  insuranceStatus: 'Active' | 'Expired' | 'Suspended';
  insuranceProvider: string;
  isBlacklisted: boolean;
  blacklistReason?: string;
  blacklistSeverity?: 'Critical' | 'High' | 'Moderate' | 'Warning';
  flaggedByAgency?: string;
  flagDate?: string;
  owner: VehicleOwner;
  currentJourney?: Journey;
  previousJourneys: Journey[];
}

export interface CitySectorTraffic {
  id: string;
  name: string;
  code: string;
  congestionIndex: number; // 0 - 100%
  vehicleCountPerHour: number;
  averageSpeed: number; // km/h
  speedLimit: number;
  status: 'Smooth' | 'Moderate' | 'Congested' | 'Severe Gridlock';
  primaryBottleneck: string;
  activeSurveillanceCameras: number;
  incidentsReported: number;
}

export interface TrafficActionOption {
  id: string;
  title: string;
  category: 'Signal Control' | 'Fleet & Drone' | 'Enforcement' | 'Eco & Dynamic';
  description: string;
  projectedImpact: string;
  estimatedLatency: string;
  badge: string;
  iconName: string;
}

export interface LiveANPRDetection {
  id: string;
  plateNumber: string;
  cameraId: string;
  cameraName: string;
  sector: string;
  timestamp: string;
  speed: number;
  speedLimit: number;
  confidence: number;
  vehicleModel: string;
  vehicleColor: string;
  isBlacklisted: boolean;
  isOverspeed: boolean;
}
