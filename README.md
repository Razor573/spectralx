# SPECTRALx: SPHEREx Sky Explorer
> **NASA International Space Apps Challenge 2026**  
> **Challenge:** *"Planet X and SPHEREx"*  
> **Team:** PROJECT SPECTRALx  
> **Team Members:**  
> - **Ghazanfar Kalhoro (Kabi)**: Team Lead & Backend Engineer (Python/Astropy, SPHEREx survey methodology, IRSA integration)  
> - **Vagif Novruzov**: Frontend Engineer & Astrometry (Full-bleed sky viewer, Blink Comparator engine, time-slider)  
> - **Loudjeine Boussalem (Sylveon)**: UI/UX & Design Systems Lead (Apple Liquid Glass design tokens, accessibility, responsive ergonomics)  

SPECTRALx is a public-facing, time-domain astronomical web explorer designed to visualize multi-epoch, multi-wavelength infrared data from NASA's SPHEREx mission. By comparing celestial observations across time with an interactive time-slider and high-speed Blink Comparator, users and citizen scientists can spot shifting trans-Neptunian bodies, Kuiper belt objects, cold brown dwarfs, and hypothetical Planet X candidates against stationary background stars.

---

## Architecture Overview

```
PROJECT_SPECTRALX/
├── index.html                   # Semantic HTML5 single-page application
├── styles.css                   # Space theme engine with root CSS variables
├── app.js                       # Client logic: Time-slider, Blink Comparator, API client
├── assets/
│   └── images/                  # Real astronomical survey imagery (IRSA / Caltech / SPHEREx / Herschel)
│       ├── wavelength-annotated.webp   # Explainer strip with callouts
│       ├── wavelength-six-bands.webp   # Raw 6-channel detector array
│       ├── cluster-survey-cyan.jpg     # Star cluster observation (Epoch 1: 2025-04-15)
│       ├── cluster-survey-blue.jpg     # Star cluster observation (Epoch 2: 2026-02-14)
│       ├── nebula-red-orange.jpg       # Star-forming emission nebula
│       ├── nebula-amber-dust.jpg       # Thermal dust cloud
│       ├── herschel-filaments.jpg      # Molecular cloud filamentary web
│       ├── milkyway-starfield.jpg      # Milky Way dense star field
│       ├── milkyway-deepfield-hires.jpg# Deep galactic disk survey
│       ├── ngc1760-096um.webp          # NGC 1760 early SPHEREx band 1 (0.96 µm: ionized sulfur S III)
│       ├── ngc1760-098um.webp          # NGC 1760 early SPHEREx band 2 (0.98 µm: stellar continuum)
│       ├── ngc1760-329um.webp          # NGC 1760 early SPHEREx band 3 (3.29 µm: carbon dust PAHs)
│       ├── spherex-allsky-stars.webp   # SPHEREx All Sky Map 2025: Stars and Galaxies (1.00 µm)
│       └── spherex-allsky-dust.webp    # SPHEREx All Sky Map 2025: Dust and Gas (4.80 µm)
├── scripts/
│   └── self-check.sh            # Automated project quality validator & auto-fixer
├── .github/
│   └── workflows/
│       └── self-check.yml       # Daily GitHub Actions automated CI cron
├── SELF-CHECK-REPORT.md         # Generated health audit log
├── submission.md                # NASA Space Apps hackathon submission draft
└── README.md                    # Project documentation (this file)
```

---

## How the Pieces Fit Together

1. **Front End (`index.html`, `styles.css`, `app.js`)**:
   - Zero-dependency static client.
   - Designed with an immersive dark space aesthetic where celestial imagery takes center stage.
   - All colors, fonts, and dimensions are parameterized as CSS variables in `:root` inside `styles.css` for easy theme iteration.
2. **Backend Server Pipeline (Python/Astropy)**:
   - Built by our teammate to ingest raw Level-2 and Level-3 FITS files from the NASA/IPAC Infrared Science Archive (IRSA) at Caltech.
   - Handles background subtraction, flux non-linear stretching (`asinh`), and WCS coordinate registration to generate web-ready tiles.
3. **API Contract (`/api/sky-view`)**:
   - SPECTRALx is built **API-first** with an automated **fallback mode**.
   - Set `API_BASE_URL` at line 17 of `app.js` (e.g. `https://api.spectralx.space`).
   - The front end queries:
     ```http
     GET /api/sky-view?ra={ra_deg}&dec={dec_deg}
     ```
   - Expected JSON schema:
     ```json
     {
       "ra": 156.09,
       "dec": -41.64,
       "target_name": "Planet X Search Field",
       "fov_deg": "3.5° × 3.5°",
       "has_moving_candidate": true,
       "epochs": [
         {
           "date": "2025-06-01",
           "band_um": 1.0,
           "image_url": "/static/tiles/epoch1.png",
           "marker_pos": { "x": 48.0, "y": 52.0 }
         },
         {
           "date": "2025-09-15",
           "band_um": 1.0,
           "image_url": "/static/tiles/epoch2.png",
           "marker_pos": { "x": 51.5, "y": 49.0 }
         }
       ]
     }
     ```
   - **Standalone Fallback:** If `API_BASE_URL` is empty or the network request fails, SPECTRALx automatically activates its built-in fallback dataset using the assets in `assets/images/`.

---

## How to Run Locally

Because SPECTRALx uses pure web standards with zero dependencies, you can run it with any standard HTTP server:

### Option 1: Python HTTP Server (Recommended)
```bash
# In the project directory:
python3 -m http.server 8000
```
Then open your browser to [http://localhost:8000](http://localhost:8000).

### Option 2: Node.js (npx serve)
```bash
npx serve .
```

### Option 3: Direct File Opening
Double click `index.html` in your file explorer or open it directly in Chrome, Firefox, Safari, or Edge.

---

## Free Deployment Guide

### Deploy to GitHub Pages (2 Minutes)
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of PROJECT SPECTRALx"
   ```
2. Create a repository on GitHub and push:
   ```bash
   git remote add origin https://github.com/[YOUR-USERNAME]/[YOUR-REPO].git
   git branch -M main
   git push -u origin main
   ```
3. In your GitHub repository:
   - Navigate to **Settings** &rarr; **Pages**.
   - Under **Build and deployment** &rarr; **Branch**, select `main` branch and `/ (root)` folder.
   - Click **Save**. Your site will be live at `https://[YOUR-USERNAME].github.io/[YOUR-REPO]/`.

### Deploy to Netlify (1 Minute)
1. Sign in to [Netlify](https://netlify.com).
2. Drag and drop the `PROJECT_SPECTRALX` folder directly into the Netlify dashboard.
3. Your live production URL is generated instantly.

---

## Automated Self-Check QA

Run the automated self-check script anytime:
```bash
./scripts/self-check.sh
```
This script audits JS syntax, API contracts, image links, and accessibility, auto-fixes common path mistakes across up to 3 passes, and logs results to `SELF-CHECK-REPORT.md`. A daily GitHub Actions workflow (`.github/workflows/self-check.yml`) keeps the repository continuously verified.

---

## Acknowledgments & Data Credits
- **NASA SPHEREx Mission**: Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer.
- **NASA / IPAC Infrared Science Archive (IRSA)** at the California Institute of Technology.
- **ESA Herschel Space Observatory** and **NASA / JPL-Caltech**.
- **NASA International Space Apps Challenge 2026**.
