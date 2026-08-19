"""Pull Cologne's Bewohnerparkgebiete (resident-parking-zone) polygons from the city's WFS.

The service returns coordinates in EPSG:25832 (ETRS89 / UTM zone 32N); web maps
(MapLibre, GeoJSON on the frontend) expect EPSG:4326 (WGS84 lat/lon), so this
script reprojects every coordinate before saving.
"""

import json
from pathlib import Path

import requests
from pyproj import Transformer

WFS_URL = "https://geoportal.stadt-koeln.de/wss/service/bewohnerparken_wfs/guest"
OUTPUT_DIR = Path(__file__).parent / "output"
HEADERS = {"User-Agent": "parking-finder-de/0.1 (data pipeline; personal project)"}

# always_xy=True means transform() takes/returns (x, y) i.e. (lon, lat), matching GeoJSON order.
transformer = Transformer.from_crs("EPSG:25832", "EPSG:4326", always_xy=True)


def fetch_zones() -> dict:
    params = {
        "SERVICE": "WFS",
        "REQUEST": "GetFeature",
        "VERSION": "2.0.0",
        "TYPENAMES": "ms:bewohnerparkgebiete_zonen",
        "OUTPUTFORMAT": "geojson",
        "COUNT": "1000",  # well above the known total of 47, to guarantee everything in one request
    }
    response = requests.get(WFS_URL, params=params, headers=HEADERS, timeout=60)
    if not response.ok:
        print(f"WFS returned {response.status_code}: {response.text[:500]}")
    response.raise_for_status()
    return response.json()


def reproject_coordinates(coords: list) -> list:
    """Recursively reproject nested coordinate lists - handles Polygon/MultiPolygon rings
    without needing separate logic per geometry type."""
    if isinstance(coords[0], (int, float)):
        lon, lat = transformer.transform(coords[0], coords[1])
        return [lon, lat]
    return [reproject_coordinates(c) for c in coords]


def reproject_feature_collection(geojson: dict) -> dict:
    for feature in geojson["features"]:
        geometry = feature["geometry"]
        geometry["coordinates"] = reproject_coordinates(geometry["coordinates"])
    geojson["crs"] = {
        "type": "name",
        "properties": {"name": "urn:ogc:def:crs:EPSG::4326"},
    }
    return geojson


def save(geojson: dict) -> Path:
    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / "cologne_bewohnerparkgebiete.geojson"
    out_path.write_text(
        json.dumps(geojson, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return out_path


def main() -> None:
    print("Fetching Cologne Bewohnerparkgebiete zones...")
    geojson = fetch_zones()
    print(f"Got {len(geojson['features'])} zones.")

    geojson = reproject_feature_collection(geojson)
    out_path = save(geojson)
    print(f"Saved to {out_path}")


if __name__ == "__main__":
    main()
