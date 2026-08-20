# Parking Finder

A web app showing where you're allowed to park for free vs. where a resident permit or Parkschein is required, at street-segment level.

## What it does right now

- Interactive map, color-coded by parking condition (free / ticket-or-permit-required / no-stopping-or-parking), for central Cologne
- Resident-permit zones shown as overlays
- Click a street or zone for plain-language details, plus a "Get directions" link to that exact spot
- Interactive filter/legend - toggle any combination of conditions or permit zones on or off
- Mobile-friendly: detail view is a full-width bottom sheet on phones, a compact card on desktop
- Installable as a PWA

## Goal

Grow this into a reliable way to find real, verified free/legal street parking - starting with Cologne, expanding from there.

## Access

Live at **[parking-finder-beige.vercel.app](https://parking-finder-beige.vercel.app)**. To run it locally instead, see Setup below.

## Setup

### Prerequisites

- Python 3.12+
- Node.js + npm
- Docker Desktop

### One-time setup

1. Copy `.env.example` to `.env` and fill in real values (or keep the defaults for local dev).
2. Install each component's dependencies:

   ```bash
   npm install                                   # repo root - commit linting + dev orchestration

   cd backend && python -m venv venv && source venv/Scripts/activate && pip install -r requirements.txt && cd ..
   cd data-pipeline && python -m venv venv && source venv/Scripts/activate && pip install -r requirements.txt && cd ..
   cd frontend && npm install && cd ..
   ```

3. Populate the database (run once - repeat any time you want to refresh the data):
   ```bash
   cd data-pipeline
   source venv/Scripts/activate
   python fetch_osm_parking.py
   python fetch_cologne_wfs.py
   python load_to_postgis.py
   cd ..
   ```

### Running it

```bash
npm run dev
```

Starts the database, backend, and frontend together (one Ctrl+C stops all three). Frontend at `http://localhost:5173`, backend at `http://localhost:8000` (`/docs` for interactive API docs).

<details>
<summary>Running each piece manually instead (useful for troubleshooting)</summary>

```bash
docker compose up -d

cd backend && source venv/Scripts/activate && uvicorn main:app --reload --port 8000

cd frontend && npm start
```

</details>

## Contributing

1. Fork and clone the repo, then follow Setup above.
2. Run `npm install` at the repo root too - it sets up commit-message linting.
3. Before committing: `npm run lint` in `frontend/`, `ruff check .` in `backend/` and `data-pipeline/`.
4. Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `fix: ...`, `feat: ...`, `docs: ...`) - this is enforced automatically on commit.
5. Open a PR.

## License & data sources

This project's own code is MIT licensed (see `LICENSE`).

Data used:

- OpenStreetMap contributors - [ODbL](https://opendatacommons.org/licenses/odbl/)
- Stadt Köln Bewohnerparkgebiete - Datenlizenz Deutschland – Zero – Version 2.0
