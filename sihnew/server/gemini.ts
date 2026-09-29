/**
 * AEGISNET — Gemini AI Integration Service
 * Provides AI-powered traffic analysis, vehicle intelligence,
 * and natural language query capabilities via Google Gemini API.
 */

import { GoogleGenAI } from '@google/genai';
import {
  vehicles,
  citySectors,
  CITY_CAMERAS,
  liveANPRStream,
  type Vehicle,
  type CitySectorTraffic,
} from './data.js';

// ============================================================================
// GEMINI CLIENT INITIALIZATION
// ============================================================================

let genAI: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set. Please set it in your .env.local file.'
      );
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

// ============================================================================
// CONTEXT BUILDERS — Feed structured data into Gemini prompts
// ============================================================================

function buildVehicleContext(vehicle: Vehicle): string {
  const journeyInfo = vehicle.currentJourney
    ? `Current Journey: ${vehicle.currentJourney.startLocation} → ${vehicle.currentJourney.destination} (${vehicle.currentJourney.totalDistanceKm} km, highest speed ${vehicle.currentJourney.highestSpeed} km/h at ${vehicle.currentJourney.highestSpeedLocation})`
    : 'No active journey';

  const violations = vehicle.currentJourney?.checkpoints
    .filter(c => c.recordedSpeed > c.speedLimit)
    .map(c => `${c.name}: ${c.recordedSpeed}/${c.speedLimit} km/h`)
    .join('; ') || 'None';

  return `
Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.year})
Plate: ${vehicle.plateNumber} | RFID: ${vehicle.rfidTag}
Color: ${vehicle.color} | Type: ${vehicle.vehicleType} | Fuel: ${vehicle.fuelType}
VIN: ${vehicle.vin} | Engine: ${vehicle.engineNumber}
Registration: ${vehicle.registrationDate} | Fitness Expiry: ${vehicle.fitnessExpiry}
Insurance: ${vehicle.insuranceStatus} (${vehicle.insuranceProvider})
Blacklisted: ${vehicle.isBlacklisted ? `YES — ${vehicle.blacklistReason} (${vehicle.blacklistSeverity}, flagged by ${vehicle.flaggedByAgency} on ${vehicle.flagDate})` : 'No'}
Owner: ${vehicle.owner.name} | License: ${vehicle.owner.licenseNumber} | Penalty Points: ${vehicle.owner.penaltyPoints}
${journeyInfo}
Speed Violations: ${violations}
Previous Journeys: ${vehicle.previousJourneys.length} on record
`.trim();
}

function buildTrafficContext(): string {
  return citySectors
    .map(
      s =>
        `${s.name} (${s.code}): Congestion ${s.congestionIndex}% | ${s.vehicleCountPerHour} veh/hr | Avg ${s.averageSpeed}/${s.speedLimit} km/h | Status: ${s.status} | Bottleneck: ${s.primaryBottleneck} | Cameras: ${s.activeSurveillanceCameras} | Incidents: ${s.incidentsReported}`
    )
    .join('\n');
}

function buildSystemPrompt(): string {
  return `You are AegisNet AI, an advanced traffic intelligence assistant for the National Transit & ANPR Trajectory Portal. You are integrated into a government urban traffic surveillance and vehicle tracking system used by Indian law enforcement and traffic authorities.

Your capabilities:
1. Analyze vehicle trajectories, speed violations, and blacklist records
2. Provide traffic congestion analysis and mitigation recommendations
3. Assess risk levels for flagged vehicles
4. Generate enforcement advisories and incident reports
5. Answer queries about ANPR detection data and camera networks

Always respond in a professional, authoritative tone befitting a government traffic intelligence system. Include specific data points from the provided context. Format responses with clear sections using markdown.

When analyzing violations, reference specific camera IDs, timestamps, and speed differentials. When discussing traffic, cite sector codes and congestion indices.`;
}

// ============================================================================
// AI SERVICE FUNCTIONS
// ============================================================================

/**
 * Analyze a specific vehicle's trajectory and generate an intelligence report
 */
export async function analyzeVehicle(plateNumber: string): Promise<string> {
  const vehicle = vehicles.find(v => v.plateNumber === plateNumber);
  if (!vehicle) {
    return `No vehicle found with plate number: ${plateNumber}`;
  }

  const ai = getGenAI();
  const prompt = `${buildSystemPrompt()}

VEHICLE DATA:
${buildVehicleContext(vehicle)}

Generate a comprehensive Vehicle Intelligence Report for this vehicle. Include:
1. Risk Assessment (Critical/High/Medium/Low) with justification
2. Speed Violation Analysis — list each violation with severity
3. Trajectory Pattern Analysis — assess the route behavior
4. Enforcement Recommendation — specific actions for traffic authorities
5. Owner Profile Summary — relevant enforcement notes

Keep the response detailed but concise (under 600 words). Use professional law enforcement terminology.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text || 'AI analysis could not be generated.';
  } catch (error: any) {
    console.error('Gemini API error (analyzeVehicle):', error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Analyze city-wide traffic conditions and provide mitigation strategies
 */
export async function analyzeTraffic(city: string): Promise<string> {
  const ai = getGenAI();
  const prompt = `${buildSystemPrompt()}

CITY: ${city}
CURRENT TRAFFIC DATA:
${buildTrafficContext()}

CAMERA NETWORK:
${CITY_CAMERAS.length} active ANPR cameras across ${new Set(CITY_CAMERAS.map(c => c.sector)).size} sectors.

Generate a City Traffic Intelligence Briefing. Include:
1. Overall City Traffic Health Score (0-100)
2. Critical Sectors requiring immediate intervention (sorted by severity)
3. Bottleneck Root Cause Analysis for gridlocked sectors
4. Recommended AI Mitigation Actions (reference the available options: AI Signal Modulation, Emergency Corridor Preemption, Dynamic Toll Diversion, Drone Fleet Dispatch, Variable Speed Limits, Blacklist Intercept Grid)
5. 24-Hour Traffic Forecast based on current patterns

Keep the response under 500 words. Use data-driven analysis with specific numbers.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text || 'AI analysis could not be generated.';
  } catch (error: any) {
    console.error('Gemini API error (analyzeTraffic):', error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Process a natural language query about the traffic system
 */
export async function queryAI(question: string): Promise<string> {
  const ai = getGenAI();

  // Build comprehensive context
  const vehicleSummaries = vehicles
    .map(
      v =>
        `${v.plateNumber} (${v.make} ${v.model}) — ${v.isBlacklisted ? 'BLACKLISTED' : 'Clear'}, Owner: ${v.owner.name}, Current Speed Record: ${v.currentJourney?.highestSpeed || 'N/A'} km/h`
    )
    .join('\n');

  const recentDetections = liveANPRStream
    .map(
      d =>
        `${d.plateNumber} at ${d.cameraName} — ${d.speed}/${d.speedLimit} km/h @ ${d.timestamp} ${d.isBlacklisted ? '[BLACKLISTED]' : ''} ${d.isOverspeed ? '[OVERSPEED]' : ''}`
    )
    .join('\n');

  const prompt = `${buildSystemPrompt()}

REGISTERED VEHICLES:
${vehicleSummaries}

TRAFFIC SECTORS:
${buildTrafficContext()}

RECENT ANPR DETECTIONS:
${recentDetections}

CAMERA NETWORK: ${CITY_CAMERAS.length} cameras, sectors: ${[...new Set(CITY_CAMERAS.map(c => c.sector))].join(', ')}

USER QUERY: ${question}

Answer the user's query using ONLY the data provided above. Be precise, cite specific data points, and maintain professional law enforcement tone. If the query cannot be answered from available data, state that clearly. Keep the response under 400 words.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text || 'AI could not generate a response.';
  } catch (error: any) {
    console.error('Gemini API error (queryAI):', error.message);
    throw new Error(`AI query failed: ${error.message}`);
  }
}

/**
 * Generate an ANPR detection analysis for a specific camera feed
 */
export async function analyzeCameraFeed(cameraId: string): Promise<string> {
  const camera = CITY_CAMERAS.find(c => c.id === cameraId);
  if (!camera) {
    return `Camera not found: ${cameraId}`;
  }

  const detections = liveANPRStream.filter(d => d.cameraId === cameraId);

  const ai = getGenAI();
  const prompt = `${buildSystemPrompt()}

CAMERA: ${camera.name} (${camera.id})
Sector: ${camera.sector} | Location: ${camera.lat}, ${camera.lng} | Speed Limit: ${camera.limit} km/h

RECENT DETECTIONS AT THIS CAMERA:
${detections.length > 0
      ? detections
          .map(
            d =>
              `- ${d.plateNumber} (${d.vehicleModel}, ${d.vehicleColor}): ${d.speed} km/h @ ${d.timestamp} | Confidence: ${d.confidence}% ${d.isBlacklisted ? '⚠ BLACKLISTED' : ''} ${d.isOverspeed ? '🔴 OVERSPEED' : '✅ COMPLIANT'}`
          )
          .join('\n')
      : 'No recent detections at this camera.'
    }

Generate a Camera Feed Intelligence Summary. Include:
1. Camera Status Assessment
2. Detection Pattern Analysis (speed distribution, violation rate)
3. Blacklisted Vehicle Alerts (if any)
4. Enforcement Priority Recommendations

Keep the response under 300 words.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text || 'AI analysis could not be generated.';
  } catch (error: any) {
    console.error('Gemini API error (analyzeCameraFeed):', error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}
