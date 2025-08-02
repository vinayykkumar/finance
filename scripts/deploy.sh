#!/bin/bash

# FinTrack Backend Deployment Script
# This script deploys the backend to production

set -e  # Exit on any error

echo "🚀 Deploying FinTrack Backend to Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found"
    print_status "Creating .env.production from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.production
        print_warning "Please edit .env.production with your production credentials"
        exit 1
    else
        print_error ".env.example file not found"
        exit 1
    fi
fi

# Backup current deployment
if [ -f "docker-compose.prod.yml" ]; then
    print_status "Backing up current deployment..."
    docker-compose -f docker-compose.prod.yml down
fi

# Build and deploy
print_status "Building production Docker image..."
docker build -t fintrack-backend:latest .

print_status "Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Health check
print_status "Performing health check..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "✅ Backend is healthy and running!"
else
    print_error "❌ Health check failed"
    print_status "Checking logs..."
    docker-compose -f docker-compose.prod.yml logs fintrack-api
    exit 1
fi

# Show running services
print_status "Running services:"
docker-compose -f docker-compose.prod.yml ps

echo ""
print_success "🎉 Deployment complete!"
echo ""
echo "Services available at:"
echo "- API: http://localhost:3001"
echo "- Docs: http://localhost:3001/docs"
echo "- Health: http://localhost:3001/api/health"
echo ""
echo "Management commands:"
echo "- View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "- Stop services: docker-compose -f docker-compose.prod.yml down"
echo "- Restart: docker-compose -f docker-compose.prod.yml restart"