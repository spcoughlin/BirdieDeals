#!/bin/bash
set -e

echo "Starting frontend server..."
npm install -g serve
serve -s dist -l $PORT
