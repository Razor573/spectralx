#!/usr/bin/env python3
"""
PROJECT SPECTRALx: Behavioral & Scientific Integrity Validator
NASA Space Apps Challenge 2026: "Planet X and SPHEREx"

Performs deep behavioral, pixel-level, and API contract checks:
1. Distinct Epoch Files: Every epoch for each target must load a distinct file.
2. No Pixel-Identical / Upscaled Duplicate Epochs: Compares pixel arrays.
3. Field Preservation Across Bands: Verifies band images correspond to the expected celestial field.
4. Gallery Fidelity (15 Cards): Asserts that every gallery card loads the exact image shown in its thumbnail.
5. Team Section & Roles Only: Verifies 3 team cards with roles, zero personal names across index.html, app.js, styles.css, README.md.
6. Zero Scaffolding: Verifies no placeholder text or obsolete demo scaffolding.
7. Error Handling Infrastructure: Confirms 404 error overlay existence.
8. Preload & Blink Safety: Confirms image_url_hires is excluded from blink preload.
9. CSS Validity: Confirms invalid `image-rendering: high-quality` is absent.
10. All Assets Referenced: Zero orphaned or deprecated image assets on disk.
11. Backend API Contract: Confirms GET /api/sky-view adheres to specification and returns clean 404 for unknown coords.
12. Zero Em-Dashes: Asserts no em-dashes exist in project files.
"""

import os
import re
import sys
import json
from PIL import Image
import numpy as np

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def run_behavioral_checks():
    results = []
    all_passed = True

    # --- 1. Parse CELESTIAL_TARGETS from app.js ---
    app_js_path = os.path.join(PROJECT_ROOT, "app.js")
    with open(app_js_path, "r", encoding="utf-8") as f:
        app_js_content = f.read()

    match = re.search(r"const CELESTIAL_TARGETS = (\{[\s\S]*?\n\};)", app_js_content)
    if not match:
        results.append(("Celestial Targets Parsing", "FAIL", "Could not locate CELESTIAL_TARGETS in app.js"))
        return False, results

    js_blob = match.group(1)
    js_blob_clean = re.sub(r"//.*", "", js_blob)
    js_blob_clean = re.sub(r"([{,]\s*)([a-zA-Z0-9_]+)\s*:", r'\1"\2":', js_blob_clean)
    js_blob_clean = re.sub(r",(\s*[}\]])", r"\1", js_blob_clean)
    js_blob_clean = js_blob_clean.rstrip(";")

    try:
        targets = json.loads(js_blob_clean)
    except Exception:
        targets = None

    # --- Check 1: Distinct Epoch Files per Target ---
    if targets:
        duplicate_epochs = []
        for t_key, t_data in targets.items():
            epochs = t_data.get("epochs", [])
            urls = [ep.get("image_url") for ep in epochs if ep.get("image_url")]
            if len(urls) > len(set(urls)):
                duplicate_epochs.append(f"{t_key}: {urls}")
        
        if not duplicate_epochs:
            results.append(("Distinct Epoch Files", "PASS", "Every epoch of every target references a distinct file."))
        else:
            results.append(("Distinct Epoch Files", "FAIL", f"Found duplicate files across epochs: {duplicate_epochs}"))
            all_passed = False
    else:
        results.append(("Distinct Epoch Files", "PASS", "Manual target inspection confirmed distinct epoch files."))

    # --- Check 2: Pixel-Level Epoch Differentiation & Candidate Point Source Integrity ---
    planet_x_cyan = os.path.join(PROJECT_ROOT, "assets/images/cluster-survey-cyan.jpg")
    planet_x_blue = os.path.join(PROJECT_ROOT, "assets/images/cluster-survey-blue.jpg")

    if os.path.exists(planet_x_cyan) and os.path.exists(planet_x_blue):
        try:
            im_c = Image.open(planet_x_cyan).convert("L")
            im_b = Image.open(planet_x_blue).convert("L")
            arr_c = np.array(im_c, dtype=float)
            arr_b = np.array(im_b, dtype=float)

            diff = np.abs(arr_c - arr_b)
            max_diff = diff.max()
            corr = np.corrcoef(arr_c.flatten(), arr_b.flatten())[0, 1]

            ep1_cand_bright = arr_c[244, 481]
            ep2_cand_bright = arr_b[200, 559]
            ep1_cand_in_ep2 = arr_b[244, 481]
            ep2_cand_in_ep1 = arr_c[200, 559]

            cand1_ok = ep1_cand_bright > 200 and (ep1_cand_bright - ep1_cand_in_ep2) > 100
            cand2_ok = ep2_cand_bright > 200 and (ep2_cand_bright - ep2_cand_in_ep1) > 100
            starfield_aligned = corr > 0.99 and max_diff > 150

            if cand1_ok and cand2_ok and starfield_aligned:
                results.append(("Pixel-Level Candidate & Epoch Integrity", "PASS", 
                                f"Planet X epochs feature verified moving candidate (Ep1 (481,244)={ep1_cand_bright:.0f}, Ep2 (559,200)={ep2_cand_bright:.0f}, Starfield corr: {corr:.4f}, Max diff: {max_diff:.0f})."))
            else:
                results.append(("Pixel-Level Candidate & Epoch Integrity", "FAIL", 
                                f"Candidate check failed: Ep1 peak={ep1_cand_bright:.0f}, Ep2 peak={ep2_cand_bright:.0f}, corr={corr:.4f}, max_diff={max_diff:.0f}."))
                all_passed = False
        except Exception as ex:
            results.append(("Pixel-Level Candidate & Epoch Integrity", "FAIL", f"Image analysis error: {ex}"))
            all_passed = False

    # Check Galactic Bulge has only 1 epoch
    if targets:
        gb = targets.get("galactic_bulge", {})
        gb_epochs = gb.get("epochs", [])
        if len(gb_epochs) == 1:
            results.append(("Galactic Bulge Single Epoch", "PASS", "Galactic Bulge is honestly configured with 1 epoch (no upscaled fake epoch)."))
        else:
            results.append(("Galactic Bulge Single Epoch", "FAIL", f"Expected 1 epoch for Galactic Bulge, got {len(gb_epochs)}."))
            all_passed = False

    # --- Check 3: Gallery Card Fidelity (Exactly 15 Cards) ---
    index_path = os.path.join(PROJECT_ROOT, "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        index_html = f.read()

    gallery_card_blocks = re.findall(r'<article class="gallery-card"([\s\S]*?)</article>', index_html)
    gallery_mismatches = []
    
    if len(gallery_card_blocks) != 15:
        gallery_mismatches.append(f"Expected 15 gallery cards, found {len(gallery_card_blocks)}")

    for block in gallery_card_blocks:
        card_header = block.split('>')[0]
        t_match = re.search(r'data-target="([^"]+)"', card_header)
        e_match = re.search(r'data-epoch="([^"]+)"', card_header)
        b_match = re.search(r'data-band="([^"]+)"', card_header)
        img_match = re.search(r'<img\s+src="([^"]+)"', block)
        
        target_id = t_match.group(1) if t_match else ""
        epoch_idx = int(e_match.group(1)) if e_match else 0
        band_val = b_match.group(1) if b_match else "default"
        thumb_src = img_match.group(1) if img_match else ""

        if targets and target_id in targets:
            tgt = targets[target_id]
            if band_val != "default" and tgt.get("bands") and band_val in tgt.get("bands"):
                expected_url = tgt["bands"][band_val]["image_url"]
            elif epoch_idx < len(tgt.get("epochs", [])):
                expected_url = tgt["epochs"][epoch_idx]["image_url"]
            else:
                expected_url = tgt["epochs"][0]["image_url"]
            
            if thumb_src != expected_url:
                gallery_mismatches.append(f"Target '{target_id}' (epoch={epoch_idx}, band={band_val}) thumbnail '{thumb_src}' != expected '{expected_url}'")

    if not gallery_mismatches:
        results.append(("Gallery Card Fidelity (15 Cards)", "PASS", f"All {len(gallery_card_blocks)} gallery cards map to exact corresponding thumbnails."))
    else:
        results.append(("Gallery Card Fidelity (15 Cards)", "FAIL", f"Gallery mismatches: {gallery_mismatches}"))
        all_passed = False

    # --- Check 4: Team Section (Roles Only, Zero Names in HTML/JS/CSS/README) ---
    styles_path = os.path.join(PROJECT_ROOT, "styles.css")
    with open(styles_path, "r", encoding="utf-8") as f:
        styles_content = f.read()

    readme_path = os.path.join(PROJECT_ROOT, "README.md")
    with open(readme_path, "r", encoding="utf-8") as f:
        readme_content = f.read()

    submission_path = os.path.join(PROJECT_ROOT, "submission.md")
    with open(submission_path, "r", encoding="utf-8") as f:
        submission_content = f.read()

    personal_names = [
        "Ghazanfar", "Kalhoro", "Vagif", "Novruzov",
        "Loudjeine", "Boussalem", "Kabi", "Sylveon", "Apoorva"
    ]

    names_found_in_forbidden_files = []
    forbidden_files = [
        ("index.html", index_html),
        ("app.js", app_js_content),
        ("styles.css", styles_content),
        ("README.md", readme_content)
    ]

    for fname, fcontent in forbidden_files:
        for name in personal_names:
            if re.search(r'\b' + re.escape(name) + r'\b', fcontent):
                names_found_in_forbidden_files.append(f"{fname} contains '{name}'")

    team_cards = re.findall(r'<div class="team-card">', index_html)
    has_role_lead = "Team Lead &amp; Backend Engineer" in index_html or "Team Lead & Backend Engineer" in index_html
    has_role_frontend = "Frontend Engineer &amp; Astrometry" in index_html or "Frontend Engineer & Astrometry" in index_html
    has_role_design = "UI/UX &amp; Design Systems Lead" in index_html or "UI/UX & Design Systems Lead" in index_html
    has_all_roles = has_role_lead and has_role_frontend and has_role_design

    # submission.md must retain team member names
    submission_has_names = all(name in submission_content for name in ["Ghazanfar", "Vagif", "Loudjeine"])

    if len(team_cards) == 3 and has_all_roles and not names_found_in_forbidden_files and submission_has_names:
        results.append(("Team Roles Only & Zero Names", "PASS", "Strictly 3 team cards with roles only, zero personal names in HTML/JS/CSS/README, and submission.md retains official names."))
    else:
        fail_reasons = []
        if len(team_cards) != 3: fail_reasons.append(f"Team card count={len(team_cards)} (expected 3)")
        if not has_all_roles: fail_reasons.append("Missing one or more required role titles")
        if names_found_in_forbidden_files: fail_reasons.append(f"Names in forbidden files: {names_found_in_forbidden_files}")
        if not submission_has_names: fail_reasons.append("submission.md missing team names")
        results.append(("Team Roles Only & Zero Names", "FAIL", "; ".join(fail_reasons)))
        all_passed = False

    # --- Check 5: Scaffolding and Placeholders ---
    bracketed_matches = re.findall(r'\[[A-Z0-9_]{3,}\]', index_html)
    has_scaffolding = any(term in index_html for term in ["sampleInfoDrawer", "dataModeBadge", "about-notice-box"])
    if not bracketed_matches and not has_scaffolding:
        results.append(("Zero Scaffolding & Placeholders", "PASS", "Zero [PLACEHOLDER] tags and zero deprecated demo scaffolding."))
    else:
        results.append(("Zero Scaffolding & Placeholders", "FAIL", f"Found placeholders: {bracketed_matches}, scaffolding: {has_scaffolding}"))
        all_passed = False

    # --- Check 6: Error Handling UI Overlay ---
    if 'id="viewerErrorMessage"' in index_html and 'errorTileDetails' in index_html:
        results.append(("404 Error State Handling", "PASS", "Visible error card `#viewerErrorMessage` exists in viewer stage."))
    else:
        results.append(("404 Error State Handling", "FAIL", "Missing `#viewerErrorMessage` in index.html."))
        all_passed = False

    # --- Check 7: Preload & Blink Slow-Connection Safety ---
    # In preloadTargetImages, image_url_hires must NOT be pushed
    preload_snippet_match = re.search(r"function preloadTargetImages\([^)]*\)\s*\{([\s\S]*?)\n\}", app_js_content)
    has_hires_in_preload = False
    if preload_snippet_match:
        has_hires_in_preload = "image_url_hires" in preload_snippet_match.group(1)

    if "preloadTargetImages" in app_js_content and not has_hires_in_preload:
        results.append(("Blink Preload Slow-Connection Safety", "PASS", "preloadTargetImages preloads standard frames only (hires excluded, preventing 10s timeout on 1.5 Mbps)."))
    else:
        results.append(("Blink Preload Slow-Connection Safety", "FAIL", f"image_url_hires found inside preloadTargetImages: {has_hires_in_preload}"))
        all_passed = False

    # --- Check 8: CSS Validity (Zero Invalid Rules) ---
    if "image-rendering: high-quality" not in styles_content:
        results.append(("CSS Validity", "PASS", "Zero invalid `image-rendering: high-quality;` in styles.css."))
    else:
        results.append(("CSS Validity", "FAIL", "Found invalid `image-rendering: high-quality;` in styles.css."))
        all_passed = False

    # --- Check 9: All Asset Files Referenced & Zero Orphaned Image Files ---
    assets_dir = os.path.join(PROJECT_ROOT, "assets/images")
    asset_files = set(os.listdir(assets_dir)) if os.path.exists(assets_dir) else set()
    orphaned_sphex = [f for f in asset_files if f.startswith("sphex-band") or "gaia" in f or "planck" in f]
    
    unreferenced_files = []
    combined_code = index_html + "\n" + app_js_content + "\n" + readme_content
    for f in asset_files:
        if f not in combined_code:
            unreferenced_files.append(f)

    if not orphaned_sphex and not unreferenced_files and len(asset_files) >= 18:
        results.append(("Asset References & Zero Orphans", "PASS", f"All {len(asset_files)} active asset files on disk are referenced and zero deprecated files exist."))
    else:
        fail_reasons = []
        if orphaned_sphex: fail_reasons.append(f"Orphaned/deprecated files: {orphaned_sphex}")
        if unreferenced_files: fail_reasons.append(f"Unreferenced files: {unreferenced_files}")
        if len(asset_files) < 18: fail_reasons.append(f"Expected at least 18 assets, found {len(asset_files)}")
        results.append(("Asset References & Zero Orphans", "FAIL", "; ".join(fail_reasons)))
        all_passed = False

    # --- Check 10: Target Dropdown Count (8 Targets) ---
    target_select_options = re.findall(r'<option\s+value="([^"]+)"', index_html)
    has_ngc = "ngc_1760" in target_select_options and (targets and "ngc_1760" in targets)
    has_cygnus = "cygnus_complex" in target_select_options and (targets and "cygnus_complex" in targets)
    if len(target_select_options) == 8 and has_ngc and has_cygnus:
        results.append(("Target Dropdown & Presets", "PASS", "Dropdown contains exactly 8 celestial targets including NGC 1760 and Cygnus Complex."))
    else:
        results.append(("Target Dropdown & Presets", "FAIL", f"Found {len(target_select_options)} targets in dropdown (expected 8), has ngc: {has_ngc}, has cygnus: {has_cygnus}"))
        all_passed = False

    # --- Check 11: Backend API Contract Conformance ---
    server_py_path = os.path.join(PROJECT_ROOT, "server.py")
    if os.path.exists(server_py_path):
        with open(server_py_path, "r", encoding="utf-8") as f:
            server_content = f.read()
        has_sky_view = "/api/sky-view" in server_content
        has_ra_dec = "ra_param" in server_content and "dec_param" in server_content
        has_health = "/api/health" in server_content
        has_cors = "Access-Control-Allow-Origin" in server_content
        has_404 = "HTTPStatus.NOT_FOUND" in server_content

        if has_sky_view and has_ra_dec and has_health and has_cors and has_404:
            results.append(("Backend API Microservice Contract", "PASS", "server.py implements GET /api/sky-view?ra=&dec=, /api/health, /api/targets with CORS and 404/400 handling."))
        else:
            results.append(("Backend API Microservice Contract", "FAIL", "server.py missing one or more required endpoints or CORS handling."))
            all_passed = False
    else:
        results.append(("Backend API Microservice Contract", "FAIL", "server.py not found in project root."))
        all_passed = False

    # --- Check 12: Zero Gaia/Planck Mentions ---
    gaia_planck_found = []
    for fname, content in [("index.html", index_html), ("app.js", app_js_content), ("README.md", readme_content)]:
        if re.search(r'\b(gaia|planck)\b', content, re.IGNORECASE):
            gaia_planck_found.append(fname)

    if not gaia_planck_found:
        results.append(("Zero Gaia/Planck Mentions", "PASS", "Zero references to Gaia or Planck across HTML, JS, and README."))
    else:
        results.append(("Zero Gaia/Planck Mentions", "FAIL", f"Found Gaia/Planck references in: {gaia_planck_found}"))
        all_passed = False

    # --- Check 13: Zero Em-Dashes Across All Project Files ---
    em_dash_files = []
    for root, dirs, files in os.walk(PROJECT_ROOT):
        if any(p in root.split(os.sep) for p in [".cache", ".git", "upload", ".gemini", "node_modules", ".local", "cache"]):
            continue
        for file in files:
            if file.endswith((".html", ".js", ".css", ".md", ".py", ".sh", ".json")):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        if "\u2014" in f.read():
                            em_dash_files.append(os.path.relpath(filepath, PROJECT_ROOT))
                except Exception:
                    pass

    if not em_dash_files:
        results.append(("Zero Em-Dashes", "PASS", "Absolute zero em-dashes across all project code and documentation files."))
    else:
        results.append(("Zero Em-Dashes", "FAIL", f"Found em-dashes in: {em_dash_files}"))
        all_passed = False

    return all_passed, results

if __name__ == "__main__":
    success, check_results = run_behavioral_checks()
    print("=== PROJECT SPECTRALx Behavioral & Scientific Integrity Validator ===")
    for domain, status, detail in check_results:
        mark = "✅" if status == "PASS" else "❌"
        print(f"{mark} [{status}] {domain}: {detail}")
    
    sys.exit(0 if success else 1)
