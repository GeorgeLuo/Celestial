#!/bin/bash
cd webapp/session-visualizer

# Check if node_modules directory does not exist, then run npm install
if [ ! -d "node_modules" ]; then
  npm install
fi

npm run build
cd ../../
