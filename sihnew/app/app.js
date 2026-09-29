/**
 * AEGISNET — National Transit & ANPR Trajectory Portal
 * Complete Vanilla JavaScript Application
 */

// ============================================================================
// APPLICATION STATE
// ============================================================================
const AppState = {
    currentTab: 'journey',
    selectedPlate: 'MH-12-DE-4491',
    selectedJourneyIndex: 0, // 0 = currentJourney, 1+ = previousJourneys
    selectedCheckpointId: null,
    playback: {
        isPlaying: false,
        progress: 0, // 0.0 to 1.0
        speed: 1,    // 1x, 2x, 5x
        intervalId: null
    },
    mapInstance: null,
    mapMarkers: [],
    mapPolyline: null,
    vehicleMarker: null,
    selectedSectorId: 'SEC-01',
    selectedCity: 'Metropolis Central',
    selectedLiveCamId: 'CAM-05-RIV-BRG',
    fontSizeOffset: 0,
    language: 'EN',
    blocklist: [...BLOCKLIST_PLATES],
    videoAnalyzer: {
        currentScenarioIndex: 0,
        customVideoUrl: null,
        isPlaying: false,
        speedLimit: 70,
        detectedSpeed: 118,
        detectedPlate: 'MH-12-DE-4491',
        carModel: 'Porsche Taycan 4S',
        ocrConfidence: 99.4,
        animFrameId: null,
        simProgress: 0,
        resultsLog: []
    }
};

function renderAllPages() {
    renderJourneyPage();
    renderIdentifierPage();
    renderReviewerPage();
    renderLivePage();
    renderAnalyzerPage();
}

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    renderAllPages();
    switchTab('journey');
    
    // Window resize handler for Leaflet
    window.addEventListener('resize', () => {
        if (AppState.mapInstance) {
            setTimeout(() => AppState.mapInstance.invalidateSize(), 200);
        }
    });
});

// Utility Clock
function initClock() {
    function update() {
        const now = new Date();
        const dateEl = document.getElementById('utility-date');
        const timeEl = document.getElementById('utility-time');
        if (dateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = now.toLocaleDateString('en-GB', options);
        }
        if (timeEl) {
            timeEl.textContent = now.toTimeString().split(' ')[0];
        }
    }
    update();
    setInterval(update, 1000);
}

// Font Sizing
function setFontSize(delta) {
    AppState.fontSizeOffset = delta;
    document.body.classList.remove('font-small', 'font-large');
    if (delta === -1) document.body.classList.add('font-small');
    if (delta === 1) document.body.classList.add('font-large');

    document.querySelectorAll('.font-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', (delta === -1 && idx === 0) || (delta === 0 && idx === 1) || (delta === 1 && idx === 2));
    });
}

// Language Switch
function setLanguage(lang) {
    AppState.language = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(lang === 'EN' ? 'English' : 'हिन्दी'));
    });
}

// Tab Switching
function switchTab(tabId) {
    AppState.currentTab = tabId;

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update page visibility
    document.querySelectorAll('.page').forEach(page => {
        page.classList.toggle('active', page.id === `page-${tabId}`);
    });

    // Specific tab activation hooks
    if (tabId === 'journey') {
        renderJourneyPage();
        setTimeout(initOrUpdateMap, 150);
    } else if (tabId === 'identifier') {
        renderIdentifierPage();
    } else if (tabId === 'reviewer') {
        renderReviewerPage();
    } else if (tabId === 'live') {
        renderLivePage();
    } else if (tabId === 'analyzer') {
        renderAnalyzerPage();
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

// Helpers
function getSelectedVehicle() {
    return MOCK_VEHICLES.find(v => v.plateNumber === AppState.selectedPlate) || MOCK_VEHICLES[0];
}

function getSelectedJourney() {
    const vehicle = getSelectedVehicle();
    if (AppState.selectedJourneyIndex === 0) {
        return vehicle.currentJourney;
    }
    return vehicle.previousJourneys[AppState.selectedJourneyIndex - 1] || vehicle.currentJourney;
}

// ============================================================================
// TAB 1: JOURNEY MAP PAGE
// ============================================================================
function renderJourneyPage() {
    const container = document.getElementById('page-journey');
    const vehicle = getSelectedVehicle();
    const journey = getSelectedJourney();
    const isBlacklisted = vehicle.isBlacklisted;
    const isCurrent = AppState.selectedJourneyIndex === 0;

    let html = `
    <!-- Top Vehicle Quick Selector & Plate Search -->
    <div class="card p-4 mb-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-2 overflow-x-auto pb-1" style="max-width: 100%;">
                <span class="text-xs font-mono font-bold text-slate-500 uppercase shrink-0">SELECT VEHICLE:</span>
                ${MOCK_VEHICLES.map(v => `
                    <button class="plate-pill ${v.plateNumber === AppState.selectedPlate ? 'active' : ''} ${v.isBlacklisted ? 'blacklisted' : ''}"
                            onclick="selectVehicle('${v.plateNumber}')">
                        ${v.plateNumber} ${v.isBlacklisted ? '⚠' : ''}
                    </button>
                `).join('')}
            </div>
            <div class="input-group" style="min-width: 260px;">
                <i data-lucide="search" class="input-icon"></i>
                <input type="text" class="input-field" placeholder="Search Plate (e.g. MH-12...)" 
                       value="${AppState.selectedPlate}" onchange="searchPlate(this.value)">
            </div>
        </div>
    </div>

    <!-- Blacklist Alert Banner if applicable -->
    ${isBlacklisted ? `
        <div class="blacklist-banner mb-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                        <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-red-800 text-sm font-mono">SECTOR INTERCEPT NOTICE // उच्च सतर्कता जब्ती वारंट</span>
                            <span class="badge badge-red font-mono text-xs">CRITICAL WARRANT</span>
                        </div>
                        <p class="text-xs text-red-700 mt-0.5">${vehicle.blacklistReason}</p>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm shrink-0" onclick="switchTab('identifier')">
                    <i data-lucide="file-text" class="w-3.5 h-3.5"></i> View Legal Dossier
                </button>
            </div>
        </div>
    ` : ''}

    <!-- Vehicle & Trajectory Summary Header -->
    <div class="card mb-4 overflow-hidden">
        <div class="navy-header">
            <div class="flex items-center gap-3">
                <i data-lucide="car" class="w-5 h-5 text-amber-400"></i>
                <div>
                    <h3 class="font-bold text-white text-base">${vehicle.make} ${vehicle.model} (${vehicle.year})</h3>
                    <span class="text-xs text-slate-300 font-mono">VIN: ${vehicle.vin} • Color: ${vehicle.color}</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="badge ${isBlacklisted ? 'badge-red' : 'badge-emerald'} font-mono">
                    ${isBlacklisted ? 'BLACKLISTED' : 'CLEARED'}
                </span>
                <span class="badge badge-navy font-mono hide-mobile">RFID: ${vehicle.rfidTag}</span>
            </div>
        </div>

        <div class="p-4 bg-slate-50 border-b border-slate-200">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <!-- Journey Selector Tabs -->
                <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold text-slate-600">JOURNEY RECORD:</span>
                    <button class="btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-ghost'}" onclick="selectJourneyIndex(0)">
                        Today's Active Trajectory
                    </button>
                    ${vehicle.previousJourneys.map((pj, idx) => `
                        <button class="btn btn-sm ${AppState.selectedJourneyIndex === (idx + 1) ? 'btn-primary' : 'btn-ghost'}" 
                                onclick="selectJourneyIndex(${idx + 1})">
                            ${pj.date}
                        </button>
                    `).join('')}
                </div>
                <div class="text-xs font-mono text-slate-500">
                    ID: <strong>${journey.id}</strong> | Timestamp: ${journey.startTime} - ${journey.endTime}
                </div>
            </div>
        </div>

        <!-- Telemetry Stat Bar -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200">
            <div class="bg-white p-3 text-center">
                <span class="text-xs font-mono text-slate-500 block">TOTAL DISTANCE</span>
                <span class="text-xl font-bold font-mono text-slate-900">${journey.totalDistanceKm} km</span>
            </div>
            <div class="bg-white p-3 text-center">
                <span class="text-xs font-mono text-slate-500 block">TRANSIT DURATION</span>
                <span class="text-xl font-bold font-mono text-slate-900">${journey.durationMinutes} min</span>
            </div>
            <div class="bg-white p-3 text-center">
                <span class="text-xs font-mono text-slate-500 block">AVERAGE SPEED</span>
                <span class="text-xl font-bold font-mono text-slate-900">${journey.averageSpeed} km/h</span>
            </div>
            <div class="bg-white p-3 text-center ${journey.highestSpeed > 100 ? 'bg-red-50' : ''}">
                <span class="text-xs font-mono text-red-600 font-bold block">PEAK RECORDED SPEED</span>
                <span class="text-xl font-bold font-mono text-red-700">${journey.highestSpeed} km/h</span>
            </div>
        </div>
    </div>

    <!-- Main Trajectory Map + Playback Controls + Sidebar -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Interactive Map Section (Cols 1 & 2) -->
        <div class="lg:col-span-2 flex flex-col gap-3">
            <div class="map-container">
                <!-- Map HUD Badges -->
                <div class="map-hud">
                    <span class="map-hud-badge">
                        <span class="pulse-dot bg-red-600"></span>
                        HIGH-PRECISION GIS RADAR TRAJECTORY
                    </span>
                    <span class="map-hud-badge">
                        CHECKPOINTS: ${journey.checkpoints.length} LOGGED
                    </span>
                </div>

                <!-- Leaflet Mount Div -->
                <div id="journey-map" style="width: 100%; height: 100%;"></div>

                <!-- Bottom Map Legend -->
                <div class="map-legend">
                    <div class="flex items-center gap-4">
                        <div class="map-legend-item">
                            <span class="legend-dot" style="background: var(--navy-700);"></span>
                            <span>Speed Limit Compliant</span>
                        </div>
                        <div class="map-legend-item">
                            <span class="legend-dot" style="background: var(--amber-500);"></span>
                            <span>Overspeed</span>
                        </div>
                        <div class="map-legend-item">
                            <span class="legend-dot" style="background: var(--red-600);"></span>
                            <span class="font-bold text-red-700">Peak Violation</span>
                        </div>
                    </div>
                    <div class="text-xs text-slate-500 hide-mobile">
                        Hover/Click camera marker for optical verification
                    </div>
                </div>
            </div>

            <!-- Replay Playback Bar -->
            <div class="playback-controls">
                <button class="btn btn-primary btn-sm" onclick="togglePlayback()">
                    <i data-lucide="${AppState.playback.isPlaying ? 'pause' : 'play'}" class="w-4 h-4"></i>
                    ${AppState.playback.isPlaying ? 'Pause' : 'Replay Route'}
                </button>
                <button class="btn btn-ghost btn-sm" onclick="resetPlayback()" title="Reset">
                    <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                </button>
                <input type="range" min="0" max="100" value="${Math.round(AppState.playback.progress * 100)}" 
                       class="timeline-slider" id="timeline-slider" oninput="seekPlayback(this.value)">
                <div class="flex items-center gap-1">
                    <button class="speed-btn ${AppState.playback.speed === 1 ? 'active' : ''}" onclick="setPlaybackSpeed(1)">1x</button>
                    <button class="speed-btn ${AppState.playback.speed === 2 ? 'active' : ''}" onclick="setPlaybackSpeed(2)">2x</button>
                    <button class="speed-btn ${AppState.playback.speed === 5 ? 'active' : ''}" onclick="setPlaybackSpeed(5)">5x</button>
                </div>
            </div>
        </div>

        <!-- Right Side: Checkpoint Audit Trail & Inspector (Col 3) -->
        <div class="flex flex-col gap-4">
            <div class="audit-list">
                <div class="audit-list-header">
                    <h3>Sequential Camera Logs</h3>
                    <span class="counter">${journey.checkpoints.length} SENSORS</span>
                </div>
                <div style="max-height: 480px; overflow-y: auto;">
                    ${journey.checkpoints.map((cp, idx) => {
                        const isHighest = cp.recordedSpeed === journey.highestSpeed;
                        const isOver = cp.recordedSpeed > cp.speedLimit;
                        const isSelected = AppState.selectedCheckpointId === cp.id;
                        return `
                        <div class="audit-item ${isSelected ? 'selected' : ''} ${isHighest ? 'highest' : ''}"
                             onclick="selectCheckpoint('${cp.id}')">
                            <div class="audit-item-left">
                                <div class="audit-idx ${isHighest ? 'red' : isOver ? 'amber' : 'navy'}">
                                    ${idx + 1}
                                </div>
                                <div>
                                    <div class="font-bold text-slate-900">${cp.name}</div>
                                    <div class="text-xs text-slate-500">${cp.timestamp} • ${cp.lane}</div>
                                </div>
                            </div>
                            <div class="audit-item-right">
                                <div class="speed-tag ${isHighest ? 'red' : isOver ? 'amber' : 'normal'}">
                                    <div>${cp.recordedSpeed} km/h</div>
                                    <div class="text-xs" style="font-size: 9px;">Limit: ${cp.speedLimit}</div>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Optical Snapshot Details of Selected Checkpoint -->
            ${renderSelectedCheckpointCard(journey)}
        </div>
    </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function renderSelectedCheckpointCard(journey) {
    const cp = journey.checkpoints.find(c => c.id === AppState.selectedCheckpointId) || journey.checkpoints[0];
    if (!cp) return '';

    const isOver = cp.recordedSpeed > cp.speedLimit;
    const isHighest = cp.recordedSpeed === journey.highestSpeed;

    return `
    <div class="card p-4">
        <div class="flex items-center justify-between mb-3">
            <div class="font-bold text-xs font-mono text-slate-600">SELECTED SENSOR OPTICAL TELEMETRY</div>
            <span class="badge ${isHighest ? 'badge-red' : isOver ? 'badge-amber' : 'badge-emerald'} font-mono">
                ${cp.id}
            </span>
        </div>

        <!-- Simulated Camera Viewport -->
        <div class="camera-view mb-3">
            <div class="grid-overlay"></div>
            <div class="osd-tag" style="top: 8px; left: 8px; background: rgba(0,0,0,0.7); color: #38bdf8;">
                ${cp.id} // ${cp.direction}
            </div>
            <div class="osd-tag" style="top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: #4ade80;">
                OCR: ${cp.ocrConfidence}% CONFIDENT
            </div>
            <div class="text-center p-4 z-10">
                <i data-lucide="camera" class="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80"></i>
                <div class="font-mono text-xs text-white font-bold">${AppState.selectedPlate}</div>
                <div class="font-mono text-xs text-cyan-300">${cp.lane}</div>
            </div>
            <div class="osd-tag" style="bottom: 8px; left: 8px; background: rgba(0,0,0,0.7); color: #f59e0b;">
                RADAR: ${cp.recordedSpeed} KM/H (LIMIT ${cp.speedLimit})
            </div>
            <div class="osd-tag" style="bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white;">
                ${cp.timestamp}
            </div>
        </div>

        <div class="flex flex-col gap-1.5 text-xs font-mono">
            <div class="data-row">
                <span class="data-label">SECTOR:</span>
                <span class="data-value">${cp.sector}</span>
            </div>
            <div class="data-row">
                <span class="data-label">RECORDED SPEED:</span>
                <span class="data-value ${isOver ? 'text-red-600 font-bold' : ''}">${cp.recordedSpeed} km/h (Limit: ${cp.speedLimit})</span>
            </div>
            <div class="data-row">
                <span class="data-label">SPEED COMPLIANCE:</span>
                <span class="data-value ${isOver ? 'text-red-600' : 'text-emerald-600'}">
                    ${isOver ? `VIOLATION (+${cp.recordedSpeed - cp.speedLimit} km/h)` : 'COMPLIANT'}
                </span>
            </div>
        </div>
    </div>
    `;
}

// Leaflet Map Initialization & Updates (Fixed Hover Fluctuation, Zero Jitter)
function initOrUpdateMap() {
    const mapDiv = document.getElementById('journey-map');
    if (!mapDiv) return;

    const journey = getSelectedJourney();
    if (!journey || !journey.checkpoints || journey.checkpoints.length === 0) return;

    const latLngs = journey.checkpoints.map(cp => [cp.lat, cp.lng]);
    const center = latLngs[0];

    // If map already exists, just remove and recreate or update
    if (AppState.mapInstance) {
        AppState.mapInstance.remove();
        AppState.mapInstance = null;
    }

    // Initialize Leaflet Map with smooth cartographic theme
    AppState.mapInstance = L.map('journey-map', {
        zoomControl: true,
        attributionControl: false
    }).setView(center, 12);

    // Sleek CartoDB Positron Cartography
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
    }).addTo(AppState.mapInstance);

    // Draw Route Polyline
    AppState.mapPolyline = L.polyline(latLngs, {
        color: '#0b3c61',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
    }).addTo(AppState.mapInstance);

    // Clear marker storage
    AppState.mapMarkers = [];

    // Add Fixed-Anchor Checkpoint Markers (Zero Fluctuation)
    journey.checkpoints.forEach((cp, idx) => {
        const isHighest = cp.recordedSpeed === journey.highestSpeed;
        const isOver = cp.recordedSpeed > cp.speedLimit;
        const colorClass = isHighest ? 'red' : isOver ? 'amber' : 'navy';

        const customIcon = L.divIcon({
            className: 'custom-leaflet-marker-wrapper',
            html: `<div class="checkpoint-marker ${colorClass}">${idx + 1}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14] // Exactly centered: anchors never move or fluctuate!
        });

        const marker = L.marker([cp.lat, cp.lng], { icon: customIcon }).addTo(AppState.mapInstance);

        // Tooltip with pointer-events: none (prevents hover flicker loop)
        marker.bindTooltip(`
            <strong>${idx + 1}. ${cp.name}</strong><br>
            Speed: ${cp.recordedSpeed} km/h (Limit: ${cp.speedLimit})<br>
            Time: ${cp.timestamp}
        `, {
            direction: 'top',
            offset: [0, -14],
            className: `checkpoint-tooltip ${colorClass}-tt`,
            permanent: false,
            sticky: false
        });

        marker.on('click', () => {
            selectCheckpoint(cp.id);
        });

        AppState.mapMarkers.push({ id: cp.id, marker });
    });

    // Replay vehicle moving icon
    const vehicleIcon = L.divIcon({
        className: 'vehicle-replay-icon',
        html: `<div style="width: 18px; height: 18px; border-radius: 50%; background: #f59e0b; border: 3px solid white; box-shadow: 0 0 10px rgba(245,158,11,0.8); animation: pulse-anim 1.5s infinite;"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });
    AppState.vehicleMarker = L.marker(latLngs[0], { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(AppState.mapInstance);

    // Fit bounds smoothly
    AppState.mapInstance.fitBounds(AppState.mapPolyline.getBounds(), { padding: [50, 50] });
}

function selectCheckpoint(cpId) {
    AppState.selectedCheckpointId = cpId;
    renderJourneyPage();
    if (AppState.mapInstance) {
        const journey = getSelectedJourney();
        const cp = journey.checkpoints.find(c => c.id === cpId);
        if (cp) {
            AppState.mapInstance.panTo([cp.lat, cp.lng], { animate: true, duration: 0.5 });
        }
    }
}

function selectVehicle(plate) {
    AppState.selectedPlate = plate;
    AppState.selectedJourneyIndex = 0;
    AppState.selectedCheckpointId = null;
    resetPlayback();
    renderJourneyPage();
    setTimeout(initOrUpdateMap, 100);
}

function selectJourneyIndex(idx) {
    AppState.selectedJourneyIndex = idx;
    AppState.selectedCheckpointId = null;
    resetPlayback();
    renderJourneyPage();
    setTimeout(initOrUpdateMap, 100);
}

function searchPlate(query) {
    if (!query) return;
    const q = query.trim().toUpperCase();
    const found = MOCK_VEHICLES.find(v => v.plateNumber.toUpperCase().includes(q));
    if (found) {
        selectVehicle(found.plateNumber);
    } else {
        alert(`Vehicle with Plate "${q}" not found in local active registry. Please test with MH-12-DE-4491, DL-01-AB-9821, or TS-09-EQ-7744.`);
    }
}

// Playback Logic
function togglePlayback() {
    if (AppState.playback.isPlaying) {
        pausePlayback();
    } else {
        startPlayback();
    }
}

function startPlayback() {
    AppState.playback.isPlaying = true;
    const journey = getSelectedJourney();
    if (AppState.playback.progress >= 1.0) {
        AppState.playback.progress = 0;
    }

    if (AppState.playback.intervalId) clearInterval(AppState.playback.intervalId);

    const stepMs = 50;
    AppState.playback.intervalId = setInterval(() => {
        const delta = (stepMs / 12000) * AppState.playback.speed;
        AppState.playback.progress += delta;

        if (AppState.playback.progress >= 1.0) {
            AppState.playback.progress = 1.0;
            pausePlayback();
        }

        updateVehiclePlaybackPosition();
        const slider = document.getElementById('timeline-slider');
        if (slider) slider.value = Math.round(AppState.playback.progress * 100);
    }, stepMs);

    renderJourneyPage();
}

function pausePlayback() {
    AppState.playback.isPlaying = false;
    if (AppState.playback.intervalId) {
        clearInterval(AppState.playback.intervalId);
        AppState.playback.intervalId = null;
    }
    renderJourneyPage();
}

function resetPlayback() {
    pausePlayback();
    AppState.playback.progress = 0;
    const slider = document.getElementById('timeline-slider');
    if (slider) slider.value = 0;
    updateVehiclePlaybackPosition();
}

function seekPlayback(val) {
    AppState.playback.progress = val / 100;
    updateVehiclePlaybackPosition();
}

function setPlaybackSpeed(s) {
    AppState.playback.speed = s;
    if (AppState.playback.isPlaying) {
        startPlayback();
    } else {
        renderJourneyPage();
    }
}

function updateVehiclePlaybackPosition() {
    if (!AppState.vehicleMarker) return;
    const journey = getSelectedJourney();
    const cps = journey.checkpoints;
    if (!cps || cps.length === 0) return;

    if (cps.length === 1) {
        AppState.vehicleMarker.setLatLng([cps[0].lat, cps[0].lng]);
        return;
    }

    const totalSegments = cps.length - 1;
    const pos = AppState.playback.progress * totalSegments;
    const segIdx = Math.min(Math.floor(pos), totalSegments - 1);
    const frac = pos - segIdx;

    const p1 = cps[segIdx];
    const p2 = cps[segIdx + 1];

    const curLat = p1.lat + (p2.lat - p1.lat) * frac;
    const curLng = p1.lng + (p2.lng - p1.lng) * frac;

    AppState.vehicleMarker.setLatLng([curLat, curLng]);
}

// ============================================================================
// TAB 2: VEHICLE IDENTIFIER PAGE
// ============================================================================
function renderIdentifierPage() {
    const container = document.getElementById('page-identifier');
    const vehicle = getSelectedVehicle();
    const isBlacklisted = vehicle.isBlacklisted;

    let html = `
    <!-- Top Vehicle Select Bar -->
    <div class="card p-4 mb-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-2 overflow-x-auto pb-1">
                <span class="text-xs font-mono font-bold text-slate-500 uppercase shrink-0">SELECT DOSSIER:</span>
                ${MOCK_VEHICLES.map(v => `
                    <button class="plate-pill ${v.plateNumber === AppState.selectedPlate ? 'active' : ''} ${v.isBlacklisted ? 'blacklisted' : ''}"
                            onclick="selectVehicleForId('${v.plateNumber}')">
                        ${v.plateNumber} ${v.isBlacklisted ? '⚠' : ''}
                    </button>
                `).join('')}
            </div>
            <div class="flex items-center gap-2">
                <button class="btn btn-outline btn-sm" onclick="printDossier()">
                    <i data-lucide="printer" class="w-3.5 h-3.5"></i> Print Record
                </button>
                <button class="btn btn-primary btn-sm" onclick="downloadVahanDossier()">
                    <i data-lucide="download" class="w-3.5 h-3.5"></i> Export Official RC Dossier (PDF)
                </button>
            </div>
        </div>
    </div>

    <!-- Blacklist or Clear Banner -->
    ${isBlacklisted ? `
        <div class="blacklist-banner mb-6">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
                        <i data-lucide="shield-alert" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h3 class="font-bold text-red-900 text-base font-mono">NATIONAL JUDICIAL RESTRAINT & SEIZURE WARRANT</h3>
                            <span class="badge badge-red font-mono text-xs">STATUS: IMPOUND WARRANT ACTIVE</span>
                        </div>
                        <p class="text-xs text-red-700 mt-1"><strong>Reason:</strong> ${vehicle.blacklistReason}</p>
                        <div class="text-xs text-red-600 font-mono mt-1">
                            Flagged By: <strong>${vehicle.flaggedByAgency}</strong> • Flag Date: <strong>${vehicle.flagDate}</strong> • Severity: <strong>${vehicle.blacklistSeverity}</strong>
                        </div>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm shrink-0" onclick="alert('Intercept alert dispatched to all Highway Patrol interceptors within 15km sector.')">
                    <i data-lucide="siren" class="w-4 h-4"></i> Dispatch Interceptor Alert
                </button>
            </div>
        </div>
    ` : `
        <div class="clear-banner mb-6">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                    <i data-lucide="check" class="w-5 h-5"></i>
                </div>
                <div>
                    <h3 class="font-bold text-emerald-900 text-sm font-mono">CITIZEN RECORD CLEARED // वाहन विवरण सत्यापन सफल</h3>
                    <p class="text-xs text-emerald-700">No active judicial warrants, impound flags, or unpaid high-speed transit infractions found on this registration.</p>
                </div>
            </div>
            <span class="badge badge-emerald font-mono">ALL ENFORCEMENT CLEARED</span>
        </div>
    `}

    <!-- 2 Column Master Details: Owner & Vehicle Specs -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Citizen / Owner Identity Card -->
        <div class="card overflow-hidden">
            <div class="navy-header">
                <h3><i data-lucide="user-check" class="w-4 h-4 text-cyan-400"></i> Registered Owner Identity // स्वामी विवरण</h3>
                <span class="badge">VAHAN VERIFIED</span>
            </div>
            <div class="p-4 flex flex-col gap-2.5">
                <div class="data-row">
                    <span class="data-label">FULL LEGAL NAME:</span>
                    <span class="data-value text-slate-900">${vehicle.owner.name}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">NATIONAL ID (AADHAAR/NAT):</span>
                    <span class="data-value font-mono">${vehicle.owner.nationalId}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">DRIVING LICENSE NO:</span>
                    <span class="data-value font-mono">${vehicle.owner.licenseNumber} (Valid: ${vehicle.owner.licenseValidity})</span>
                </div>
                <div class="data-row">
                    <span class="data-label">PENALTY POINTS:</span>
                    <span class="data-value ${vehicle.owner.penaltyPoints > 5 ? 'text-red-600 font-bold' : ''}">
                        ${vehicle.owner.penaltyPoints} / 12 Points
                    </span>
                </div>
                <div class="data-row">
                    <span class="data-label">PHONE NUMBER:</span>
                    <span class="data-value font-mono">${vehicle.owner.phone}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">EMAIL ADDRESS:</span>
                    <span class="data-value font-mono">${vehicle.owner.email}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">REGISTERED RESIDENCE:</span>
                    <span class="data-value text-right" style="max-width: 60%;">${vehicle.owner.address}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">EMERGENCY CONTACT:</span>
                    <span class="data-value text-right font-mono">${vehicle.owner.emergencyContact}</span>
                </div>
            </div>
        </div>

        <!-- Vehicle Specifications Card -->
        <div class="card overflow-hidden">
            <div class="navy-header">
                <h3><i data-lucide="file-check" class="w-4 h-4 text-amber-400"></i> Technical & Registration Specs // वाहन विवरण</h3>
                <span class="badge">RTO CERTIFIED</span>
            </div>
            <div class="p-4 flex flex-col gap-2.5">
                <div class="data-row">
                    <span class="data-label">REGISTRATION PLATE:</span>
                    <span class="data-value font-bold text-slate-900 font-mono">${vehicle.plateNumber}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">MAKE & MODEL:</span>
                    <span class="data-value">${vehicle.make} ${vehicle.model} (${vehicle.year})</span>
                </div>
                <div class="data-row">
                    <span class="data-label">BODY TYPE & COLOR:</span>
                    <span class="data-value">${vehicle.vehicleType} • ${vehicle.color}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">CHASSIS NUMBER (VIN):</span>
                    <span class="data-value font-mono">${vehicle.vin}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">ENGINE / MOTOR SERIAL:</span>
                    <span class="data-value font-mono">${vehicle.engineNumber}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">FUEL / PROPULSION:</span>
                    <span class="data-value">${vehicle.fuelType}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">REGISTRATION DATE:</span>
                    <span class="data-value font-mono">${vehicle.registrationDate}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">FITNESS CERTIFICATE EXPIRY:</span>
                    <span class="data-value font-mono">${vehicle.fitnessExpiry}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">INSURANCE STATUS:</span>
                    <span class="data-value text-emerald-700 font-bold">${vehicle.insuranceStatus} (${vehicle.insuranceProvider})</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Journey History Log Table -->
    <div class="card overflow-hidden mb-6">
        <div class="audit-list-header">
            <h3>Logged Trajectory History (ANPR Multi-Camera Reconstructions)</h3>
            <span class="counter">${1 + vehicle.previousJourneys.length} ARCHIVED TRIPS</span>
        </div>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.75rem;">
                <thead>
                    <tr style="background: var(--slate-100); border-bottom: 2px solid var(--slate-300); text-align: left; color: var(--slate-700);">
                        <th style="padding: 10px 14px;">JOURNEY ID</th>
                        <th style="padding: 10px 14px;">DATE</th>
                        <th style="padding: 10px 14px;">ROUTE START ➔ DESTINATION</th>
                        <th style="padding: 10px 14px;">DISTANCE</th>
                        <th style="padding: 10px 14px;">PEAK SPEED</th>
                        <th style="padding: 10px 14px;">STATUS</th>
                        <th style="padding: 10px 14px; text-align: right;">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Current Journey -->
                    <tr style="border-bottom: 1px solid var(--slate-200); background: rgba(254,243,199,0.3);">
                        <td style="padding: 10px 14px; font-weight: bold; color: var(--navy-700);">${vehicle.currentJourney.id}</td>
                        <td style="padding: 10px 14px;">${vehicle.currentJourney.date}</td>
                        <td style="padding: 10px 14px;">${vehicle.currentJourney.startLocation} ➔ ${vehicle.currentJourney.destination}</td>
                        <td style="padding: 10px 14px;">${vehicle.currentJourney.totalDistanceKm} km</td>
                        <td style="padding: 10px 14px; font-weight: bold; color: ${vehicle.currentJourney.highestSpeed > 100 ? 'var(--red-600)' : 'var(--slate-800)'};">
                            ${vehicle.currentJourney.highestSpeed} km/h
                        </td>
                        <td style="padding: 10px 14px;">
                            <span class="badge ${vehicle.currentJourney.status === 'flagged' ? 'badge-red' : 'badge-emerald'}">
                                ${vehicle.currentJourney.status.toUpperCase()}
                            </span>
                        </td>
                        <td style="padding: 10px 14px; text-align: right;">
                            <button class="btn btn-primary btn-xs" onclick="viewJourneyOnMap(0)">
                                View On Map ➔
                            </button>
                        </td>
                    </tr>
                    <!-- Previous Journeys -->
                    ${vehicle.previousJourneys.map((pj, idx) => `
                        <tr style="border-bottom: 1px solid var(--slate-200);">
                            <td style="padding: 10px 14px; font-weight: bold; color: var(--navy-700);">${pj.id}</td>
                            <td style="padding: 10px 14px;">${pj.date}</td>
                            <td style="padding: 10px 14px;">${pj.startLocation} ➔ ${pj.destination}</td>
                            <td style="padding: 10px 14px;">${pj.totalDistanceKm} km</td>
                            <td style="padding: 10px 14px; font-weight: bold; color: ${pj.highestSpeed > 100 ? 'var(--red-600)' : 'var(--slate-800)'};">
                                ${pj.highestSpeed} km/h
                            </td>
                            <td style="padding: 10px 14px;">
                                <span class="badge ${pj.status === 'flagged' ? 'badge-red' : 'badge-emerald'}">
                                    ${pj.status.toUpperCase()}
                                </span>
                            </td>
                            <td style="padding: 10px 14px; text-align: right;">
                                <button class="btn btn-ghost btn-xs" onclick="viewJourneyOnMap(${idx + 1})">
                                    View On Map ➔
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function selectVehicleForId(plate) {
    AppState.selectedPlate = plate;
    renderIdentifierPage();
}

function viewJourneyOnMap(journeyIdx) {
    AppState.selectedJourneyIndex = journeyIdx;
    AppState.selectedCheckpointId = null;
    switchTab('journey');
}

function printDossier() {
    window.print();
}

function downloadVahanDossier() {
    const v = getSelectedVehicle();
    openModal(`
        <div class="navy-header">
            <h3><i data-lucide="file-check" class="w-4 h-4"></i> National Transport Authority Dossier</h3>
            <button class="btn-xs btn-ghost" onclick="closeModal()">✕</button>
        </div>
        <div class="p-6">
            <div class="text-center mb-4">
                <div class="font-bold text-sm text-navy-700 font-mono">GOVERNMENT OF INDIA • MINISTRY OF ROAD TRANSPORT</div>
                <div class="text-xs text-slate-500 font-mono">VAHAN 4.0 INTEGRATED ELECTRONIC CERTIFICATE OF REGISTRATION</div>
            </div>
            <div class="border border-slate-300 rounded-lg p-4 bg-slate-50 font-mono text-xs mb-4">
                <div class="grid grid-cols-2 gap-2">
                    <div><strong>REGISTRATION:</strong> ${v.plateNumber}</div>
                    <div><strong>CHASSIS:</strong> ${v.vin}</div>
                    <div><strong>OWNER:</strong> ${v.owner.name}</div>
                    <div><strong>CONTACT:</strong> ${v.owner.phone}</div>
                    <div><strong>STATUS:</strong> ${v.isBlacklisted ? 'BLACKLISTED (WARRANT)' : 'CLEARED'}</div>
                    <div><strong>FITNESS VALID:</strong> ${v.fitnessExpiry}</div>
                </div>
            </div>
            <div class="text-xs text-slate-600 mb-6">
                This document is a certified digital extract generated from the Unified National ANPR & Trajectory Highway Enforcement Database with cryptographic SHA-256 seal.
            </div>
            <div class="flex justify-end gap-2">
                <button class="btn btn-ghost btn-sm" onclick="closeModal()">Close</button>
                <button class="btn btn-primary btn-sm" onclick="alert('Digital Dossier PDF generated and downloaded to your system.'); closeModal();">
                    Download Signed PDF
                </button>
            </div>
        </div>
    `);
}

// ============================================================================
// TAB 3: TRAFFIC REVIEWER PAGE
// ============================================================================
function renderReviewerPage() {
    const container = document.getElementById('page-reviewer');
    const selectedSector = CITY_SECTORS.find(s => s.id === AppState.selectedSectorId) || CITY_SECTORS[0];

    let html = `
    <!-- City Header Bar -->
    <div class="card p-4 mb-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <span class="text-xs font-mono font-bold text-slate-500 uppercase">ACTIVE COMMAND REGION:</span>
                <h2 class="text-lg font-bold text-navy-700">${AppState.selectedCity} Metropolitan Surveillance Grid</h2>
            </div>
            <div class="flex items-center gap-2">
                <select class="input-field" style="width: auto; padding-left: 12px;" onchange="AppState.selectedCity = this.value; renderReviewerPage();">
                    ${CITIES.map(c => `
                        <option value="${c.name}" ${c.name === AppState.selectedCity ? 'selected' : ''}>
                            ${c.name} (${c.cameras} Cameras)
                        </option>
                    `).join('')}
                </select>
                <button class="btn btn-primary btn-sm shrink-0" onclick="alert('Refreshing real-time sensor ingestion telemetry...')">
                    <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Refresh Grid
                </button>
            </div>
        </div>
    </div>

    <!-- 6 Sectors Congestion Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        ${CITY_SECTORS.map(sec => {
            const isSelected = sec.id === AppState.selectedSectorId;
            const isSevere = sec.congestionIndex >= 80;
            const isModerate = sec.congestionIndex >= 50 && sec.congestionIndex < 80;
            const statusColor = isSevere ? 'badge-red' : isModerate ? 'badge-amber' : 'badge-emerald';

            return `
            <div class="card p-4 cursor-pointer transition-all ${isSelected ? 'border-navy-700 shadow-md ring-2 ring-blue-900' : ''}"
                 onclick="selectSector('${sec.id}')">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-bold text-xs font-mono text-slate-500">${sec.code}</span>
                    <span class="badge ${statusColor} font-mono">${sec.congestionIndex}% CONGESTION</span>
                </div>
                <h4 class="font-bold text-slate-900 text-sm mb-2">${sec.name}</h4>
                <div class="progress-container mb-3">
                    <div class="progress-bar" style="width: ${sec.congestionIndex}%; background: ${isSevere ? 'var(--red-600)' : isModerate ? 'var(--amber-500)' : 'var(--emerald-600)'};"></div>
                </div>
                <div class="flex items-center justify-between text-xs font-mono text-slate-600">
                    <span>Flow: <strong>${sec.vehicleCountPerHour.toLocaleString()} v/h</strong></span>
                    <span>Avg: <strong>${sec.averageSpeed} km/h</strong></span>
                </div>
            </div>
            `;
        }).join('')}
    </div>

    <!-- Deep Dive into Selected Sector -->
    <div class="card overflow-hidden mb-6">
        <div class="navy-header">
            <h3><i data-lucide="activity" class="w-4 h-4 text-amber-400"></i> Sector Real-Time Deep Dive: ${selectedSector.name} (${selectedSector.code})</h3>
            <span class="badge">${selectedSector.status.toUpperCase()}</span>
        </div>
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Radar Visualizer -->
                <div class="radar-graphic">
                    <div class="radar-ring outer"></div>
                    <div class="radar-ring mid"></div>
                    <div class="radar-ring inner"></div>
                    <div class="radar-value">
                        <div class="value">${selectedSector.congestionIndex}%</div>
                        <div class="label">CONGESTION LEVEL</div>
                    </div>
                </div>

                <!-- Sector Metrics -->
                <div class="flex flex-col justify-between gap-2">
                    <div class="data-row">
                        <span class="data-label">VEHICLE FLOW:</span>
                        <span class="data-value">${selectedSector.vehicleCountPerHour.toLocaleString()} vehicles/hr</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">CORRIDOR AVERAGE SPEED:</span>
                        <span class="data-value text-red-600 font-bold">${selectedSector.averageSpeed} km/h (Limit: ${selectedSector.speedLimit})</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">ACTIVE SENSOR NODES:</span>
                        <span class="data-value font-bold text-slate-900">${selectedSector.activeSurveillanceCameras} ANPR Interceptors</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">REPORTED INCIDENTS:</span>
                        <span class="data-value ${selectedSector.incidentsReported > 0 ? 'text-red-600 font-bold' : ''}">
                            ${selectedSector.incidentsReported} Active Blockages
                        </span>
                    </div>
                </div>

                <!-- Primary Bottleneck -->
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-300 flex flex-col justify-between">
                    <div>
                        <span class="text-xs font-mono font-bold text-slate-500 uppercase block mb-1">PRIMARY CHOKEPOINT BOTTLENECK</span>
                        <p class="text-sm font-bold text-slate-900 mb-2">${selectedSector.primaryBottleneck}</p>
                        <p class="text-xs text-slate-600">Dynamic queue estimation indicates 420m queue spillback extending into adjoining arterials.</p>
                    </div>
                    <button class="btn btn-outline btn-sm mt-3" onclick="openSimModal('${selectedSector.id}')">
                        <i data-lucide="play" class="w-3.5 h-3.5"></i> Run AI Clearing Simulation
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- AI Autonomous Traffic Mitigation Actions -->
    <div class="card overflow-hidden">
        <div class="navy-header">
            <h3><i data-lucide="cpu" class="w-4 h-4 text-cyan-400"></i> AI Autonomous Traffic Mitigation Options // यातायात नियंत्रण विकल्प</h3>
            <span class="badge">6 PROTOCOLS ACTIVE</span>
        </div>
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${TRAFFIC_ACTION_OPTIONS.map(opt => `
                    <div class="action-card" onclick="deployOption('${opt.id}')">
                        <span class="coming-soon-tag">${opt.badge}</span>
                        <div>
                            <div class="w-10 h-10 rounded-lg bg-navy-700 text-amber-400 flex items-center justify-center mb-3">
                                <i data-lucide="${opt.iconName}" class="w-5 h-5"></i>
                            </div>
                            <h4 class="font-bold text-slate-900 text-sm mb-1">${opt.title}</h4>
                            <span class="text-xs font-mono text-blue-900 font-bold block mb-2">${opt.category}</span>
                            <p class="text-xs text-slate-600 mb-4">${opt.description}</p>
                        </div>
                        <div class="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                            <span class="text-emerald-700 font-bold">${opt.projectedImpact}</span>
                            <span class="text-slate-500">${opt.estimatedLatency}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function selectSector(secId) {
    AppState.selectedSectorId = secId;
    renderReviewerPage();
}

function deployOption(optId) {
    const opt = TRAFFIC_ACTION_OPTIONS.find(o => o.id === optId);
    if (!opt) return;

    openModal(`
        <div class="navy-header">
            <h3><i data-lucide="${opt.iconName}" class="w-4 h-4"></i> Deploy: ${opt.title}</h3>
            <button class="btn-xs btn-ghost" onclick="closeModal()">✕</button>
        </div>
        <div class="p-6">
            <div class="flex items-center gap-2 mb-2">
                <span class="badge badge-navy">${opt.category}</span>
                <span class="badge badge-emerald">${opt.projectedImpact}</span>
            </div>
            <p class="text-xs text-slate-600 mb-4">${opt.description}</p>
            <div class="p-3 bg-slate-50 rounded border border-slate-300 font-mono text-xs mb-4">
                <div>AI Latency: <strong>${opt.estimatedLatency}</strong></div>
                <div>Status: <strong>Ready for Command Deployment</strong></div>
                <div>Authority: <strong>Urban Mobility Grid Automated Dispatcher</strong></div>
            </div>
            <div class="flex justify-end gap-2">
                <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary btn-sm" onclick="alert('Autonomous protocol deployed successfully! Signal phases synchronized.'); closeModal();">
                    Authorize & Deploy
                </button>
            </div>
        </div>
    `);
}

function openSimModal(secId) {
    const sec = CITY_SECTORS.find(s => s.id === secId);
    openModal(`
        <div class="navy-header">
            <h3><i data-lucide="play-circle" class="w-4 h-4"></i> AI Congestion Clearing Simulation</h3>
            <button class="btn-xs btn-ghost" onclick="closeModal()">✕</button>
        </div>
        <div class="p-6">
            <h4 class="font-bold text-slate-900 text-sm mb-2">Simulating Corridor: ${sec.name}</h4>
            <p class="text-xs text-slate-600 mb-4">Running synthetic ANPR flow simulation with 14,200 vehicles over next 30 minutes under Adaptive Signal Timing + Dynamic Diversion.</p>
            <div class="progress-container mb-2">
                <div class="progress-bar" style="width: 78%;"></div>
            </div>
            <div class="text-xs font-mono text-emerald-700 font-bold mb-4">
                ★ Projected Delay Reduction: -34% in 18 minutes
            </div>
            <div class="flex justify-end">
                <button class="btn btn-primary btn-sm" onclick="closeModal()">Close Simulation</button>
            </div>
        </div>
    `);
}

// ============================================================================
// TAB 4: LIVE SURVEILLANCE PAGE
// ============================================================================
function renderLivePage() {
    const container = document.getElementById('page-live');
    const activeCam = CITY_CAMERAS.find(c => c.id === AppState.selectedLiveCamId) || CITY_CAMERAS[0];

    let html = `
    <!-- Top Bar with Camera Selector -->
    <div class="card p-4 mb-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <span class="text-xs font-mono font-bold text-slate-500 uppercase">HIGHWAY CCTV INTERCEPT NETWORK:</span>
                <h3 class="font-bold text-navy-700 text-base">Live Video Telemetry Feeds (12 Multi-Camera Corridors)</h3>
            </div>
            <div class="flex items-center gap-2">
                <select class="input-field" style="width: auto; padding-left: 12px;" onchange="AppState.selectedLiveCamId = this.value; renderLivePage();">
                    ${CITY_CAMERAS.map(c => `
                        <option value="${c.id}" ${c.id === AppState.selectedLiveCamId ? 'selected' : ''}>
                            ${c.name} (${c.id})
                        </option>
                    `).join('')}
                </select>
                <button class="btn btn-outline btn-sm" onclick="alert('Camera snapshot exported to local cache.')">
                    <i data-lucide="camera" class="w-3.5 h-3.5"></i> Capture Frame
                </button>
            </div>
        </div>
    </div>

    <!-- Live Grid: Main Viewport + Real-time Detection Feed -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Live Surveillance Camera View (Cols 1 & 2) -->
        <div class="lg:col-span-2 flex flex-col gap-3">
            <div class="live-video-box">
                <!-- Highway Road Lines Simulation -->
                <div class="live-road-lines">
                    <div class="road-inner">
                        <div class="road-dash"></div>
                        <div class="road-dash"></div>
                    </div>
                </div>

                <!-- Live Scanning Line Animation -->
                <div style="position: absolute; left: 0; right: 0; height: 2px; background: rgba(34,211,238,0.7); box-shadow: 0 0 10px #22d3ee; animation: scanline-anim 3s infinite linear;"></div>

                <!-- Bounding Box on Simulated Vehicle -->
                <div class="live-detection-box" style="width: 220px; height: 130px; left: 50%; top: 46%; transform: translate(-50%, -50%);">
                    <div style="position: absolute; top: -18px; left: 0; background: var(--cyan-400); color: #0f172a; font-family: var(--font-mono); font-size: 10px; font-weight: bold; padding: 1px 4px; border-radius: 2px;">
                        TRACK_ID: #VEH-8819 [0.99 CONF]
                    </div>
                    <div style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); background: #ffffff; color: #000000; font-family: var(--font-mono); font-size: 12px; font-weight: 900; padding: 2px 8px; border-radius: 3px; border: 1.5px solid #000; letter-spacing: 1px;">
                        MH-12-DE-4491
                    </div>
                </div>

                <!-- On-Screen Telemetry OSD -->
                <div class="live-osd" style="top: 12px; left: 12px; background: rgba(0,0,0,0.8); color: #38bdf8;">
                    ● LIVE INTERCEPT FEED // ${activeCam.id}
                </div>
                <div class="live-osd" style="top: 12px; right: 12px; background: rgba(0,0,0,0.8); color: #ef4444;">
                    RADAR: 158 KM/H (LIMIT ${activeCam.limit}) ★ OVERSPEED
                </div>
                <div class="live-osd" style="bottom: 12px; left: 12px; background: rgba(0,0,0,0.8); color: white;">
                    SECTOR: ${activeCam.sector} | 60.00 FPS • AI-VISION ON
                </div>
                <div class="live-osd" style="bottom: 12px; right: 12px; background: rgba(0,0,0,0.8); color: #4ade80;">
                    ${new Date().toLocaleTimeString()} IST
                </div>
            </div>

            <!-- Camera Controls & Stats -->
            <div class="card p-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>RESOLUTION: <strong>4K UHD (3840x2160)</strong></span>
                </div>
                <div>OPTICAL OCR LATENCY: <strong>14.2ms</strong></div>
                <div>RADAR DOPPLER FREQ: <strong>24.150 GHz</strong></div>
            </div>
        </div>

        <!-- Right Side: Live Stream Event Log (Col 3) -->
        <div class="flex flex-col gap-3">
            <div class="audit-list">
                <div class="audit-list-header">
                    <h3>Recent ANPR Intercepts</h3>
                    <span class="counter">REAL-TIME STREAM</span>
                </div>
                <div style="max-height: 480px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding: 12px;">
                    ${LIVE_ANPR_STREAM.map(det => `
                        <div class="anpr-stream-item ${det.isBlacklisted ? 'blacklisted' : det.isOverspeed ? 'overspeed' : 'normal'}">
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-slate-900">${det.plateNumber}</span>
                                <span class="badge ${det.isBlacklisted ? 'badge-red' : det.isOverspeed ? 'badge-amber' : 'badge-emerald'} text-xs">
                                    ${det.isBlacklisted ? 'BLACKLISTED' : det.isOverspeed ? 'OVERSPEED' : 'NORMAL'}
                                </span>
                            </div>
                            <div class="text-xs text-slate-600">
                                ${det.vehicleModel} • ${det.vehicleColor}
                            </div>
                            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                                <span>${det.cameraName}</span>
                                <span class="font-bold ${det.isOverspeed ? 'text-red-600' : 'text-slate-800'}">${det.speed} km/h</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

// ============================================================================
// TAB 5: VIDEO ANALYZER PAGE (NEW FEATURE)
// Upload pre-recorded video -> Detect plate & Check Blocklist -> Measure Speed
// ============================================================================
const TEST_SCENARIOS = [
    {
        name: 'Scenario 1: Highway Overspeeding & Wanted Vehicle',
        plate: 'MH-12-DE-4491',
        make: 'Porsche Taycan 4S',
        speed: 118,
        speedLimit: 70,
        ocrConfidence: 99.4,
        description: 'High-speed reckless transit on Grand River Expressway. Active police warrant for unpaid toll evasion.'
    },
    {
        name: 'Scenario 2: Urban Arterial Regular Commute (Compliant)',
        plate: 'KA-05-MM-3319',
        make: 'Volvo XC90 AWD',
        speed: 54,
        speedLimit: 60,
        ocrConfidence: 99.8,
        description: 'Standard morning commuter traffic through Cyber Avenue flyover. Verified clean registration.'
    },
    {
        name: 'Scenario 3: Severe Expressway Speed Violation & Blocklisted',
        plate: 'DL-01-AB-9821',
        make: 'BMW M3 Competition',
        speed: 142,
        speedLimit: 80,
        ocrConfidence: 99.6,
        description: 'Critical speeding infraction (+62 km/h over limit). Vehicle involved in hit-and-run FIR #992/2026.'
    }
];

function renderAnalyzerPage() {
    const container = document.getElementById('page-analyzer');
    const va = AppState.videoAnalyzer;
    const currentScenario = TEST_SCENARIOS[va.currentScenarioIndex];
    const activePlate = va.detectedPlate || currentScenario.plate;
    const activeSpeed = va.detectedSpeed || currentScenario.speed;
    const isOver = activeSpeed > va.speedLimit;
    const isBlocked = AppState.blocklist.includes(activePlate);

    let html = `
    <!-- Top Overview Header -->
    <div class="card p-4 mb-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="badge badge-navy font-mono">STANDALONE AI MODULE</span>
                    <span class="badge badge-emerald font-mono">OPTICAL RADAR & OCR READY</span>
                </div>
                <h2 class="text-xl font-bold text-navy-700">Video Upload ANPR & Speed Verification Engine</h2>
                <p class="text-xs text-slate-600">Upload any pre-recorded traffic video or choose a benchmark test scenario to evaluate vehicle speed compliance and blocklist status in real-time.</p>
            </div>
            <div class="flex items-center gap-2">
                <button class="btn btn-outline btn-sm" onclick="showBlocklistModal()">
                    <i data-lucide="shield" class="w-3.5 h-3.5"></i> Manage Blocklist (${AppState.blocklist.length} Plates)
                </button>
            </div>
        </div>
    </div>

    <!-- 2-Column Layout: Video Player / Upload & Live Detection Telemetry -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <!-- Left Section (Cols 1-7): Upload & Video Canvas Player -->
        <div class="lg:col-span-7 flex flex-col gap-4">
            <!-- Scenario Selector Chips -->
            <div class="card p-3 bg-slate-50">
                <span class="text-xs font-mono font-bold text-slate-500 uppercase block mb-2">QUICK TEST WITH PRE-LOADED VIDEO SCENARIOS:</span>
                <div class="flex flex-wrap gap-2">
                    ${TEST_SCENARIOS.map((sc, idx) => `
                        <button class="btn btn-sm ${va.currentScenarioIndex === idx && !va.customVideoUrl ? 'btn-primary' : 'btn-ghost'}"
                                onclick="selectScenario(${idx})">
                            ${sc.name.split(':')[0]} (${sc.plate})
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Upload Drop Zone / Video Box -->
            <div class="card p-4 overflow-hidden">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-bold text-sm text-navy-700 flex items-center gap-2">
                        <i data-lucide="video" class="w-4 h-4 text-cyan-500"></i> Video Telemetry Canvas
                    </h3>
                    <label class="btn btn-primary btn-xs cursor-pointer">
                        <i data-lucide="upload" class="w-3.5 h-3.5"></i> Upload Your Own Video
                        <input type="file" id="video-file-input" accept="video/mp4,video/webm,video/mov" 
                               style="display: none;" onchange="handleVideoUpload(event)">
                    </label>
                </div>

                <!-- Interactive Video Canvas -->
                <div class="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-700" style="aspect-ratio: 16/9;">
                    <canvas id="analyzer-canvas" style="width: 100%; height: 100%; display: block;"></canvas>

                    <!-- Real-time HUD Overlays -->
                    <div style="position: absolute; top: 12px; left: 12px; font-family: var(--font-mono); font-size: 11px; background: rgba(15,23,42,0.85); color: #38bdf8; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.4);">
                        ● REC // AI-ANPR-RADAR V4.2
                    </div>

                    <div style="position: absolute; top: 12px; right: 12px; font-family: var(--font-mono); font-size: 11px; background: ${isOver ? 'rgba(220,38,38,0.9)' : 'rgba(5,150,105,0.9)'}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold;">
                        SPEED: ${activeSpeed} KM/H ${isOver ? '★ VIOLATION' : '✓ OK'}
                    </div>

                    <div style="position: absolute; bottom: 12px; left: 12px; font-family: var(--font-mono); font-size: 11px; background: rgba(15,23,42,0.85); color: #facc15; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(250,204,21,0.4);">
                        PLATE: <strong>${activePlate}</strong> (OCR: ${va.ocrConfidence}%)
                    </div>

                    <div style="position: absolute; bottom: 12px; right: 12px; font-family: var(--font-mono); font-size: 11px; background: ${isBlocked ? 'rgba(220,38,38,0.9)' : 'rgba(5,150,105,0.9)'}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold;">
                        ${isBlocked ? '⚠ BLOCKLIST MATCH' : 'CLEARED REGISTRY'}
                    </div>
                </div>

                <!-- Video Controls & Speed Slider -->
                <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-2">
                        <button class="btn btn-primary btn-sm" onclick="toggleAnalyzerPlayback()">
                            <i data-lucide="${va.isPlaying ? 'pause' : 'play'}" class="w-4 h-4"></i>
                            ${va.isPlaying ? 'Pause Analysis' : 'Run Video Analysis'}
                        </button>
                        <button class="btn btn-ghost btn-sm" onclick="resetAnalyzerPlayback()">
                            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>

                    <!-- Configurable Speed Limit Slider -->
                    <div class="flex items-center gap-3 w-full sm:w-auto">
                        <span class="text-xs font-mono font-bold text-slate-700 whitespace-nowrap">CORRIDOR LIMIT:</span>
                        <input type="range" min="30" max="120" step="5" value="${va.speedLimit}" 
                               class="timeline-slider" oninput="changeAnalyzerSpeedLimit(this.value)" style="width: 140px;">
                        <span class="badge badge-navy font-mono text-xs">${va.speedLimit} km/h</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Section (Cols 8-12): Real-Time Diagnostic Results -->
        <div class="lg:col-span-5 flex flex-col gap-4">
            <!-- Speed Compliance Result Card -->
            <div class="card overflow-hidden">
                <div class="navy-header">
                    <h3><i data-lucide="gauge" class="w-4 h-4 text-amber-400"></i> Speed Analysis Verdict</h3>
                    <span class="badge ${isOver ? 'badge-red' : 'badge-emerald'}">
                        ${isOver ? 'OVERSPEED' : 'COMPLIANT'}
                    </span>
                </div>
                <div class="p-4">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <span class="text-xs font-mono text-slate-500 block">MEASURED SPEED</span>
                            <span class="text-3xl font-extrabold font-mono ${isOver ? 'text-red-600' : 'text-emerald-600'}">
                                ${activeSpeed} <span class="text-sm font-normal text-slate-600">km/h</span>
                            </span>
                        </div>
                        <div class="text-right">
                            <span class="text-xs font-mono text-slate-500 block">AUTHORIZED LIMIT</span>
                            <span class="text-2xl font-bold font-mono text-slate-800">
                                ${va.speedLimit} <span class="text-sm font-normal text-slate-500">km/h</span>
                            </span>
                        </div>
                    </div>

                    ${isOver ? `
                        <div class="p-3 bg-red-50 border border-red-300 rounded-lg text-xs font-mono text-red-800 mb-3">
                            <div class="font-bold mb-1">⚠ EXCESS SPEED DETECTED: +${activeSpeed - va.speedLimit} KM/H</div>
                            <div>Vehicle exceeds the designated speed threshold. Immediate automated citation candidate under Section 183 of the Motor Vehicles Act.</div>
                        </div>
                    ` : `
                        <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-mono text-emerald-800 mb-3">
                            <div class="font-bold mb-1">✓ SPEED COMPLIANT</div>
                            <div>Vehicle is moving at the authorized speed within safe tolerance bounds. No speed violation logged.</div>
                        </div>
                    `}

                    <div class="data-row mb-1">
                        <span class="data-label">RADAR CERTAINTY:</span>
                        <span class="data-value font-mono">99.2% Doppler Precision</span>
                    </div>
                </div>
            </div>

            <!-- Number Plate & Blocklist Detection Result Card -->
            <div class="card overflow-hidden">
                <div class="navy-header">
                    <h3><i data-lucide="shield-check" class="w-4 h-4 text-cyan-400"></i> Plate & Blocklist Verification</h3>
                    <span class="badge ${isBlocked ? 'badge-red' : 'badge-emerald'}">
                        ${isBlocked ? 'MATCH FOUND' : 'CLEARED'}
                    </span>
                </div>
                <div class="p-4">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <span class="text-xs font-mono text-slate-500 block">DETECTED LICENSE PLATE</span>
                            <span class="text-2xl font-black font-mono text-slate-900 bg-amber-100 px-3 py-1 rounded border border-amber-300 inline-block mt-1">
                                ${activePlate}
                            </span>
                        </div>
                        <div class="text-right">
                            <span class="text-xs font-mono text-slate-500 block">OCR CONFIDENCE</span>
                            <span class="text-xl font-bold font-mono text-emerald-700">${va.ocrConfidence}%</span>
                        </div>
                    </div>

                    ${isBlocked ? `
                        <div class="p-3 bg-red-100 border border-red-400 rounded-lg text-xs font-mono text-red-900 mb-4 animate-pulse">
                            <div class="font-bold mb-1">CRITICAL ALERT: PRESENT IN NATIONAL BLOCKLIST!</div>
                            <div>This registration matches an active warrant in the Interceptor Hotlist. High priority intercept alert broadcasted.</div>
                        </div>
                    ` : `
                        <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-mono text-emerald-800 mb-4">
                            <div class="font-bold mb-1">CLEARED: NOT IN BLOCKLIST</div>
                            <div>No legal seizure warrants, unpaid impound flags, or criminal records found for this registration number.</div>
                        </div>
                    `}

                    <!-- Interactive Action: Issue e-Challan / Download Violation Report -->
                    <button class="btn ${isOver || isBlocked ? 'btn-danger' : 'btn-primary'} w-full" 
                            onclick="generateEChallan('${activePlate}', ${activeSpeed}, ${va.speedLimit}, ${isBlocked})">
                        <i data-lucide="file-text" class="w-4 h-4"></i>
                        ${isOver || isBlocked ? 'Generate Violation e-Challan / Legal Citation' : 'Export Verified Telemetry Certificate'}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Diagnostic Logs of Video Runs -->
    <div class="card overflow-hidden">
        <div class="audit-list-header">
            <h3>Recent Video Analysis Audit Records</h3>
            <span class="counter">${va.resultsLog.length} RUNS</span>
        </div>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.75rem;">
                <thead>
                    <tr style="background: var(--slate-100); border-bottom: 2px solid var(--slate-300); text-align: left; color: var(--slate-700);">
                        <th style="padding: 10px 14px;">TIMESTAMP</th>
                        <th style="padding: 10px 14px;">SOURCE</th>
                        <th style="padding: 10px 14px;">DETECTED PLATE</th>
                        <th style="padding: 10px 14px;">RECORDED SPEED</th>
                        <th style="padding: 10px 14px;">LIMIT</th>
                        <th style="padding: 10px 14px;">SPEED STATUS</th>
                        <th style="padding: 10px 14px;">BLOCKLIST STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    ${va.resultsLog.length === 0 ? `
                        <tr>
                            <td colspan="7" style="padding: 24px; text-align: center; color: var(--slate-500);">
                                Run an analysis above or upload a video to populate real-time verification logs.
                            </td>
                        </tr>
                    ` : va.resultsLog.map(r => `
                        <tr style="border-bottom: 1px solid var(--slate-200);">
                            <td style="padding: 10px 14px;">${r.time}</td>
                            <td style="padding: 10px 14px;">${r.source}</td>
                            <td style="padding: 10px 14px; font-weight: bold;">${r.plate}</td>
                            <td style="padding: 10px 14px; font-weight: bold; color: ${r.speed > r.limit ? 'var(--red-600)' : 'var(--slate-800)'};">${r.speed} km/h</td>
                            <td style="padding: 10px 14px;">${r.limit} km/h</td>
                            <td style="padding: 10px 14px;">
                                <span class="badge ${r.speed > r.limit ? 'badge-red' : 'badge-emerald'}">
                                    ${r.speed > r.limit ? `OVERSPEED (+${r.speed - r.limit})` : 'COMPLIANT'}
                                </span>
                            </td>
                            <td style="padding: 10px 14px;">
                                <span class="badge ${r.isBlocked ? 'badge-red' : 'badge-emerald'}">
                                    ${r.isBlocked ? 'IN BLOCKLIST' : 'CLEARED'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    initAnalyzerCanvas();
}

function selectScenario(idx) {
    const va = AppState.videoAnalyzer;
    va.currentScenarioIndex = idx;
    va.customVideoUrl = null;
    const sc = TEST_SCENARIOS[idx];
    va.detectedPlate = sc.plate;
    va.detectedSpeed = sc.speed;
    va.speedLimit = sc.speedLimit;
    va.ocrConfidence = sc.ocrConfidence;
    va.carModel = sc.make;
    va.simProgress = 0;
    renderAnalyzerPage();
}

function changeAnalyzerSpeedLimit(newLimit) {
    AppState.videoAnalyzer.speedLimit = parseInt(newLimit, 10);
    renderAnalyzerPage();
}

function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const va = AppState.videoAnalyzer;
    va.customVideoUrl = URL.createObjectURL(file);
    
    // Simulate AI detection extraction from user's custom video
    const randomSpeed = Math.floor(Math.random() * 50) + 55; // 55 to 105 km/h
    const randomPlates = ['MH-12-DE-4491', 'KA-03-NZ-1002', 'DL-01-AB-9821', 'TS-09-EQ-7744', 'KA-05-MM-3319'];
    const chosenPlate = randomPlates[Math.floor(Math.random() * randomPlates.length)];

    va.detectedPlate = chosenPlate;
    va.detectedSpeed = randomSpeed;
    va.ocrConfidence = 99.1;
    va.simProgress = 0;

    // Log this run
    logAnalysisResult('Custom Upload (' + file.name + ')', chosenPlate, randomSpeed, va.speedLimit);

    alert(`Video file "${file.name}" ingested successfully! AI ANPR & radar model initialized.`);
    renderAnalyzerPage();
    startAnalyzerPlayback();
}

function toggleAnalyzerPlayback() {
    const va = AppState.videoAnalyzer;
    if (va.isPlaying) {
        pauseAnalyzerPlayback();
    } else {
        startAnalyzerPlayback();
    }
}

function startAnalyzerPlayback() {
    const va = AppState.videoAnalyzer;
    va.isPlaying = true;
    renderAnalyzerPage();

    if (va.animFrameId) cancelAnimationFrame(va.animFrameId);

    function loop() {
        if (!va.isPlaying) return;
        va.simProgress += 0.008;
        if (va.simProgress > 1.0) {
            va.simProgress = 0;
            // Record result
            const sc = TEST_SCENARIOS[va.currentScenarioIndex];
            logAnalysisResult(sc.name.split(':')[0], va.detectedPlate, va.detectedSpeed, va.speedLimit);
        }
        drawAnalyzerCanvas();
        va.animFrameId = requestAnimationFrame(loop);
    }
    va.animFrameId = requestAnimationFrame(loop);
}

function pauseAnalyzerPlayback() {
    const va = AppState.videoAnalyzer;
    va.isPlaying = false;
    if (va.animFrameId) {
        cancelAnimationFrame(va.animFrameId);
        va.animFrameId = null;
    }
    renderAnalyzerPage();
}

function resetAnalyzerPlayback() {
    pauseAnalyzerPlayback();
    AppState.videoAnalyzer.simProgress = 0;
    drawAnalyzerCanvas();
}

function logAnalysisResult(source, plate, speed, limit) {
    const va = AppState.videoAnalyzer;
    const isBlocked = AppState.blocklist.includes(plate);
    va.resultsLog.unshift({
        time: new Date().toLocaleTimeString(),
        source,
        plate,
        speed,
        limit,
        isBlocked
    });
    if (va.resultsLog.length > 10) va.resultsLog.pop();
}

// Canvas Visualizer with Moving Vehicle & Dynamic ANPR Optical Bounding Boxes
function initAnalyzerCanvas() {
    drawAnalyzerCanvas();
}

function drawAnalyzerCanvas() {
    const canvas = document.getElementById('analyzer-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = canvas.parentElement.clientWidth || 640;
    const height = canvas.parentElement.clientHeight || 360;
    canvas.width = width;
    canvas.height = height;

    const va = AppState.videoAnalyzer;
    const t = va.simProgress;

    // Draw dark asphalt road
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Perspective highway road lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.1, height);
    ctx.lineTo(width * 0.35, height * 0.3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width * 0.9, height);
    ctx.lineTo(width * 0.65, height * 0.3);
    ctx.stroke();

    // Dashed center line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 16]);
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height);
    ctx.lineTo(width * 0.5, height * 0.3);
    ctx.stroke();
    ctx.setLineDash([]);

    // Horizon sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.3);
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.3);

    // Overhead ANPR Gantry
    ctx.fillStyle = '#475569';
    ctx.fillRect(width * 0.15, height * 0.28, width * 0.7, 8);
    // Gantry camera sensor pods
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(width * 0.3, height * 0.29, 12, 10);
    ctx.fillRect(width * 0.5, height * 0.29, 12, 10);
    ctx.fillRect(width * 0.7, height * 0.29, 12, 10);

    // Calculate vehicle position along lane
    // Vehicle moves from distant horizon (scale 0.3) to foreground (scale 1.0)
    const scale = 0.25 + t * 0.85;
    const carX = width * 0.48 + (Math.sin(t * Math.PI) * 15);
    const carY = height * 0.3 + (t * (height * 0.62));
    const carW = 160 * scale;
    const carH = 90 * scale;

    // Car Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(carX, carY + carH * 0.48, carW * 0.55, carH * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Car Body
    const isOver = va.detectedSpeed > va.speedLimit;
    ctx.fillStyle = isOver ? '#b91c1c' : '#1e3a5f';
    ctx.beginPath();
    ctx.roundRect(carX - carW * 0.5, carY - carH * 0.5, carW, carH * 0.8, 8 * scale);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Car Roof / Windshield
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(carX - carW * 0.35, carY - carH * 0.45, carW * 0.7, carH * 0.4, 4 * scale);
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(carX - carW * 0.4, carY + carH * 0.15, 6 * scale, 0, Math.PI * 2);
    ctx.arc(carX + carW * 0.4, carY + carH * 0.15, 6 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Number Plate on front bumper
    const plateW = carW * 0.42;
    const plateH = 18 * scale;
    const plateX = carX - plateW * 0.5;
    const plateY = carY + carH * 0.12;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.fillRect(plateX, plateY, plateW, plateH);
    ctx.strokeRect(plateX, plateY, plateW, plateH);

    // Plate text
    if (scale > 0.4) {
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.max(9, Math.round(11 * scale))}px JetBrains Mono`;
        ctx.textAlign = 'center';
        ctx.fillText(va.detectedPlate, carX, plateY + plateH * 0.75);
    }

    // Optical AI Tracking Bounding Box
    ctx.strokeStyle = isOver ? '#ef4444' : '#22d3ee';
    ctx.lineWidth = 2;
    ctx.strokeRect(carX - carW * 0.55, carY - carH * 0.55, carW * 1.1, carH * 1.1);

    // AI Bounding Box Label
    ctx.fillStyle = isOver ? '#ef4444' : '#22d3ee';
    ctx.fillRect(carX - carW * 0.55, carY - carH * 0.55 - 18, 120, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`VEH: ${va.detectedPlate}`, carX - carW * 0.55 + 4, carY - carH * 0.55 - 5);

    // Radar Laser Beam
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.29);
    ctx.lineTo(carX, carY);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Blocklist Management Modal
function showBlocklistModal() {
    renderBlocklistModalContent();
}

function renderBlocklistModalContent() {
    openModal(`
        <div class="navy-header">
            <h3><i data-lucide="shield-alert" class="w-4 h-4 text-red-400"></i> Police Hotlist & Seizure Registry</h3>
            <button class="btn-xs btn-ghost" onclick="closeModal()">✕</button>
        </div>
        <div class="p-6">
            <p class="text-xs text-slate-600 mb-4">
                Vehicles in this registry trigger immediate red alerts upon ANPR camera capture or video upload.
            </p>

            <!-- Add new plate to blocklist -->
            <div class="flex gap-2 mb-4">
                <input type="text" id="new-blocklist-plate" class="input-field" placeholder="Enter Plate (e.g. DL-04-XY-9999)" style="text-transform: uppercase;">
                <button class="btn btn-primary btn-sm shrink-0" onclick="addPlateToBlocklist()">
                    <i data-lucide="plus" class="w-4 h-4"></i> Add to Hotlist
                </button>
            </div>

            <!-- List of current blocklisted plates -->
            <div class="border border-slate-300 rounded-lg overflow-hidden mb-4">
                <div style="max-height: 220px; overflow-y: auto;">
                    ${AppState.blocklist.map(p => `
                        <div class="flex items-center justify-between p-3 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 font-mono text-xs">
                            <div class="flex items-center gap-2">
                                <span class="badge badge-red font-bold">${p}</span>
                                <span class="text-slate-500">Active High-Speed / Warrant Alert</span>
                            </div>
                            <button class="btn btn-ghost btn-xs text-red-600" onclick="removePlateFromBlocklist('${p}')">
                                Remove
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="flex justify-end">
                <button class="btn btn-primary btn-sm" onclick="closeModal()">Done</button>
            </div>
        </div>
    `);
    if (window.lucide) lucide.createIcons();
}

function addPlateToBlocklist() {
    const input = document.getElementById('new-blocklist-plate');
    if (!input || !input.value.trim()) return;
    const plate = input.value.trim().toUpperCase();
    if (!AppState.blocklist.includes(plate)) {
        AppState.blocklist.push(plate);
    }
    renderAnalyzerPage();
    renderBlocklistModalContent();
}

function removePlateFromBlocklist(plate) {
    AppState.blocklist = AppState.blocklist.filter(p => p !== plate);
    renderAnalyzerPage();
    renderBlocklistModalContent();
}

// Generate Official e-Challan Modal
function generateEChallan(plate, speed, limit, isBlocked) {
    const isOver = speed > limit;
    const excess = speed - limit;
    const challanNo = 'ECH-2026-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleString('en-GB');

    openModal(`
        <div class="navy-header">
            <h3><i data-lucide="file-text" class="w-4 h-4"></i> Official Motor Vehicle e-Challan</h3>
            <button class="btn-xs btn-ghost" onclick="closeModal()">✕</button>
        </div>
        <div class="p-6">
            <div class="border-2 border-slate-800 p-4 rounded-xl bg-white mb-4 font-mono">
                <!-- Header of Challan -->
                <div class="text-center pb-3 border-b-2 border-slate-800 mb-3">
                    <div class="font-black text-sm text-slate-900">INTEGRATED TRAFFIC SURVEILLANCE & ENFORCEMENT COMMAND</div>
                    <div class="text-xs text-slate-600">NOTICE OF CITATION UNDER MOTOR VEHICLES (AMENDMENT) ACT</div>
                    <div class="font-bold text-xs text-red-700 mt-1">CITATION NO: ${challanNo}</div>
                </div>

                <!-- Snapshot Frame -->
                <div class="p-3 bg-slate-900 text-white rounded mb-3 text-xs flex justify-between items-center">
                    <div>
                        <div>VEHICLE PLATE: <strong class="text-amber-400 text-sm">${plate}</strong></div>
                        <div>RADAR SPEED: <strong class="text-red-400">${speed} km/h</strong> (Limit: ${limit} km/h)</div>
                    </div>
                    <div class="text-right">
                        <div>TIMESTAMP: ${dateStr}</div>
                        <div>LOCATION: Grand River Expressway (CAM-05)</div>
                    </div>
                </div>

                <!-- Violation Details -->
                <div class="flex flex-col gap-1.5 text-xs">
                    <div class="flex justify-between py-1 border-b border-slate-200">
                        <span>OFFENSE 1:</span>
                        <strong class="${isOver ? 'text-red-700' : 'text-slate-700'}">
                            ${isOver ? `Sec 183 MV Act: Overspeeding (+${excess} km/h above ${limit})` : 'Compliant Speed Verified'}
                        </strong>
                    </div>
                    ${isBlocked ? `
                        <div class="flex justify-between py-1 border-b border-slate-200 text-red-700">
                            <span>OFFENSE 2:</span>
                            <strong>Sec 177 / CR Bench Warrant: Hotlist Impound Flag</strong>
                        </div>
                    ` : ''}
                    <div class="flex justify-between py-1 border-b border-slate-200">
                        <span>PENALTY FINE PAYABLE:</span>
                        <strong class="text-base text-red-800">${isOver ? '₹ 2,000.00' : '₹ 0.00'}</strong>
                    </div>
                    <div class="flex justify-between py-1">
                        <span>PAYMENT DUE DATE:</span>
                        <strong>15 Days from Notice Issue</strong>
                    </div>
                </div>
            </div>

            <div class="flex justify-between items-center">
                <span class="text-xs font-mono text-slate-500">Cryptographically Sealed // e-Parivahan Compatible</span>
                <div class="flex gap-2">
                    <button class="btn btn-ghost btn-sm" onclick="closeModal()">Close</button>
                    <button class="btn btn-primary btn-sm" onclick="window.print()">
                        <i data-lucide="printer" class="w-3.5 h-3.5"></i> Print Citation
                    </button>
                </div>
            </div>
        </div>
    `);
    if (window.lucide) lucide.createIcons();
}

// ============================================================================
// MODAL SYSTEM
// ============================================================================
function openModal(contentHtml) {
    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');
    if (overlay && body) {
        body.innerHTML = contentHtml;
        overlay.style.display = 'flex';
        if (window.lucide) lucide.createIcons();
    }
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}
