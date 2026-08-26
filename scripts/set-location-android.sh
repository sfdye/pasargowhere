#!/bin/bash
set -euo pipefail
echo "Setting location on Android emulator to Singapore city centre..."
adb emu geo fix 103.8607 1.2834
