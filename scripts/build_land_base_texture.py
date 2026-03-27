#!/usr/bin/env python3

from __future__ import annotations

import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "data" / "vector" / "land.fill.10m.geojson"
SVG_PATH = ROOT / "assets" / "earth" / "derived" / "world.land.base.4096x2048.svg"
PNG_PATH = ROOT / "assets" / "earth" / "derived" / "world.land.base.4096x2048.png"
WIDTH = 4096
HEIGHT = 2048
OCEAN = "#2f7398"
LAND = "#98b977"


def project_point(longitude: float, latitude: float) -> tuple[float, float]:
    x = ((longitude + 180.0) / 360.0) * WIDTH
    y = ((90.0 - latitude) / 180.0) * HEIGHT
    return x, y


def ring_to_path(ring: list[list[float]]) -> str:
    commands: list[str] = []
    for index, coordinate in enumerate(ring):
        x, y = project_point(float(coordinate[0]), float(coordinate[1]))
        command = "M" if index == 0 else "L"
        commands.append(f"{command}{x:.3f},{y:.3f}")
    commands.append("Z")
    return " ".join(commands)


def geometry_to_path(geometry: dict) -> str:
    if geometry["type"] == "Polygon":
        return " ".join(ring_to_path(ring) for ring in geometry["coordinates"])

    if geometry["type"] == "MultiPolygon":
        return " ".join(
            ring_to_path(ring)
            for polygon in geometry["coordinates"]
            for ring in polygon
        )

    raise ValueError(f"Unsupported geometry type: {geometry['type']}")


def build_svg() -> str:
    payload = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    feature = payload["features"][0]
    path_data = geometry_to_path(feature["geometry"])
    return (
        f"<svg xmlns='http://www.w3.org/2000/svg' width='{WIDTH}' height='{HEIGHT}' "
        f"viewBox='0 0 {WIDTH} {HEIGHT}'>"
        f"<rect width='{WIDTH}' height='{HEIGHT}' fill='{OCEAN}'/>"
        f"<path d='{path_data}' fill='{LAND}' fill-rule='evenodd'/>"
        "</svg>"
    )


def main() -> int:
    SVG_PATH.parent.mkdir(parents=True, exist_ok=True)
    SVG_PATH.write_text(build_svg(), encoding="utf-8")
    subprocess.run(
        [
            "convert",
            str(SVG_PATH),
            str(PNG_PATH),
        ],
        cwd=ROOT,
        check=True,
    )
    print(f"Wrote {PNG_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
