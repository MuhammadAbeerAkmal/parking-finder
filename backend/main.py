"""Parking Finder API - serves parking_segments and permit_zones as GeoJSON.

No bounding-box filtering: at 618 segments + 47 zones for Köln, a full-city
response loads instantly. That's a scaling concern for a much larger dataset
or many cities at once, not something to build against now.
"""

import json
import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).parent.parent / ".env")

DB_CONFIG = {
    "host": os.environ["DB_HOST"],
    "port": os.environ["DB_PORT"],
    "dbname": os.environ["POSTGRES_DB"],
    "user": os.environ["POSTGRES_USER"],
    "password": os.environ["POSTGRES_PASSWORD"],
}

ATTRIBUTION = (
    "Contains data from OpenStreetMap contributors (ODbL) and "
    "Stadt Köln Bewohnerparkgebiete (Datenlizenz Deutschland - Zero - Version 2.0)."
)

app = FastAPI(title="Parking Finder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/segments")
def get_segments(city: str = "Köln", condition_type: str | None = None):
    query = """
        SELECT osm_id, name, primary_condition_type, raw_condition_tags,
               ST_AsGeoJSON(geometry) AS geometry
        FROM parking_segments
        WHERE city = %s
    """
    params = [city]
    if condition_type:
        query += " AND primary_condition_type = %s"
        params.append(condition_type)

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
    finally:
        conn.close()

    features = [
        {
            "type": "Feature",
            "geometry": json.loads(row[4]),
            "properties": {
                "osm_id": row[0],
                "name": row[1],
                "condition_type": row[2],
                "condition_tags": row[3],
            },
        }
        for row in rows
    ]
    return {
        "type": "FeatureCollection",
        "attribution": ATTRIBUTION,
        "features": features,
    }


@app.get("/api/zones")
def get_zones(city: str = "Köln"):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT zone_name, zone_abbreviation, info_url,
                       ST_AsGeoJSON(geometry) AS geometry
                FROM permit_zones
                WHERE city = %s
                """,
                (city,),
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    features = [
        {
            "type": "Feature",
            "geometry": json.loads(row[3]),
            "properties": {
                "zone_name": row[0],
                "zone_abbreviation": row[1],
                "info_url": row[2],
            },
        }
        for row in rows
    ]
    return {
        "type": "FeatureCollection",
        "attribution": ATTRIBUTION,
        "features": features,
    }
