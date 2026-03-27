#!/usr/bin/env python3
"""Compatibility wrapper for the real vector asset builder.

The primary implementation now lives in scripts/build_vector_assets.mjs so it can
reuse the local topojson-client bundle directly. Keep this wrapper so existing
docs/commands continue to work.
"""

from __future__ import annotations

from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
NODE_SCRIPT_PATH = ROOT / "scripts" / "build_vector_assets.mjs"


def main() -> int:
    completed = subprocess.run(
        ["node", str(NODE_SCRIPT_PATH)],
        cwd=ROOT,
        check=False,
    )
    return completed.returncode


if __name__ == "__main__":
    raise SystemExit(main())
