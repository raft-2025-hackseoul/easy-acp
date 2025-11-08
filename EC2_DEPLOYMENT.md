# EC2 Deployment Guide

Complete guide for deploying Easy ACP to AWS EC2 with Docker Compose, SSL, and Route53.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial EC2 Setup](#initial-ec2-setup)
3. [Route53 DNS Configuration](#route53-dns-configuration)
4. [SSL Certificate Setup](#ssl-certificate-setup)
5. [Application Deployment](#application-deployment)
6. [Verification](#verification)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Local Machine

- Git repository cloned
- SSH access to EC2 instance
- SSH key: `~/.ssh/workith-mail-dev.pem`
- AWS CLI configured (for Route53 setup)

### EC2 Instance

- **Instance Name**: `temp-instance-hackathon`
- **OS**: Ubuntu 20.04 or later
- **Instance Type**: t3.small or larger (minimum 1GB RAM)
- **Security Group**: Allow ports 22, 80, 443
- **Elastic IP**: Recommended for stable DNS

### Required Services

- OpenAI API Key
- OpenRouter API Key

## Initial EC2 Setup

### Step 1: Connect to EC2

```bash
# Test connection
ssh -i ~/.ssh/workith-mail-dev.pem ubuntu@temp-instance-hackathon

# If connection fails, use the public IP
ssh -i ~/.ssh/workith-mail-dev.pem ubuntu@<EC2_PUBLIC_IP>
```

### Step 2: Run Setup Script

On the EC2 instance:

```bash
# Clone repository (or upload setup script)
git clone <your-repo-url> /opt/easy-acp
cd /opt/easy-acp

# Run EC2 setup script
sudo bash setup-ec2.sh
```

This script will:

- Update system packages
- Install Docker and Docker Compose
- Install Nginx
- Configure firewall (UFW)
- Create necessary directories
- Setup log rotation

### Step 3: Verify Installation

```bash
# Check Docker
docker --version
docker-compose --version

# Check Nginx
nginx -v
systemctl status nginx

# Check firewall
sudo ufw status
```

## Route53 DNS Configuration

### Option 1: Using AWS Console

1. Go to Route53 in AWS Console
2. Select your hosted zone: `wrkth.in`
3. Create a new record:
   - **Record name**: `acp`
   - **Record type**: A
   - **Value**: Your EC2 instance's Elastic IP or public IP
   - **TTL**: 300 (5 minutes)
   - **Routing policy**: Simple routing

### Option 2: Using AWS CLI

```bash
# Get your EC2 public IP
EC2_IP=$(ssh -i ~/.ssh/workith-mail-dev.pem ubuntu@temp-instance-hackathon "curl -s http://checkip.amazonaws.com")

# Create Route53 record
aws route53 change-resource-record-sets \
  --hosted-zone-id <YOUR_HOSTED_ZONE_ID> \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "acp.wrkth.in",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'$EC2_IP'"}]
      }
    }]
  }'
```

### Step 4: Verify DNS Propagation

```bash
# Check DNS resolution
dig +short acp.wrkth.in

# Or using nslookup
nslookup acp.wrkth.in

# Should return your EC2 instance IP
```

Wait 5-10 minutes for DNS propagation before proceeding to SSL setup.

## SSL Certificate Setup

### Important: DNS Must Be Configured First

Let's Encrypt requires DNS to be pointing to your server before issuing certificates.

### Run SSL Setup Script

On the EC2 instance:

```bash
cd /opt/easy-acp
sudo bash setup-ssl.sh
```

This script will:

- Install Certbot
- Verify DNS configuration
- Create temporary Nginx config
- Obtain SSL certificate from Let's Encrypt
- Install full Nginx config with SSL
- Setup auto-renewal cron job

### Manual SSL Setup (If Script Fails)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly \
  --nginx \
  --non-interactive \
  --agree-tos \
  --email admin@wrkth.in \
  --domains acp.wrkth.in

# Copy nginx config
sudo cp nginx/acp.wrkth.in.conf /etc/nginx/sites-available/acp.wrkth.in
sudo ln -s /etc/nginx/sites-available/acp.wrkth.in /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Verify SSL

```bash
# Check certificate
sudo certbot certificates

# Test SSL
curl -I https://acp.wrkth.in
```

## Application Deployment

### Step 1: Prepare Environment Variables

On the EC2 instance:

```bash
cd /opt/easy-acp

# Copy template
cp .env.production .env

# Edit .env and add your API keys
nano .env
```

Required variables in `.env`:

```bash
NODE_ENV=production
OPENAI_API_KEY=sk-proj-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
APP_URL=https://acp.wrkth.in
```

### Step 2: Deploy from Local Machine

From your local development machine:

```bash
cd /path/to/easy-acp

# Deploy to EC2
./deploy-ec2.sh ubuntu@temp-instance-hackathon
```

The deployment script will:

1. Test SSH connection
2. Clone or update repository
3. Build Docker images
4. Start containers with Docker Compose
5. Run health checks
6. Show recent logs

### Step 3: Manual Deployment (Alternative)

On the EC2 instance:

```bash
cd /opt/easy-acp

# Pull latest changes
git pull origin main

# Build and start containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check status
docker-compose ps
```

## Verification

### Check Container Status

```bash
# On EC2 instance
cd /opt/easy-acp
docker-compose ps

# Should show:
# easy-acp-api    running
# easy-acp-web    running
```

### Check Health Endpoints

```bash
# API health
curl http://localhost:3001/api/health

# Web health
curl http://localhost:3000/health

# Public HTTPS
curl https://acp.wrkth.in/health
curl https://acp.wrkth.in/api/health
```

### Check Logs

```bash
# All logs
docker-compose logs -f

# API only
docker-compose logs -f api

# Web only
docker-compose logs -f web

# Last 50 lines
docker-compose logs --tail=50
```

### Test Application

1. Open browser: `https://acp.wrkth.in`
2. Upload a CSV file
3. Test field mapping
4. Verify API responses

## Maintenance

### Viewing Logs

```bash
# Follow logs in real-time
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Nginx access logs
sudo tail -f /var/log/nginx/acp.wrkth.in.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/acp.wrkth.in.error.log
```

### Restarting Services

```bash
# Restart all containers
docker-compose restart

# Restart specific service
docker-compose restart api
docker-compose restart web

# Reload Nginx
sudo systemctl reload nginx
```

### Updating Application

```bash
# From local machine
./deploy-ec2.sh ubuntu@temp-instance-hackathon

# Or manually on EC2
cd /opt/easy-acp
git pull origin main
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### SSL Certificate Renewal

Certificates auto-renew via cron job. To manually renew:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### Backup Uploads

```bash
# On EC2 instance
# Uploads are stored in Docker volume
docker volume inspect easy-acp_uploads

# Backup uploads
docker run --rm -v easy-acp_uploads:/data -v $(pwd):/backup ubuntu tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz /data

# Restore uploads
docker run --rm -v easy-acp_uploads:/data -v $(pwd):/backup ubuntu tar xzf /backup/uploads-backup-YYYYMMDD.tar.gz
```

### Monitoring Resource Usage

```bash
# Container stats
docker stats

# Disk usage
df -h
docker system df

# Memory usage
free -h

# CPU usage
top
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs api
docker-compose logs web

# Check if ports are in use
sudo lsof -i :3000
sudo lsof -i :3001

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Check nginx config
sudo nginx -t

# Check firewall
sudo ufw status

# Verify DNS
dig +short acp.wrkth.in

# Test Let's Encrypt connectivity
curl -I http://acme-v02.api.letsencrypt.org/directory
```

### DNS Not Resolving

```bash
# Check Route53 record
aws route53 list-resource-record-sets --hosted-zone-id <ZONE_ID> | grep acp

# Check from different DNS server
dig @8.8.8.8 acp.wrkth.in
dig @1.1.1.1 acp.wrkth.in

# Clear local DNS cache (on your machine)
sudo dscacheutil -flushcache  # macOS
sudo systemd-resolve --flush-caches  # Linux
```

### Application Not Accessible

```bash
# Check if containers are running
docker-compose ps

# Check container health
docker inspect easy-acp-api | grep -A 10 Health
docker inspect easy-acp-web | grep -A 10 Health

# Check nginx status
sudo systemctl status nginx

# Test internal connectivity
curl http://localhost:3001/api/health
curl http://localhost:3000/health

# Test nginx proxy
curl -H "Host: acp.wrkth.in" http://localhost/health
```

### High Resource Usage

```bash
# Check container resources
docker stats

# Limit resources in docker-compose.prod.yml
# (already configured with resource limits)

# Clean up Docker
docker system prune -a
docker volume prune
```

### Environment Variables Not Loading

```bash
# Check .env file exists
ls -la /opt/easy-acp/.env

# Verify file permissions
chmod 600 /opt/easy-acp/.env

# Check values are loaded in container
docker-compose exec api env | grep OPENAI
docker-compose exec api env | grep OPENROUTER

# Recreate containers
docker-compose down
docker-compose up -d
```

## Security Best Practices

1. **SSH Key**: Keep `~/.ssh/workith-mail-dev.pem` secure with 400 permissions
2. **Environment Variables**: Never commit `.env` to git
3. **Firewall**: Only allow necessary ports (22, 80, 443)
4. **Updates**: Regularly update system packages
5. **SSL**: Keep certificates auto-renewing
6. **Backups**: Regular backups of uploads and database (when added)

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [AWS Route53 Documentation](https://docs.aws.amazon.com/route53/)

## Quick Reference Commands

```bash
# SSH to EC2
ssh -i ~/.ssh/workith-mail-dev.pem ubuntu@temp-instance-hackathon

# Deploy from local
./deploy-ec2.sh ubuntu@temp-instance-hackathon

# View logs on EC2
cd /opt/easy-acp && docker-compose logs -f

# Restart containers
docker-compose restart

# Check SSL
sudo certbot certificates

# Update app
git pull && docker-compose up -d --build
```
