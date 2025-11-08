#!/bin/bash

# EC2 Instance Setup Script
# This script sets up the EC2 instance for the first time
# Run this ONCE on the EC2 instance after initial launch

set -e  # Exit on error

echo "========================================="
echo "Easy ACP - EC2 Setup Script"
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

print_info "Updating system packages..."
apt-get update
apt-get upgrade -y

print_info "Installing required packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    wget \
    vim

print_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Set up the repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Start and enable Docker
    systemctl start docker
    systemctl enable docker

    print_info "Docker installed successfully"
else
    print_info "Docker already installed"
fi

print_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION="v2.24.5"
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_info "Docker Compose installed successfully"
else
    print_info "Docker Compose already installed"
fi

print_info "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    print_info "Nginx installed successfully"
else
    print_info "Nginx already installed"
fi

print_info "Configuring firewall (UFW)..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw --force enable
    print_info "Firewall configured"
else
    print_warning "UFW not installed, skipping firewall setup"
fi

print_info "Creating application directory..."
APP_DIR="/opt/easy-acp"
mkdir -p $APP_DIR
cd $APP_DIR

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
    create 0640 www-data adm
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
