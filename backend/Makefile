# FinTrack Backend Makefile
# Convenient commands for development and deployment

.PHONY: help install dev prod test clean docker-build docker-dev docker-prod

# Default target
help:
	@echo "FinTrack Backend - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make install     - Install Python dependencies"
	@echo "  make dev         - Start development server"
	@echo "  make test        - Run tests"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-dev  - Start development with Docker"
	@echo "  make docker-prod - Start production with Docker"
	@echo "  make docker-build- Build Docker image"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean       - Clean cache and temp files"
	@echo "  make lint        - Run code linting"
	@echo "  make format      - Format code"

# Development
install:
	pip install -r requirements.txt

dev:
	python run.py

test:
	pytest tests/ -v

lint:
	flake8 app/
	black --check app/

format:
	black app/
	isort app/

# Docker commands
docker-build:
	docker build -t fintrack-backend:latest .

docker-dev:
	docker-compose -f docker-compose.dev.yml up --build

docker-prod:
	docker-compose -f docker-compose.prod.yml up --build -d

docker-stop:
	docker-compose down

docker-clean:
	docker-compose down -v
	docker system prune -f

# Utilities
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type f -name ".coverage" -delete

# Database
migrate:
	@echo "Run migrations in Supabase dashboard or use supabase CLI"

# AI/ML specific
install-ai:
	pip install scikit-learn pandas numpy openai tensorflow

# Production deployment
deploy-prod:
	docker-compose -f docker-compose.prod.yml up --build -d
	@echo "Backend deployed at http://localhost:3001"

# Backup
backup-env:
	cp .env .env.backup.$(shell date +%Y%m%d_%H%M%S)

# Health check
health:
	curl -f http://localhost:3001/api/health || echo "Backend not running"