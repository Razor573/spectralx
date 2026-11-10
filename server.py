#!/usr/bin/env python3
"""
PROJECT SPECTRALx: SPHEREx Sky Explorer Backend Microservice
NASA Space Apps Challenge 2026: "Planet X and SPHEREx"

Lightweight, high-concurrency HTTP service providing:
1. REST API endpoint GET /api/sky-view?ra={ra}&dec={dec}
2. Health check endpoint GET /api/health
3. Target catalog endpoint GET /api/targets
4. Tile streaming and static asset delivery with full CORS support
"""

import os
import sys
import math
import json
import argparse
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

_script_dir = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(_script_dir, "..")) if os.path.basename(_script_dir) == "backend" else _script_dir
ASSETS_DIR = os.path.join(PROJECT_ROOT, "assets", "images")

# SPHEREx Survey Targets Catalog (Caltech IRSA QR2 / QR3 Archive Model)
SPHEREX_SURVEY_TARGETS = {
    "planet_x_field": {
        "id": "planet_x_field",
        "target_name": "Planet X Candidate Field (2 Epochs)",
        "ra": 156.09,
        "dec": -41.64,
        "fov_deg": "3.5° × 3.5°",
        "has_moving_candidate": True,
        "available_bands": [1, 2],
        "default_band": 1,
        "unavailable_notice": "Bands 3-6 not observed for this field",
        "epochs": [
            {
                "date": "2025-04-15",
                "band_um": 1.0,
                "band_number": 1,
                "image_url": "assets/images/cluster-survey-cyan.jpg",
                "image_url_hires": "assets/images/cluster-survey-cyan-hires.jpg",
                "marker_pos": {"x": 47.0, "y": 42.4}
            },
            {
                "date": "2026-02-14",
                "band_um": 1.4,
                "band_number": 2,
                "image_url": "assets/images/cluster-survey-blue.jpg",
                "image_url_hires": "assets/images/cluster-survey-blue-hires.jpg",
                "marker_pos": {"x": 54.6, "y": 34.7}
            }
        ],
        "bands": {
            "1": {"um": 1.0, "label": "Band 1 (1.0 µm)", "image_url": "assets/images/cluster-survey-cyan.jpg"},
            "2": {"um": 1.4, "label": "Band 2 (1.4 µm)", "image_url": "assets/images/cluster-survey-blue.jpg"}
        }
    },
    "star_formation_hub": {
        "id": "star_formation_hub",
        "target_name": "Star Formation Hub: Carina Nebula (2 Bands)",
        "ra": 161.26,
        "dec": -59.87,
        "fov_deg": "2.8° × 2.8°",
        "has_moving_candidate": False,
        "available_bands": [4, 5],
        "default_band": 4,
        "unavailable_notice": "Bands 1-3, 6 not observed for this field",
        "epochs": [
            {
                "date": "2025-05-10",
                "band_um": 3.1,
                "band_number": 4,
                "image_url": "assets/images/nebula-red-orange.jpg"
            }
        ],
        "bands": {
            "4": {"um": 3.1, "label": "Band 4 (3.1 µm)", "image_url": "assets/images/nebula-red-orange.jpg"},
            "5": {"um": 4.1, "label": "Band 5 (4.1 µm)", "image_url": "assets/images/nebula-amber-dust.jpg"}
        }
    },
    "ngc_1760": {
        "id": "ngc_1760",
        "target_name": "NGC 1760 Star-Forming Nebula (3 Bands)",
        "ra": 74.43,
        "dec": -66.35,
        "fov_deg": "1.3° × 0.7°",
        "has_moving_candidate": False,
        "available_bands": [1, 2, 3],
        "default_band": 2,
        "unavailable_notice": "Bands 4-6 not observed for this field",
        "epochs": [
            {
                "date": "2025-05-01",
                "band_um": 0.98,
                "band_number": 2,
                "image_url": "assets/images/ngc1760-098um.webp"
            }
        ],
        "bands": {
            "1": {"um": 0.96, "label": "Band 1 (0.96 µm)", "image_url": "assets/images/ngc1760-096um.webp"},
            "2": {"um": 0.98, "label": "Band 2 (0.98 µm)", "image_url": "assets/images/ngc1760-098um.webp"},
            "3": {"um": 3.29, "label": "Band 3 (3.29 µm)", "image_url": "assets/images/ngc1760-329um.webp"}
        }
    },
    "galactic_bulge": {
        "id": "galactic_bulge",
        "target_name": "Galactic Bulge & Inner Disk (1 Epoch, 2 Bands)",
        "ra": 266.42,
        "dec": -29.01,
        "fov_deg": "4.2° × 4.2°",
        "has_moving_candidate": False,
        "available_bands": [2, 3],
        "default_band": 2,
        "unavailable_notice": "Bands 1, 4-6 not observed for this field",
        "epochs": [
            {
                "date": "2025-06-01",
                "band_um": 1.4,
                "band_number": 2,
                "image_url": "assets/images/milkyway-starfield.jpg"
            }
        ],
        "bands": {
            "2": {"um": 1.4, "label": "Band 2 (1.4 µm)", "image_url": "assets/images/milkyway-starfield.jpg"},
            "3": {"um": 2.0, "label": "Band 3 (2.0 µm)", "image_url": "assets/images/milkyway-deepfield-hires.jpg"}
        }
    },
    "milkyway_allsky": {
        "id": "milkyway_allsky",
        "target_name": "Milky Way All-Sky Survey (2 Bands)",
        "ra": 0.00,
        "dec": 0.00,
        "fov_deg": "360° × 180°",
        "has_moving_candidate": False,
        "available_bands": [1, 6],
        "default_band": 1,
        "unavailable_notice": "Bands 2-5 not observed for this all-sky projection",
        "epochs": [
            {
                "date": "2025-07-01",
                "band_um": 1.0,
                "band_number": 1,
                "image_url": "assets/images/spherex-allsky-stars.webp"
            }
        ],
        "bands": {
            "1": {"um": 1.0, "label": "Band 1 (1.0 µm)", "image_url": "assets/images/spherex-allsky-stars.webp"},
            "6": {"um": 4.8, "label": "Band 6 (4.8 µm)", "image_url": "assets/images/spherex-allsky-dust.webp"}
        }
    },
    "molecular_filaments": {
        "id": "molecular_filaments",
        "target_name": "Herschel Molecular Cloud Filaments (1 Epoch)",
        "ra": 274.70,
        "dec": -13.81,
        "fov_deg": "2.5° × 2.5°",
        "has_moving_candidate": False,
        "available_bands": [6],
        "default_band": 6,
        "unavailable_notice": "Bands 1-5 not observed for this field",
        "epochs": [
            {
                "date": "2025-08-20",
                "band_um": 4.8,
                "band_number": 6,
                "image_url": "assets/images/herschel-filaments.jpg"
            }
        ],
        "bands": {
            "6": {"um": 4.8, "label": "Band 6 (4.8 µm)", "image_url": "assets/images/herschel-filaments.jpg"}
        }
    },
    "spherex_mosaic": {
        "id": "spherex_mosaic",
        "target_name": "SPHEREx 6-Channel Detector Focal Plane Array",
        "ra": 270.00,
        "dec": 66.56,
        "fov_deg": "3.5° × 7.0° (Mosaic)",
        "has_moving_candidate": False,
        "available_bands": [],
        "default_band": 1,
        "unavailable_notice": "Simultaneous 6-channel detector mosaic view",
        "epochs": [
            {
                "date": "2025-04-01",
                "band_um": 2.5,
                "band_number": 1,
                "image_url": "assets/images/wavelength-six-bands.webp"
            }
        ],
        "bands": {}
    },
    "cygnus_complex": {
        "id": "cygnus_complex",
        "target_name": "Cygnus Molecular Cloud Complex (2 Bands)",
        "ra": 308.20,
        "dec": 41.30,
        "fov_deg": "3.0° × 3.0°",
        "has_moving_candidate": False,
        "available_bands": [2, 3],
        "default_band": 2,
        "unavailable_notice": "Bands 1, 4-6 not observed for this field",
        "epochs": [
            {
                "date": "2025-09-15",
                "band_um": 1.4,
                "band_number": 2,
                "image_url": "assets/images/cygnus-stars-dust-44.jpg"
            }
        ],
        "bands": {
            "2": {"um": 1.4, "label": "Band 2 (1.4 µm)", "image_url": "assets/images/cygnus-stars-dust-44.jpg"},
            "3": {"um": 3.0, "label": "Band 3 (3.0 µm)", "image_url": "assets/images/cygnus-interstellar-ice-43.jpg"}
        }
    }
}

def calculate_angular_separation_deg(ra1: float, dec1: float, ra2: float, dec2: float) -> float:
    """Calculates great-circle angular separation between two celestial points in degrees."""
    rad = math.pi / 180.0
    r1, d1 = ra1 * rad, dec1 * rad
    r2, d2 = ra2 * rad, dec2 * rad
    cos_sep = math.sin(d1) * math.sin(d2) + math.cos(d1) * math.cos(d2) * math.cos(r1 - r2)
    clamped = max(-1.0, min(1.0, cos_sep))
    return math.acos(clamped) * (180.0 / math.pi)

def find_matching_target(ra: float, dec: float, max_separation_deg: float = 1.5):
    """Finds the closest SPHEREx survey target within tolerance."""
    closest_key = None
    min_dist = float("inf")
    for key, tgt in SPHEREX_SURVEY_TARGETS.items():
        dist = calculate_angular_separation_deg(ra, dec, tgt["ra"], tgt["dec"])
        if dist < min_dist:
            min_dist = dist
            closest_key = key
    if closest_key and min_dist <= max_separation_deg:
        return SPHEREX_SURVEY_TARGETS[closest_key], min_dist
    return None, min_dist

class SpectralxRequestHandler(SimpleHTTPRequestHandler):
    """HTTP request handler supporting SPHEREx REST API and static asset streaming."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT_ROOT, **kwargs)

    def end_headers(self):
        # Enable Cross-Origin Resource Sharing (CORS) for all clients
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        """Responds to CORS preflight requests."""
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def do_GET(self):
        """Dispatches GET requests to API routes or static file serving."""
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/sky-view":
            self.handle_sky_view(parsed)
        elif path == "/api/health":
            self.handle_health()
        elif path == "/api/targets":
            self.handle_targets()
        elif path.startswith("/static/tiles/"):
            self.handle_static_tile(path)
        else:
            # Serve regular static files from PROJECT_ROOT
            super().do_GET()

    def send_json(self, status: HTTPStatus, data: dict):
        """Encodes and sends a JSON response."""
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_health(self):
        """Returns API health status and mission data provenance."""
        self.send_json(HTTPStatus.OK, {
            "status": "healthy",
            "service": "PROJECT SPECTRALx SPHEREx Sky Explorer API",
            "version": "2.0.0",
            "mission": "NASA SPHEREx",
            "archive": "NASA/IPAC Infrared Science Archive (IRSA) QR2",
            "band_coverage_um": "0.75 - 5.00"
        })

    def handle_targets(self):
        """Returns the full catalog of available SPHEREx fields."""
        targets_list = []
        for key, tgt in SPHEREX_SURVEY_TARGETS.items():
            targets_list.append({
                "id": tgt["id"],
                "target_name": tgt["target_name"],
                "ra": tgt["ra"],
                "dec": tgt["dec"],
                "fov_deg": tgt["fov_deg"],
                "has_moving_candidate": tgt["has_moving_candidate"],
                "available_bands": tgt["available_bands"],
                "epochs_count": len(tgt["epochs"])
            })
        self.send_json(HTTPStatus.OK, {
            "count": len(targets_list),
            "targets": targets_list
        })

    def handle_sky_view(self, parsed_url):
        """
        Handles GET /api/sky-view?ra={ra}&dec={dec}
        Returns compliant JSON contract with epochs and bands, or clean 400/404 on error.
        """
        query = parse_qs(parsed_url.query)
        ra_param = query.get("ra", [None])[0]
        dec_param = query.get("dec", [None])[0]

        if ra_param is None or dec_param is None:
            self.send_json(HTTPStatus.BAD_REQUEST, {
                "error": "Missing required query parameters. Both 'ra' (0 to 360) and 'dec' (-90 to +90) are required.",
                "example": "/api/sky-view?ra=156.09&dec=-41.64"
            })
            return

        try:
            ra = float(ra_param)
            dec = float(dec_param)
        except ValueError:
            self.send_json(HTTPStatus.BAD_REQUEST, {
                "error": "Invalid coordinate format. 'ra' and 'dec' must be floating-point numbers.",
                "ra_received": ra_param,
                "dec_received": dec_param
            })
            return

        if not (0.0 <= ra <= 360.0 and -90.0 <= dec <= 90.0):
            self.send_json(HTTPStatus.BAD_REQUEST, {
                "error": "Coordinates out of bounds. 'ra' must be within [0, 360] and 'dec' within [-90, +90].",
                "ra": ra,
                "dec": dec
            })
            return

        target, dist_deg = find_matching_target(ra, dec, max_separation_deg=1.5)
        if not target:
            self.send_json(HTTPStatus.NOT_FOUND, {
                "error": "Coordinate field not covered in SPHEREx QR2 survey archive",
                "ra": ra,
                "dec": dec,
                "closest_field_distance_deg": round(dist_deg, 2),
                "suggestion": "Select a verified target from /api/targets or slew to known coordinates (e.g. RA 156.09, Dec -41.64)."
            })
            return

        response_payload = {
            "ra": target["ra"],
            "dec": target["dec"],
            "target_name": target["target_name"],
            "fov_deg": target["fov_deg"],
            "has_moving_candidate": target["has_moving_candidate"],
            "available_bands": target["available_bands"],
            "default_band": target["default_band"],
            "unavailable_notice": target.get("unavailable_notice", ""),
            "epochs": target["epochs"],
            "bands": target["bands"],
            "survey_provenance": {
                "source": "Caltech / NASA IPAC Infrared Science Archive (IRSA)",
                "mission": "SPHEREx",
                "data_release": "Quick Release 2 (QR2 / QR3)",
                "band_pairing": "Bands 1 & 4 (0.75-1.11, 2.42-3.82 um), 2 & 5 (1.11-1.64, 3.82-4.42 um), 3 & 6 (1.64-2.42, 4.42-5.00 um)"
            }
        }
        self.send_json(HTTPStatus.OK, response_payload)

    def handle_static_tile(self, path: str):
        """Translates /static/tiles/{filename} to assets/images/{filename}."""
        filename = os.path.basename(path)
        filepath = os.path.join(ASSETS_DIR, filename)

        if os.path.isfile(filepath):
            # Determine content type
            ext = os.path.splitext(filename)[1].lower()
            content_type = "image/jpeg"
            if ext == ".png":
                content_type = "image/png"
            elif ext == ".webp":
                content_type = "image/webp"

            try:
                with open(filepath, "rb") as f:
                    content = f.read()
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            except Exception as e:
                self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, f"Error reading tile: {e}")
        else:
            self.send_json(HTTPStatus.NOT_FOUND, {
                "error": f"Tile '{filename}' not found in assets/images/ archive."
            })

def run_server(port: int = 3000, host: str = "0.0.0.0"):
    """Starts the multi-threaded HTTP server."""
    server_address = (host, port)
    httpd = ThreadingHTTPServer(server_address, SpectralxRequestHandler)
    print(f"🌌 PROJECT SPECTRALx Backend Server active at http://{host}:{port}")
    print(f"   REST API: GET http://{host}:{port}/api/sky-view?ra=156.09&dec=-41.64")
    print(f"   Health:   GET http://{host}:{port}/api/health")
    print(f"   Catalog:  GET http://{host}:{port}/api/targets")
    print(f"   Frontend: http://{host}:{port}/index.html")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()
        sys.exit(0)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PROJECT SPECTRALx Python Backend Service")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 3000)), help="Port to listen on (default: 3000)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host interface to bind to (default: 0.0.0.0)")
    args = parser.parse_args()

    run_server(port=args.port, host=args.host)
