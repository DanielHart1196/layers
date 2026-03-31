#!/usr/bin/env python3
"""Shared builder-side feature id generation utilities."""

from __future__ import annotations

import hashlib
import json
from typing import Any


def _canonicalize(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: _canonicalize(value[key]) for key in sorted(value)}
    if isinstance(value, list):
        return [_canonicalize(item) for item in value]
    return value


def build_feature_id(
    *,
    layer_id: str,
    feature_index: int,
    time_key: str | int | None = None,
    properties: dict[str, Any] | None = None,
    geometry: dict[str, Any] | None = None,
) -> str:
    """Create a deterministic app-owned feature id for normalized data."""

    canonical_payload = {
        "layerId": layer_id,
        "timeKey": time_key,
        "featureIndex": feature_index,
        "properties": _canonicalize(properties or {}),
        "geometry": _canonicalize(geometry or {}),
    }
    digest = hashlib.sha1(
        json.dumps(canonical_payload, ensure_ascii=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()[:16]
    time_prefix = f"{time_key}-" if time_key is not None else ""
    return f"{layer_id}-{time_prefix}{digest}"
