#!/usr/bin/env python3
import argparse
import json
import os
import re
from pathlib import Path


def parse_header_map(path):
    header_map = {}
    with open(path, "r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            parts = line.split(",")
            if len(parts) < 3:
                continue
            key, start, end = parts[0].strip(), parts[1].strip(), parts[2].strip()
            header_map[key] = (int(start, 16), int(end, 16))
    return header_map


def parse_pointer_map(path):
    pointer_map = {}
    with open(path, "r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            parts = line.split(",")
            if len(parts) < 2:
                continue
            key, value = parts[0].strip(), parts[1].strip()
            pointer_map[key] = value
    return pointer_map


def sanitize_filename(name):
    safe = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    safe = safe.strip("._")
    return safe or "sprite"


def build_output_name(base_name, existing_names):
    candidate = sanitize_filename(base_name)
    if candidate not in existing_names:
        existing_names.add(candidate)
        return candidate
    index = 2
    while f"{candidate}-{index}" in existing_names:
        index += 1
    final_name = f"{candidate}-{index}"
    existing_names.add(final_name)
    return final_name


def extract_sprites(dump_path, header_map, pointer_map, output_dir, mapping_path):
    output_dir.mkdir(parents=True, exist_ok=True)
    dump_bytes = Path(dump_path).read_bytes()

    rows = []
    used_names = set()

    if pointer_map:
        entries = pointer_map.items()
    else:
        entries = ((key, key) for key in header_map.keys())

    for pointer_key, sprite_key in entries:
        if sprite_key not in header_map:
            continue
        start, end = header_map[sprite_key]
        if end <= start:
            continue
        file_base = build_output_name(pointer_key, used_names)
        filename = f"{file_base}.png"
        output_path = output_dir / filename
        output_path.write_bytes(dump_bytes[start:end])
        rows.append(
            {
                "pointer_key": pointer_key,
                "sprite_key": sprite_key,
                "filename": filename,
                "start": start,
                "end": end,
            }
        )

    if mapping_path:
        mapping_path.parent.mkdir(parents=True, exist_ok=True)
        mapping_path.write_text(json.dumps(rows, indent=2), encoding="utf-8")


def build_parser():
    parser = argparse.ArgumentParser(
        description="Extract sprites from Unity imagedump files into standalone PNGs."
    )
    parser.add_argument("--dump", required=True, help="Path to imagedump.dmp")
    parser.add_argument("--header", required=True, help="Path to imagedump.dmp.header")
    parser.add_argument(
        "--pointer",
        help="Path to SpritePointer.txt (optional, used to map item keys to sprite keys)",
    )
    parser.add_argument(
        "--out-dir",
        default="resources/sprites",
        help="Output directory for extracted PNGs",
    )
    parser.add_argument(
        "--map-output",
        default="resources/sprite-map.json",
        help="JSON mapping output for pointer keys to filenames",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    header_map = parse_header_map(args.header)
    pointer_map = parse_pointer_map(args.pointer) if args.pointer else None

    extract_sprites(
        args.dump,
        header_map,
        pointer_map,
        Path(args.out_dir),
        Path(args.map_output) if args.map_output else None,
    )


if __name__ == "__main__":
    main()
