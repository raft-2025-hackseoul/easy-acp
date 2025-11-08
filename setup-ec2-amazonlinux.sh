#!/bin/bash

# EC2 Instance Setup Script for Amazon Linux 2023
# Run this ONCE on the EC2 instance after initial launch

set -e  # Exit on error

echo "========================================="
echo "Easy ACP - EC2 Setup Script (Amazon Linux)"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

print_info "Updating system packages..."
dnf update -y

print_info "Installing required packages..."
dnf install -y \
    git \
    wget \
    vim \
    tar

print_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    dnf install -y docker
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user
    print_info "Docker installed successfully"
else
    print_info "Docker already installed"
fi

print_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION="v2.24.5"
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    print_info "Docker Compose installed successfully"
else
    print_info "Docker Compose already installed"
fi

print_info "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    dnf install -y nginx
    systemctl start nginx
    systemctl enable nginx
    print_info "Nginx installed successfully"
else
    print_info "Nginx already installed"
fi

print_info "Creating application directory..."
APP_DIR="/opt/easy-acp"
mkdir -p $APP_DIR
chown ec2-user:ec2-user $APP_DIR

print_info "Creating uploads directory..."
mkdir -p $APP_DIR/uploads
chmod 755 $APP_DIR/uploads

print_info "Creating certbot directory..."
mkdir -p /var/www/certbot
chmod 755 /var/www/certbot

print_info "Setting up log rotation..."
cat > /etc/logrotate.d/easy-acp <<EOF
/var/log/nginx/acp.wrkth.in.*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 nginx adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 \$(cat /var/run/nginx.pid)
    endscript
}
EOF

print_info "Docker version: $(docker --version)"
print_info "Docker Compose version: $(docker-compose --version)"
print_info "Nginx version: $(nginx -v 2>&1)"

echo ""
print_info "========================================="
print_info "EC2 Setup Complete!"
print_info "========================================="
echo ""
print_warning "Next steps:"
echo "  1. Clone your repository to $APP_DIR"
echo "  2. Copy .env.production to .env and fill in your API keys"
echo "  3. Run setup-ssl.sh to configure SSL certificates"
echo "  4. Run deploy-ec2.sh to deploy the application"
echo ""
print_info "Application directory: $APP_DIR"
print_info "Repository should be cloned to: $APP_DIR"
