/**
 * =========================================================================
 * PROJECT SPECTRALx: SPHEREx Sky Explorer Client (v2 Rebuild)
 * NASA Space Apps Challenge 2026: "Planet X and SPHEREx"
 * =========================================================================
 */

"use strict";

// =========================================================================
// 1. BACKEND REST API CONFIGURATION
// =========================================================================
/**
 * Single clearly-marked API configuration point.
 * Empty string by default activates verified local fallback dataset.
 * To point to your teammate's Python/Astropy backend:
 * const API_BASE_URL = "https://api.your-domain.org";
 */
const API_BASE_URL = "";

// =========================================================================
// 2. CELESTIAL TARGETS DATASET (GENUINE OBSERVATIONS & HONEST BANDS)
// =========================================================================
const CELESTIAL_TARGETS = {
  planet_x_field: {
    id: "planet_x_field",
    name: "Planet X Candidate Field (2 Epochs)",
    ra: 156.09,
    dec: -41.64,
    fov_deg: "3.5° × 3.5°",
    has_moving_candidate: true,
    available_bands: [1, 2],
    default_band: 1,
    unavailable_notice: "Bands 3–6 not observed for this field",
    epochs: [
      {
        date: "2025-04-15",
        band_um: 1.0,
        band_number: 1,
        image_url: "assets/images/cluster-survey-cyan.jpg",
        image_url_hires: "assets/images/cluster-survey-cyan-hires.jpg",
        marker_pos: { x: 47.0, y: 42.4 }
      },
      {
        date: "2026-02-14",
        band_um: 1.4,
        band_number: 2,
        image_url: "assets/images/cluster-survey-blue.jpg",
        image_url_hires: "assets/images/cluster-survey-blue-hires.jpg",
        marker_pos: { x: 54.6, y: 34.7 }
      }
    ],
    bands: {
      1: { um: 1.0, label: "Band 1 (1.0 µm)", image_url: "assets/images/cluster-survey-cyan.jpg", image_url_hires: "assets/images/cluster-survey-cyan-hires.jpg", epoch_index: 0 },
      2: { um: 1.4, label: "Band 2 (1.4 µm)", image_url: "assets/images/cluster-survey-blue.jpg", image_url_hires: "assets/images/cluster-survey-blue-hires.jpg", epoch_index: 1 }
    }
  },

  star_formation_hub: {
    id: "star_formation_hub",
    name: "Star Formation Hub: Carina Nebula (2 Bands)",
    ra: 161.26,
    dec: -59.87,
    fov_deg: "2.8° × 2.8°",
    has_moving_candidate: false,
    available_bands: [4, 5],
    default_band: 4,
    unavailable_notice: "Bands 1–3, 6 not observed for this field",
    epochs: [
      {
        date: "2025-05-10",
        band_um: 3.1,
        band_number: 4,
        image_url: "assets/images/nebula-red-orange.jpg"
      }
    ],
    bands: {
      4: { um: 3.1, label: "Band 4 (3.1 µm)", image_url: "assets/images/nebula-red-orange.jpg" },
      5: { um: 4.1, label: "Band 5 (4.1 µm)", image_url: "assets/images/nebula-amber-dust.jpg" }
    }
  },

  ngc_1760: {
    id: "ngc_1760",
    name: "NGC 1760 Star-Forming Nebula (3 Bands)",
    ra: 74.43,
    dec: -66.35,
    fov_deg: "1.3° × 0.7°",
    has_moving_candidate: false,
    available_bands: [1, 2, 3],
    default_band: 2,
    unavailable_notice: "Bands 4–6 not observed for this field",
    epochs: [
      {
        date: "2025-05-01",
        band_um: 0.98,
        band_number: 2,
        image_url: "assets/images/ngc1760-098um.webp"
      }
    ],
    bands: {
      1: { um: 0.96, label: "Band 1 (0.96 µm)", title: "Band 1 (0.96 µm: S III emission)", image_url: "assets/images/ngc1760-096um.webp" },
      2: { um: 0.98, label: "Band 2 (0.98 µm)", title: "Band 2 (0.98 µm: Stellar continuum)", image_url: "assets/images/ngc1760-098um.webp" },
      3: { um: 3.29, label: "Band 3 (3.29 µm)", title: "Band 3 (3.29 µm: PAHs carbon dust)", image_url: "assets/images/ngc1760-329um.webp" }
    }
  },

  galactic_bulge: {
    id: "galactic_bulge",
    name: "Galactic Bulge & Inner Disk (1 Epoch, 2 Bands)",
    ra: 266.42,
    dec: -29.01,
    fov_deg: "4.2° × 4.2°",
    has_moving_candidate: false,
    available_bands: [2, 3],
    default_band: 2,
    unavailable_notice: "Bands 1, 4–6 not observed for this field",
    epochs: [
      {
        date: "2025-06-01",
        band_um: 1.4,
        band_number: 2,
        image_url: "assets/images/milkyway-starfield.jpg"
      }
    ],
    bands: {
      2: { um: 1.4, label: "Band 2 (1.4 µm)", image_url: "assets/images/milkyway-starfield.jpg" },
      3: { um: 2.0, label: "Band 3 (2.0 µm)", image_url: "assets/images/milkyway-deepfield-hires.jpg" }
    }
  },

  milkyway_allsky: {
    id: "milkyway_allsky",
    name: "Milky Way All-Sky Survey (2 Bands)",
    ra: 0.00,
    dec: 0.00,
    fov_deg: "360° × 180°",
    has_moving_candidate: false,
    available_bands: [1, 6],
    default_band: 1,
    unavailable_notice: "Bands 2–5 not observed for this all-sky projection",
    epochs: [
      {
        date: "2025-07-01",
        band_um: 1.0,
        band_number: 1,
        image_url: "assets/images/spherex-allsky-stars.webp"
      }
    ],
    bands: {
      1: { um: 1.0, label: "Band 1 (1.0 µm)", title: "Band 1 (1.0 µm: All-Sky Stars and Galaxies)", image_url: "assets/images/spherex-allsky-stars.webp" },
      6: { um: 4.8, label: "Band 6 (4.8 µm)", title: "Band 6 (4.8 µm: All-Sky Dust and Gas)", image_url: "assets/images/spherex-allsky-dust.webp" }
    }
  },

  molecular_filaments: {
    id: "molecular_filaments",
    name: "Herschel Molecular Cloud Filaments (1 Epoch)",
    ra: 274.70,
    dec: -13.81,
    fov_deg: "2.5° × 2.5°",
    has_moving_candidate: false,
    available_bands: [6],
    default_band: 6,
    unavailable_notice: "Bands 1–5 not observed for this field",
    epochs: [
      {
        date: "2025-08-20",
        band_um: 4.8,
        band_number: 6,
        image_url: "assets/images/herschel-filaments.jpg"
      }
    ],
    bands: {
      6: { um: 4.8, label: "Band 6 (4.8 µm)", image_url: "assets/images/herschel-filaments.jpg" }
    }
  },

  spherex_mosaic: {
    id: "spherex_mosaic",
    name: "SPHEREx 6-Channel Detector Focal Plane Array",
    ra: 270.00,
    dec: 66.56,
    fov_deg: "3.5° × 7.0° (Mosaic)",
    has_moving_candidate: false,
    available_bands: [],
    default_band: 1,
    unavailable_notice: "Simultaneous 6-channel detector mosaic view",
    epochs: [
      {
        date: "2025-04-01",
        band_um: 2.5,
        band_number: 1,
        image_url: "assets/images/wavelength-six-bands.webp"
      }
    ],
    bands: {}
  },

  cygnus_complex: {
    id: "cygnus_complex",
    name: "Cygnus Molecular Cloud Complex (2 Bands)",
    ra: 308.20,
    dec: 41.30,
    fov_deg: "3.0° × 3.0°",
    has_moving_candidate: false,
    available_bands: [2, 3],
    default_band: 2,
    unavailable_notice: "Bands 1, 4-6 not observed for this field",
    epochs: [
      {
        date: "2025-09-15",
        band_um: 1.4,
        band_number: 2,
        image_url: "assets/images/cygnus-stars-dust-44.jpg"
      }
    ],
    bands: {
      2: { um: 1.4, label: "Band 2 (1.4 µm)", title: "Band 2 (1.4 µm: Stars & Dust Continuum)", image_url: "assets/images/cygnus-stars-dust-44.jpg" },
      3: { um: 3.0, label: "Band 3 (3.0 µm)", title: "Band 3 (3.0 µm: Interstellar Ice Absorption)", image_url: "assets/images/cygnus-interstellar-ice-43.jpg" }
    }
  }
};

// =========================================================================
// 3. APPLICATION STATE & GENERATION TOKENS
// =========================================================================
const appState = {
  activeTargetKey: "planet_x_field",
  activeTarget: CELESTIAL_TARGETS.planet_x_field,
  epochIndex: 0,
  bandNumber: 1,
  bandUm: 1.0,
  showMarker: true,
  showCrosshair: false,
  isBlinking: false,
  isLoadingBlink: false,
  blinkTimerId: null,
  blinkFlip: false,
  isLiveApi: false,
  isLiveApiConnected: false,
  preloadedImages: new Map(), // url -> HTMLImageElement
  loadGeneration: 0           // Stale-load race protection token
};

// =========================================================================
// 4. DOM ELEMENT CACHE
// =========================================================================
const ui = {
  // Viewer Stage & Elements
  viewerStage: document.getElementById("viewerStage"),
  skyDisplay: document.getElementById("skyDisplay"),
  viewerErrorMessage: document.getElementById("viewerErrorMessage"),
  errorTileDetails: document.getElementById("errorTileDetails"),
  btnErrorRetry: document.getElementById("btnErrorRetry"),
  crosshairGrid: document.getElementById("crosshairGrid"),
  motionMarker: document.getElementById("motionMarker"),

  // HUD Elements
  hudRa: document.getElementById("hudRa"),
  hudDec: document.getElementById("hudDec"),
  hudFov: document.getElementById("hudFov"),
  hudBand: document.getElementById("hudBand"),
  toggleMarkerBtn: document.getElementById("toggleMarkerBtn"),
  toggleCrosshairBtn: document.getElementById("toggleCrosshairBtn"),

  // Controls Toolbar
  targetSelect: document.getElementById("targetSelect"),
  raInput: document.getElementById("raInput"),
  decInput: document.getElementById("decInput"),
  btnSlew: document.getElementById("btnSlew"),
  slewFeedback: document.getElementById("slewFeedback"),

  // Dynamic Bands
  bandChipsContainer: document.getElementById("bandChipsContainer"),
  bandNotice: document.getElementById("bandNotice"),

  // Slider & Blink
  btnBlink: document.getElementById("btnBlink"),
  blinkBtnText: document.getElementById("blinkBtnText"),
  epochSlider: document.getElementById("epochSlider"),
  epochDateDisplay: document.getElementById("epochDateDisplay"),
  epochStepDisplay: document.getElementById("epochStepDisplay"),

  // Gallery Cards
  galleryCards: document.querySelectorAll(".gallery-card")
};

// =========================================================================
// 5. ASTROMETRIC COMPUTATIONS & COORDINATE VALIDATION
// =========================================================================
function calculateAngularSeparationDeg(ra1, dec1, ra2, dec2) {
  const rad = Math.PI / 180.0;
  const a1 = ra1 * rad;
  const d1 = dec1 * rad;
  const a2 = ra2 * rad;
  const d2 = dec2 * rad;

  const cosD = Math.sin(d1) * Math.sin(d2) + Math.cos(d1) * Math.cos(d2) * Math.cos(a1 - a2);
  const clampedCosD = Math.max(-1.0, Math.min(1.0, cosD));
  return Math.acos(clampedCosD) * (180.0 / Math.PI);
}

function executeSlew(ra, dec) {
  clearSlewFeedback();

  // Validate Range: RA 0..360, Dec -90..90
  if (isNaN(ra) || isNaN(dec) || ra < 0 || ra > 360 || dec < -90 || dec > 90) {
    showSlewFeedback("Coordinates out of range. RA must be 0° to 360°, Dec must be -90° to +90°.", "error");
    return;
  }

  let closestKey = null;
  let minDistanceDeg = Infinity;

  for (const [key, target] of Object.entries(CELESTIAL_TARGETS)) {
    const dist = calculateAngularSeparationDeg(ra, dec, target.ra, target.dec);
    if (dist < minDistanceDeg) {
      minDistanceDeg = dist;
      closestKey = key;
    }
  }

  if (closestKey) {
    stopBlink();
    appState.epochIndex = 0;
    appState.activeTargetKey = closestKey;

    if (ui.targetSelect) {
      ui.targetSelect.value = closestKey;
    }

    loadTarget(closestKey, { ra, dec, distanceDeg: minDistanceDeg });

    const distString = minDistanceDeg < 0.1 ? "exact target match" : `closest field at Δθ = ${minDistanceDeg.toFixed(1)}°`;
    showSlewFeedback(`Slewed to ${CELESTIAL_TARGETS[closestKey].name} (${distString}).`, "info");
  }
}

function showSlewFeedback(message, type) {
  if (!ui.slewFeedback) return;
  ui.slewFeedback.textContent = message;
  ui.slewFeedback.className = `slew-feedback-message ${type}`;
}

function clearSlewFeedback() {
  if (!ui.slewFeedback) return;
  ui.slewFeedback.textContent = "";
  ui.slewFeedback.className = "slew-feedback-message";
}

// =========================================================================
// 6. IMAGE PRELOADING, LOAD-GATING & STALE-LOAD PROTECTION (STEP 0.7 #3, #5, #6)
// =========================================================================
function preloadTargetImages(target, onProgress = null) {
  if (!target) return Promise.resolve([]);

  const urls = [];
  if (target.epochs) {
    target.epochs.forEach(ep => {
      if (ep.image_url && !urls.includes(ep.image_url)) urls.push(ep.image_url);
    });
  }
  if (target.bands) {
    Object.values(target.bands).forEach(b => {
      if (b.image_url && !urls.includes(b.image_url)) urls.push(b.image_url);
    });
  }

  let loadedCount = 0;
  const total = urls.length;

  return Promise.all(
    urls.map((url, idx) => {
      if (appState.preloadedImages.has(url) && appState.preloadedImages.get(url).complete) {
        loadedCount++;
        if (onProgress) onProgress(loadedCount, total);
        return Promise.resolve(appState.preloadedImages.get(url));
      }
      return new Promise(resolve => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          appState.preloadedImages.set(url, img);
          loadedCount++;
          if (onProgress) onProgress(loadedCount, total);
          resolve(img);
        };
        img.onerror = () => {
          console.warn(`[SPECTRALx] Preload failed for: ${url}`);
          resolve(null);
        };
      });
    })
  );
}

function displayImageTile(targetUrl, hiresUrl = null) {
  if (!ui.skyDisplay) return;

  hideViewerError();

  const thisGen = ++appState.loadGeneration;
  const previousSrc = appState.currentGoodUrl || ui.skyDisplay.getAttribute("src") || "";

  const applySrc = (url, hires) => {
    if (hires) {
      ui.skyDisplay.srcset = `${hires} 2048w, ${url} 1024w`;
      ui.skyDisplay.sizes = "100vw";
    } else {
      ui.skyDisplay.removeAttribute("srcset");
      ui.skyDisplay.removeAttribute("sizes");
    }
    ui.skyDisplay.src = url;
    ui.skyDisplay.style.opacity = "1";
  };

  // Apply immediately so viewer responds instantaneously
  applySrc(targetUrl, hiresUrl);

  // Background error detection: if targetUrl fails (404), revert to previous held image
  const loader = new Image();
  loader.src = targetUrl;
  loader.onload = () => {
    appState.preloadedImages.set(targetUrl, loader);
    appState.currentGoodUrl = targetUrl;
  };
  loader.onerror = () => {
    if (thisGen === appState.loadGeneration) {
      console.error(`[SPECTRALx] Image tile failed to load: ${targetUrl}`);
      // Revert to holding the previous valid image instead of staying on the broken URL!
      if (previousSrc && !previousSrc.includes("non-existent-tile-404")) {
        applySrc(previousSrc, null);
      }
      showViewerError(targetUrl);
    }
  };
}

function showViewerError(failedUrl) {
  if (ui.viewerErrorMessage) {
    ui.viewerErrorMessage.hidden = false;
  }
  if (ui.errorTileDetails) {
    ui.errorTileDetails.textContent = `Astronomical tile unavailable: "${failedUrl}".`;
  }
  if (ui.skyDisplay) {
    ui.skyDisplay.style.opacity = "0.2";
  }
}

function hideViewerError() {
  if (ui.viewerErrorMessage) {
    ui.viewerErrorMessage.hidden = true;
  }
  if (ui.skyDisplay) {
    ui.skyDisplay.style.opacity = "1";
  }
}

// =========================================================================
// 7. TARGET LOADING & UI SYNCHRONIZATION
// =========================================================================
// Monotonic request sequence: a slow API response must never overwrite a
// newer target selection (IRSA TAP takes ~10-14s on first query, so rapid
// target switches otherwise resolve out of order and clobber the view).
let loadTargetSeq = 0;

async function loadTarget(targetKey, slewMeta = null, forcedBand = null) {
  const mySeq = ++loadTargetSeq;
  const localTarget = CELESTIAL_TARGETS[targetKey] || CELESTIAL_TARGETS.planet_x_field;

  // Render the local dataset immediately: the page is complete and blink
  // works from the first paint. The live API response merges in silently
  // when it arrives (a cold IRSA TAP query takes ~10-14s, and the page
  // used to wait for it before showing anything interactive).
  setLiveStatus(false);
  appState.activeTargetKey = localTarget.id;
  if (slewMeta) {
    appState.activeTarget = {
      ...localTarget,
      ra: slewMeta.ra,
      dec: slewMeta.dec
    };
  } else {
    appState.activeTarget = localTarget;
  }
  syncViewportUI(forcedBand);
  preloadTargetImages(appState.activeTarget);

  const baseUrl = API_BASE_URL !== undefined ? API_BASE_URL : "";
  const queryHost = baseUrl || (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin.startsWith("http") ? window.location.origin : "");

  if (queryHost) {
    try {
      const queryRa = slewMeta ? slewMeta.ra : (localTarget?.ra ?? 156.09);
      const queryDec = slewMeta ? slewMeta.dec : (localTarget?.dec ?? -41.64);
      const url = `${queryHost}/api/sky-view?ra=${encodeURIComponent(queryRa)}&dec=${encodeURIComponent(queryDec)}`;

      const response = await fetch(url).catch(() => null);
      if (mySeq !== loadTargetSeq) return; // superseded by a newer selection
      if (response && response.ok) {
        const json = await response.json().catch(() => null);
        if (mySeq !== loadTargetSeq) return; // superseded while parsing
        if (json && Array.isArray(json.epochs) && json.epochs.length > 0) {
          const mergedEpochs = json.epochs.map((ep, idx) => {
            const localEp = (localTarget && localTarget.epochs && localTarget.epochs[idx]) || {};
            return {
              ...localEp,
              ...ep,
              marker_pos: ep.marker_pos || localEp.marker_pos,
              image_url_hires: ep.image_url_hires || localEp.image_url_hires
            };
          });

          const mergedBands = {};
          const sourceBands = json.bands || (localTarget?.bands || {});
          for (const [bKey, bVal] of Object.entries(sourceBands)) {
            const localBand = (localTarget && localTarget.bands && localTarget.bands[bKey]) || {};
            mergedBands[bKey] = {
              ...localBand,
              ...bVal,
              image_url_hires: bVal.image_url_hires || localBand.image_url_hires || null
            };
          }

          setLiveStatus(true);
          appState.activeTargetKey = targetKey;
          appState.activeTarget = {
            id: targetKey,
            name: json.target_name || (localTarget?.name || `Field (${queryRa}°, ${queryDec}°)`),
            ra: json.ra ?? queryRa,
            dec: json.dec ?? queryDec,
            fov_deg: json.fov_deg || (localTarget?.fov_deg || "3.5° × 3.5°"),
            has_moving_candidate: json.has_moving_candidate !== undefined ? Boolean(json.has_moving_candidate) : Boolean(localTarget?.has_moving_candidate),
            available_bands: json.available_bands || (localTarget?.available_bands || [1]),
            default_band: json.default_band || (localTarget?.default_band || 1),
            unavailable_notice: json.unavailable_notice || (localTarget?.unavailable_notice || ""),
            epochs: mergedEpochs,
            bands: mergedBands
          };
          syncViewportUI(forcedBand);
          preloadTargetImages(appState.activeTarget);
          return;
        }
      }
    } catch (err) {
      // Backend unavailable - local dataset is already showing
    }
  }
}

function setLiveStatus(isLive) {
  appState.isLiveApi = isLive;
  appState.isLiveApiConnected = isLive;
}

/**
 * Synchronizes controls toolbar, slider limits, band chips, and active image.
 */
function syncViewportUI(forcedBand = null) {
  const target = appState.activeTarget;
  if (!target) return;

  // Sync HUD coordinates
  if (ui.hudRa) ui.hudRa.textContent = `${Number(target.ra).toFixed(2)}°`;
  if (ui.hudDec) ui.hudDec.textContent = `${Number(target.dec).toFixed(2)}°`;
  if (ui.hudFov) ui.hudFov.textContent = target.fov_deg || "3.5° × 3.5°";

  // Sync Input fields
  if (ui.raInput) ui.raInput.value = Number(target.ra).toFixed(2);
  if (ui.decInput) ui.decInput.value = Number(target.dec).toFixed(2);

  // Sync Target dropdown
  if (ui.targetSelect && ui.targetSelect.value !== target.id) {
    ui.targetSelect.value = target.id;
  }

  // Epoch Slider bounds
  const totalEpochs = target.epochs.length;
  if (ui.epochSlider) {
    if (totalEpochs <= 1) {
      ui.epochSlider.min = "0";
      ui.epochSlider.max = "0";
      ui.epochSlider.disabled = true;
      appState.epochIndex = 0;
    } else {
      ui.epochSlider.disabled = false;
      ui.epochSlider.min = "0";
      ui.epochSlider.max = String(totalEpochs - 1);
      if (appState.epochIndex >= totalEpochs) {
        appState.epochIndex = 0;
      }
      ui.epochSlider.value = String(appState.epochIndex);
    }
  }

  // Blink button disabled state for single-epoch targets
  if (ui.btnBlink) {
    if (totalEpochs < 2) {
      stopBlink();
      ui.btnBlink.disabled = true;
      ui.btnBlink.title = "Blink Comparator requires 2 or more observation epochs";
      if (ui.blinkBtnText) ui.blinkBtnText.textContent = "Blink (Needs 2+ Epochs)";
    } else {
      ui.btnBlink.disabled = false;
      ui.btnBlink.title = "Auto-flip between first and last epoch to detect moving objects";
      if (ui.blinkBtnText) ui.blinkBtnText.textContent = "Blink Comparator";
    }
  }

  // Sync Available Band Chips dynamically (Only render what exists!)
  const availableBands = target.available_bands || [];
  let initialBand = forcedBand || target.default_band || availableBands[0] || 1;

  if (!availableBands.includes(initialBand) && availableBands.length > 0) {
    initialBand = availableBands[0];
  }

  appState.bandNumber = initialBand;

  renderBandChips(target, initialBand);
  renderStage();
}

/**
 * Dynamically renders only the bands that exist for the current target.
 */
function renderBandChips(target, selectedBand) {
  if (!ui.bandChipsContainer) return;
  ui.bandChipsContainer.innerHTML = "";

  const availableBands = target.available_bands || [];

  if (availableBands.length === 0) {
    if (ui.bandNotice) {
      ui.bandNotice.textContent = target.unavailable_notice || "Full-spectrum focal plane array view";
      ui.bandNotice.style.display = "inline";
    }
    return;
  }

  // Hide notice when available bands exist (avoiding duplicate dead chips + note)
  if (ui.bandNotice) {
    ui.bandNotice.textContent = "";
    ui.bandNotice.style.display = "none";
  }

  availableBands.forEach(bNum => {
    const bandData = target.bands ? target.bands[bNum] : null;
    const um = bandData ? bandData.um : 1.0;
    const label = bandData && bandData.label ? bandData.label : `Band ${bNum} (${um.toFixed(2)} µm)`;
    const titleText = bandData && bandData.title ? bandData.title : `Switch to ${label}`;

    const btn = document.createElement("button");
    btn.className = `band-chip ${bNum === selectedBand ? "active" : ""}`;
    btn.type = "button";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", (bNum === selectedBand).toString());
    btn.setAttribute("data-band", String(bNum));
    btn.setAttribute("data-um", String(um));
    btn.title = titleText;

    btn.innerHTML = `<span class="chip-dot"></span> ${label}`;

    btn.addEventListener("click", () => {
      setBand(bNum, um);
    });

    ui.bandChipsContainer.appendChild(btn);
  });
}

/**
 * Updates stage image, reticle positions, and consolidated date/step indicator.
 */
function renderStage() {
  const target = appState.activeTarget;
  if (!target || !target.epochs || target.epochs.length === 0) return;

  const currentEpoch = target.epochs[appState.epochIndex] || target.epochs[0];
  const totalEpochs = target.epochs.length;

  let displayUrl = currentEpoch.image_url;
  let activeUm = currentEpoch.band_um;
  let hiresUrl = currentEpoch.image_url_hires || null;

  if (target.bands && target.bands[appState.bandNumber]) {
    displayUrl = target.bands[appState.bandNumber].image_url;
    activeUm = target.bands[appState.bandNumber].um;
    hiresUrl = target.bands[appState.bandNumber].image_url_hires || currentEpoch.image_url_hires || null;
  }

  appState.bandUm = activeUm;

  displayImageTile(displayUrl, hiresUrl);

  // Update HUD Band (Step 0.12 #3a: 2 decimal places so 0.96 and 0.98 are distinguishable)
  if (ui.hudBand) {
    ui.hudBand.textContent = `${activeUm.toFixed(2)} µm`;
  }

  // Consolidated Single Date & Step Indicator (Step 0.8 #3)
  if (ui.epochDateDisplay) {
    ui.epochDateDisplay.textContent = currentEpoch.date;
  }
  if (ui.epochStepDisplay) {
    ui.epochStepDisplay.innerHTML = `Epoch <strong>${appState.epochIndex + 1}</strong> of <strong>${totalEpochs}</strong>`;
  }

  // Update Motion Marker Reticle
  if (ui.motionMarker) {
    if (appState.showMarker && target.has_moving_candidate && currentEpoch.marker_pos) {
      ui.motionMarker.classList.add("visible");
      ui.motionMarker.style.left = `${currentEpoch.marker_pos.x}%`;
      ui.motionMarker.style.top = `${currentEpoch.marker_pos.y}%`;
    } else {
      ui.motionMarker.classList.remove("visible");
    }
  }
}

// =========================================================================
// 8. TIME SLIDER & LOAD-GATED BLINK ENGINE (STEP 0.7 #4, #5, #6)
// =========================================================================
function setEpoch(index) {
  const target = appState.activeTarget;
  if (!target || !target.epochs || index >= target.epochs.length) return;

  appState.epochIndex = index;
  if (ui.epochSlider) {
    ui.epochSlider.value = String(index);
  }

  const currentEpoch = target.epochs[index];
  if (target.epochs.length > 1 && currentEpoch && currentEpoch.band_number) {
    appState.bandNumber = currentEpoch.band_number;
    const chips = ui.bandChipsContainer ? ui.bandChipsContainer.querySelectorAll(".band-chip") : [];
    chips.forEach(chip => {
      const bNum = Number(chip.getAttribute("data-band"));
      const isMatch = bNum === currentEpoch.band_number;
      chip.classList.toggle("active", isMatch);
      chip.setAttribute("aria-checked", isMatch ? "true" : "false");
    });
  }

  renderStage();
}

/**
 * Toggles Blink Comparator. Re-entry guarded and gated on full preloading.
 */
async function toggleBlink() {
  if (appState.isBlinking) {
    stopBlink();
  } else {
    await startBlink();
  }
}

async function startBlink() {
  const target = appState.activeTarget;
  if (!target || target.epochs.length < 2) return;

  // Re-entry guard against double-clicks during loading
  if (appState.isLoadingBlink || appState.isBlinking) return;
  appState.isLoadingBlink = true;

  if (ui.btnBlink) {
    ui.btnBlink.disabled = true;
  }
  if (ui.blinkBtnText) {
    ui.blinkBtnText.textContent = "Loading Epoch 1 of 2...";
  }

  // 10s Timeout Safeguard (Step 0.7 #6)
  let timedOut = false;
  const timeoutTimer = setTimeout(() => {
    timedOut = true;
    appState.isLoadingBlink = false;
    if (ui.btnBlink) ui.btnBlink.disabled = false;
    if (ui.blinkBtnText) ui.blinkBtnText.textContent = "Preload Timeout (Retry)";
    console.warn("[SPECTRALx] Preload timed out after 10s under slow network.");
  }, 10000);

  // Preload with progress reporting
  const preloadResults = await preloadTargetImages(target, (loaded, total) => {
    if (!timedOut && ui.blinkBtnText) {
      ui.blinkBtnText.textContent = `Loading Epoch ${loaded} of ${total}...`;
    }
  });

  clearTimeout(timeoutTimer);
  if (timedOut) return;

  appState.isLoadingBlink = false;
  if (ui.btnBlink) ui.btnBlink.disabled = false;

  // Error check: If any epoch failed to load, do not start blink (Step 0.7 #5)
  const anyFailed = target.epochs.some(ep => {
    const cached = appState.preloadedImages.get(ep.image_url);
    return !cached || !cached.complete || cached.naturalWidth === 0;
  });

  if (anyFailed) {
    stopBlink();
    showViewerError("One or more epoch image tiles failed to load.");
    if (ui.blinkBtnText) ui.blinkBtnText.textContent = "Blink (Error)";
    return;
  }

  appState.isBlinking = true;
  appState.blinkFlip = false;

  if (ui.btnBlink) {
    ui.btnBlink.classList.add("blinking");
  }
  if (ui.blinkBtnText) {
    ui.blinkBtnText.textContent = "Stop Blink";
  }

  const firstIdx = 0;
  const lastIdx = target.epochs.length - 1;

  appState.blinkTimerId = setInterval(() => {
    if (!appState.isBlinking) {
      clearInterval(appState.blinkTimerId);
      appState.blinkTimerId = null;
      return;
    }

    const nextIdx = appState.blinkFlip ? firstIdx : lastIdx;
    const nextUrl = target.epochs[nextIdx].image_url;

    // Gated flip
    const cached = appState.preloadedImages.get(nextUrl);
    if (!cached || !cached.complete || cached.naturalWidth === 0) {
      return;
    }

    appState.blinkFlip = !appState.blinkFlip;
    setEpoch(nextIdx);
  }, 500);
}

function stopBlink() {
  appState.isBlinking = false;
  appState.isLoadingBlink = false;

  if (appState.blinkTimerId) {
    clearInterval(appState.blinkTimerId);
    appState.blinkTimerId = null;
  }

  if (ui.btnBlink) {
    ui.btnBlink.classList.remove("blinking");
    ui.btnBlink.disabled = appState.activeTarget?.epochs?.length < 2;
    if (ui.blinkBtnText) {
      ui.blinkBtnText.textContent = appState.activeTarget?.epochs?.length < 2 ? "Blink (Needs 2+ Epochs)" : "Blink Comparator";
    }
  }
}

// =========================================================================
// 9. WAVELENGTH BAND SWITCHING (STRICTLY ON CURRENT TARGET)
// =========================================================================
function setBand(bandNumber, bandUm) {
  const target = appState.activeTarget;
  if (!target) return;

  const bNum = Number(bandNumber);
  const availableBands = target.available_bands || [];

  if (!availableBands.includes(bNum)) {
    return;
  }

  appState.bandNumber = bNum;
  appState.bandUm = Number(bandUm);

  const chips = ui.bandChipsContainer ? ui.bandChipsContainer.querySelectorAll(".band-chip") : [];
  chips.forEach(chip => {
    const isCurrent = Number(chip.getAttribute("data-band")) === bNum;
    chip.classList.toggle("active", isCurrent);
    chip.setAttribute("aria-checked", isCurrent ? "true" : "false");
  });

  if (target.bands && target.bands[bNum] && typeof target.bands[bNum].epoch_index === "number") {
    setEpoch(target.bands[bNum].epoch_index);
  } else {
    renderStage();
  }
}

// =========================================================================
// 10. EVENT LISTENERS & REAL CLICK BINDINGS
// =========================================================================
function bindUIEvents() {
  // 1. HUD Buttons (Marker & Crosshair)
  if (ui.toggleMarkerBtn) {
    ui.toggleMarkerBtn.addEventListener("click", () => {
      appState.showMarker = !appState.showMarker;
      ui.toggleMarkerBtn.classList.toggle("active", appState.showMarker);
      ui.toggleMarkerBtn.setAttribute("aria-pressed", appState.showMarker ? "true" : "false");
      renderStage();
    });
  }

  if (ui.toggleCrosshairBtn) {
    ui.toggleCrosshairBtn.addEventListener("click", () => {
      appState.showCrosshair = !appState.showCrosshair;
      ui.toggleCrosshairBtn.classList.toggle("active", appState.showCrosshair);
      ui.toggleCrosshairBtn.setAttribute("aria-pressed", appState.showCrosshair ? "true" : "false");
      if (ui.crosshairGrid) {
        ui.crosshairGrid.classList.toggle("active", appState.showCrosshair);
      }
    });
  }

  // 2. Target Select Dropdown
  if (ui.targetSelect) {
    ui.targetSelect.addEventListener("change", (e) => {
      stopBlink();
      clearSlewFeedback();
      appState.epochIndex = 0;
      loadTarget(e.target.value);
    });
  }

  // 3. Slew Viewport Button
  if (ui.btnSlew) {
    ui.btnSlew.addEventListener("click", () => {
      const ra = parseFloat(ui.raInput.value);
      const dec = parseFloat(ui.decInput.value);
      executeSlew(ra, dec);
    });
  }

  [ui.raInput, ui.decInput].forEach(inp => {
    if (inp) {
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          ui.btnSlew.click();
        }
      });
    }
  });

  // 4. Epoch Time Slider (1:1 tracking)
  if (ui.epochSlider) {
    ui.epochSlider.addEventListener("input", (e) => {
      if (appState.isBlinking) {
        stopBlink();
      }
      setEpoch(parseInt(e.target.value, 10));
    });
  }

  // 5. Blink Comparator Button
  if (ui.btnBlink) {
    ui.btnBlink.addEventListener("click", () => {
      toggleBlink();
    });
  }

  // 6. Gallery Cards Click & Keyboard Navigation
  ui.galleryCards.forEach(card => {
    const handleCardActivate = () => {
      const targetKey = card.getAttribute("data-target");
      const epochIndex = parseInt(card.getAttribute("data-epoch") || "0", 10);
      const bandAttr = card.getAttribute("data-band");
      const forcedBand = (bandAttr && bandAttr !== "default") ? parseInt(bandAttr, 10) : null;

      stopBlink();
      clearSlewFeedback();
      appState.epochIndex = epochIndex;

      loadTarget(targetKey, null, forcedBand).then(() => {
        if (epochIndex > 0) {
          setEpoch(epochIndex);
        }
        const viewerSection = document.getElementById("viewer");
        if (viewerSection) {
          viewerSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    };

    card.addEventListener("click", handleCardActivate);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCardActivate();
      }
    });
  });

  // 8. Error retry button
  if (ui.btnErrorRetry) {
    ui.btnErrorRetry.addEventListener("click", () => {
      ++appState.loadGeneration;
      hideViewerError();
      loadTarget("planet_x_field");
    });
  }
}

// =========================================================================
// 11. INITIALIZATION ON DOM READY
// =========================================================================
function initializeApp() {
  bindUIEvents();
  loadTarget("planet_x_field");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
