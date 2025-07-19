# FinTrack Backend API

A FastAPI-based backend for the FinTrack personal finance application with AI capabilities.

## 🐳 Quick Start with Docker

The fastest way to get the backend running:

```bash
# Clone and navigate to backend
git clone <your-repo-url>
cd fintrack-backend  # or just backend/ if part of monorepo

# Copy environment file and configure
cp .env.example .env
# Edit .env with your Supabase credentials

# Start with Docker Compose
docker-compose up --build
```

The API will be available at:
- **API**: http://localhost:3001
- **Documentation**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/api/health

## Features

- **RESTful API**: Complete REST API for financial data management
- **Supabase Integration**: Seamless connection to Supabase database
- **Type Safety**: Full TypeScript-like validation with Pydantic
- **Auto Documentation**: Interactive API docs with Swagger UI
- **AI Ready**: Structured for future AI/ML integration
- **CORS Support**: Configured for frontend integration
- **Docker Support**: Containerized deployment ready
- **Redis Integration**: Optional caching layer for AI features

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **Pydantic**: Data validation and settings management
- **Supabase**: Backend as a Service for database operations
- **Uvicorn**: ASGI server for running the application
- **Python 3.8+**: Modern Python with async/await support
- **Docker**: Containerization for easy deployment
- **Redis**: Optional caching layer

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application setup
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models.py            # Pydantic models
│   ├── routers/             # API route handlers
│   │   ├── banks.py
│   │   ├── categories.py
│   │   ├── transactions.py
│   │   ├── budgets.py
│   │   ├── goals.py
│   │   └── reports.py
│   └── services/            # Business logic
│       ├── bank_service.py
│       ├── category_service.py
│       ├── transaction_service.py
│       ├── budget_service.py
│       ├── goal_service.py
│       └── report_service.py
├── Dockerfile              # Docker container definition
├── docker-compose.yml      # Multi-service orchestration
├── .dockerignore           # Docker ignore patterns
├── .gitignore             # Git ignore patterns
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
├── run.py                  # Development server runner
└── README.md
```

## 🚀 Setup Instructions

### Option 1: Docker Setup (Recommended)

#### Prerequisites
- Docker and Docker Compose installed
- Supabase account and project

#### Quick Start
```bash
# 1. Clone repository
git clone <your-repo-url>
cd fintrack-backend

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start services
docker-compose up --build

# 4. Verify
curl http://localhost:3001/api/health
```

#### Development with Docker
```bash
# Start in development mode (with hot reload)
docker-compose up --build

# View logs
docker-compose logs -f fintrack-api

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up --build
```

### Option 2: Local Development Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

### 3. Run the Development Server

```bash
python run.py
```

The API will be available at:
- **API**: http://localhost:3001
- **Documentation**: http://localhost:3001/docs
- **Alternative Docs**: http://localhost:3001/redoc

## 🐳 Docker Commands

### Development
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up --build
```

### Production
```bash
# Build production image
docker build -t fintrack-backend .

# Run production container
docker run -d \
  --name fintrack-api \
  -p 3001:3001 \
  --env-file .env \
  fintrack-backend
```

### Useful Docker Commands
```bash
# Shell into running container
docker-compose exec fintrack-api bash

# View container logs
docker logs fintrack-backend

# Remove all containers and volumes
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache
```

## API Endpoints

### Banks
- `GET /api/banks` - Get all bank accounts
- `POST /api/banks` - Create a new bank account
- `GET /api/banks/{id}` - Get a specific bank account
- `PATCH /api/banks/{id}` - Update a bank account
- `DELETE /api/banks/{id}` - Delete a bank account
- `PATCH /api/banks/{id}/balance` - Update bank balance

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/{id}` - Get a specific category
- `PATCH /api/categories/{id}` - Update a category
- `DELETE /api/categories/{id}` - Delete a category

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/{id}` - Get a specific transaction
- `PATCH /api/transactions/{id}` - Update a transaction
- `DELETE /api/transactions/{id}` - Delete a transaction

### Budgets
- `GET /api/budgets` - Get budgets for a month
- `GET /api/budgets/summary` - Get budget summary with spending
- `POST /api/budgets` - Create a new budget
- `PATCH /api/budgets/{id}` - Update a budget
- `DELETE /api/budgets/{id}` - Delete a budget

### Goals
- `GET /api/goals` - Get all financial goals
- `POST /api/goals` - Create a new goal
- `GET /api/goals/{id}` - Get a specific goal
- `PATCH /api/goals/{id}` - Update a goal
- `DELETE /api/goals/{id}` - Delete a goal
- `POST /api/goals/{id}/contribute` - Add contribution to goal

### Reports
- `GET /api/reports/monthly-spending` - Get monthly spending data
- `GET /api/reports/monthly-income` - Get monthly income data
- `GET /api/reports/category-spending` - Get category spending breakdown
- `GET /api/reports/net-worth` - Get net worth data over time

## 🔗 Frontend Integration

Update your frontend's API client base URL to point to the backend:

```typescript
// In src/lib/api-client.ts
const API_BASE_URL = 'http://localhost:3001/api';
```

## 🤖 AI Integration Ready

The backend is structured to easily integrate AI capabilities:

1. **Data Analysis**: Rich financial data available for ML models
2. **Prediction APIs**: Add endpoints for spending predictions
3. **Recommendation Engine**: Budget and saving recommendations
4. **Natural Language Processing**: Smart transaction categorization
5. **Anomaly Detection**: Unusual spending pattern alerts

### AI Service Examples

```python
# app/services/ai_service.py
class AIService:
    async def predict_spending(self, user_data):
        # ML model for spending prediction
        pass
    
    async def categorize_transaction(self, description):
        # NLP for smart categorization
        pass
    
    async def generate_insights(self, financial_data):
        # LLM for financial advice
        pass
```

## 🛠 Development

### Adding New Features

1. **Create Models**: Add Pydantic models in `app/models.py`
2. **Create Service**: Add business logic in `app/services/`
3. **Create Router**: Add API endpoints in `app/routers/`
4. **Register Router**: Add to `app/main.py`

### Adding AI Features

1. **Install ML Libraries**: Add to `requirements.txt`
   ```
   scikit-learn==1.3.0
   pandas==2.0.3
   numpy==1.24.3
   openai==0.28.0  # For LLM integration
   ```

2. **Create AI Service**: Add to `app/services/ai_service.py`
3. **Add AI Endpoints**: Create `app/routers/ai.py`
4. **Integrate**: Use AI services in existing business logic

### Testing

The API includes interactive documentation at `/docs` where you can test all endpoints directly in your browser.

## 🚀 Production Deployment

### Docker Deployment

```bash
# Build production image
docker build -t fintrack-backend:latest .

# Deploy to your server
docker run -d \
  --name fintrack-api \
  -p 3001:3001 \
  --env-file .env.production \
  --restart unless-stopped \
  fintrack-backend:latest
```

### Environment Configuration

For production deployment:

1. Set `DEBUG=False` in environment variables
2. Use a production ASGI server like Gunicorn
3. Configure proper CORS origins
4. Set up proper logging and monitoring
5. Use environment-specific database URLs
7. Use Docker for consistent deployments
8. Set up Redis for caching (optional)

### Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  fintrack-api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DEBUG=False
    env_file:
      - .env.production
    restart: unless-stopped
```

## 🔍 Error Handling

The API includes comprehensive error handling:
- Input validation with Pydantic
- Database error handling
- Global exception handler
- Detailed error responses in development mode

## 📊 Monitoring and Logging

### Health Checks
- **Endpoint**: `/api/health`
- **Docker**: Built-in health check
- **Database**: Connection validation

### Logging
```python
# Structured logging for production
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## 🔐 Security

- **Environment Variables**: Sensitive data in .env files
- **CORS**: Properly configured origins
- **Input Validation**: Pydantic models prevent injection
- **Non-root User**: Docker container runs as non-root
- **Health Checks**: Monitor service availability

## 📈 Scaling for AI

The architecture supports scaling for AI workloads:

1. **Async Processing**: Background tasks for ML inference
2. **Redis Caching**: Cache ML model results
3. **Service Isolation**: Separate AI services from core API
4. **Docker Scaling**: Easy horizontal scaling
5. **Database Optimization**: Efficient queries for large datasets