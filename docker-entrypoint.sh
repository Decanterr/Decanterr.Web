#!/bin/sh
# Inject runtime environment variables into the built JS
# This allows VITE_API_URL and VITE_API_KEY to be set at container runtime

if [ -n "$VITE_API_URL" ] || [ -n "$VITE_API_KEY" ]; then
  # Find all JS files and replace placeholder values
  for file in /usr/share/nginx/html/assets/*.js; do
    if [ -f "$file" ]; then
      # Replace default values with runtime env vars
      if [ -n "$VITE_API_URL" ]; then
        sed -i "s|http://localhost:8080|${VITE_API_URL}|g" "$file"
      fi
      if [ -n "$VITE_API_KEY" ]; then
        sed -i "s|CHANGE-ME-TO-A-SECURE-KEY|${VITE_API_KEY}|g" "$file"
      fi
    fi
  done
fi
