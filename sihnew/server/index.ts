/**
 * AEGISNET — Express Backend Server
 * National Transit & ANPR Trajectory Portal API
 *
 * Provides RESTful API endpoints for:
 * - Vehicle data & journey tracking
 * - Blacklist management
 * - Traffic sector analytics
 * - Live ANPR detection stream
 * - Camera network management
 * - Gemini AI-powered intelligence analysis
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  vehicles,
  citySectors,
  CITY_CAMERAS,
  liveANPRStream,
  trafficActionOptions,
  blocklistPlates,
  type LiveANPRDetection,
} from './data.js';

import {
  analyzeVehicle,
  analyzeTraffic,
  queryAI,
  analyzeCameraFeed,
} from './gemini.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local first, then .env as fallback
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(express.json());

// CORS — allow frontend dev server
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    process.env.APP_URL,
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'operational',
    service: 'AegisNet ANPR & Traffic AI Engine',
    version: '4.2.8',
    serverBuild: '2026.09',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// ============================================================================
// VEHICLE ENDPOINTS
// ============================================================================

/**
 * GET /api/vehicles — List all vehicles
 * Query params: ?blacklisted=true|false, ?search=<plate>
 */
app.get('/api/vehicles', (req: Request, res: Response) => {
  let result = [...vehicles];

  // Filter by blacklist status
  if (req.query.blacklisted !== undefined) {
    const isBlacklisted = req.query.blacklisted === 'true';
    result = result.filter(v => v.isBlacklisted === isBlacklisted);
  }

  // Search by plate number (partial match)
  if (req.query.search) {
    const search = (req.query.search as string).toUpperCase();
    result = result.filter(v => v.plateNumber.includes(search));
  }

  res.json({
    count: result.length,
    vehicles: result.map(v => ({
      plateNumber: v.plateNumber,
      rfidTag: v.rfidTag,
      make: v.make,
      model: v.model,
      year: v.year,
      color: v.color,
      vehicleType: v.vehicleType,
      isBlacklisted: v.isBlacklisted,
      blacklistSeverity: v.blacklistSeverity,
      ownerName: v.owner.name,
      currentJourneyStatus: v.currentJourney?.status || 'none',
    })),
  });
});

/**
 * GET /api/vehicles/:plateNumber — Full vehicle details
 */
app.get('/api/vehicles/:plateNumber', (req: Request, res: Response) => {
  const vehicle = vehicles.find(
    v => v.plateNumber === req.params.plateNumber.toUpperCase()
  );
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found', plateNumber: req.params.plateNumber });
  }
  res.json(vehicle);
});

/**
 * GET /api/vehicles/:plateNumber/journeys — All journeys for a vehicle
 */
app.get('/api/vehicles/:plateNumber/journeys', (req: Request, res: Response) => {
  const vehicle = vehicles.find(
    v => v.plateNumber === req.params.plateNumber.toUpperCase()
  );
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const journeys = [];
  if (vehicle.currentJourney) {
    journeys.push({ ...vehicle.currentJourney, isCurrent: true });
  }
  vehicle.previousJourneys.forEach(j => journeys.push({ ...j, isCurrent: false }));

  res.json({
    plateNumber: vehicle.plateNumber,
    totalJourneys: journeys.length,
    journeys,
  });
});

/**
 * GET /api/vehicles/:plateNumber/journeys/:journeyId — Specific journey details
 */
app.get('/api/vehicles/:plateNumber/journeys/:journeyId', (req: Request, res: Response) => {
  const vehicle = vehicles.find(
    v => v.plateNumber === req.params.plateNumber.toUpperCase()
  );
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const allJourneys = [vehicle.currentJourney, ...vehicle.previousJourneys].filter(Boolean);
  const journey = allJourneys.find(j => j?.id === req.params.journeyId);

  if (!journey) {
    return res.status(404).json({ error: 'Journey not found', journeyId: req.params.journeyId });
  }

  res.json(journey);
});

// ============================================================================
// BLACKLIST ENDPOINTS
// ============================================================================

/**
 * GET /api/blacklist — List all blacklisted plates
 */
app.get('/api/blacklist', (_req: Request, res: Response) => {
  const blacklisted = vehicles.filter(v => v.isBlacklisted);
  res.json({
    count: blacklisted.length,
    plates: blacklisted.map(v => ({
      plateNumber: v.plateNumber,
      reason: v.blacklistReason,
      severity: v.blacklistSeverity,
      flaggedBy: v.flaggedByAgency,
      flagDate: v.flagDate,
      make: v.make,
      model: v.model,
      ownerName: v.owner.name,
    })),
  });
});

/**
 * POST /api/blacklist/:plateNumber — Add vehicle to blacklist
 * Body: { reason: string, severity?: string, agency?: string }
 */
app.post('/api/blacklist/:plateNumber', (req: Request, res: Response) => {
  const vehicle = vehicles.find(
    v => v.plateNumber === req.params.plateNumber.toUpperCase()
  );
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  if (vehicle.isBlacklisted) {
    return res.status(409).json({ error: 'Vehicle is already blacklisted' });
  }

  const { reason, severity, agency } = req.body;
  if (!reason) {
    return res.status(400).json({ error: 'Blacklist reason is required' });
  }

  vehicle.isBlacklisted = true;
  vehicle.blacklistReason = reason;
  vehicle.blacklistSeverity = severity || 'High';
  vehicle.flaggedByAgency = agency || 'Metropolitan Traffic Enforcement Division';
  vehicle.flagDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Add to quick-lookup list
  if (!blocklistPlates.includes(vehicle.plateNumber)) {
    blocklistPlates.push(vehicle.plateNumber);
  }

  console.log(`[BLACKLIST] Added ${vehicle.plateNumber}: ${reason}`);

  res.json({
    message: `Vehicle ${vehicle.plateNumber} added to blacklist`,
    vehicle: {
      plateNumber: vehicle.plateNumber,
      isBlacklisted: vehicle.isBlacklisted,
      blacklistReason: vehicle.blacklistReason,
      blacklistSeverity: vehicle.blacklistSeverity,
      flaggedByAgency: vehicle.flaggedByAgency,
      flagDate: vehicle.flagDate,
    },
  });
});

/**
 * DELETE /api/blacklist/:plateNumber — Remove vehicle from blacklist
 */
app.delete('/api/blacklist/:plateNumber', (req: Request, res: Response) => {
  const vehicle = vehicles.find(
    v => v.plateNumber === req.params.plateNumber.toUpperCase()
  );
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  if (!vehicle.isBlacklisted) {
    return res.status(409).json({ error: 'Vehicle is not blacklisted' });
  }

  vehicle.isBlacklisted = false;
  vehicle.blacklistReason = undefined;
  vehicle.blacklistSeverity = undefined;
  vehicle.flaggedByAgency = undefined;
  vehicle.flagDate = undefined;

  const idx = blocklistPlates.indexOf(vehicle.plateNumber);
  if (idx !== -1) blocklistPlates.splice(idx, 1);

  console.log(`[BLACKLIST] Removed ${vehicle.plateNumber}`);

  res.json({
    message: `Vehicle ${vehicle.plateNumber} removed from blacklist`,
    plateNumber: vehicle.plateNumber,
    isBlacklisted: false,
  });
});

// ============================================================================
// TRAFFIC SECTOR ENDPOINTS
// ============================================================================

/**
 * GET /api/traffic/sectors — All city sectors with traffic data
 * Query params: ?city=<cityName>
 */
app.get('/api/traffic/sectors', (req: Request, res: Response) => {
  const city = (req.query.city as string) || 'Metropolis Central';
  const avgCongestion = Math.round(
    citySectors.reduce((acc, s) => acc + s.congestionIndex, 0) / citySectors.length
  );
  const totalVehiclesHour = citySectors.reduce((acc, s) => acc + s.vehicleCountPerHour, 0);
  const totalIncidents = citySectors.reduce((acc, s) => acc + s.incidentsReported, 0);

  res.json({
    city,
    summary: {
      avgCongestion,
      totalVehiclesHour,
      totalIncidents,
      activeCameras: CITY_CAMERAS.length,
      sectorCount: citySectors.length,
    },
    sectors: citySectors,
  });
});

/**
 * GET /api/traffic/sectors/:sectorId — Single sector details
 */
app.get('/api/traffic/sectors/:sectorId', (req: Request, res: Response) => {
  const sector = citySectors.find(s => s.id === req.params.sectorId);
  if (!sector) {
    return res.status(404).json({ error: 'Sector not found' });
  }

  // Find cameras in this sector
  const sectorCameras = CITY_CAMERAS.filter(c =>
    c.sector.toLowerCase().includes(sector.name.split(' ')[0].toLowerCase())
  );

  res.json({ ...sector, cameras: sectorCameras });
});

/**
 * GET /api/traffic/actions — Available traffic action/mitigation options
 * Query params: ?category=<category>
 */
app.get('/api/traffic/actions', (req: Request, res: Response) => {
  let options = [...trafficActionOptions];

  if (req.query.category && req.query.category !== 'All') {
    options = options.filter(o => o.category === req.query.category);
  }

  res.json({
    count: options.length,
    options,
  });
});

// ============================================================================
// CAMERA ENDPOINTS
// ============================================================================

/**
 * GET /api/cameras — List all ANPR cameras
 * Query params: ?sector=<sectorName>
 */
app.get('/api/cameras', (req: Request, res: Response) => {
  let cameras = [...CITY_CAMERAS];

  if (req.query.sector) {
    const sector = (req.query.sector as string).toLowerCase();
    cameras = cameras.filter(c => c.sector.toLowerCase().includes(sector));
  }

  res.json({
    count: cameras.length,
    cameras,
  });
});

/**
 * GET /api/cameras/:cameraId — Single camera details + recent detections
 */
app.get('/api/cameras/:cameraId', (req: Request, res: Response) => {
  const camera = CITY_CAMERAS.find(c => c.id === req.params.cameraId);
  if (!camera) {
    return res.status(404).json({ error: 'Camera not found' });
  }

  const detections = liveANPRStream.filter(d => d.cameraId === camera.id);

  res.json({
    ...camera,
    recentDetections: detections,
    detectionCount: detections.length,
  });
});

// ============================================================================
// LIVE ANPR STREAM ENDPOINTS
// ============================================================================

/**
 * GET /api/anpr/detections — All live ANPR detections
 * Query params: ?blacklisted=true, ?overspeed=true, ?camera=<cameraId>
 */
app.get('/api/anpr/detections', (req: Request, res: Response) => {
  let detections = [...liveANPRStream];

  if (req.query.blacklisted === 'true') {
    detections = detections.filter(d => d.isBlacklisted);
  }
  if (req.query.overspeed === 'true') {
    detections = detections.filter(d => d.isOverspeed);
  }
  if (req.query.camera) {
    detections = detections.filter(d => d.cameraId === req.query.camera);
  }

  res.json({
    count: detections.length,
    timestamp: new Date().toISOString(),
    detections,
  });
});

/**
 * POST /api/anpr/detections — Simulate a new ANPR detection
 * Body: { plateNumber, cameraId, speed }
 */
app.post('/api/anpr/detections', (req: Request, res: Response) => {
  const { plateNumber, cameraId, speed } = req.body;

  if (!plateNumber || !cameraId || speed === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: plateNumber, cameraId, speed',
    });
  }

  const camera = CITY_CAMERAS.find(c => c.id === cameraId);
  if (!camera) {
    return res.status(404).json({ error: 'Camera not found' });
  }

  const vehicle = vehicles.find(v => v.plateNumber === plateNumber.toUpperCase());

  const detection: LiveANPRDetection = {
    id: `DET-${Date.now().toString().slice(-6)}`,
    plateNumber: plateNumber.toUpperCase(),
    cameraId: camera.id,
    cameraName: camera.name,
    sector: camera.sector,
    timestamp: new Date().toLocaleTimeString(),
    speed,
    speedLimit: camera.limit,
    confidence: +(98.5 + Math.random() * 1.4).toFixed(1),
    vehicleModel: vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown',
    vehicleColor: vehicle?.color || 'Unknown',
    isBlacklisted: vehicle?.isBlacklisted || false,
    isOverspeed: speed > camera.limit,
  };

  liveANPRStream.unshift(detection);

  // Keep stream at manageable size
  if (liveANPRStream.length > 100) {
    liveANPRStream.length = 100;
  }

  console.log(
    `[ANPR] New detection: ${detection.plateNumber} @ ${camera.name} — ${speed}/${camera.limit} km/h${detection.isBlacklisted ? ' [BLACKLISTED]' : ''}${detection.isOverspeed ? ' [OVERSPEED]' : ''}`
  );

  res.status(201).json(detection);
});

// ============================================================================
// DASHBOARD / ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/dashboard/stats — Aggregated dashboard statistics
 */
app.get('/api/dashboard/stats', (_req: Request, res: Response) => {
  const totalVehicles = vehicles.length;
  const blacklistedCount = vehicles.filter(v => v.isBlacklisted).length;
  const activeJourneys = vehicles.filter(v => v.currentJourney?.status === 'in_progress' || v.currentJourney?.status === 'flagged').length;
  const flaggedJourneys = vehicles.filter(v => v.currentJourney?.status === 'flagged').length;
  const avgCongestion = Math.round(
    citySectors.reduce((acc, s) => acc + s.congestionIndex, 0) / citySectors.length
  );
  const totalDetections = liveANPRStream.length;
  const overspeedDetections = liveANPRStream.filter(d => d.isOverspeed).length;
  const blacklistDetections = liveANPRStream.filter(d => d.isBlacklisted).length;

  res.json({
    timestamp: new Date().toISOString(),
    vehicles: {
      total: totalVehicles,
      blacklisted: blacklistedCount,
      cleared: totalVehicles - blacklistedCount,
    },
    journeys: {
      active: activeJourneys,
      flagged: flaggedJourneys,
    },
    traffic: {
      avgCongestion,
      totalSectors: citySectors.length,
      gridlockedSectors: citySectors.filter(s => s.congestionIndex >= 80).length,
    },
    anpr: {
      totalDetections,
      overspeed: overspeedDetections,
      blacklistHits: blacklistDetections,
      cameras: CITY_CAMERAS.length,
    },
  });
});

// ============================================================================
// GEMINI AI ENDPOINTS
// ============================================================================

/**
 * POST /api/ai/analyze-vehicle — AI-powered vehicle intelligence report
 * Body: { plateNumber: string }
 */
app.post('/api/ai/analyze-vehicle', async (req: Request, res: Response) => {
  try {
    const { plateNumber } = req.body;
    if (!plateNumber) {
      return res.status(400).json({ error: 'plateNumber is required' });
    }

    const analysis = await analyzeVehicle(plateNumber);
    res.json({
      plateNumber,
      analysis,
      generatedAt: new Date().toISOString(),
      model: 'gemini-2.0-flash',
    });
  } catch (error: any) {
    console.error('AI vehicle analysis error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/analyze-traffic — AI-powered traffic analysis
 * Body: { city?: string }
 */
app.post('/api/ai/analyze-traffic', async (req: Request, res: Response) => {
  try {
    const city = req.body.city || 'Metropolis Central';
    const analysis = await analyzeTraffic(city);
    res.json({
      city,
      analysis,
      generatedAt: new Date().toISOString(),
      model: 'gemini-2.0-flash',
    });
  } catch (error: any) {
    console.error('AI traffic analysis error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/query — Natural language query to AI assistant
 * Body: { question: string }
 */
app.post('/api/ai/query', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    const answer = await queryAI(question);
    res.json({
      question,
      answer,
      generatedAt: new Date().toISOString(),
      model: 'gemini-2.0-flash',
    });
  } catch (error: any) {
    console.error('AI query error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/analyze-camera — AI-powered camera feed analysis
 * Body: { cameraId: string }
 */
app.post('/api/ai/analyze-camera', async (req: Request, res: Response) => {
  try {
    const { cameraId } = req.body;
    if (!cameraId) {
      return res.status(400).json({ error: 'cameraId is required' });
    }

    const analysis = await analyzeCameraFeed(cameraId);
    res.json({
      cameraId,
      analysis,
      generatedAt: new Date().toISOString(),
      model: 'gemini-2.0-flash',
    });
  } catch (error: any) {
    console.error('AI camera analysis error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// STATIC FILE SERVING (Production)
// ============================================================================

// In production, serve the built frontend
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler for API routes
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: {
      health: 'GET /api/health',
      vehicles: 'GET /api/vehicles, GET /api/vehicles/:plate',
      journeys: 'GET /api/vehicles/:plate/journeys',
      blacklist: 'GET /api/blacklist, POST/DELETE /api/blacklist/:plate',
      traffic: 'GET /api/traffic/sectors, GET /api/traffic/actions',
      cameras: 'GET /api/cameras, GET /api/cameras/:id',
      anpr: 'GET /api/anpr/detections, POST /api/anpr/detections',
      dashboard: 'GET /api/dashboard/stats',
      ai: 'POST /api/ai/analyze-vehicle, POST /api/ai/analyze-traffic, POST /api/ai/query, POST /api/ai/analyze-camera',
    },
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║        AEGISNET — ANPR & Traffic AI Engine              ║');
  console.log('║        National Transit Portal Backend Server           ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Server:    http://localhost:${PORT}                       ║`);
  console.log(`║  API Base:  http://localhost:${PORT}/api                   ║`);
  console.log(`║  Health:    http://localhost:${PORT}/api/health            ║`);
  console.log(`║  Gemini AI: ${process.env.GEMINI_API_KEY ? 'Configured ✓' : 'NOT configured (set GEMINI_API_KEY)'}${''.padEnd(process.env.GEMINI_API_KEY ? 20 : 5)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
});

export default app;
