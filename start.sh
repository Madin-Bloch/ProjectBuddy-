#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/frontend"
if [ ! -d node_modules ]; then
  npm install
fi
cd "$ROOT/backend"
if [ ! -d node_modules ]; then
  npm install express
fi
node "$ROOT/backend/src/index.js" &
BACK_PID=$!
cd "$ROOT/frontend"
npm run dev
kill $BACK_PID 2>/dev/null || true
