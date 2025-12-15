#!/usr/bin/env bash
# scripts/init-uploads.sh
# Creates public/uploads and a .gitkeep and sets permissive write permissions for local dev.
# Usage: bash scripts/init-uploads.sh

set -e

UPLOADS_DIR="./public/uploads"
GITKEEP="${UPLOADS_DIR}/.gitkeep"

if [ ! -d "$UPLOADS_DIR" ]; then
  echo "Creating $UPLOADS_DIR"
  mkdir -p "$UPLOADS_DIR"
else
  echo "$UPLOADS_DIR already exists"
fi

if [ ! -f "$GITKEEP" ]; then
  echo "Creating .gitkeep"
  touch "$GITKEEP"
else
  echo ".gitkeep already present"
fi

# Make sure dev user can write (chmod 775)
chmod 775 "$UPLOADS_DIR"
chmod 664 "$GITKEEP"

echo "Done. You can now upload files to $UPLOADS_DIR (dev only)."
