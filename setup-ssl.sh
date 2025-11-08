#!/bin/bash

# SSL Certificate Setup Script using Let's Encrypt
# This script sets up SSL certificates for acp.wrkth.in
# Prerequisites: DNS must be pointing to this server's IP

set -e  # Exit on error

echo "========================================="
echo "Easy ACP - SSL Setup Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

DOMAIN="acp.wrkth.in"
EMAIL="admin@wrkth.in"  # Change this to your email

print_info "Setting up SSL for domain: $DOMAIN"

# Install Certbot
print_info "Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    print_info "Certbot installed successfully"
else
    print_info "Certbot already installed"
fi

# Check if DNS is pointing to this server
print_info "Checking DNS configuration..."
SERVER_IP=$(curl -s http://checkip.amazonaws.com || echo "Unable to get IP")
print_info "Server IP: $SERVER_IP"

DNS_IP=$(dig +short $DOMAIN @8.8.8.8 | tail -n1 || echo "Unable to resolve")
print_info "DNS resolves to: $DNS_IP"

if [ "$SERVER_IP" != "$DNS_IP" ]; then
    print_warning "DNS might not be pointing to this server!"
    print_warning "Server IP: $SERVER_IP"
    print_warning "DNS IP: $DNS_IP"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Aborted. Please configure DNS first."
        exit 1
    fi
fi

# Setup nginx config directory
print_info "Setting up nginx configuration..."
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN"

# Check if config already exists
if [ -f "$NGINX_CONFIG" ]; then
    print_warning "Nginx config already exists at $NGINX_CONFIG"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping nginx config setup"
    else
        # Copy nginx config from repository
        if [ -f "nginx/$DOMAIN.conf" ]; then
            # Create temporary config without SSL for initial certbot setup
            print_info "Creating temporary nginx config for certbot..."
            cat > $NGINX_CONFIG <<EOF
# Temporary configuration for Let's Encrypt setup
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Allow Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Temporary: serve app on HTTP
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
        else
            print_error "nginx/$DOMAIN.conf not found in repository"
            exit 1
        fi
    fi
else
    # Create temporary config for initial setup
    print_info "Creating temporary nginx config..."
    cat > $NGINX_CONFIG <<EOF
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
fi

# Enable nginx site
if [ ! -L "$NGINX_ENABLED" ]; then
    ln -s $NGINX_CONFIG $NGINX_ENABLED
    print_info "Enabled nginx site"
fi

# Test nginx config
print_info "Testing nginx configuration..."
nginx -t

# Reload nginx
print_info "Reloading nginx..."
systemctl reload nginx

# Obtain SSL certificate
print_info "Obtaining SSL certificate from Let's Encrypt..."
print_warning "This will use Let's Encrypt's rate limits. Make sure DNS is correct!"

certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --domains $DOMAIN \
    || {
        print_error "Failed to obtain SSL certificate"
        print_error "Common issues:"
        print_error "  1. DNS not pointing to this server"
        print_error "  2. Port 80 not accessible from internet"
        print_error "  3. Firewall blocking HTTP traffic"
        exit 1
    }

print_info "SSL certificate obtained successfully!"

# Now install the full nginx config with SSL
print_info "Installing full nginx configuration with SSL..."
if [ -f "nginx/$DOMAIN.conf" ]; then
    cp "nginx/$DOMAIN.conf" $NGINX_CONFIG
    print_info "Nginx config updated"
else
    print_warning "Full nginx config not found. You may need to update it manually."
fi

# Test nginx config
print_info "Testing nginx configuration..."
nginx -t

# Reload nginx
print_info "Reloading nginx with SSL configuration..."
systemctl reload nginx

# Setup automatic renewal
print_info "Setting up automatic certificate renewal..."

# Create renewal script
cat > /etc/cron.d/certbot-renew <<EOF
# Renew Let's Encrypt certificates twice daily
0 */12 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

print_info "Auto-renewal configured"

# Test renewal
print_info "Testing certificate renewal (dry run)..."
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
echo ""
print_warning "Certificate will auto-renew every 60 days"
print_info "Check renewal status with: certbot renew --dry-run"
