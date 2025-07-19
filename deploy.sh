#!/bin/bash

# SaStays Production Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e  # Exit on any error

ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🚀 Starting SaStays deployment for environment: $ENVIRONMENT"
echo "📅 Timestamp: $TIMESTAMP"

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "❌ Error: server/.env file not found!"
    echo "📝 Please copy server/env.template to server/.env and fill in your values"
    exit 1
fi

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create backup directory
BACKUP_DIR="backups/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

# Backup existing database if it exists
if docker-compose ps db | grep -q "Up"; then
    echo "💾 Creating database backup..."
    docker-compose exec -T db pg_dump -U postgres coastal_booking > "$BACKUP_DIR/database_backup.sql"
    echo "✅ Database backup created: $BACKUP_DIR/database_backup.sql"
fi

# Stop existing services
echo "🛑 Stopping existing services..."
docker-compose down

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose pull

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ All services are running successfully!"
else
    echo "❌ Some services failed to start"
    docker-compose logs
    exit 1
fi

# Run database migrations (if needed)
echo "🗄️ Running database migrations..."
docker-compose exec -T server node -e "
const pool = require('./db');
pool.query('SELECT version()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Database connected successfully');
    process.exit(0);
});
"

# Health check
echo "🏥 Performing health check..."
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_DELAY=10

for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    if curl -f http://localhost:5001/health > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        break
    else
        echo "⚠️ Health check attempt $i/$HEALTH_CHECK_RETRIES failed, retrying in $HEALTH_CHECK_DELAY seconds..."
        if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
            echo "❌ Health check failed after $HEALTH_CHECK_RETRIES attempts"
            docker-compose logs server
            exit 1
        fi
        sleep $HEALTH_CHECK_DELAY
    fi
done

# Cleanup old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find backups -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true

echo "🎉 Deployment completed successfully!"
echo "📊 Service status:"
docker-compose ps

echo "🌐 Application URLs:"
echo "   - Backend API: http://localhost:5001"
echo "   - Database: localhost:5432"
echo "   - Redis: localhost:6379"

echo "📝 Next steps:"
echo "   1. Update your DNS to point to this server"
echo "   2. Configure SSL certificates"
echo "   3. Set up monitoring and alerts"
echo "   4. Test all payment gateways"
echo "   5. Verify email and SMS notifications"

echo "📚 Logs: docker-compose logs -f [service_name]"
echo "🛑 Stop: docker-compose down"
echo "🔄 Restart: docker-compose restart" 