# Production Deployment Guide

This guide provides instructions for deploying P0cit in a production environment. Follow these steps to ensure a secure, reliable, and performant deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Security Considerations](#security-considerations)
- [Deployment Options](#deployment-options)
  - [Docker Compose Deployment](#docker-compose-deployment)
  - [Kubernetes Deployment](#kubernetes-deployment)
- [Database Setup](#database-setup)
- [Reverse Proxy Configuration](#reverse-proxy-configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Scaling Considerations](#scaling-considerations)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying P0cit to production, ensure you have:

- A Linux server with at least 2GB RAM and 2 CPU cores
- Docker and Docker Compose installed
- Domain name configured with DNS records
- SSL certificate (Let's Encrypt or commercial)
- Firewall configured to allow necessary ports
- Regular backup system

## Security Considerations

When deploying to production, implement these security measures:

1. **Environment Variables**: Never commit sensitive environment variables to version control
2. **Database Security**: Use strong passwords and restrict network access
3. **API Rate Limiting**: Implement rate limiting to prevent abuse
4. **Regular Updates**: Keep all components updated with security patches
5. **Principle of Least Privilege**: Run services with minimal required permissions
6. **Network Isolation**: Use Docker networks to isolate services
7. **Secrets Management**: Consider using a secrets management solution

## Deployment Options

### Docker Compose Deployment

For small to medium deployments, Docker Compose provides a straightforward approach:

1. Clone the repository on your production server:
   ```bash
   git clone https://github.com/yourusername/p0cit.git
   cd p0cit
   ```

2. Create a production `.env` file:
   ```bash
   cp .env.example .env.prod
   ```

3. Edit the `.env.prod` file with production values:
   ```
   # Database settings
   DATABASE_URL=postgresql://postgres:strong-password@db:5432/p0cit
   
   # Security settings
   SECRET_KEY=your-very-long-and-secure-random-key
   
   # CORS settings
   CORS_ORIGINS=https://your-domain.com
   
   # Other production settings
   ENVIRONMENT=production
   ```

4. Create a production `docker-compose.prod.yml` file:
   ```yaml
   version: '3.8'
   
   services:
     api:
       build: .
       restart: always
       environment:
         - ENV_FILE=.env.prod
       volumes:
         - ./uploads:/app/uploads
         - /var/run/docker.sock:/var/run/docker.sock
       depends_on:
         - db
       networks:
         - p0cit-network
         - web
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.p0cit-api.rule=Host(`api.your-domain.com`)"
         - "traefik.http.routers.p0cit-api.entrypoints=websecure"
         - "traefik.http.routers.p0cit-api.tls.certresolver=myresolver"
     
     frontend:
       build: ./frontend
       restart: always
       environment:
         - NEXT_PUBLIC_API_URL=https://api.your-domain.com
       networks:
         - web
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.p0cit-frontend.rule=Host(`your-domain.com`)"
         - "traefik.http.routers.p0cit-frontend.entrypoints=websecure"
         - "traefik.http.routers.p0cit-frontend.tls.certresolver=myresolver"
     
     db:
       image: postgres:14
       restart: always
       environment:
         - POSTGRES_PASSWORD=strong-password
         - POSTGRES_DB=p0cit
       volumes:
         - postgres_data:/var/lib/postgresql/data
       networks:
         - p0cit-network
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U postgres"]
         interval: 10s
         timeout: 5s
         retries: 5
   
   networks:
     p0cit-network:
       internal: true
     web:
       external: true
   
   volumes:
     postgres_data:
     uploads:
   ```

5. Deploy with Docker Compose:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

6. Create a super admin user:
   ```bash
   docker-compose -f docker-compose.prod.yml exec api python -m app.create_super_admin admin admin@example.com secure-password
   ```

### Kubernetes Deployment

For larger deployments or organizations already using Kubernetes, refer to the Kubernetes deployment files in the `k8s/` directory.

## Database Setup

For production, consider these database optimizations:

1. **Regular Backups**: Set up automated daily backups
2. **Connection Pooling**: Use PgBouncer for connection pooling
3. **Performance Tuning**: Adjust PostgreSQL settings based on server resources
4. **High Availability**: Consider setting up replication for critical deployments

## Reverse Proxy Configuration

We recommend using Traefik or Nginx as a reverse proxy:

### Traefik Configuration

Traefik can be configured using Docker labels as shown in the docker-compose example above.

### Nginx Configuration

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_session_cache shared:SSL:10m;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    server_name api.your-domain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_session_cache shared:SSL:10m;
    
    # API
    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## SSL/TLS Setup

For production, always use HTTPS:

1. **Let's Encrypt**: Use Certbot to obtain free certificates
   ```bash
   certbot --nginx -d your-domain.com -d api.your-domain.com
   ```

2. **Commercial Certificate**: If using a commercial certificate, install according to provider instructions

3. **Certificate Renewal**: Set up automatic renewal for Let's Encrypt certificates
   ```bash
   echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
   ```

## Monitoring and Logging

Implement monitoring and logging for production:

1. **Prometheus & Grafana**: For metrics collection and visualization
2. **ELK Stack**: For centralized logging
3. **Uptime Monitoring**: Use a service like Uptime Robot or Pingdom
4. **Error Tracking**: Consider integrating Sentry for error tracking

## Backup and Recovery

Implement a robust backup strategy:

1. **Database Backups**: Daily automated backups
   ```bash
   # Add to crontab
   0 2 * * * docker-compose -f /path/to/docker-compose.prod.yml exec -T db pg_dump -U postgres p0cit > /path/to/backups/p0cit_$(date +\%Y\%m\%d).sql
   ```

2. **File Backups**: Regular backups of uploaded files
   ```bash
   # Add to crontab
   0 3 * * * tar -czf /path/to/backups/uploads_$(date +\%Y\%m\%d).tar.gz /path/to/p0cit/uploads
   ```

3. **Off-site Storage**: Store backups in a separate location or cloud storage

4. **Recovery Testing**: Regularly test restoring from backups

## Scaling Considerations

For high-traffic deployments:

1. **Horizontal Scaling**: Deploy multiple API instances behind a load balancer
2. **Database Scaling**: Consider read replicas for database scaling
3. **Caching**: Implement Redis for caching frequently accessed data
4. **CDN**: Use a CDN for static assets

## Troubleshooting

Common production issues and solutions:

1. **Database Connection Issues**: Check network connectivity and credentials
2. **Permission Problems**: Ensure proper file permissions for uploads directory
3. **Memory Issues**: Monitor container memory usage and adjust limits
4. **Docker Socket Permission**: Ensure the API container has access to the Docker socket
5. **Log Analysis**: Check container logs for detailed error messages
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f api
   ```

For additional support, please open an issue on the GitHub repository.

---

This guide covers the basics of deploying P0cit to production. Adjust the configurations based on your specific infrastructure and requirements.
