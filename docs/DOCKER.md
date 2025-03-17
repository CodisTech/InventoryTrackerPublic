# Docker Deployment Guide

This guide explains how to deploy the Inventory Management System using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10.0 or later
- Docker Compose 2.0.0 or later
- A machine with at least 2GB RAM and 1 CPU core
- Basic understanding of Docker concepts

## Quick Start

1. Clone the repository
   ```
   git clone https://github.com/CodisTech/InventoryTracker.git
   cd InventoryTracker
   ```

2. Start the containers
   ```
   docker-compose up -d
   ```

3. Access the application at http://localhost:5000

## Docker Compose Configuration

The application uses a multi-container setup defined in `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/codis
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_DB=codis
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

## Environment Variables

The following environment variables can be adjusted in the docker-compose.yml file:

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection URL | postgresql://postgres:postgres@db:5432/codis |
| NODE_ENV | Application environment | production |
| PORT | Application port | 5000 |
| SESSION_SECRET | Secret for session encryption | (auto-generated) |

## Container Details

### Application Container

- Base image: Node.js 18
- Exposed port: 5000
- Healthcheck: HTTP GET /health every 30 seconds
- Restart policy: Unless stopped manually

### Database Container

- Image: PostgreSQL 14 Alpine
- Exposed port: 5432
- Data persistence: Docker volume (postgres_data)
- Restart policy: Unless stopped manually

## Persistent Storage

The setup uses a Docker volume named `postgres_data` to persist database information. This ensures that data is retained even when containers are recreated.

## Production Deployment Considerations

For production deployments, consider the following:

### Security

1. Change default database credentials
2. Use Docker secrets for sensitive information
3. Set up TLS/SSL for secure communication
4. Consider network isolation with Docker networks

### Performance

1. Adjust PostgreSQL settings based on expected load
2. Consider using a dedicated PostgreSQL server for high traffic scenarios
3. Implement proper connection pooling

### High Availability

1. Set up database backups
2. Consider using Docker Swarm or Kubernetes for container orchestration
3. Implement health checks and automated recovery

## Scaling

The application can be scaled horizontally:

```bash
docker-compose up -d --scale app=3
```

When scaling horizontally, consider:
- Adding a load balancer (like Nginx or Traefik)
- Setting up session persistence across instances
- Ensuring database connection limits are properly configured

## Maintenance

### Updating the Application

```bash
git pull
docker-compose build
docker-compose up -d
```

### Backing Up Data

```bash
docker exec -t codis_db_1 pg_dumpall -c -U postgres > backup_$(date +%Y-%m-%d_%H-%M-%S).sql
```

### Restoring Data

```bash
cat backup_file.sql | docker exec -i codis_db_1 psql -U postgres
```

## Monitoring

For production deployments, consider adding monitoring:

1. Container metrics using Prometheus
2. Application logs using ELK stack or Graylog
3. Database monitoring using pgAdmin or similar tools

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker-compose logs app
```

### Database Connection Issues

Verify database is running:
```bash
docker-compose ps
```

Check connection from app container:
```bash
docker-compose exec app nc -zv db 5432
```

### Volume Permissions

If you encounter permission issues with the PostgreSQL volume:
```bash
docker-compose down
docker volume rm postgres_data
docker-compose up -d
```

## Support

For Docker-related deployment issues, please contact support@codistech.com.