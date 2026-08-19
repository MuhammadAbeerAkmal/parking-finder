"""Pull OSM parking:condition:* tagged street segments for a German city via the Overpass API.

This script only extracts and saves raw data - it does not decide what counts as
free/paid/permit. That mapping happens later, in the transform/load step, once
we're looking at both this and the city's official zone data together.
"""

import argparse
import json
from pathlib import Path

import requests

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
OUTPUT_DIR = Path(__file__).parent / "output"
HEADERS = {"User-Agent": "parking-finder-de/0.1 (data pipeline; personal project)"}


def build_query(city: str) -> str:
    return f"""
    [out:json][timeout:60];
    area["name"="{city}"]["boundary"="administrative"]->.searchArea;
    (
      way["parking:condition:both"](area.searchArea);
      way["parking:condition:left"](area.searchArea);
      way["parking:condition:right"](area.searchArea);
    );
    out geom;
    """


def fetch_ways(city: str) -> list[dict]:
    response = requests.post(
        OVERPASS_URL, data={"data": build_query(city)}, headers=HEADERS, timeout=90
    )
    if not response.ok:
        print(f"Overpass returned {response.status_code}: {response.text[:500]}")
    response.raise_for_status()
    return response.json()["elements"]


def extract_relevant_fields(ways: list[dict]) -> list[dict]:
    extracted = []
    for way in ways:
        tags = way.get("tags", {})
        condition_tags = {
            key: value
            for key, value in tags.items()
            if key.startswith("parking:condition")
        }
        extracted.append(
            {
                "osm_id": way["id"],
                "name": tags.get("name"),
                "geometry": way.get("geometry", []),
                "condition_tags": condition_tags,
            }
        )
    return extracted


def save(city: str, data: list[dict]) -> Path:
    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / f"osm_parking_{city.lower()}.json"
    out_path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return out_path


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch OSM parking:condition data for a German city"
    )
    parser.add_argument(
        "--city", default="Köln", help="City name as it appears in OSM (default: Köln)"
    )
    args = parser.parse_args()

    print(f"Fetching OSM parking:condition ways for {args.city}...")
    ways = fetch_ways(args.city)
    print(f"Got {len(ways)} ways.")

    extracted = extract_relevant_fields(ways)
    out_path = save(args.city, extracted)
    print(f"Saved to {out_path}")


if __name__ == "__main__":
    main()
