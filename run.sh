#!/bin/bash
cd "$(dirname "$0")"
echo "🔍 Memory Search Engine - Launching..."
echo "Type your query and press Enter"
echo 'Type "exit" or press Ctrl+C to quit'
echo ""
node src/cli.js
