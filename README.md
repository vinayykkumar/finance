# Finance App

A comprehensive personal finance management application built with React/TypeScript frontend and FastAPI backend.

## 🏗️ Project Structure

```
finance/
├── frontend/          # React/TypeScript application
├── backend/           # FastAPI Python backend
├── shared/            # Shared types and utilities
├── docs/              # Documentation
├── scripts/           # Build and deployment scripts
└── docker-compose.yml # Development environment
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Python >= 3.8
- npm >= 8.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vinayykkumar/finance.git
   cd finance
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

This will start both frontend (http://localhost:5173) and backend (http://localhost:8000) servers.

## 📁 Directory Structure

### Frontend (`/frontend`)
- React/TypeScript application
- Vite build system
- Tailwind CSS styling
- Component-based architecture

### Backend (`/backend`)
- FastAPI Python backend
- RESTful API endpoints
- Database integration
- Authentication services

### Shared (`/shared`)
- Common types and interfaces
- Utility functions
- Shared constants

### Documentation (`/docs`)
- Setup guides
- API documentation
- Troubleshooting guides

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only

### Building
- `npm run build` - Build frontend for production
- `npm run build:frontend` - Build frontend only

### Testing
- `npm run test` - Run all tests
- `npm run test:frontend` - Run frontend tests
- `npm run test:backend` - Run backend tests

### Linting
- `npm run lint` - Lint frontend code
- `npm run lint:frontend` - Lint frontend only

### Docker
- `npm run docker:dev` - Start development environment with Docker
- `npm run docker:prod` - Start production environment with Docker
- `npm run docker:build` - Build Docker images

## 🔧 Configuration

### Environment Variables
Create `.env` files in both `frontend/` and `backend/` directories as needed.

### Database
The application uses Supabase for database and authentication.

## 📚 Documentation

See the `/docs` directory for detailed documentation:
- [Setup Guide](docs/SETUP_GUIDE.md)
- [Quick Start](docs/QUICK_START.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [AI Features](docs/AI_FEATURES.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 