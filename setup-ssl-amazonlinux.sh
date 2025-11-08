#!/bin/bash

# SSL Certificate Setup Script for Amazon Linux 2023
# Uses Let's Encrypt with Certbot

set -e

echo "========================================="
echo "Easy ACP - SSL Setup (Amazon Linux)"
echo "========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

DOMAIN="acp.wrkth.in"
EMAIL="admin@wrkth.in"

print_info "Setting up SSL for domain: $DOMAIN"

# Install Certbot
print_info "Installing Certbot..."
dnf install -y python3 python3-pip augeas-libs
python3 -m pip install --upgrade pip
python3 -m pip install certbot certbot-nginx

print_info "Checking DNS configuration..."
SERVER_IP=$(curl -s http://checkip.amazonaws.com || echo "Unable to get IP")
print_info "Server IP: $SERVER_IP"

DNS_IP=$(dig +short $DOMAIN @8.8.8.8 | tail -n1 || echo "Unable to resolve")
print_info "DNS resolves to: $DNS_IP"

if [ "$SERVER_IP" != "$DNS_IP" ]; then
    print_warning "DNS might not be pointing to this server!"
    print_warning "Server IP: $SERVER_IP"
    print_warning "DNS IP: $DNS_IP"
    sleep 5
fi

# Setup nginx temp config
print_info "Creating temporary nginx configuration..."
NGINX_CONFIG="/etc/nginx/conf.d/$DOMAIN.conf"

cat > $NGINX_CONFIG <<EOF
# Temporary configuration for Let's Encrypt
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Nginx is running. SSL setup in progress...';
        add_header Content-Type text/plain;
    }
}
EOF

# Test and reload nginx
nginx -t
systemctl reload nginx

# Obtain SSL certificate
print_info "Obtaining SSL certificate from Let's Encrypt..."

certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --domains $DOMAIN \
    || {
        print_error "Failed to obtain SSL certificate"
        exit 1
    }

print_info "SSL certificate obtained successfully!"

# Install full nginx config
print_info "Installing full nginx configuration with SSL..."

cat > $NGINX_CONFIG <<'EOFNGINX'
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

# Upstream definitions
upstream api_backend {
    server localhost:3001;
    keepalive 32;
}

upstream web_frontend {
    server localhost:3000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name acp.wrkth.in;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name acp.wrkth.in;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/acp.wrkth.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/acp.wrkth.in/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/acp.wrkth.in/chain.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/acp.wrkth.in.access.log;
    error_log /var/log/nginx/acp.wrkth.in.error.log;

    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;

    # API endpoints
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend
    location / {
        limit_req zone=general_limit burst=50 nodelay;
        proxy_pass http://web_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }

    # Health check
    location = /health {
        access_log off;
        proxy_pass http://web_frontend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
EOFNGINX

# Test and reload
nginx -t
systemctl reload nginx

# Setup auto-renewal
print_info "Setting up automatic certificate renewal..."

cat > /etc/cron.d/certbot-renew <<EOF
0 */12 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

print_info "Testing certificate renewal..."
certbot renew --dry-run || print_warning "Renewal test failed, but certificate is installed"

echo ""
print_info "========================================="
print_info "SSL Setup Complete!"
print_info "========================================="
echo ""
print_info "Certificate information:"
certbot certificates

echo ""
print_info "Your site should now be accessible at:"
print_info "  https://$DOMAIN"
