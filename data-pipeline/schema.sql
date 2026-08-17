-- Two tables mirroring our two real data sources, rather than forcing everything
-- into one flattened rule_type enum (which would lose the structured OSM data we
-- actually found for Köln, e.g. "ticket, free outside 9-21h, residents exempt").

CREATE EXTENSION IF NOT EXISTS postgis;

-- Street-level segments from OSM parking:condition:* tags.
CREATE TABLE IF NOT EXISTS parking_segments (
    id SERIAL PRIMARY KEY,
    osm_id BIGINT NOT NULL,
    city TEXT NOT NULL,
    name TEXT,
    geometry GEOMETRY(Geometry, 4326) NOT NULL,
    primary_condition_type TEXT,       -- best-effort single value for map coloring
    raw_condition_tags JSONB,          -- full original tags, nothing discarded
    source TEXT NOT NULL DEFAULT 'osm',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS parking_segments_geom_idx ON parking_segments USING GIST (geometry);
CREATE INDEX IF NOT EXISTS parking_segments_city_idx ON parking_segments (city);

-- Resident-permit zone polygons from each city's official open data (WFS).
CREATE TABLE IF NOT EXISTS permit_zones (
    id SERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    zone_name TEXT,
    zone_abbreviation TEXT,
    info_url TEXT,
    geometry GEOMETRY(Geometry, 4326) NOT NULL,
    source TEXT NOT NULL DEFAULT 'city_wfs',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS permit_zones_geom_idx ON permit_zones USING GIST (geometry);
CREATE INDEX IF NOT EXISTS permit_zones_city_idx ON permit_zones (city);