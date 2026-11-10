# NASA Space Apps Challenge 2026 Submission

**Project Title:** SPECTRALx: SPHEREx Sky Explorer  
**Challenge:** Planet X and SPHEREx  
**Team Name:** PROJECT SPECTRALx  
**Team Members:** Ghazanfar Kalhoro (Kabi, Team Lead & Backend Engineer), Vagif Novruzov (Frontend Engineer & Astrometry), Loudjeine Boussalem (Sylveon, UI/UX & Design Systems Lead)  
**Live Application Demo:** `[LIVE_DEMO_URL - e.g., https://your-team.github.io/spectralx/]`  
**Public Code Repository:** `[GITHUB_REPOSITORY_URL - e.g., https://github.com/your-team/spectralx]`  

---

## 1. Project Summary
SPECTRALx is an interactive time-domain web explorer that visualizes multi-epoch infrared sky surveys from NASA's SPHEREx mission. By allowing users to scrub between observation dates and engage a high-speed Blink Comparator, the tool makes objects that move over time (such as hypothetical Planet X candidates, trans-Neptunian bodies, and cold brown dwarfs) immediately leap out against fixed background stars. The application requires no software installation, running directly in any web browser to connect citizen scientists and professional astronomers with massive all-sky survey data.

---

## 2. The Problem We Address
NASA's SPHEREx mission maps the entire celestial sphere across 102 near-infrared spectral bands (0.75 to 5.0 &mu;m) multiple times over its mission lifetime. While this creates a goldmine of time-domain astrophysics data, the sheer volume of data is stored in complex, multi-gigabyte scientific FITS (Flexible Image Transport System) files that cannot be opened on ordinary devices or web browsers. 

Without specialized tools, exploring whether a faint signal is a stationary distant star or a moving solar system body requires specialized programming scripts, high-bandwidth downloads, and complex image alignment. This steep barrier prevents citizen scientists, students, and educators from participating in one of the most exciting astronomical hunts of our era: finding undiscovered worlds in the outer Solar System.

---

## 3. How We Use NASA Open Data
Our platform relies directly on open scientific data from NASA's **SPHEREx** mission archived through the **NASA/IPAC Infrared Science Archive (IRSA)** at Caltech. 

Specifically, our system:
- Ingests Level-2 calibrated spectral image cubes and Level-3 all-sky coadded survey data across the full 0.75 &mu;m &ndash; 5.0 &mu;m range.
- References the World Coordinate System (WCS) headers to accurately map Right Ascension (RA) and Declination (Dec) coordinates.
- Cross-references time-stamped observation epochs to track proper motion, parallax, and orbital displacement across successive survey scans.

---

## 4. What We Built
PROJECT SPECTRALx is an end-to-end open science architecture consisting of two complementary components:

1. **Server-Side Astropy Processing Pipeline (Backend)**:
   - A Python microservice built with **Astropy**, **NumPy**, and **Photutils**.
   - Downloads SPHEREx FITS cubes from the Caltech IRSA archive, executes sky background subtraction, applies non-linear `asinh` flux stretching, and aligns multi-epoch frames to sub-pixel accuracy.
   - Converts scientific arrays into lightweight, high-dynamic-range web tiles served via the clean `GET /api/sky-view?ra={ra}&dec={dec}` REST endpoint.

2. **Zero-Dependency Sky Explorer Client (Front End)**:
   - A modern, dark space UI built with pure semantic HTML5, CSS3, and ES6 JavaScript.
   - **Interactive Time-Slider:** Lets users scrub through observational epochs with immediate visual feedback.
   - **Blink Comparator:** An automated 500ms flipper that rapidly toggles between observation epochs, utilizing human visual motion-detection to spot shifting targets instantaneously.
   - **SPHEREx 6-Band Selector:** Interactive filter pills allowing users to view celestial targets across representative near-infrared wavelengths (0.75 to 5.0 &mu;m).
   - **Annotated Spectral Strip & Image Library:** Highlights key astronomical phenomena (Helium airglow, circumstellar dust, distant redshifted galaxies) with click-to-load navigation.
   - **Resilient Fallback Mode:** Built-in high-fidelity astronomical dataset enabling full offline operation and instant demoing without requiring a running backend.

---

## 5. Who It Helps & Why It Matters
- **Citizen Scientists & Enthusiasts:** Democratizes access to multi-billion-pixel NASA data without needing expensive computing hardware or specialized software.
- **Planetary Scientists & Observers:** Provides a rapid, zero-latency visual verification tool for vetting moving target candidates flagged by automated detection algorithms.
- **STEM Educators & Students:** Serves as an interactive educational laboratory for teaching spectroscopy, infrared astronomy, and the mechanics of planetary discovery.

---

## 6. What We Would Do With More Time
If given additional time and development runway, we would expand PROJECT SPECTRALx with:
1. **Interactive Trajectory Calculator:** Automatic orbit fitting and velocity vectors directly calculated from user-identified candidate displacements across 3+ epochs.
2. **Citizen Flagging Database:** A decentralized database allowing registered users to bookmark candidate anomalies, comment on detections, and submit potential discoveries directly for professional follow-up.
3. **Spectral Energy Distribution (SED) Inspector:** An integrated mini-charting engine plotting the 102-channel flux curve of any clicked pixel to distinguish cold brown dwarfs from rocky Kuiper Belt Objects.
4. **Machine Learning Pipeline Integration:** On-the-fly candidate suggestions powered by a lightweight convolutional neural network (CNN) pre-trained on simulated SPHEREx transient injections.

---

## 7. Project Assets & Media
- **Primary Demonstration Video:** `[VIDEO_DEMO_URL - e.g., YouTube or Google Drive link]`
- **Presentation Slides:** `[SLIDES_LINK - e.g., Google Slides or PDF link]`
- **Data Credit:** NASA / JPL-Caltech / IRSA.
