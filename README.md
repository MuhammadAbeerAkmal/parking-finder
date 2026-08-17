# Parking Finder — Köln

A web app showing where you're allowed to park for free vs. where a resident permit or Parkschein is required, at street-segment level. Currently covers **Cologne only** (see `data/` sourcing below for why).

Full project plan and phase history: see the plan file this project was built from (or ask for a re-cap — the short version is in "Status" below).

## Status

MVP in progress, Phase 1 (aggregation-first data pipeline + map). Data sources:
- OpenStreetMap `parking:condition:*` tags (street-level: free / ticket / no_stopping / no_parking / residents)
- Cologne's official Bewohnerparkgebiete WFS (resident-permit zone polygons, DL-DE Zero 2.0 license)

Coverage is real but geographically limited to what those two sources actually contain — mostly central Cologne. Anything outside that shows as "no data," never a false "free" claim.

## Prerequisites

- Python 3.12+
- Node.js + npm
- Docker Desktop

## Setup

1. Copy `.env.example` to `.env` and fill in real values (or keep the defaults for local dev).
2. Start the database:
   ```
   docker compose up -d
   ```
3. Backend:
   ```
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
4. Data pipeline (run once to populate the database — repeat any time you want to refresh the data):
   ```
   cd data-pipeline
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python fetch_osm_parking.py
   python fetch_cologne_wfs.py
   python load_to_postgis.py
   ```
5. Frontend:
   ```
   cd frontend
   npm install
   npm start
   ```

Opens at `http://localhost:5173`. Backend runs at `http://localhost:8000` (see `/docs` for the interactive API docs).

## Project structure

- `backend/` — FastAPI service serving parking segments + permit zones as GeoJSON
- `data-pipeline/` — scripts to pull OSM + city open data and load it into PostGIS
- `frontend/` — React + Webpack + TypeScript PWA, MapLibre GL JS for the map
- `docker-compose.yml` — PostGIS database