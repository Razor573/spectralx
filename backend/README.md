# PROJECT SPECTRALx Backend API & Data Pipeline

## Overview
The SPECTRALx backend microservice is a high-concurrency, lightweight Python service designed to stream multi-epoch, multi-wavelength infrared data products from NASA's SPHEREx mission (archived at Caltech / IPAC Infrared Science Archive - IRSA).

It implements the REST API specification:
`GET /api/sky-view?ra={ra}&dec={dec}`
alongside health diagnostics, target catalogs, and tile delivery with full CORS support.

---

## SPHEREx Science & IRSA Archive Architecture

### Data Provenance
1. **Caltech IRSA SPHEREx Mission Archive**:
   - Quick Release 2 (QR2, October 2025) and Quick Release 3 (QR3, September 2026).
   - High-throughput AWS S3 direct data access and FITS cutout service.
   - Reference: `https://irsa.ipac.caltech.edu/Missions/spherex.html`

2. **SPHEREx Data Products Schedule**:
   - Level-2 Calibrated Spectral Images delivered within 2 months of observation.
   - Level-3 All-Sky Data Cubes release scheduled for November 2026.
   - Level-4 Source Catalog release scheduled for August 2027.
   - Reference: `https://spherex.caltech.edu/page/data-products`

3. **6-Band Focal Plane Model & Band Pairing**:
   - SPHEREx utilizes 6 distinct Linear Variable Filter (LVF) detector arrays spanning 0.75 to 5.00 µm.
   - Paired beam-splitter optical layout:
     - Band Pair 1: Band 1 (0.75 - 1.11 µm) & Band 4 (2.42 - 3.82 µm)
     - Band Pair 2: Band 2 (1.11 - 1.64 µm) & Band 5 (3.82 - 4.42 µm)
     - Band Pair 3: Band 3 (1.64 - 2.42 µm) & Band 6 (4.42 - 5.00 µm)
   - Reference: `https://irsa.ipac.caltech.edu/onlinehelp/spherex/spherex/overview.html`

---

## API Endpoints Reference

### 1. `GET /api/sky-view?ra={ra}&dec={dec}`
Queries the SPHEREx survey archive for infrared observations covering the requested coordinates.

**Query Parameters:**
- `ra` (float, required): Right Ascension in decimal degrees [0.0, 360.0].
- `dec` (float, required): Declination in decimal degrees [-90.0, +90.0].

**Success Response (200 OK):**
```json
{
  "ra": 156.09,
  "dec": -41.64,
  "target_name": "Planet X Candidate Field (2 Epochs)",
  "fov_deg": "3.5° × 3.5°",
  "has_moving_candidate": true,
  "available_bands": [1, 2],
  "default_band": 1,
  "epochs": [
    {
      "date": "2025-04-15",
      "band_um": 1.0,
      "band_number": 1,
      "image_url": "assets/images/cluster-survey-cyan.jpg"
    },
    {
      "date": "2026-02-14",
      "band_um": 1.4,
      "band_number": 2,
      "image_url": "assets/images/cluster-survey-blue.jpg"
    }
  ],
  "bands": {
    "1": { "um": 1.0, "label": "Band 1 (1.0 µm)", "image_url": "assets/images/cluster-survey-cyan.jpg" },
    "2": { "um": 1.4, "label": "Band 2 (1.4 µm)", "image_url": "assets/images/cluster-survey-blue.jpg" }
  }
}
```

**Out-of-Survey Coordinates Response (404 Not Found):**
```json
{
  "error": "Coordinate field not covered in SPHEREx QR2 survey archive",
  "ra": 12.34,
  "dec": 56.78,
  "closest_field_distance_deg": 48.21,
  "suggestion": "Select a verified target from /api/targets or slew to known coordinates (e.g. RA 156.09, Dec -41.64)."
}
```

**Invalid Parameter Response (400 Bad Request):**
```json
{
  "error": "Coordinates out of bounds. 'ra' must be within [0, 360] and 'dec' within [-90, +90].",
  "ra": 450.0,
  "dec": -120.0
}
```

### 2. `GET /api/health`
Service health check and telemetry.
```json
{
  "status": "healthy",
  "service": "PROJECT SPECTRALx SPHEREx Sky Explorer API",
  "version": "2.0.0",
  "mission": "NASA SPHEREx",
  "archive": "NASA/IPAC Infrared Science Archive (IRSA) QR2",
  "band_coverage_um": "0.75 - 5.00"
}
```

### 3. `GET /api/targets`
Retrieves the complete catalog of verified celestial survey targets.

---

## Local Development & Execution

Run with Python 3.8+ (standard library only, zero external dependencies required):
```bash
# Start backend server on default port 3000
python3 server.py

# Or start with custom port
python3 server.py --port 8000
```

---

## Free Cloud Deployment Options

### Option 1: Render (Free Web Service)
1. Fork or push repository to GitHub.
2. In Render dashboard, click **New > Web Service**.
3. Settings:
   - **Environment**: Python 3
   - **Build Command**: `echo 'Ready'`
   - **Start Command**: `python3 server.py --port $PORT`
4. Copy the assigned URL (e.g., `https://spectralx.onrender.com`) and paste into `API_BASE_URL` in `app.js` if running frontend on a separate host.

### Option 2: Fly.io
```bash
fly launch --name spectralx-api
fly deploy
```

### Option 3: Vercel / Netlify (Serverless Python Function)
Point the rewrites in `vercel.json` to `api/sky-view` or deploy the integrated frontend-backend bundle.
