# SPECTRALx: SPHEREx Sky Explorer
> **NASA International Space Apps Challenge 2026**  
> **Challenge:** *"Planet X and SPHEREx"*  
> **Team:** PROJECT SPECTRALx  
> **Team Roles:**  
> - **Team Lead & Backend Engineer**: Python/Astropy, SPHEREx survey methodology, IRSA integration  
> - **Frontend Engineer & Astrometry**: Full-bleed sky viewer, Blink Comparator engine, time-slider  
> - **UI/UX & Design Systems Lead**: Apple Liquid Glass design tokens, accessibility, responsive ergonomics  

SPECTRALx is a public-facing, time-domain astronomical web explorer designed to visualize multi-epoch, multi-wavelength infrared data from NASA's SPHEREx mission. By comparing celestial observations across time with an interactive time-slider and high-speed Blink Comparator, users and citizen scientists can spot shifting trans-Neptunian bodies, Kuiper belt objects, cold brown dwarfs, and hypothetical Planet X candidates against stationary background stars.

---

## Combined Architecture Overview

```
PROJECT_SPECTRALX/
├── index.html                   # Semantic HTML5 single-page application
├── styles.css                   # Space theme engine with root CSS variables
├── app.js                       # Client logic: Time-slider, Blink Comparator, API client
├── server.py                    # Lightweight Python backend (REST API & static server)
├── backend/
│   ├── server.py                # Backend entry point (symlinked to ../server.py)
│   └── README.md                # Comprehensive backend and IRSA data documentation
├── assets/
│   └── images/                  # Real astronomical survey imagery (IRSA / Caltech / SPHEREx / Herschel)
│       ├── wavelength-annotated.webp   # Explainer strip with callouts
│       ├── wavelength-six-bands.webp   # Raw 6-channel detector array
│       ├── cluster-survey-cyan.jpg     # Star cluster observation (Epoch 1: 2025-04-15)
│       ├── cluster-survey-cyan-hires.jpg # High-resolution 2K star cluster observation (Epoch 1)
│       ├── cluster-survey-blue.jpg     # Star cluster observation (Epoch 2: 2026-02-14)
│       ├── cluster-survey-blue-hires.jpg # High-resolution 2K star cluster observation (Epoch 2)
│       ├── nebula-red-orange.jpg       # Star-forming emission nebula (Carina, Band 4)
│       ├── nebula-amber-dust.jpg       # Thermal dust cloud (Carina, Band 5)
│       ├── herschel-filaments.jpg      # Molecular cloud filamentary web (Band 6)
│       ├── milkyway-starfield.jpg      # Milky Way dense star field (Galactic Bulge, Band 2)
│       ├── milkyway-deepfield-hires.jpg# Deep galactic disk survey (Band 3)
│       ├── ngc1760-096um.webp          # NGC 1760 early SPHEREx band 1 (0.96 µm: S III)
│       ├── ngc1760-098um.webp          # NGC 1760 early SPHEREx band 2 (0.98 µm: continuum)
│       ├── ngc1760-329um.webp          # NGC 1760 early SPHEREx band 3 (3.29 µm: PAHs)
│       ├── spherex-allsky-stars.webp   # SPHEREx All Sky Map 2025: Stars and Galaxies (1.00 µm)
│       ├── spherex-allsky-dust.webp    # SPHEREx All Sky Map 2025: Dust and Gas (4.80 µm)
│       ├── cygnus-stars-dust-44.jpg    # SPHEREx Cygnus stars and dust survey (AvmImage 44)
│       └── cygnus-interstellar-ice-43.jpg # SPHEREx interstellar ice absorption survey (AvmImage 43)
├── scripts/
│   ├── self-check.sh            # Automated project quality validator & auto-fixer
│   ├── verify_behavior.py       # Pixel-level scientific & behavioral validation engine
│   └── test-all.sh              # Single-command unified test suite
├── .github/
│   └── workflows/
│       └── self-check.yml       # Automated CI workflow
├── SELF-CHECK-REPORT.md         # Generated health audit log
├── submission.md                # NASA Space Apps hackathon submission draft
└── README.md                    # Combined project documentation (this file)
```

---

## How the Pieces Fit Together

1. **Front End (`index.html`, `styles.css`, `app.js`)**:
   - Zero-dependency client running pure semantic HTML5, CSS3, and ES6 JavaScript.
   - Designed with an edge-to-edge dark space visual system where astronomical survey imagery takes center stage.
   - High-fidelity time-domain slider, load-gated Blink Comparator, and 15-card astronomical image library.
   - Operates in live API mode when connected to the backend, and automatically engages a verified local dataset fallback mode when offline (zero error badge, zero broken layout).

2. **Backend Server Pipeline (`server.py`)**:
   - Lightweight, dependency-free Python microservice built using the Python standard library.
   - Ingests and references SPHEREx mission data archived at the Caltech / IPAC Infrared Science Archive (IRSA).
   - Validates celestial coordinates, computes great-circle angular distances, and streams observational epochs.
   - Includes `/static/tiles/` tile proxy and full Cross-Origin Resource Sharing (CORS).

3. **API Contract (`GET /api/sky-view?ra={ra}&dec={dec}`)**:
   - Query coordinates using Right Ascension and Declination:
     ```http
     GET /api/sky-view?ra=156.09&dec=-41.64
     ```
   - Schema compliant JSON response:
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
   - Out-of-survey coordinates return clean HTTP 404 JSON.

---

## How to Run Locally

### Combined Frontend + Backend (Recommended)
Run the Python backend server:
```bash
python3 server.py --port 3000
```
Then open your browser to [http://localhost:3000](http://localhost:3000). The single process serves the full frontend application and responds to live `/api/sky-view` REST calls.

### Standalone Frontend Mode
Because the front end incorporates a resilient fallback architecture, you can also host or open the static files directly:
```bash
python3 -m http.server 8000
```
Or open `index.html` directly in any web browser.

---

## Free Cloud Deployment Guide

### Deploying the Backend API & Full Stack
1. **Render (Free Web Service)**:
   - Connect repository to Render.
   - Environment: Python 3
   - Build Command: `echo 'Build complete'`
   - Start Command: `python3 server.py --port $PORT`
2. **Fly.io**:
   - Run `fly launch` followed by `fly deploy`.
3. **Pointing Frontend to External Backend**:
   - If hosting the frontend on GitHub Pages or Netlify separately, update `const API_BASE_URL` in `app.js` with your production API URL (e.g. `https://spectralx.onrender.com`).

### Deploying the Frontend Statically (GitHub Pages)
1. Push repository to GitHub.
2. In GitHub repository settings, navigate to **Settings** &rarr; **Pages**.
3. Select `main` branch and `/ (root)` folder.
4. Click **Save**.

---

## Unified Test Suite

Execute the single-command validation suite:
```bash
./scripts/test-all.sh
```
Or run the behavioral validator directly:
```bash
python3 scripts/verify_behavior.py
```

---

## Acknowledgments & Data Credits
- **NASA SPHEREx Mission**: Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer (`https://science.nasa.gov/mission/spherex/`).
- **NASA / IPAC Infrared Science Archive (IRSA)** at the California Institute of Technology (`https://irsa.ipac.caltech.edu/Missions/spherex.html`).
- **SPHEREx Science Team & Data Products**: `https://spherex.caltech.edu/page/data-products`.
- **ESA Herschel Space Observatory** and **NASA / JPL-Caltech**.
- **NASA International Space Apps Challenge 2026**: `https://github.com/nasa/spaceapps`.
