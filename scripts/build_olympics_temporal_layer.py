#!/usr/bin/env python3
"""Build a packed temporal layer artifact from OlympicsGoNUTS yearly CSVs."""

from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path

from feature_ids import build_feature_id


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "data" / "sources" / "olympicsgonuts"
OUTPUT_PATH = ROOT / "data" / "temporal" / "olympic-medals-birthplace.layer.json"
YEARS = (1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024)


def clean_value(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    if not stripped or stripped == "NA":
        return None
    return stripped


def parse_float(value: str | None) -> float | None:
    cleaned = clean_value(value)
    if cleaned is None:
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def load_missing_count(year: int) -> int:
    missing_path = SOURCE_ROOT / str(year) / f"{year}_medalists_missing_place_of_birth.csv"
    with missing_path.open("r", encoding="utf-8", newline="") as handle:
        return max(sum(1 for _ in handle) - 1, 0)


def build_feature(year: int, row: dict[str, str], feature_index: int) -> dict[str, object] | None:
    lon = parse_float(row.get("lon"))
    lat = parse_float(row.get("lat"))
    if lon is None or lat is None:
        return None

    properties = {
        "year": year,
        "athleteId": clean_value(row.get("medalist_wikidata_id")),
        "athleteName": clean_value(row.get("medalist_name")),
        "athleteLink": clean_value(row.get("medalist_link")),
        "medal": clean_value(row.get("medal")),
        "delegationName": clean_value(row.get("delegation_name")),
        "delegationId": clean_value(row.get("delegation_wikidata_id")),
        "countryName": clean_value(row.get("country_medal")),
        "countryCode2": clean_value(row.get("country_medal_code2")),
        "countryCode3": clean_value(row.get("country_medal_code3")),
        "countryIocCode": clean_value(row.get("country_medal_ioc_country_code")),
        "sex": clean_value(row.get("sex_or_gender")),
        "eventId": clean_value(row.get("event_wikidata_id")),
        "eventName": clean_value(row.get("event_name")),
        "eventLink": clean_value(row.get("event_link")),
        "eventGroup": clean_value(row.get("event_part_of")),
        "sport": clean_value(row.get("sport")),
        "sportId": clean_value(row.get("sport_wikidata_id")),
        "birthDate": clean_value(row.get("date_of_birth")),
        "birthplaceId": clean_value(row.get("place_of_birth_wikidata_id")),
        "birthplaceName": clean_value(row.get("place_of_birth")),
        "birthplaceLocatedIn": clean_value(row.get("place_of_birth_located_in")),
        "birthplaceLocatedInId": clean_value(row.get("place_of_birth_located_in_wikidata_id")),
        "birthplaceCoordinatesRaw": clean_value(row.get("place_of_birth_coordinates")),
        "nuts0Id": clean_value(row.get("nuts0_id")),
        "nuts0Name": clean_value(row.get("nuts0_name")),
        "nuts1Id": clean_value(row.get("nuts1_id")),
        "nuts1Name": clean_value(row.get("nuts1_name")),
        "nuts2Id": clean_value(row.get("nuts2_id")),
        "nuts2Name": clean_value(row.get("nuts2_name")),
        "nuts3Id": clean_value(row.get("nuts3_id")),
        "nuts3Name": clean_value(row.get("nuts3_name")),
    }
    geometry = {"type": "Point", "coordinates": [lon, lat]}

    return {
        "type": "Feature",
        "id": build_feature_id(
            layer_id="olympic-medals-birthplace",
            time_key=year,
            feature_index=feature_index,
            properties=properties,
            geometry=geometry,
        ),
        "geometry": geometry,
        "properties": properties,
    }


def main() -> int:
    artifact: dict[str, object] = {
        "layerId": "olympic-medals-birthplace",
        "label": "Olympic Medals by Birthplace",
        "geometryType": "Point",
        "timeField": "year",
        "availableTimes": list(YEARS),
        "filterFields": [
            "medal",
            "sport",
            "eventName",
            "eventGroup",
            "delegationName",
            "countryName",
            "sex",
        ],
        "source": {
            "name": "OlympicsGoNUTS",
            "sourceRoot": "data/sources/olympicsgonuts",
            "canonicalInputPattern": "{year}/{year}_medalists_all.csv",
            "licenseNote": "Source project states CC-BY on the published site.",
            "url": "https://edjnet.github.io/OlympicsGoNUTS/",
        },
        "coverageByTime": {},
        "featuresByTime": {},
    }

    for year in YEARS:
        source_path = SOURCE_ROOT / str(year) / f"{year}_medalists_all.csv"
        features: list[dict[str, object]] = []
        sport_counter: Counter[str] = Counter()
        medal_counter: Counter[str] = Counter()
        sex_counter: Counter[str] = Counter()
        event_counter: Counter[str] = Counter()

        with source_path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            skipped_for_missing_coordinates = 0
            for row_index, row in enumerate(reader):
                feature = build_feature(year, row, row_index)
                if feature is None:
                    skipped_for_missing_coordinates += 1
                    continue
                features.append(feature)
                props = feature["properties"]
                for counter, key in (
                    (sport_counter, "sport"),
                    (medal_counter, "medal"),
                    (sex_counter, "sex"),
                    (event_counter, "eventName"),
                ):
                    value = props.get(key)
                    if isinstance(value, str):
                        counter[value] += 1

        missing_birthplace_rows = load_missing_count(year)
        coverage = {
            "featureCount": len(features),
            "rowsSkippedForMissingCoordinates": skipped_for_missing_coordinates,
            "missingBirthplaceCount": missing_birthplace_rows,
            "missingBirthplaceRate": round(
                missing_birthplace_rows / (len(features) + missing_birthplace_rows), 4
            )
            if features
            else 0,
            "uniqueSports": len(sport_counter),
            "uniqueEvents": len(event_counter),
            "medalBreakdown": dict(sorted(medal_counter.items())),
            "sexBreakdown": dict(sorted(sex_counter.items())),
        }
        artifact["coverageByTime"][str(year)] = coverage
        artifact["featuresByTime"][str(year)] = {
            "type": "FeatureCollection",
            "features": features,
        }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as handle:
        json.dump(artifact, handle, ensure_ascii=True, separators=(",", ":"))

    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
