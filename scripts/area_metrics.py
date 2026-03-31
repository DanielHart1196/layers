#!/usr/bin/env python3
"""Shared build-time utilities for polygon area metrics."""

from __future__ import annotations

import math


EARTH_RADIUS_KM = 6371.0088


def _ring_area_steradians(ring: list[list[float]]) -> float:
    if len(ring) < 4:
      return 0.0

    area = 0.0
    previous = ring[-1]
    prev_lon = math.radians(previous[0])
    prev_lat = math.radians(previous[1])

    for current in ring:
        lon = math.radians(current[0])
        lat = math.radians(current[1])
        area += (lon - prev_lon) * (2 + math.sin(prev_lat) + math.sin(lat))
        prev_lon = lon
        prev_lat = lat

    return area / 2.0


def polygon_area_km2(coordinates: list[list[list[float]]]) -> float:
    if not coordinates:
        return 0.0

    outer_area = abs(_ring_area_steradians(coordinates[0]))
    holes_area = sum(abs(_ring_area_steradians(ring)) for ring in coordinates[1:])
    return max(0.0, (outer_area - holes_area) * (EARTH_RADIUS_KM ** 2))


def geometry_area_km2(geometry: dict) -> float:
    geometry_type = geometry.get("type")
    if geometry_type == "Polygon":
        return polygon_area_km2(geometry.get("coordinates", []))
    if geometry_type == "MultiPolygon":
        return sum(polygon_area_km2(polygon) for polygon in geometry.get("coordinates", []))
    return 0.0
