#!/bin/bash

# FinTrack Backend Setup Script
# This script sets up the backend environment for development

set -e  # Exit on any error

echo "🚀 Setting up FinTrack Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
REQUIRED_VERSION="3.8"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Python $PYTHON_VERSION is installed, but Python $REQUIRED_VERSION+ is required."
    exit 1
fi

print_success "Python $PYTHON_VERSION detected"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed. Please install pip first."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_status "Virtual environment already exists"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt
print_success "Dependencies installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_status "Creating .env file from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env file with your Supabase credentials"
    else
        print_error ".env.example file not found"
        exit 1
    fi
else
    print_status ".env file already exists"
fi

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    print_success "Docker detected - you can use 'make docker-dev' for containerized development"
else
    print_warning "Docker not found - install Docker for containerized development (optional)"
fi

# Check if make is installed
if command -v make &> /dev/null; then
    print_success "Make detected - you can use 'make dev' to start the server"
else
    print_warning "Make not found - use 'python run.py' to start the server"
fi

echo ""
print_success "🎉 Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Supabase credentials"
echo "2. Start the development server:"
echo "   - With Make: make dev"
echo "   - Direct: python run.py"
echo "   - With Docker: make docker-dev"
echo ""
echo "The API will be available at:"
echo "- API: http://localhost:3001"
echo "- Docs: http://localhost:3001/docs"
echo "- Health: http://localhost:3001/api/health"