"""
FastAPI main application module.

This module sets up the FastAPI application with all routes, middleware,
and configuration for the FinTrack backend API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from app.routers import banks, categories, transactions, budgets, goals, reports
from app.routers import ai
from app.database import init_db
from app.config import settings

# Load environment variables
load_dotenv()

# Create FastAPI application
app = FastAPI(
    title="FinTrack API",
    description="Personal Finance Tracking API with AI capabilities",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        settings.FRONTEND_URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(banks.router, prefix="/api/banks", tags=["banks"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["budgets"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup."""
    await init_db()

@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {
        "message": "FinTrack API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "FinTrack API is operational"
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )