#!/bin/bash
# Script para actualizar resultados reales durante la ceremonia
# Uso: ./update-results.sh "best-picture" "Sinners"

BLOB_ID="019cf34f-fc35-7eea-87fc-eb42c60c02c3"
URL="https://jsonblob.com/api/jsonBlob/$BLOB_ID"

CATEGORY="$1"
WINNER="$2"

if [ -z "$CATEGORY" ] || [ -z "$WINNER" ]; then
  echo "Uso: $0 <category-id> <winner>"
  echo ""
  echo "Categorías:"
  echo "  best-picture, best-director, best-actor, best-actress"
  echo "  best-supporting-actor, best-supporting-actress"
  echo "  best-original-screenplay, best-adapted-screenplay"
  echo "  best-animated, best-documentary, best-international"
  echo "  best-cinematography, best-costume, best-editing"
  echo "  best-makeup, best-vfx, best-sound, best-production-design"
  echo "  best-score, best-song, best-casting"
  echo "  best-animated-short, best-short, best-doc-short"
  exit 1
fi

# Fetch current data
DATA=$(curl -s "$URL")

# Update results using jq
UPDATED=$(echo "$DATA" | jq --arg cat "$CATEGORY" --arg win "$WINNER" '.results[$cat] = $win')

# Write back
curl -s -X PUT "$URL" \
  -H "Content-Type: application/json" \
  -d "$UPDATED" | jq '.results'

echo ""
echo "✅ Actualizado: $CATEGORY = $WINNER"
