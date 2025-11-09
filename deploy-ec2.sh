#!/bin/bash

# EC2 Deployment Script
# Deploys Easy ACP to EC2 instance
# Usage: ./deploy-ec2.sh [ec2-user@ip-address]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Configuration
EC2_HOST="${1:-ec2-user@15.165.161.41}"  # Default or from argument
SSH_KEY="$HOME/.ssh/workith-mail-dev.pem"
APP_DIR="/opt/easy-acp"
REPO_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

echo "========================================="
echo "Easy ACP - EC2 Deployment Script"
echo "========================================="
echo ""

# Validate SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_error "SSH key not found at: $SSH_KEY"
    exit 1
fi

print_info "Configuration:"
echo "  EC2 Host: $EC2_HOST"
echo "  SSH Key: $SSH_KEY"
echo "  App Directory: $APP_DIR"
echo "  Repository: $REPO_URL"
echo "  Branch: $BRANCH"
echo ""

# Test SSH connection
print_step "Testing SSH connection..."
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_HOST" "echo 'SSH connection successful'" &>/dev/null; then
    print_error "Failed to connect to EC2 instance"
    print_error "Make sure:"
    print_error "  1. EC2 instance is running"
    print_error "  2. Security group allows SSH (port 22)"
    print_error "  3. SSH key is correct: $SSH_KEY"
    exit 1
fi
print_info "SSH connection successful"

# Function to run commands on EC2
run_on_ec2() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "$@"
}

# Check if this is initial deployment or update
print_step "Checking deployment status..."
if run_on_ec2 "[ -d $APP_DIR/.git ]"; then
    DEPLOYMENT_TYPE="update"
    print_info "Existing deployment found - performing update"
else
    DEPLOYMENT_TYPE="initial"
    print_info "No existing deployment - performing initial deployment"
fi

if [ "$DEPLOYMENT_TYPE" = "initial" ]; then
    # Initial deployment
    print_step "Setting up application directory..."
    run_on_ec2 "sudo mkdir -p $APP_DIR && sudo chown \$USER:\$USER $APP_DIR"

    print_step "Cloning repository..."
    if [ -z "$REPO_URL" ]; then
        print_error "Git repository URL not found. Please run from git repository."
        exit 1
    fi
    run_on_ec2 "cd $APP_DIR && git clone $REPO_URL ."

    print_step "Checking out branch: $BRANCH"
    run_on_ec2 "cd $APP_DIR && git checkout $BRANCH"

    print_warning "Please ensure .env file is created on EC2 with your API keys"
    print_warning "You can copy .env.production as a template:"
    echo "  scp -i $SSH_KEY .env.production $EC2_HOST:$APP_DIR/.env"
    echo "  Then edit it with your API keys on the EC2 instance"
    echo ""
    read -p "Press Enter when .env is configured..."
else
    # Update deployment
    print_step "Pulling latest changes..."
    run_on_ec2 "cd $APP_DIR && git fetch origin && git checkout $BRANCH && git pull origin $BRANCH"
fi

# Check if .env exists
print_step "Checking environment configuration..."
if ! run_on_ec2 "[ -f $APP_DIR/.env ]"; then
    print_error ".env file not found on EC2!"
    print_error "Please create it from .env.production template"
    echo ""
    echo "Run these commands:"
    echo "  scp -i $SSH_KEY .env.production $EC2_HOST:$APP_DIR/.env"
    echo "  ssh -i $SSH_KEY $EC2_HOST"
    echo "  nano $APP_DIR/.env  # Edit and add your API keys"
    exit 1
fi
print_info ".env file found"

# Build and deploy
print_step "Stopping existing containers..."
run_on_ec2 "cd $APP_DIR && docker-compose -f docker-compose.yml -f docker-compose.prod.yml down" || true

print_step "Building Docker images..."
run_on_ec2 "cd $APP_DIR && docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache"

print_step "Starting containers..."
run_on_ec2 "cd $APP_DIR && docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"

print_step "Waiting for containers to be healthy..."
sleep 10

# Check container status
print_step "Checking container status..."
run_on_ec2 "cd $APP_DIR && docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps"

# Check API health
print_step "Checking API health..."
if run_on_ec2 "curl -f http://localhost:3001/api/health" &>/dev/null; then
    print_info "API is healthy"
else
    print_warning "API health check failed"
fi

# Check Web health
print_step "Checking Web health..."
if run_on_ec2 "curl -f http://localhost:3000/health" &>/dev/null; then
    print_info "Web frontend is healthy"
else
    print_warning "Web health check failed"
fi

# Clean up old Docker images
print_step "Cleaning up old Docker images..."
run_on_ec2 "docker image prune -f" || true

# Show logs
print_step "Recent container logs:"
echo ""
print_info "API Logs:"
run_on_ec2 "cd $APP_DIR && docker-compose logs --tail=20 api"
echo ""
print_info "Web Logs:"
run_on_ec2 "cd $APP_DIR && docker-compose logs --tail=20 web"

echo ""
print_info "========================================="
print_info "Deployment Complete!"
print_info "========================================="
echo ""
print_info "Your application should be accessible at:"
print_info "  https://acp.wrkth.in"
echo ""
print_info "Useful commands:"
echo "  View logs:    ssh -i $SSH_KEY $EC2_HOST 'cd $APP_DIR && docker-compose logs -f'"
echo "  Restart:      ssh -i $SSH_KEY $EC2_HOST 'cd $APP_DIR && docker-compose restart'"
echo "  Stop:         ssh -i $SSH_KEY $EC2_HOST 'cd $APP_DIR && docker-compose down'"
echo "  Shell access: ssh -i $SSH_KEY $EC2_HOST"
