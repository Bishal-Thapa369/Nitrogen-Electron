#!/bin/bash

# Nitrogen Editor RAM Usage Tracker
# This script identifies all processes related to the Electron frontend
# and calculates their total Resident Set Size (RSS) in MB.

echo "--- Nitrogen Editor RAM Usage Monitor ---"
echo "Searching for processes: electron, nitrogen-editor, node (dev-server)"

# Get total usage in KB for all matching electron/node processes
total_kb=$(ps -C electron,nitrogen-editor,node -o rss= | awk '{sum+=$1} END {print sum}')

if [ -z "$total_kb" ] || [ "$total_kb" -eq 0 ]; then
    echo "Error: No active Nitrogen/Electron processes found."
    echo "Make sure to run 'npm run dev:electron' first."
    exit 1
fi

total_mb=$(echo "scale=2; $total_kb / 1024" | bc)

echo "Total RAM Usage: ${total_mb} MB"
echo "----------------------------------------"

# Breakdown by process type (approximate)
ps -C electron,nitrogen-editor,node -o pid,rss,cmd | while read line; do
    if [[ $line == *"PID"* ]]; then continue; fi
    pid=$(echo $line | awk '{print $1}')
    kb=$(echo $line | awk '{print $2}')
    mb=$(echo "scale=2; $kb / 1024" | bc)
    cmd=$(echo $line | cut -d' ' -f3-)
    echo "PID: $pid | $mb MB | $cmd"
done
