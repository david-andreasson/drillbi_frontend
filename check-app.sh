#!/bin/bash

# Kontrollera att frontend bygger
cd "$(dirname "$0")"
echo "Bygger frontend..."
npm run build
FRONTEND_STATUS=$?

cd ../drillbi_backend

echo "Bygger backend..."
mvn clean verify
BACKEND_STATUS=$?

if [ $FRONTEND_STATUS -eq 0 ] && [ $BACKEND_STATUS -eq 0 ]; then
  echo "✅ Applikationen kan starta (frontend & backend bygger utan fel)"
  exit 0
else
  echo "❌ Byggfel! Kontrollera loggar ovan."
  exit 1
fi
