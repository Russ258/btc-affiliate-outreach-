#!/bin/bash

# Daily Discovery Cron Job
# This script runs automatically to discover new prospects

# Change to the project directory
cd /Users/240553/btc-affiliate-outreach

# Load environment variables
export PATH="/opt/anaconda3/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# Log file
LOG_FILE="/Users/240553/btc-affiliate-outreach/logs/discovery-$(date +%Y-%m-%d).log"
mkdir -p logs

# Run discovery
echo "=== Discovery started at $(date) ===" >> "$LOG_FILE"
npm run discover >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "=== Discovery completed successfully at $(date) ===" >> "$LOG_FILE"
else
  echo "=== Discovery failed with exit code $EXIT_CODE at $(date) ===" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
