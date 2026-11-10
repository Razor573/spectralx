# PROJECT SPECTRALx Backend API & Data Pipeline

## Overview
The SPECTRALx backend microservice is a high-concurrency, lightweight Python service designed to stream multi-epoch, multi-wavelength infrared data products from NASA's SPHEREx mission (archived at Caltech / IPAC Infrared Science Archive - IRSA).

It implements the REST API specification:
`GET /api/sky-view?ra={ra}&dec={dec}`
alongside health diagnostics, target catalogs, and tile delivery with full CORS support.

---

## Live IRSA SPHEREx TAP Integration & Data Pipeline

### Programmatic Upstream Service
1. **Caltech IRSA SPHEREx TAP Service**:
   - Endpoint: `https://irsa.ipac.caltech.edu/TAP/sync`
   - Table: `spherex.obscore` (IVOA ObsCore data model for SPHEREx products)
   - Protocol: IVOA Table Access Protocol (TAP) with Astronomical Data Query Language (ADQL)
   - Coverage: Quick Release 2 (QR2, October 2025) and Quick Release 3 (QR3, September 2026)

2. **How the Live Query Works**:
   - For every request to `GET /api/sky-view?ra={ra}&dec={dec}`, the server first attempts a live cone search query against `spherex.obscore`:
     ```sql
     SELECT TOP 10 obs_id, s_ra, s_dec, access_url, t_min, t_max, em_min, em_max
     FROM spherex.obscore
     WHERE 1=CONTAINS(POINT('ICRS',s_ra,s_dec),CIRCLE('ICRS',ra,dec,5.0))
     ORDER BY t_min ASC
     ```
   - If IRSA returns matching observation records, the service translates MJD observation dates (`t_min`) to UTC calendar epochs and spectral ranges (`em_min`, `em_max`) to SPHEREx band numbers (1-6).
   - Responses are cached on disk at `assets/cache/irsa/` so repeat requests execute instantly without repeated upstream latency.

3. **Resilient Local Fallback Engine**:
   - If the upstream IRSA TAP service is unreachable, network access is severed, or the requested coordinates fall outside current quick-release footprints, the service falls back silently to the local high-fidelity dataset.
   - The frontend experiences zero downtime, zero layout breakages, and zero error badges.

4. **High-Resolution Desktop Hero Support**:
   - Every band and epoch object returned by the API carries an explicit `image_url_hires` field (e.g. `assets/images/cluster-survey-cyan-hires.jpg` and `assets/images/cluster-survey-blue-hires.jpg` for Planet X).
   - At desktop viewports (1440px and 1920px), the frontend serves crisp 2048w assets via responsive `srcset`.

---

## SPHEREx Mission References

1. **IRSA Mission Archive**:
   - Quick Release 2 (QR2) and Quick Release 3 (QR3) public releases.
   - Direct AWS S3 access and FITS cutout service.
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
      "image_url": "assets/images/cluster-survey-cyan.jpg",
      "image_url_hires": "assets/images/cluster-survey-cyan-hires.jpg",
      "marker_pos": { "x": 47.0, "y": 42.4 }
    },
    {
      "date": "2026-02-14",
      "band_um": 1.4,
      "band_number": 2,
      "image_url": "assets/images/cluster-survey-blue.jpg",
      "image_url_hires": "assets/images/cluster-survey-blue-hires.jpg",
      "marker_pos": { "x": 54.6, "y": 34.7 }
    }
  ],
  "bands": {
    "1": {
      "um": 1.0,
      "label": "Band 1 (1.0 µm)",
      "image_url": "assets/images/cluster-survey-cyan.jpg",
      "image_url_hires": "assets/images/cluster-survey-cyan-hires.jpg"
    },
    "2": {
      "um": 1.4,
      "label": "Band 2 (1.4 µm)",
      "image_url": "assets/images/cluster-survey-blue.jpg",
      "image_url_hires": "assets/images/cluster-survey-blue-hires.jpg"
    }
  },
  "survey_provenance": {
    "source": "NASA/IPAC Infrared Science Archive (IRSA) Live TAP Service",
    "service_endpoint": "https://irsa.ipac.caltech.edu/TAP/sync",
    "query_table": "spherex.obscore",
    "data_release": "Quick Release 2 (QR2 / QR3)",
    "live_query": true,
    "upstream_records_count": 5
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

### 3. `GET /api/targets`
Retrieves the complete catalog of verified celestial survey targets (8 fields).

---

## Dependencies & Installation

Install dependencies using `requirements.txt`:
```bash
pip install -r requirements.txt
```

**Dependencies (`requirements.txt`):**
- `astropy>=5.0.0`: Astronomical FITS parsing, WCS transformations, and MJD time conversions.
- `numpy>=1.20.0`: Fast multi-dimensional array operations and percentile normalization.
- `pillow>=9.0.0`: Image processing and high-fidelity JPEG/PNG conversion.

---

## Local Execution

Start the unified server (handles both REST API and static frontend):
```bash
python3 server.py --port 3000
```
Open `http://localhost:3000` in your web browser.
