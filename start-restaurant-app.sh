#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo ""
echo "============================================================"
echo "  Restaurant Online Ordering & QR Table Management System"
echo "  One-Click Setup & Launcher"
echo "============================================================"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js is not installed."
  echo "Install Node.js LTS from https://nodejs.org/ and run this script again."
  exit 1
fi

echo "[OK] Detected Node.js $(node -v)"
node setup.mjs --start --open
