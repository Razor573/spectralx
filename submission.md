# NASA Space Apps Challenge 2026 Submission

**Project Title:** SPECTRALx: SPHEREx Sky Explorer  
**Challenge:** Planet X and SPHEREx  
**Team Name:** PROJECT SPECTRALx  
**Team Members:** Ghazanfar Kalhoro (Kabi, Team Lead & Backend Engineer), Vagif Novruzov (Frontend Engineer & Astrometry), Loudjeine Boussalem (Sylveon, UI/UX & Design Systems Lead)  
**Live Application Demo:** `[LIVE_DEMO_URL - e.g., https://your-team.github.io/spectralx/]`  
**Public Code Repository:** `[GITHUB_REPOSITORY_URL - e.g., https://github.com/your-team/spectralx]`  

---

## 1. Project Summary
SPECTRALx is an interactive time-domain web explorer that visualizes multi-epoch infrared sky surveys from NASA's SPHEREx mission. By allowing users to scrub between observation dates and engage a high-speed Blink Comparator, the tool makes objects that move over time (such as hypothetical Planet X candidates, trans-Neptunian bodies, and cold brown dwarfs) immediately leap out against fixed background stars. The application requires no software installation, running directly in any modern web browser to connect citizen scientists and professional astronomers with massive all-sky survey data.

---

## 2. The Problem We Address
NASA's SPHEREx mission maps the entire celestial sphere across 102 near-infrared spectral bands (0.75 to 5.0 µm) multiple times over its mission lifetime. While this creates a goldmine of time-domain astrophysics data, the sheer volume of data is stored in complex, multi-gigabyte scientific FITS (Flexible Image Transport System) files that cannot be opened on ordinary devices or web browsers.

Without specialized tools, exploring whether a faint signal is a stationary distant star or a moving solar system body requires specialized programming scripts, high-bandwidth downloads, and complex image alignment. This steep barrier prevents citizen scientists, students, and educators from participating in one of the most exciting astronomical hunts of our era: finding undiscovered worlds in the outer Solar System.

---

## 3. How We Use NASA Open Data & Real SPHEREx Sources
Our platform integrates directly with authoritative NASA and Caltech / IPAC data resources:

1. **NASA / IPAC Infrared Science Archive (IRSA) SPHEREx Mission Archive**:
   - `https://irsa.ipac.caltech.edu/Missions/spherex.html`
   - Ingests Level-2 calibrated spectral image cubes and Level-3 all-sky coadded survey data across Quick Release 2 (QR2, Oct 2025) and Quick Release 3 (QR3, Sep 2026).
   - High-throughput AWS S3 direct data access and FITS cutout service integration.

2. **SPHEREx Data Products Schedule**:
   - `https://spherex.caltech.edu/page/data-products`
   - Level-2 Calibrated Spectral Images delivered within 2 months of observation.
   - Level-3 All-Sky Data Cubes release scheduled for November 2026.
   - Level-4 Source Catalog release scheduled for August 2027.

3. **IRSA SPHEREx Data Explorer & Optical Instrument Model**:
   - `https://irsa.ipac.caltech.edu/onlinehelp/spherex/spherex/overview.html`
   - Implements the 6-band Linear Variable Filter (LVF) detector array model and optical beam-splitter pairing:
     - Band Pair 1: Band 1 (0.75 - 1.11 µm) and Band 4 (2.42 - 3.82 µm)
     - Band Pair 2: Band 2 (1.11 - 1.64 µm) and Band 5 (3.82 - 4.42 µm)
     - Band Pair 3: Band 3 (1.64 - 2.42 µm) and Band 6 (4.42 - 5.00 µm)

4. **SPHEREx Observatory Scientific Imagery**:
   - AvmImage 44 (`cygnus-stars-dust-44.jpg`): High-resolution infrared mapping of stars and warm interstellar dust across the Cygnus complex.
   - AvmImage 43 (`cygnus-interstellar-ice-43.jpg`): Spectroscopic mapping of interstellar water ice (3.0 µm) and carbon ice absorption bands in the Milky Way.

5. **NASA SPHEREx Mission Core & Space Apps Challenge**:
   - NASA SPHEREx Mission: `https://science.nasa.gov/mission/spherex/`
   - NASA Space Apps Challenge Archive: `https://github.com/nasa/spaceapps`

---

## 4. What We Built
PROJECT SPECTRALx is an integrated, full-stack open science architecture consisting of two complementary components:

1. **Lightweight Python Backend Microservice (`server.py`)**:
   - Built with Python 3 standard library (zero third-party dependencies required to execute).
   - Exposes REST API endpoint `GET /api/sky-view?ra={ra}&dec={dec}` returning JSON metadata, observational epochs, and tile references.
   - Implements astrometric coordinate validation, great-circle angular distance resolution, and graceful HTTP 404 responses for out-of-survey fields.
   - Provides `/api/health` diagnostics and `/api/targets` catalog.
   - Full Cross-Origin Resource Sharing (CORS) support and `/static/tiles/` tile proxy.

2. **Zero-Dependency Sky Explorer Client (Front End)**:
   - Modern, edge-to-edge dark space interface built with semantic HTML5, CSS3, and ES6 JavaScript.
   - **Full-Bleed Sky Viewer:** Responsive viewport with dynamic srcset serving native 2048x1152 high-resolution tiles on 1440px and 1920px displays.
   - **Interactive Time-Slider:** Smooth 1:1 pointer tracking scrubbing through observation epochs.
   - **Blink Comparator Engine:** Rapid toggle between survey epochs with image load-gating and 10-second timeout protection.
   - **Dynamic Wavelength Band Chips:** Single-line filter selector tailored to available bands per target (0.75 to 5.0 µm).
   - **15-Card Astronomical Image Library:** Interactive gallery featuring Planet X search fields, Carina Nebula, NGC 1760 (Bands 1-3), Galactic Bulge, All-Sky surveys, Herschel filaments, 6-band detector mosaic, and Cygnus complex (AvmImages 43 & 44).
   - **Resilient Fallback Mode:** Seamless local dataset fallback when the backend service is offline, with zero error banners or disrupted layouts.

---

## 5. Who It Helps & Why It Matters
- **Citizen Scientists & Enthusiasts:** Democratizes access to multi-billion-pixel NASA data without needing expensive computing hardware or specialized software.
- **Planetary Scientists & Observers:** Provides a rapid, zero-latency visual verification tool for vetting moving target candidates flagged by automated detection algorithms.
- **STEM Educators & Students:** Serves as an interactive educational laboratory for teaching spectroscopy, infrared astronomy, and the mechanics of planetary discovery.

---

## 6. What We Would Do With More Time
1. **Interactive Trajectory Calculator:** Automatic orbit fitting and velocity vectors directly calculated from user-identified candidate displacements across 3+ epochs.
2. **Citizen Flagging Database:** A decentralized database allowing registered users to bookmark candidate anomalies, comment on detections, and submit potential discoveries directly for professional follow-up.
3. **Spectral Energy Distribution (SED) Inspector:** An integrated charting engine plotting the 102-channel flux curve of any clicked pixel to distinguish cold brown dwarfs from rocky Kuiper Belt Objects.
4. **Machine Learning Pipeline Integration:** On-the-fly candidate suggestions powered by a lightweight convolutional neural network pre-trained on simulated SPHEREx transient injections.

---

## 7. Project Assets & Media
- **Primary Demonstration Video:** `[VIDEO_DEMO_URL - e.g., YouTube or Google Drive link]`
- **Presentation Slides:** `[SLIDES_LINK - e.g., Google Slides or PDF link]`
- **Data Credit:** NASA / JPL-Caltech / IRSA.
