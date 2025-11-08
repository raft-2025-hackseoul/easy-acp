# Easy ACP Deployment Guide

This guide covers deployment options for Easy ACP.

## Current Deployment: AWS EC2

The application is currently deployed on AWS EC2 with Docker Compose, Nginx, SSL, and Route53.

**📖 See [EC2_DEPLOYMENT.md](./EC2_DEPLOYMENT.md) for complete deployment instructions.**

### Quick Start

```bash
# Deploy to EC2 from your local machine
./deploy-ec2.sh ec2-user@13.124.182.10
```

### Architecture Overview

```
Internet (HTTPS)
    ↓
Route53 DNS (acp.wrkth.in)
    ↓
EC2 Instance (13.124.182.10 - Amazon Linux)
    ↓
Nginx (SSL termination, reverse proxy)
    ├─→ Web Container (port 3000) - React frontend
    └─→ API Container (port 3001) - Express backend
```

### Key Components

- **EC2 Instance**: Amazon Linux 2 server running Docker
- **Docker Compose**: Orchestrates API and Web containers
- **Nginx**: Handles SSL and reverse proxy
- **Let's Encrypt**: Free SSL certificates with auto-renewal
- **Route53**: DNS management for acp.wrkth.in
- **Docker Volumes**: Persistent storage for uploads

### Deployment Files

| File                      | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `docker-compose.yml`      | Main container orchestration               |
| `docker-compose.prod.yml` | Production resource limits and logging     |
| `nginx/acp.wrkth.in.conf` | Nginx configuration for SSL and proxy      |
| `.env.production`         | Template for environment variables         |
| `setup-ec2.sh`            | One-time EC2 instance setup                |
| `setup-ssl.sh`            | SSL certificate setup with Let's Encrypt   |
| `deploy-ec2.sh`           | Deployment script (run from local machine) |
| `EC2_DEPLOYMENT.md`       | Complete deployment documentation          |

### Environment Variables

Create `.env` on EC2 instance with:

```bash
NODE_ENV=production
OPENAI_API_KEY=sk-proj-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
APP_URL=https://acp.wrkth.in
```

### Common Commands

```bash
# SSH to EC2
ssh -i ~/.ssh/workith-mail-dev.pem ec2-user@13.124.182.10

# Deploy updates
./deploy-ec2.sh ec2-user@13.124.182.10

# View logs
ssh -i ~/.ssh/workith-mail-dev.pem ec2-user@13.124.182.10 "cd /opt/easy-acp && docker-compose logs -f"

# Restart services
ssh -i ~/.ssh/workith-mail-dev.pem ec2-user@13.124.182.10 "cd /opt/easy-acp && docker-compose restart"

# Check SSL certificate
ssh -i ~/.ssh/workith-mail-dev.pem ec2-user@13.124.182.10 "sudo certbot certificates"
```

## Alternative Deployment Options

### Local Development

```bash
# Backend
cd apps/api
npm install
npm run dev

# Frontend
cd apps/web
npm install
npm run dev
```

### Docker Compose (Local)

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Other Cloud Providers

The Docker Compose setup can be deployed to:

- **DigitalOcean Droplets**
- **Google Cloud Compute Engine**
- **Azure Virtual Machines**
- **Linode**
- **Vultr**

Simply follow the same EC2 deployment guide, adjusting for your provider's specifics.

## Monitoring

### Health Checks

- API: `https://acp.wrkth.in/api/health`
- Web: `https://acp.wrkth.in/health`

### Logs

```bash
# Container logs
docker-compose logs -f

# Nginx access logs
sudo tail -f /var/log/nginx/acp.wrkth.in.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/acp.wrkth.in.error.log
```

### Resource Monitoring

```bash
# Container stats
docker stats

# Disk usage
df -h

# Memory usage
free -h
```

## Backup Strategy

### Uploads Backup

```bash
# Create backup
docker run --rm -v easy-acp_uploads:/data -v $(pwd):/backup ubuntu tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz /data

# Restore backup
docker run --rm -v easy-acp_uploads:/data -v $(pwd):/backup ubuntu tar xzf /backup/uploads-backup-YYYYMMDD.tar.gz
```

### Configuration Backup

- `.env` file (contains secrets - store securely)
- Nginx configuration
- Docker Compose files (in git)

## Security Considerations

1. **SSH Access**: Use key-based authentication only
2. **Firewall**: Only ports 22, 80, 443 open
3. **SSL**: Auto-renewing Let's Encrypt certificates
4. **Environment Variables**: Never commit `.env` to git
5. **Regular Updates**: Keep system packages up to date
6. **Monitoring**: Set up alerts for unusual activity

## Support & Documentation

- **Full EC2 Guide**: [EC2_DEPLOYMENT.md](./EC2_DEPLOYMENT.md)
- **Troubleshooting**: See EC2_DEPLOYMENT.md#troubleshooting
- **Docker Docs**: https://docs.docker.com/compose/
- **Nginx Docs**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/

## Migration History

- **Previous**: Fly.io (removed)
- **Current**: AWS EC2 with Docker Compose
