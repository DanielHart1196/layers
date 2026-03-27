#!/usr/bin/env python3

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "data" / "empires" / "roman_empire_ad_117_extent.geojson"
OUTPUTS = {
    "high": ROOT / "data" / "empires" / "roman_empire_ad_117_extent.high.geojson",
    "medium": ROOT / "data" / "empires" / "roman_empire_ad_117_extent.medium.geojson",
    "low": ROOT / "data" / "empires" / "roman_empire_ad_117_extent.low.geojson",
}
TOLERANCES = {
    "high": 0.08,
    "medium": 0.28,
    "low": 0.75,
}


def perpendicular_distance(point, start, end):
    px, py = point
    sx, sy = start
    ex, ey = end
    dx = ex - sx
    dy = ey - sy
    if dx == 0 and dy == 0:
        return ((px - sx) ** 2 + (py - sy) ** 2) ** 0.5
    area = abs(dy * px - dx * py + ex * sy - ey * sx)
    length = (dx * dx + dy * dy) ** 0.5
    return area / length


def rdp(points, epsilon):
    if len(points) <= 2:
        return points[:]

    start = points[0]
    end = points[-1]
    max_distance = -1.0
    split_index = 0

    for index in range(1, len(points) - 1):
        distance = perpendicular_distance(points[index], start, end)
        if distance > max_distance:
            max_distance = distance
            split_index = index

    if max_distance > epsilon:
        left = rdp(points[: split_index + 1], epsilon)
        right = rdp(points[split_index:], epsilon)
        return left[:-1] + right

    return [start, end]


def simplify_ring(ring, epsilon):
    if len(ring) <= 4:
        return ring

    is_closed = ring[0] == ring[-1]
    open_ring = ring[:-1] if is_closed else ring[:]
    simplified = rdp(open_ring, epsilon)

    if len(simplified) < 3:
        simplified = open_ring[:3]

    if is_closed:
        simplified.append(simplified[0])

    if len(simplified) < 4:
        simplified = ring[:4]

    return simplified


def simplify_geometry(geometry, epsilon):
    if geometry["type"] == "MultiPolygon":
        return {
            **geometry,
            "coordinates": [
                [simplify_ring(ring, epsilon) for ring in polygon]
                for polygon in geometry["coordinates"]
            ],
        }

    if geometry["type"] == "Polygon":
        return {
            **geometry,
            "coordinates": [simplify_ring(ring, epsilon) for ring in geometry["coordinates"]],
        }

    raise ValueError(f"Unsupported geometry type: {geometry['type']}")


def write_payload(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"{json.dumps(payload, indent=2)}\n", encoding="utf-8")


def main():
    source = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))

    for lod, output_path in OUTPUTS.items():
        tolerance = TOLERANCES[lod]
        features = []
        for feature in source["features"]:
            simplified_feature = {
                **feature,
                "properties": {
                    **feature.get("properties", {}),
                    "lod": lod,
                    "simplifyToleranceDegrees": tolerance,
                },
                "geometry": simplify_geometry(feature["geometry"], tolerance),
            }
            features.append(simplified_feature)

        payload = {
            **source,
            "features": features,
        }
        write_payload(output_path, payload)
        print(f"Wrote {output_path.name}")


if __name__ == "__main__":
    main()
