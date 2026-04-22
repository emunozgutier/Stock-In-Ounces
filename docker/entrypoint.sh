#!/bin/bash
set -e

echo "Starting Stock Data Collector Container..."

# Setup SSH key if provided in the mapped volume
if [ -f "/keys/id_rsa" ]; then
    echo "Found SSH key. Setting up ~/.ssh..."
    mkdir -p ~/.ssh
    cp /keys/id_rsa ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    ssh-keyscan github.com >> ~/.ssh/known_hosts
fi

# Configure git user and email
git config --global user.email "${GIT_EMAIL:-docker@stock-in-ounces.local}"
git config --global user.name "${GIT_NAME:-Stock Updater Bot}"

# Configure git to consider the directory safe
git config --global --add safe.directory /app

while true; do
    echo "[$(date)] Running data collection script..."
    python collect_data.py
    
    echo "[$(date)] Checking for changes..."
    git add public/data.csv public/tickers.json
    
    if git diff --staged --quiet; then
        echo "[$(date)] No changes to commit."
    else
        echo "[$(date)] Changes detected, committing to git..."
        git commit -m "Automated data update: $(date +'%Y-%m-%d %H:%M')"
        # Push to whichever branch is currently tracking origin
        git push origin HEAD
        echo "[$(date)] Git push successful."
    fi
    
    echo "[$(date)] Sleeping for 24 hours (86400 seconds)..."
    sleep 86400
done
