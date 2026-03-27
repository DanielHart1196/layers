#!/usr/bin/env python3
import json
import math
import os
import struct
import sys


def read_dbf(path):
    with open(path, "rb") as fh:
        header = fh.read(32)
        if len(header) < 32:
          raise ValueError("Invalid DBF header")
        _, year, month, day, num_records, header_len, record_len = struct.unpack("<BBBBIHH20x", header)
        field_count = (header_len - 33) // 32
        fields = []
        for _ in range(field_count):
            desc = fh.read(32)
            name = desc[:11].split(b"\x00", 1)[0].decode("ascii", errors="ignore").strip()
            field_type = chr(desc[11])
            length = desc[16]
            decimal_count = desc[17]
            fields.append((name, field_type, length, decimal_count))
        terminator = fh.read(1)
        if terminator != b"\r":
            raise ValueError("Invalid DBF field terminator")

        records = []
        for _ in range(num_records):
            row = fh.read(record_len)
            if not row or row[0:1] == b"*":
                continue
            offset = 1
            props = {}
            for name, field_type, length, decimal_count in fields:
                raw = row[offset:offset + length]
                offset += length
                text = raw.decode("latin1", errors="ignore").strip()
                if text == "":
                    value = None
                elif field_type in ("N", "F"):
                    value = float(text) if decimal_count else int(float(text))
                elif field_type == "L":
                    value = text[:1].upper() in ("Y", "T")
                else:
                    value = text
                props[name] = value
            records.append(props)
        return records


def signed_ring_area(ring):
    area = 0.0
    for i in range(len(ring) - 1):
        x1, y1 = ring[i]
        x2, y2 = ring[i + 1]
        area += (x1 * y2) - (x2 * y1)
    return area / 2.0


def group_polygon_rings(rings):
    outers = []
    current = None
    for ring in rings:
        if len(ring) < 4:
            continue
        if ring[0] != ring[-1]:
            ring = ring + [ring[0]]
        if signed_ring_area(ring) < 0 or current is None:
            current = [ring]
            outers.append(current)
        else:
            current.append(ring)
    return outers


def read_shp(path):
    with open(path, "rb") as fh:
        header = fh.read(100)
        if len(header) < 100:
            raise ValueError("Invalid SHP header")
        shape_type = struct.unpack("<i", header[32:36])[0]
        features = []

        while True:
            record_header = fh.read(8)
            if not record_header:
                break
            if len(record_header) < 8:
                raise ValueError("Invalid SHP record header")
            _, content_length_words = struct.unpack(">2i", record_header)
            content = fh.read(content_length_words * 2)
            if len(content) < 4:
                continue

            record_shape_type = struct.unpack("<i", content[:4])[0]
            if record_shape_type == 0:
                features.append(None)
                continue

            if record_shape_type == 1:
                x, y = struct.unpack("<2d", content[4:20])
                features.append({"type": "Point", "coordinates": [x, y]})
                continue

            if record_shape_type not in (3, 5):
                raise ValueError(f"Unsupported shape type: {record_shape_type}")

            num_parts, num_points = struct.unpack("<2i", content[36:44])
            parts = list(struct.unpack(f"<{num_parts}i", content[44:44 + (4 * num_parts)]))
            points_offset = 44 + (4 * num_parts)
            points = [
                list(struct.unpack("<2d", content[points_offset + (16 * i):points_offset + (16 * (i + 1))]))
                for i in range(num_points)
            ]

            rings = []
            for index, start in enumerate(parts):
                end = parts[index + 1] if index + 1 < len(parts) else len(points)
                rings.append(points[start:end])

            if record_shape_type == 3:
                coordinates = rings if len(rings) > 1 else rings[0]
                features.append({
                    "type": "MultiLineString" if len(rings) > 1 else "LineString",
                    "coordinates": coordinates,
                })
                continue

            polygons = group_polygon_rings(rings)
            if len(polygons) == 1:
                geometry = {"type": "Polygon", "coordinates": polygons[0]}
            else:
                geometry = {"type": "MultiPolygon", "coordinates": polygons}
            features.append(geometry)

        return shape_type, features


def main():
    if len(sys.argv) != 3:
        print("Usage: shapefile_to_geojson.py <input_base_or_shp> <output_geojson>", file=sys.stderr)
        sys.exit(1)

    input_arg = sys.argv[1]
    if input_arg.endswith(".shp"):
        base = input_arg[:-4]
    else:
        base = input_arg

    shp_path = f"{base}.shp"
    dbf_path = f"{base}.dbf"
    output_path = sys.argv[2]

    records = read_dbf(dbf_path)
    _, geometries = read_shp(shp_path)
    if len(records) != len(geometries):
        raise ValueError(f"Record/geometry count mismatch: {len(records)} vs {len(geometries)}")

    features = []
    for index, (props, geometry) in enumerate(zip(records, geometries)):
        if geometry is None:
            continue
        feature_id = props.get("id") or props.get("ID") or index
        features.append({
            "type": "Feature",
            "id": feature_id,
            "properties": props,
            "geometry": geometry,
        })

    fc = {"type": "FeatureCollection", "features": features}
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(fc, fh, ensure_ascii=True, separators=(",", ":"))


if __name__ == "__main__":
    main()
