#!/usr/bin/env bash
# make-media.sh — rebuild every video/image asset the site serves, from the
# locked motion renders in portfolio/motion/. Nothing here is drawn: every frame
# comes from Alex's existing AURA / NOVA / PULSE renders. Free tooling only (ffmpeg).
#
# Usage:  bash tools/make-media.sh          (run from web/site)
#
# Outputs (all under public/media/):
#   showreel.mp4 / showreel.webm / showreel-poster.jpg   hero background loop, 12 s
#   <brand>-loop.mp4 / <brand>-loop-poster.jpg           card hover preview, 960x540, 5 s
#   <brand>-hero.mp4 / <brand>-hero-poster.jpg           case-study cinematic hero, 1920x1080, 6 s
#   <brand>-<scene>.webp                                 case-study process stills
set -euo pipefail

# ffmpeg is a native Windows binary and MSYS path translation is off on this
# host, so every path handed to it must be a C:/... path (cygpath -m).
SITE_DIR="$(cygpath -m "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)")"
MOTION="$(cd "$SITE_DIR/../.." && pwd)/motion"
MOTION="$(cygpath -m "$MOTION")"
OUT="$SITE_DIR/public/media"
mkdir -p "$OUT"

echo "motion source: $MOTION"
echo "output:        $OUT"

# ---------------------------------------------------------------- hero showreel
# One 4 s segment from each brand, concatenated into a single 12 s loop.
# -an          the renders carry no audio; assert that on the way out too
# -movflags +faststart  so the first frame can paint before the file finishes
echo "-- showreel (12 s, 1600x900)"
ffmpeg -y -v error \
  -i "$MOTION/AURA/renders/aura_s01_breathe_1080p.mp4" \
  -i "$MOTION/NOVA/renders/nova_s01_future_1080p.mp4" \
  -i "$MOTION/PULSE/renders/pulse_s01_rhythm_1080p.mp4" \
  -filter_complex "\
[0:v]trim=start=1:end=5,setpts=PTS-STARTPTS,scale=1600:900,fps=30[v0];\
[1:v]trim=start=2:end=6,setpts=PTS-STARTPTS,scale=1600:900,fps=30[v1];\
[2:v]trim=start=1:end=5,setpts=PTS-STARTPTS,scale=1600:900,fps=30[v2];\
[v0][v1][v2]concat=n=3:v=1:a=0[out]" \
  -map "[out]" -an -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart \
  "$OUT/showreel.mp4"

ffmpeg -y -v error -i "$OUT/showreel.mp4" -an \
  -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -cpu-used 3 -deadline good -pix_fmt yuv420p \
  "$OUT/showreel.webm"

ffmpeg -y -v error -ss 1.5 -i "$OUT/showreel.mp4" -frames:v 1 -q:v 4 "$OUT/showreel-poster.jpg"

# ------------------------------------------------------- per-brand card loop
# 960x540 keeps a hover preview under ~250 kB — it is decoration, not content.
loop_seg() {
  case "$1" in
    AURA)  echo "1 6" ;;
    NOVA)  echo "2 7" ;;
    PULSE) echo "1 6" ;;
  esac
}
for row in "AURA aura" "NOVA nova" "PULSE pulse"; do
  set -- $row
  BRAND=$1
  lower=$(echo "$2" | tr 'A-Z' 'a-z')
  SRC=$(ls "$MOTION/$BRAND/renders/"*_s01_*_1080p.mp4 | head -1)
  read -r START END <<< "$(loop_seg "$BRAND")"
  echo "-- $BRAND card loop (960x540)"
  ffmpeg -y -v error -ss "$START" -to "$END" -i "$SRC" \
    -vf "scale=960:540,fps=30" -an -c:v libx264 -crf 28 -preset slow \
    -pix_fmt yuv420p -movflags +faststart "$OUT/$lower-loop.mp4"
  ffmpeg -y -v error -ss 0.5 -i "$OUT/$lower-loop.mp4" -frames:v 1 -q:v 5 \
    "$OUT/$lower-loop-poster.jpg"

  # --------------------------------------------------- case-study hero (1080p)
  HS=$(ls "$MOTION/$BRAND/renders/"*_s02_*_1080p.mp4 | head -1)
  echo "-- $BRAND case-study hero (1920x1080)"
  ffmpeg -y -v error -ss 1 -to 7 -i "$HS" -an \
    -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart \
    "$OUT/$lower-hero.mp4"
  ffmpeg -y -v error -ss 1 -i "$OUT/$lower-hero.mp4" -frames:v 1 -q:v 5 \
    "$OUT/$lower-hero-poster.jpg"

  # ------------------------------------------------------- process stills
  n=0
  for png in "$MOTION/$BRAND/stills/"*.png; do
    n=$((n + 1))
    scene=$(printf "%02d" "$n")
    echo "-- $BRAND process still $scene  ($(basename "$png"))"
    ffmpeg -y -v error -i "$png" -vf "scale=1400:-2" \
      -c:v libwebp -quality 80 -compression_level 6 "$OUT/$lower-$scene.webp"
  done
done

echo
echo "== public/media contents =="
ls -la "$OUT"
