#!/bin/bash
set -euo pipefail
UDID=$(xcrun simctl list devices booted -j | python3 -c "
import json, sys
data = json.load(sys.stdin)['devices']
for runtime, devices in data.items():
    for d in devices:
        if d['state'] == 'Booted':
            print(d['udid'])
            break
")
if [ -z "$UDID" ]; then
  echo "No booted iOS simulator found." >&2
  exit 1
fi
echo "Setting location on simulator $UDID to Singapore city centre..."
xcrun simctl location "$UDID" set 1.2834,103.8607
