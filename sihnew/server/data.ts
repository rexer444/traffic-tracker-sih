/**
 * AEGISNET — Server-Side Data Store
 * Central data repository for all API endpoints.
 * In production, this would be replaced by a database (PostgreSQL/MongoDB).
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CameraCheckpoint {
  id: string;
  name: string;
  sector: string;
  lat: number;
  lng: number;
  speedLimit: number;
  lane: string;
  direction: string;
  timestamp: string;
  recordedSpeed: number;
  ocrConfidence: number;
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
  vehicleType: string;
  vin: string;
  engineNumber: string;
  fuelType: string;
  registrationDate: string;
  fitnessExpiry: string;
  insuranceStatus: string;
  insuranceProvider: string;
  isBlacklisted: boolean;
  blacklistReason?: string;
  blacklistSeverity?: string;
  flaggedByAgency?: string;
  flagDate?: string;
  owner: VehicleOwner;
  currentJourney?: Journey;
  previousJourneys: Journey[];
}

export interface CityCamera {
  id: string;
  name: string;
  sector: string;
  lat: number;
  lng: number;
  limit: number;
}

export interface CitySectorTraffic {
  id: string;
  name: string;
  code: string;
  congestionIndex: number;
  vehicleCountPerHour: number;
  averageSpeed: number;
  speedLimit: number;
  status: string;
  primaryBottleneck: string;
  activeSurveillanceCameras: number;
  incidentsReported: number;
}

export interface TrafficActionOption {
  id: string;
  title: string;
  category: string;
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

// ============================================================================
// CAMERAS
// ============================================================================

export const CITY_CAMERAS: CityCamera[] = [
  { id: 'CAM-01-N-GATE', name: 'North Orbital Toll Plazas', sector: 'North Gateway', lat: 28.7041, lng: 77.1025, limit: 80 },
  { id: 'CAM-02-EXP-IN', name: 'Downtown Expressway Inbound #4', sector: 'Central Metro', lat: 28.6892, lng: 77.1270, limit: 90 },
  { id: 'CAM-03-CBD-FLY', name: 'Financial Towers Flyover South', sector: 'Central Metro', lat: 28.6769, lng: 77.1523, limit: 60 },
  { id: 'CAM-04-TECH-AV', name: 'Cyber Avenue Intersect 12', sector: 'Tech Corridor', lat: 28.6800, lng: 77.2100, limit: 50 },
  { id: 'CAM-05-RIV-BRG', name: 'Grand River Suspension Bridge', sector: 'Riverfront Corridor', lat: 28.6600, lng: 77.1800, limit: 70 },
  { id: 'CAM-06-AIR-TUN', name: 'Airport Underpass Terminal 3', sector: 'Airport Link', lat: 28.6500, lng: 77.2400, limit: 80 },
  { id: 'CAM-07-S-RING', name: 'South Perimeter Highway Mile 14', sector: 'Industrial District', lat: 28.6300, lng: 77.1600, limit: 100 },
  { id: 'CAM-08-PORT-EX', name: 'Deep Harbor Port Freight Gate', sector: 'Harbor Gateway', lat: 28.6550, lng: 77.1100, limit: 60 },
  { id: 'CAM-09-WEST-BL', name: 'West Boulevard Commerce Junction', sector: 'West District', lat: 28.6750, lng: 77.0800, limit: 50 },
  { id: 'CAM-10-CTR-SQ', name: 'Civic Plaza Central Roundabout', sector: 'Central Metro', lat: 28.6680, lng: 77.1450, limit: 40 },
  { id: 'CAM-11-EAST-SP', name: 'East Ring Speedway Junction 8', sector: 'Tech Corridor', lat: 28.6700, lng: 77.2350, limit: 90 },
  { id: 'CAM-12-METRO-D', name: 'Metro South Underpass Cam 2', sector: 'Industrial District', lat: 28.6250, lng: 77.1300, limit: 70 },
];

// ============================================================================
// VEHICLES (mutable — blacklist operations mutate this)
// ============================================================================

export const vehicles: Vehicle[] = [
  {
    plateNumber: 'MH-12-DE-4491',
    rfidTag: 'FASTAG-882190-IN',
    make: 'Porsche', model: 'Taycan 4S Cross Turismo', year: 2024,
    color: 'Frozen Blue Metallic', vehicleType: 'EV',
    vin: 'WP0AA2Y18NSA99201', engineNumber: 'EL-TRM-882110',
    fuelType: 'Electric', registrationDate: '14 Feb 2024', fitnessExpiry: '13 Feb 2039',
    insuranceStatus: 'Active', insuranceProvider: 'Allianz Global Transit',
    isBlacklisted: true,
    blacklistReason: 'Suspected High-Speed Reckless Transit & Evasion of Highway Toll Checkpoint #4; Active Bench Warrant Ref: CR-2026/0912',
    blacklistSeverity: 'Critical',
    flaggedByAgency: 'Metropolitan Highway Patrol Division',
    flagDate: '28 Sep 2026',
    owner: {
      name: 'Devraj Vikramaditya Singhania', licenseNumber: 'DL-MH12-2019008819',
      nationalId: 'NAT-IND-9920-4102', phone: '+91 98220 44910',
      email: 'devraj.singhania@apexholding.com',
      address: 'Penthouse 41B, Aurum Celestial Towers, Senapati Bapat Marg, Pune',
      emergencyContact: 'Mrs. Radhika Singhania (+91 98220 44912)',
      penaltyPoints: 8, licenseValidity: '22 Oct 2034',
    },
    currentJourney: {
      id: 'JRN-2026-9901', date: '29 Sep 2026 (Today)',
      startTime: '04:15 AM', endTime: '05:32 AM',
      startLocation: 'North Orbital Toll Plazas', destination: 'Airport Underpass Terminal 3',
      totalDistanceKm: 42.8, durationMinutes: 47,
      highestSpeed: 158, highestSpeedLocation: 'Grand River Suspension Bridge (CAM-05)',
      averageSpeed: 91.2, status: 'flagged',
      checkpoints: [
        { id: 'CAM-01-N-GATE', name: 'North Orbital Toll Plazas', sector: 'North Gateway', lat: 28.7041, lng: 77.1025, speedLimit: 80, lane: 'Lane 02 (Express FastLane)', direction: 'Southbound Inbound', timestamp: '04:15:22 AM', recordedSpeed: 88, ocrConfidence: 99.8, status: 'overspeed' },
        { id: 'CAM-02-EXP-IN', name: 'Downtown Expressway Inbound #4', sector: 'Central Metro', lat: 28.6892, lng: 77.1270, speedLimit: 90, lane: 'Lane 01 (Fast Track)', direction: 'South-East', timestamp: '04:26:45 AM', recordedSpeed: 118, ocrConfidence: 99.4, status: 'overspeed' },
        { id: 'CAM-03-CBD-FLY', name: 'Financial Towers Flyover South', sector: 'Central Metro', lat: 28.6769, lng: 77.1523, speedLimit: 60, lane: 'Lane 02 (Center)', direction: 'Eastbound', timestamp: '04:36:10 AM', recordedSpeed: 94, ocrConfidence: 98.9, status: 'overspeed' },
        { id: 'CAM-04-TECH-AV', name: 'Cyber Avenue Intersect 12', sector: 'Tech Corridor', lat: 28.6800, lng: 77.2100, speedLimit: 50, lane: 'Lane 01 (Overpass)', direction: 'Southbound', timestamp: '04:47:33 AM', recordedSpeed: 79, ocrConfidence: 99.1, status: 'overspeed' },
        { id: 'CAM-05-RIV-BRG', name: 'Grand River Suspension Bridge', sector: 'Riverfront Corridor', lat: 28.6600, lng: 77.1800, speedLimit: 70, lane: 'Lane 03 (Outer Bay)', direction: 'South-East Flyway', timestamp: '05:04:19 AM', recordedSpeed: 158, ocrConfidence: 99.7, status: 'alert' },
        { id: 'CAM-06-AIR-TUN', name: 'Airport Underpass Terminal 3', sector: 'Airport Link', lat: 28.6500, lng: 77.2400, speedLimit: 80, lane: 'Lane 01 (Terminal Approach)', direction: 'Airport Arrivals', timestamp: '05:32:04 AM', recordedSpeed: 104, ocrConfidence: 99.2, status: 'overspeed' },
      ],
    },
    previousJourneys: [
      {
        id: 'JRN-2026-9884', date: '28 Sep 2026', startTime: '10:14 PM', endTime: '11:02 PM',
        startLocation: 'Civic Plaza Central Roundabout', destination: 'South Perimeter Highway Mile 14',
        totalDistanceKm: 34.6, durationMinutes: 48, highestSpeed: 134,
        highestSpeedLocation: 'South Perimeter Highway Mile 14 (CAM-07)', averageSpeed: 78.4, status: 'flagged',
        checkpoints: [
          { id: 'CAM-10-CTR-SQ', name: 'Civic Plaza Central Roundabout', sector: 'Central Metro', lat: 28.6680, lng: 77.1450, speedLimit: 40, lane: 'Lane 01', direction: 'South', timestamp: '10:14:02 PM', recordedSpeed: 58, ocrConfidence: 98.6, status: 'overspeed' },
          { id: 'CAM-05-RIV-BRG', name: 'Grand River Suspension Bridge', sector: 'Riverfront Corridor', lat: 28.6600, lng: 77.1800, speedLimit: 70, lane: 'Lane 02', direction: 'South', timestamp: '10:32:44 PM', recordedSpeed: 112, ocrConfidence: 99.3, status: 'overspeed' },
          { id: 'CAM-07-S-RING', name: 'South Perimeter Highway Mile 14', sector: 'Industrial District', lat: 28.6300, lng: 77.1600, speedLimit: 100, lane: 'Lane 01', direction: 'Westbound', timestamp: '11:02:11 PM', recordedSpeed: 134, ocrConfidence: 99.5, status: 'overspeed' },
        ],
      },
      {
        id: 'JRN-2026-9740', date: '25 Sep 2026', startTime: '02:30 PM', endTime: '03:15 PM',
        startLocation: 'West Boulevard Commerce Junction', destination: 'North Orbital Toll Plazas',
        totalDistanceKm: 28.2, durationMinutes: 45, highestSpeed: 96,
        highestSpeedLocation: 'Downtown Expressway Inbound #4 (CAM-02)', averageSpeed: 64.0, status: 'completed',
        checkpoints: [
          { id: 'CAM-09-WEST-BL', name: 'West Boulevard Commerce Junction', sector: 'West District', lat: 28.6750, lng: 77.0800, speedLimit: 50, lane: 'Lane 02', direction: 'North', timestamp: '02:30:15 PM', recordedSpeed: 48, ocrConfidence: 99.0, status: 'normal' },
          { id: 'CAM-02-EXP-IN', name: 'Downtown Expressway Inbound #4', sector: 'Central Metro', lat: 28.6892, lng: 77.1270, speedLimit: 90, lane: 'Lane 01', direction: 'North', timestamp: '02:52:10 PM', recordedSpeed: 96, ocrConfidence: 99.4, status: 'overspeed' },
          { id: 'CAM-01-N-GATE', name: 'North Orbital Toll Plazas', sector: 'North Gateway', lat: 28.7041, lng: 77.1025, speedLimit: 80, lane: 'Lane 03', direction: 'Outbound', timestamp: '03:15:00 PM', recordedSpeed: 82, ocrConfidence: 99.7, status: 'normal' },
        ],
      },
    ],
  },
  {
    plateNumber: 'DL-01-AB-9821',
    rfidTag: 'FASTAG-771904-DL',
    make: 'BMW', model: 'M3 Competition xDrive', year: 2023,
    color: 'Isle of Man Green', vehicleType: 'Sedan',
    vin: 'WBA33AY08PFS11904', engineNumber: 'S58-B30T0-449',
    fuelType: 'Petrol', registrationDate: '09 Nov 2023', fitnessExpiry: '08 Nov 2038',
    insuranceStatus: 'Active', insuranceProvider: 'HDFC Ergo General Insurance',
    isBlacklisted: true,
    blacklistReason: 'Involved in Multi-Vehicle Hit & Run Incident at Cyber Avenue (FIR #992/2026). Vehicle Plate Alert broadcasted to all sector interceptors.',
    blacklistSeverity: 'Critical', flaggedByAgency: 'Cyberabad City Traffic Police & CID', flagDate: '27 Sep 2026',
    owner: {
      name: 'Aditya Rao',
      licenseNumber: 'DL-DL01-2021004410',
      nationalId: 'NAT-IND-9821-7702',
      phone: '+91 98110 98210',
      email: 'aditya.rao@vortexcapital.in',
      address: '1204, Empire Estate, Golf Course Road, Gurgaon',
      emergencyContact: 'Neha Rao (+91 98110 98212)',
      penaltyPoints: 12,
      licenseValidity: '18 Mar 2032',
    },
    currentJourney: {
      id: 'JRN-2026-9903', date: '29 Sep 2026 (Today)',
      startTime: '01:45 AM', endTime: '03:10 AM',
      startLocation: 'East Ring Speedway Junction 8', destination: 'Deep Harbor Port Freight Gate',
      totalDistanceKm: 55.2, durationMinutes: 85, highestSpeed: 172,
      highestSpeedLocation: 'East Ring Speedway Junction 8 (CAM-11)', averageSpeed: 88.6, status: 'flagged',
      checkpoints: [
        { id: 'CAM-11-EAST-SP', name: 'East Ring Speedway Junction 8', sector: 'Tech Corridor', lat: 28.6700, lng: 77.2350, speedLimit: 90, lane: 'Lane 01 (Outbound)', direction: 'Westbound Express', timestamp: '01:45:10 AM', recordedSpeed: 172, ocrConfidence: 99.6, status: 'alert' },
        { id: 'CAM-04-TECH-AV', name: 'Cyber Avenue Intersect 12', sector: 'Tech Corridor', lat: 28.6800, lng: 77.2100, speedLimit: 50, lane: 'Lane 02', direction: 'West', timestamp: '02:08:30 AM', recordedSpeed: 98, ocrConfidence: 99.1, status: 'overspeed' },
        { id: 'CAM-05-RIV-BRG', name: 'Grand River Suspension Bridge', sector: 'Riverfront Corridor', lat: 28.6600, lng: 77.1800, speedLimit: 70, lane: 'Lane 01', direction: 'South-West', timestamp: '02:30:15 AM', recordedSpeed: 104, ocrConfidence: 99.4, status: 'overspeed' },
        { id: 'CAM-07-S-RING', name: 'South Perimeter Highway Mile 14', sector: 'Industrial District', lat: 28.6300, lng: 77.1600, speedLimit: 100, lane: 'Lane 02', direction: 'West', timestamp: '02:52:00 AM', recordedSpeed: 138, ocrConfidence: 99.3, status: 'overspeed' },
        { id: 'CAM-08-PORT-EX', name: 'Deep Harbor Port Freight Gate', sector: 'Harbor Gateway', lat: 28.6550, lng: 77.1100, speedLimit: 60, lane: 'Lane 01 (Cargo Gate C)', direction: 'Harbor Inbound', timestamp: '03:10:40 AM', recordedSpeed: 52, ocrConfidence: 98.8, status: 'normal' },
      ],
    },
    previousJourneys: [
      {
        id: 'JRN-2026-9870', date: '27 Sep 2026', startTime: '11:20 PM', endTime: '11:55 PM',
        startLocation: 'Civic Plaza Central Roundabout', destination: 'East Ring Speedway Junction 8',
        totalDistanceKm: 22.0, durationMinutes: 35, highestSpeed: 145,
        highestSpeedLocation: 'East Ring Speedway Junction 8 (CAM-11)', averageSpeed: 72.0, status: 'flagged',
        checkpoints: [
          { id: 'CAM-10-CTR-SQ', name: 'Civic Plaza Central Roundabout', sector: 'Central Metro', lat: 28.6680, lng: 77.1450, speedLimit: 40, lane: 'Lane 01', direction: 'East', timestamp: '11:20:00 PM', recordedSpeed: 64, ocrConfidence: 99.0, status: 'overspeed' },
          { id: 'CAM-04-TECH-AV', name: 'Cyber Avenue Intersect 12', sector: 'Tech Corridor', lat: 28.6800, lng: 77.2100, speedLimit: 50, lane: 'Lane 02', direction: 'East', timestamp: '11:38:20 PM', recordedSpeed: 82, ocrConfidence: 99.2, status: 'overspeed' },
          { id: 'CAM-11-EAST-SP', name: 'East Ring Speedway Junction 8', sector: 'Tech Corridor', lat: 28.6700, lng: 77.2350, speedLimit: 90, lane: 'Lane 01', direction: 'Eastbound', timestamp: '11:55:00 PM', recordedSpeed: 145, ocrConfidence: 99.5, status: 'alert' },
        ],
      },
    ],
  },
  {
    plateNumber: 'KA-03-NZ-1002',
    rfidTag: 'FASTAG-665810-KA',
    make: 'Tesla', model: 'Model Y Long Range', year: 2025,
    color: 'Pearl White Multi-Coat', vehicleType: 'EV',
    vin: 'LRW3E7FA5NC665810', engineNumber: 'EL-DM-Y25-9102',
    fuelType: 'Electric', registrationDate: '03 Jan 2025', fitnessExpiry: '02 Jan 2040',
    insuranceStatus: 'Active', insuranceProvider: 'ICICI Lombard',
    isBlacklisted: false,
    owner: {
      name: 'Priya Venkataraman',
      licenseNumber: 'KA-03-2020007810',
      nationalId: 'NAT-IND-1002-6658',
      phone: '+91 90080 10021',
      email: 'priya.v@quantumleap.co.in',
      address: 'Apartment 8C, The Millenia, Indiranagar, Bengaluru',
      emergencyContact: 'Dr. Suresh Venkataraman (+91 90080 10023)',
      penaltyPoints: 1,
      licenseValidity: '15 Jun 2036',
    },
    currentJourney: {
      id: 'JRN-2026-9905', date: '29 Sep 2026 (Today)',
      startTime: '07:50 AM', endTime: '08:35 AM',
      startLocation: 'Cyber Avenue Intersect 12', destination: 'Financial Towers Flyover South',
      totalDistanceKm: 18.9, durationMinutes: 45, highestSpeed: 56,
      highestSpeedLocation: 'Downtown Expressway Inbound #4 (CAM-02)', averageSpeed: 44.8, status: 'completed',
      checkpoints: [
        { id: 'CAM-04-TECH-AV', name: 'Cyber Avenue Intersect 12', sector: 'Tech Corridor', lat: 28.6800, lng: 77.2100, speedLimit: 50, lane: 'Lane 02', direction: 'Westbound', timestamp: '07:50:00 AM', recordedSpeed: 48, ocrConfidence: 99.8, status: 'normal' },
        { id: 'CAM-02-EXP-IN', name: 'Downtown Expressway Inbound #4', sector: 'Central Metro', lat: 28.6892, lng: 77.1270, speedLimit: 90, lane: 'Lane 02', direction: 'West', timestamp: '08:12:05 AM', recordedSpeed: 56, ocrConfidence: 99.9, status: 'normal' },
        { id: 'CAM-03-CBD-FLY', name: 'Financial Towers Flyover South', sector: 'Central Metro', lat: 28.6769, lng: 77.1523, speedLimit: 60, lane: 'Lane 01', direction: 'Southbound', timestamp: '08:35:20 AM', recordedSpeed: 42, ocrConfidence: 99.7, status: 'normal' },
      ],
    },
    previousJourneys: [],
  },
  {
    plateNumber: 'TS-09-EQ-7744',
    rfidTag: 'FASTAG-330920-TS',
    make: 'Toyota', model: 'Fortuner 4x4 AT', year: 2022,
    color: 'Attitude Black', vehicleType: 'SUV',
    vin: 'MHFHB8GS9N0330920', engineNumber: '1GD-FTV-448801',
    fuelType: 'Diesel', registrationDate: '22 Mar 2022', fitnessExpiry: '21 Mar 2037',
    insuranceStatus: 'Active', insuranceProvider: 'New India Assurance Co Ltd',
    isBlacklisted: true,
    blacklistReason: 'Interstate Smuggling Network Suspect – Contraband cargo flagged at Deep Harbor Port Freight Gate. Subject of active NCB lookup.',
    blacklistSeverity: 'High', flaggedByAgency: 'Narcotics Control Bureau (NCB) & Customs Intelligence', flagDate: '26 Sep 2026',
    owner: {
      name: 'Mohammed Farhan Sheikh',
      licenseNumber: 'TS-09-2018002290',
      nationalId: 'NAT-IND-7744-3309',
      phone: '+91 84660 77440',
      email: 'farhan.s@logisticshub.in',
      address: 'Plot 12, Jubilee Hills Road No. 36, Hyderabad',
      emergencyContact: 'Zainab Sheikh (+91 84660 77442)',
      penaltyPoints: 5,
      licenseValidity: '30 Nov 2033',
    },
    currentJourney: {
      id: 'JRN-2026-9900', date: '29 Sep 2026 (Today)',
      startTime: '06:00 AM', endTime: '07:40 AM',
      startLocation: 'South Perimeter Highway Mile 14', destination: 'North Orbital Toll Plazas',
      totalDistanceKm: 51.6, durationMinutes: 100, highestSpeed: 126,
      highestSpeedLocation: 'South Perimeter Highway Mile 14 (CAM-07)', averageSpeed: 72.0, status: 'flagged',
      checkpoints: [
        { id: 'CAM-07-S-RING', name: 'South Perimeter Highway Mile 14', sector: 'Industrial District', lat: 28.6300, lng: 77.1600, speedLimit: 100, lane: 'Lane 01', direction: 'Northbound', timestamp: '06:00:05 AM', recordedSpeed: 126, ocrConfidence: 99.4, status: 'overspeed' },
        { id: 'CAM-12-METRO-D', name: 'Metro South Underpass Cam 2', sector: 'Industrial District', lat: 28.6250, lng: 77.1300, speedLimit: 70, lane: 'Lane 01', direction: 'North', timestamp: '06:22:30 AM', recordedSpeed: 88, ocrConfidence: 99.1, status: 'overspeed' },
        { id: 'CAM-05-RIV-BRG', name: 'Grand River Suspension Bridge', sector: 'Riverfront Corridor', lat: 28.6600, lng: 77.1800, speedLimit: 70, lane: 'Lane 02', direction: 'North', timestamp: '06:48:10 AM', recordedSpeed: 76, ocrConfidence: 99.6, status: 'overspeed' },
        { id: 'CAM-02-EXP-IN', name: 'Downtown Expressway Inbound #4', sector: 'Central Metro', lat: 28.6892, lng: 77.1270, speedLimit: 90, lane: 'Lane 01', direction: 'Northbound', timestamp: '07:15:00 AM', recordedSpeed: 92, ocrConfidence: 99.3, status: 'overspeed' },
        { id: 'CAM-01-N-GATE', name: 'North Orbital Toll Plazas', sector: 'North Gateway', lat: 28.7041, lng: 77.1025, speedLimit: 80, lane: 'Lane 02', direction: 'Outbound', timestamp: '07:40:20 AM', recordedSpeed: 78, ocrConfidence: 99.8, status: 'normal' },
      ],
    },
    previousJourneys: [],
  },
  {
    plateNumber: 'MH-02-CD-5520',
    rfidTag: 'FASTAG-502110-MH',
    make: 'Mercedes-Benz', model: 'S 500 4MATIC', year: 2024,
    color: 'Obsidian Black', vehicleType: 'Sedan',
    vin: 'WDD2220341A502110', engineNumber: 'M256-E30-99200',
    fuelType: 'Petrol', registrationDate: '08 May 2024', fitnessExpiry: '07 May 2039',
    insuranceStatus: 'Active', insuranceProvider: 'Tata AIG General Insurance',
    isBlacklisted: false,
    owner: {
      name: 'Dr. Meera Sharma',
      licenseNumber: 'MH-02-2017006620',
      nationalId: 'NAT-IND-5520-5021',
      phone: '+91 98200 55200',
      email: 'meera.sharma@apolloclinics.org',
      address: 'Flat 1902, The Imperial Heights, Tardeo, Mumbai',
      emergencyContact: 'Rohit Sharma (+91 98200 55202)',
      penaltyPoints: 0,
      licenseValidity: '12 Dec 2037',
    },
    currentJourney: {
      id: 'JRN-2026-9904', date: '29 Sep 2026 (Today)',
      startTime: '05:50 AM', endTime: '06:30 AM',
      startLocation: 'Airport Underpass Terminal 3', destination: 'Civic Plaza Central Roundabout',
      totalDistanceKm: 22.4, durationMinutes: 40, highestSpeed: 82,
      highestSpeedLocation: 'Grand River Suspension Bridge (CAM-05)', averageSpeed: 58.0, status: 'completed',
      checkpoints: [
        { id: 'CAM-06-AIR-TUN', name: 'Airport Underpass Terminal 3', sector: 'Airport Link', lat: 28.6500, lng: 77.2400, speedLimit: 80, lane: 'Lane 02 (Departure)', direction: 'Westbound', timestamp: '05:50:00 AM', recordedSpeed: 74, ocrConfidence: 99.5, status: 'normal' },
        { id: 'CAM-05-RIV-BRG', name: 'Grand River Suspension Bridge', sector: 'Riverfront Corridor', lat: 28.6600, lng: 77.1800, speedLimit: 70, lane: 'Lane 01', direction: 'North-West', timestamp: '06:08:45 AM', recordedSpeed: 82, ocrConfidence: 99.8, status: 'overspeed' },
        { id: 'CAM-10-CTR-SQ', name: 'Civic Plaza Central Roundabout', sector: 'Central Metro', lat: 28.6680, lng: 77.1450, speedLimit: 40, lane: 'Lane 01', direction: 'Arrival', timestamp: '06:30:00 AM', recordedSpeed: 32, ocrConfidence: 99.9, status: 'normal' },
      ],
    },
    previousJourneys: [
      {
        id: 'JRN-2026-9762', date: '27 Sep 2026',
        startTime: '09:00 AM', endTime: '09:40 AM',
        startLocation: 'West Boulevard Commerce Junction', destination: 'Financial Towers Flyover South',
        totalDistanceKm: 18.5, durationMinutes: 40, highestSpeed: 62,
        highestSpeedLocation: 'Financial Towers Flyover South (CAM-03)', averageSpeed: 49.0, status: 'completed',
        checkpoints: [
          { id: 'CAM-09-WEST-BL', name: 'West Boulevard Commerce Junction', sector: 'West District', lat: 28.6750, lng: 77.0800, speedLimit: 50, lane: 'Lane 02', direction: 'East', timestamp: '09:00:00 AM', recordedSpeed: 46, ocrConfidence: 99.8, status: 'normal' },
          { id: 'CAM-03-CBD-FLY', name: 'Financial Towers Flyover South', sector: 'Central Metro', lat: 28.6769, lng: 77.1523, speedLimit: 60, lane: 'Lane 01', direction: 'East', timestamp: '09:40:00 AM', recordedSpeed: 62, ocrConfidence: 99.7, status: 'overspeed' },
        ],
      },
    ],
  },
  {
    plateNumber: 'KA-05-MM-3319',
    rfidTag: 'FASTAG-994102-KA',
    make: 'Volvo', model: 'XC90 Recharge AWD', year: 2023,
    color: 'Onyx Black', vehicleType: 'SUV',
    vin: 'YV4BR0024P1994102', engineNumber: 'B4204T34-88910',
    fuelType: 'Hybrid', registrationDate: '11 Jul 2023', fitnessExpiry: '10 Jul 2038',
    insuranceStatus: 'Active', insuranceProvider: 'Bajaj Allianz General Insurance',
    isBlacklisted: false,
    owner: {
      name: 'Karan Mehra',
      licenseNumber: 'KA-05-2012009918',
      nationalId: 'NAT-IND-3319-9182',
      phone: '+91 98450 33190',
      email: 'karan.m@stridecloud.io',
      address: 'Villa 22, Windmills of Your Mind, Whitefield, Bengaluru',
      emergencyContact: 'Pooja Mehra (+91 98450 33191)',
      penaltyPoints: 2,
      licenseValidity: '08 Aug 2035',
    },
    currentJourney: {
      id: 'JRN-2026-9906', date: '29 Sep 2026 (Today)',
      startTime: '06:40 AM', endTime: '07:35 AM',
      startLocation: 'North Orbital Toll Plazas', destination: 'Cyber Avenue Intersect 12',
      totalDistanceKm: 33.4, durationMinutes: 55, highestSpeed: 92,
      highestSpeedLocation: 'Downtown Expressway Inbound #4 (CAM-02)', averageSpeed: 62.4, status: 'completed',
      checkpoints: [
        { id: 'CAM-01-N-GATE', name: 'North Orbital Toll Plazas', sector: 'North Gateway', lat: 28.7041, lng: 77.1025, speedLimit: 80, lane: 'Lane 02', direction: 'Southbound', timestamp: '06:40:05 AM', recordedSpeed: 78, ocrConfidence: 99.6, status: 'normal' },
        { id: 'CAM-02-EXP-IN', name: 'Downtown Expressway Inbound #4', sector: 'Central Metro', lat: 28.6892, lng: 77.1270, speedLimit: 90, lane: 'Lane 01', direction: 'Southbound', timestamp: '06:58:30 AM', recordedSpeed: 92, ocrConfidence: 99.8, status: 'overspeed' },
        { id: 'CAM-04-TECH-AV', name: 'Cyber Avenue Intersect 12', sector: 'Tech Corridor', lat: 28.6800, lng: 77.2100, speedLimit: 50, lane: 'Lane 02', direction: 'Arrival Gate 4', timestamp: '07:35:10 AM', recordedSpeed: 48, ocrConfidence: 99.9, status: 'normal' },
      ],
    },
    previousJourneys: [],
  },
];

// ============================================================================
// CITY TRAFFIC SECTORS
// ============================================================================

export const citySectors: CitySectorTraffic[] = [
  { id: 'SEC-01', name: 'Central Metro CBD', code: 'CBD-01', congestionIndex: 88, vehicleCountPerHour: 14250, averageSpeed: 21, speedLimit: 50, status: 'Severe Gridlock', primaryBottleneck: 'Civic Plaza Roundabout & Financial Flyover Merge', activeSurveillanceCameras: 48, incidentsReported: 3 },
  { id: 'SEC-02', name: 'Tech Corridor & IT Park', code: 'TECH-02', congestionIndex: 74, vehicleCountPerHour: 11890, averageSpeed: 32, speedLimit: 60, status: 'Congested', primaryBottleneck: 'Cyber Avenue Intersect 12 Signal Bottleneck', activeSurveillanceCameras: 64, incidentsReported: 1 },
  { id: 'SEC-03', name: 'Grand Riverfront Corridor', code: 'RIV-03', congestionIndex: 61, vehicleCountPerHour: 8940, averageSpeed: 48, speedLimit: 70, status: 'Moderate', primaryBottleneck: 'Suspension Bridge Lane Restriction Maintenance', activeSurveillanceCameras: 32, incidentsReported: 0 },
  { id: 'SEC-04', name: 'Airport Express Link', code: 'AIR-04', congestionIndex: 38, vehicleCountPerHour: 6200, averageSpeed: 74, speedLimit: 80, status: 'Smooth', primaryBottleneck: 'Terminal 3 Underpass Deceleration Wave', activeSurveillanceCameras: 42, incidentsReported: 0 },
  { id: 'SEC-05', name: 'Industrial South Logistics', code: 'IND-05', congestionIndex: 45, vehicleCountPerHour: 7120, averageSpeed: 68, speedLimit: 90, status: 'Smooth', primaryBottleneck: 'Freight Truck Weighbridge Queue', activeSurveillanceCameras: 36, incidentsReported: 1 },
  { id: 'SEC-06', name: 'Deep Harbor Port Outflow', code: 'PRT-06', congestionIndex: 92, vehicleCountPerHour: 5400, averageSpeed: 14, speedLimit: 50, status: 'Severe Gridlock', primaryBottleneck: 'Customs Cargo Container Inspection Gate A', activeSurveillanceCameras: 28, incidentsReported: 2 },
];

// ============================================================================
// TRAFFIC ACTION OPTIONS
// ============================================================================

export const trafficActionOptions: TrafficActionOption[] = [
  { id: 'OPT-01-AI-SIGNAL', title: 'AI Adaptive Signal Phase Modulation', category: 'Signal Control', description: 'Dynamically synchronize split-second traffic light phase timings using real-time ANPR vehicle queues and queue-length ML prediction.', projectedImpact: '-28% Intersection Delay', estimatedLatency: '0.4s AI compute', badge: 'Autonomous Control', iconName: 'Cpu' },
  { id: 'OPT-02-EMERGENCY', title: 'Autonomous Emergency Corridor Preemption', category: 'Fleet & Drone', description: 'Instantly carve out a green wave path along surveillance cameras for registered ambulances, fire trucks, and police escorts.', projectedImpact: '8.4 min Faster Transit', estimatedLatency: 'Realtime Trigger', badge: 'Priority Preemption', iconName: 'Siren' },
  { id: 'OPT-03-DYNAMIC-TOLL', title: 'Congestion Surge Toll & Dynamic Diversion', category: 'Eco & Dynamic', description: 'Trigger autonomous variable toll tariffs and digital highway signage to reroute 35% of suburban traffic away from Central CBD.', projectedImpact: '-34% Bottleneck Peak', estimatedLatency: 'Immediate Push', badge: 'Load Balancing', iconName: 'Compass' },
  { id: 'OPT-04-DRONE-PATROL', title: 'Autonomous Drone Fleet Dispatch', category: 'Fleet & Drone', description: 'Deploy solar tethered quadcopter swarm to hover over severe gridlock chokepoints and stream aerial computer vision to patrol interceptors.', projectedImpact: '360° Visual Telemetry', estimatedLatency: '3 min Deployment', badge: 'Aerial Recon', iconName: 'Plane' },
  { id: 'OPT-05-VARIABLE-SPEED', title: 'Variable Speed Limit (VSL) Dynamic Automation', category: 'Enforcement', description: 'Automatically adjust digital overhead highway speed limits based on rain, braking shockwaves, and ANPR trajectory acceleration data.', projectedImpact: '-42% Shockwave Jam Risks', estimatedLatency: 'Automated Sync', badge: 'Flow Smoothing', iconName: 'Gauge' },
  { id: 'OPT-06-INCIDENT-INTERCEPT', title: 'AI Multi-Agency Blacklist Intercept Grid', category: 'Enforcement', description: 'Automate high-speed cordon deployment at next 3 upcoming camera intersections when a Critical Blacklisted vehicle enters camera FOV.', projectedImpact: '99.2% Cordon Intercept Rate', estimatedLatency: 'Instant Dispatch', badge: 'Tactical Grid', iconName: 'ShieldAlert' },
];

// ============================================================================
// LIVE ANPR DETECTION STREAM (mutable — new detections are pushed)
// ============================================================================

export const liveANPRStream: LiveANPRDetection[] = [
  { id: 'DET-101', plateNumber: 'MH-12-DE-4491', cameraId: 'CAM-05-RIV-BRG', cameraName: 'Grand River Suspension Bridge', sector: 'Riverfront Corridor', timestamp: '05:04:19 AM', speed: 158, speedLimit: 70, confidence: 99.7, vehicleModel: 'Porsche Taycan', vehicleColor: 'Frozen Blue', isBlacklisted: true, isOverspeed: true },
  { id: 'DET-102', plateNumber: 'KA-03-NZ-1002', cameraId: 'CAM-04-TECH-AV', cameraName: 'Cyber Avenue Intersect 12', sector: 'Tech Corridor', timestamp: '08:12:05 AM', speed: 46, speedLimit: 50, confidence: 99.8, vehicleModel: 'Tesla Model Y', vehicleColor: 'White', isBlacklisted: false, isOverspeed: false },
  { id: 'DET-103', plateNumber: 'DL-01-AB-9821', cameraId: 'CAM-11-EAST-SP', cameraName: 'East Ring Speedway Junction 8', sector: 'Tech Corridor', timestamp: '02:22:40 AM', speed: 172, speedLimit: 90, confidence: 99.6, vehicleModel: 'BMW M3 Competition', vehicleColor: 'Green', isBlacklisted: true, isOverspeed: true },
  { id: 'DET-104', plateNumber: 'TS-09-EQ-7744', cameraId: 'CAM-07-S-RING', cameraName: 'South Perimeter Highway Mile 14', sector: 'Industrial District', timestamp: '07:22:00 AM', speed: 126, speedLimit: 100, confidence: 99.4, vehicleModel: 'Toyota Fortuner', vehicleColor: 'Black', isBlacklisted: true, isOverspeed: true },
  { id: 'DET-105', plateNumber: 'MH-02-CD-5520', cameraId: 'CAM-06-AIR-TUN', cameraName: 'Airport Underpass Terminal 3', sector: 'Airport Link', timestamp: '06:25:00 AM', speed: 72, speedLimit: 80, confidence: 99.9, vehicleModel: 'Mercedes S-Class', vehicleColor: 'Black', isBlacklisted: false, isOverspeed: false },
  { id: 'DET-106', plateNumber: 'KA-05-MM-3319', cameraId: 'CAM-02-EXP-IN', cameraName: 'Downtown Expressway Inbound #4', sector: 'Central Metro', timestamp: '06:58:30 AM', speed: 92, speedLimit: 90, confidence: 99.8, vehicleModel: 'Volvo XC90', vehicleColor: 'Black', isBlacklisted: false, isOverspeed: true },
];

// ============================================================================
// BLOCKLIST PLATE NUMBERS (quick lookup)
// ============================================================================

export const blocklistPlates: string[] = vehicles
  .filter(v => v.isBlacklisted)
  .map(v => v.plateNumber);
