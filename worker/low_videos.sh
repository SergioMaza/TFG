#!/bin/bash

INPUT_DIR="./videos"
OUTPUT_DIR="./videos/low"

mkdir -p "$OUTPUT_DIR"

for file in "$INPUT_DIR"/*.mp4; do
  filename=$(basename "$file")

  ffmpeg -i "$file" \
    -vf "scale=-2:720" \
    -r 30 \
    -c:v libx264 \
    -crf 28 \
    -preset fast \
    -c:a aac \
    -b:a 128k \
    "$OUTPUT_DIR/$filename"
done