# FinTrack Backend - Deployment Guide

This guide covers deploying the FinTrack Backend API to various environments.

## 🐳 Docker Deployment (Recommended)

### Local Development

```bash
# Start development environment
make docker-dev
# or
docker-compose -f docker-compose.dev.yml up --build

# Access services
# API: http://localhost:3001
# Redis: localhost:6379
```

### Production Deployment

```bash
# 1. Configure production environment
cp .env.example .env.production
# Edit .env.production with production values

# 2. Deploy to production
make deploy-prod
# or
docker-compose -f docker-compose.prod.yml up --build -d

# 3. Verify deployment
curl http://localhost:3001/api/health
```

## 🚀 Cloud Deployment Options

### 1. Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 2. Render

1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python run.py`
5. Add environment variables

### 3. Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create fintrack-backend

# Set environment variables
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_KEY=your_key

# Deploy
git push heroku main
```

### 4. DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `python run.py`
3. Set environment variables
4. Deploy

### 5. AWS ECS with Docker

```bash
# Build and tag image
docker build -t fintrack-backend .
docker tag fintrack-backend:latest your-ecr-repo/fintrack-backend:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-ecr-repo
docker push your-ecr-repo/fintrack-backend:latest

# Deploy with ECS task definition
```

### 6. Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/your-project/fintrack-backend
gcloud run deploy --image gcr.io/your-project/fintrack-backend --platform managed
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# API Configuration
API_HOST=0.0.0.0
API_PORT=3001
DEBUG=False

# CORS
FRONTEND_URL=https://your-frontend-domain.com
```

### Optional Environment Variables

```env
# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your_sentry_dsn

# AI Services
OPENAI_API_KEY=your_openai_key
```

## 📊 Monitoring and Health Checks

### Health Check Endpoint

```bash
# Check if API is running
curl http://your-domain.com/api/health

# Expected response
{
  "status": "healthy",
  "message": "FinTrack API is operational"
}
```

### Docker Health Checks

The Docker containers include built-in health checks:

```dockerfile
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1
```

### Monitoring Setup

```python
# app/monitoring.py
from prometheus_client import Counter, Histogram, generate_latest

# Metrics
REQUEST_COUNT = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('request_duration_seconds', 'Request duration')

@app.middleware("http")
async def monitor_requests(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path).inc()
    REQUEST_DURATION.observe(duration)
    
    return response
```

## 🔐 Security Considerations

### Production Security Checklist

- [ ] **Environment Variables**: Never commit secrets to version control
- [ ] **HTTPS**: Use SSL/TLS in production
- [ ] **CORS**: Configure proper origins
- [ ] **Rate Limiting**: Implement API rate limiting
- [ ] **Authentication**: Add proper auth if needed
- [ ] **Input Validation**: Pydantic models validate all inputs
- [ ] **Database Security**: Use service role key securely
- [ ] **Container Security**: Run as non-root user

### Security Headers

```python
# app/middleware.py
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

## 📈 Scaling Considerations

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  fintrack-api:
    build: .
    deploy:
      replicas: 3
    environment:
      - DEBUG=False
    depends_on:
      - redis
      - nginx

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
```

### Load Balancer Configuration

```nginx
# nginx-lb.conf
upstream fintrack_backend {
    server fintrack-api_1:3001;
    server fintrack-api_2:3001;
    server fintrack-api_3:3001;
}

server {
    listen 80;
    location / {
        proxy_pass http://fintrack_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t fintrack-backend .
      
      - name: Deploy to production
        run: |
          # Your deployment commands here
          echo "Deploying to production..."
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Change `API_PORT` in environment
2. **Database connection**: Verify Supabase credentials
3. **CORS errors**: Check `FRONTEND_URL` configuration
4. **Memory issues**: Increase container memory limits
5. **Health check failures**: Check application logs

### Debugging Commands

```bash
# View logs
docker-compose logs -f fintrack-api

# Shell into container
docker-compose exec fintrack-api bash

# Check environment variables
docker-compose exec fintrack-api env

# Test database connection
docker-compose exec fintrack-api python -c "from app.database import test_connection; import asyncio; asyncio.run(test_connection())"
```

## 📋 Deployment Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] CORS properly configured
- [ ] SSL/HTTPS enabled
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Error tracking configured
- [ ] Performance testing completed
- [ ] Security review completed

## 🔮 Future Enhancements

### AI/ML Deployment

When adding AI features:

```python
# app/services/ai_service.py
class AIService:
    def __init__(self):
        # Load ML models on startup
        self.spending_model = joblib.load('models/spending_predictor.pkl')
        self.categorization_model = joblib.load('models/categorizer.pkl')
    
    async def predict_spending(self, user_data):
        # ML inference
        prediction = self.spending_model.predict(user_data)
        return prediction
```

### Microservices Architecture

For scaling, consider splitting into microservices:
- **Core API**: Banks, transactions, categories
- **Analytics Service**: Reports and insights
- **AI Service**: ML predictions and recommendations
- **Notification Service**: Alerts and reminders