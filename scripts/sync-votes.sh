#!/bin/bash
# Sync votes.json to GitHub so other devices can see them
# Run this periodically or after each vote notification

cd /tmp/oscars-2026-predictions

# Read current votes from the repo
CURRENT=$(cat public/votes.json 2>/dev/null || echo '{"votes":{},"results":{}}')

# If votes changed, commit and push
if [ "$1" != "" ]; then
  echo "$1" > public/votes.json
fi

git add public/votes.json
git diff --cached --quiet && exit 0

git commit -m "update: sync votes $(date +%H:%M)" 
git push origin main

# Also update gh-pages
npx gh-pages -d dist
echo "Votes synced to GitHub"
