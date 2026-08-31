#!/bin/sh
# Resize iOS screenshots to ASC-supported dimensions before uploading.
# iPhone screenshots (no ipad- prefix) → 1242×2688 (6.5" display)
# iPad screenshots (ipad- prefix)      → 2064×2752 (13" iPad Pro M4)
for f in fastlane/screenshots/*/*.png; do
  [ -f "$f" ] || continue
  case "$(basename "$f")" in
    ipad-*) sips -z 2752 2064 "$f" >/dev/null 2>&1 ;;
    *)      sips -z 2688 1242 "$f" >/dev/null 2>&1 ;;
  esac
done
