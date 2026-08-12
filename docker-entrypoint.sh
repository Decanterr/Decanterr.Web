#!/bin/sh
# Inject the runtime API key into the built JS (VITE_API_KEY is a build-time-only
# Vite variable, so the client bundle ships a placeholder that we substitute here).

if [ -n "$VITE_API_KEY" ]; then
  for file in /usr/share/nginx/html/assets/*.js; do
    if [ -f "$file" ]; then
      sed -i "s|__DECANTERR_API_KEY__|${VITE_API_KEY}|g" "$file"
    fi
  done
fi
