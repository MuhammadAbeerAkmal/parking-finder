"""Transform the raw OSM + Cologne WFS output into the PostGIS schema.

This is the only place that interprets raw parking:condition:* tags into a
single primary_condition_type for map coloring — extraction scripts stay dumb,
this script is where meaning gets assigned.
"""

import json
import os
from pathlib import Path

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

OUTPUT_DIR = Path(__file__).parent / "output"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"

load_dotenv(Path(__file__).parent.parent / ".env")

DB_CONFIG = {
    "host": os.environ["DB_HOST"],
    "port": os.environ["DB_PORT"],
    "dbname": os.environ["POSTGRES_DB"],
    "user": os.environ["POSTGRES_USER"],
    "password": os.environ["POSTGRES_PASSWORD"],
}

CITY = "Köln"

# Preference order when a way has multiple condition tags (e.g. both "both" and
# side-specific keys) — take the first match as the representative value.
CONDITION_KEY_PRIORITY = [
    "parking:condition:both",
    "parking:condition:left",
    "parking:condition:right",
]


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


def apply_schema(conn) -> None:
    with conn.cursor() as cur:
        cur.execute(SCHEMA_PATH.read_text(encoding="utf-8"))
    conn.commit()


def points_to_linestring_wkt(points: list[dict]) -> str:
    coords = ", ".join(f"{p['lon']} {p['lat']}" for p in points)
    return f"LINESTRING({coords})"


def primary_condition_type(condition_tags: dict) -> str | None:
    for key in CONDITION_KEY_PRIORITY:
        if key in condition_tags:
            return condition_tags[key]
    return None


def load_osm_segments(conn) -> int:
    path = OUTPUT_DIR / "osm_parking_köln.json"
    ways = json.loads(path.read_text(encoding="utf-8"))

    with conn.cursor() as cur:
        cur.execute(
            "DELETE FROM parking_segments WHERE city = %s AND source = 'osm'", (CITY,)
        )
        for way in ways:
            if len(way["geometry"]) < 2:
                continue  # a LineString needs at least 2 points
            wkt = points_to_linestring_wkt(way["geometry"])
            cur.execute(
                """
                INSERT INTO parking_segments
                    (osm_id, city, name, geometry, primary_condition_type, raw_condition_tags, source)
                VALUES
                    (%s, %s, %s, ST_SetSRID(ST_GeomFromText(%s), 4326), %s, %s, 'osm')
                """,
                (
                    way["osm_id"],
                    CITY,
                    way["name"],
                    wkt,
                    primary_condition_type(way["condition_tags"]),
                    psycopg2.extras.Json(way["condition_tags"]),
                ),
            )
    conn.commit()
    return len(ways)


def load_permit_zones(conn) -> int:
    path = OUTPUT_DIR / "cologne_bewohnerparkgebiete.geojson"
    geojson = json.loads(path.read_text(encoding="utf-8"))
    features = geojson["features"]

    with conn.cursor() as cur:
        cur.execute(
            "DELETE FROM permit_zones WHERE city = %s AND source = 'city_wfs'", (CITY,)
        )
        for feature in features:
            props = feature["properties"]
            cur.execute(
                """
                INSERT INTO permit_zones
                    (city, zone_name, zone_abbreviation, info_url, geometry, source)
                VALUES
                    (%s, %s, %s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326), 'city_wfs')
                """,
                (
                    CITY,
                    props.get("Name"),
                    props.get("Abkürzung"),
                    props.get("Weitere_Informationen"),
                    json.dumps(feature["geometry"]),
                ),
            )
    conn.commit()
    return len(features)


def main() -> None:
    conn = get_connection()
    try:
        print("Applying schema...")
        apply_schema(conn)

        print("Loading OSM parking segments...")
        segment_count = load_osm_segments(conn)
        print(f"Loaded {segment_count} segments.")

        print("Loading Cologne permit zones...")
        zone_count = load_permit_zones(conn)
        print(f"Loaded {zone_count} zones.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()