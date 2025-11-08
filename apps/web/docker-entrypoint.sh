#!/bin/sh
set -e

# Default API URL if not provided
export API_URL=${API_URL:-http://localhost:3001}

echo "Configuring nginx with API_URL: $API_URL"

# Replace environment variables in nginx config
envsubst '${API_URL}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf

# Execute the CMD
exec "$@"
