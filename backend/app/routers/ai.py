"""
AI API routes.

This module handles all AI-powered features including predictions,
insights, and smart recommendations.
"""

from typing import List, Dict, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import date

from app.database import get_supabase
from app.services.ai_service import AIService, SpendingPrediction, FinancialInsight, CategorySuggestion

router = APIRouter()

def get_ai_service():
    """Dependency to get AI service instance."""
    return AIService(get_supabase())

@router.get("/predict-spending", response_model=List[Dict])
async def predict_monthly_spending(
    ai_service: AIService = Depends(get_ai_service)
):
    """Get AI predictions for next month's spending by category."""
    try:
        predictions = await ai_service.predict_monthly_spending()
        return [
            {
                "category_id": p.category_id,
                "predicted_amount": p.predicted_amount,
                "confidence": p.confidence,
                "trend": p.trend,
                "recommendation": p.recommendation
            }
            for p in predictions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-category", response_model=Dict)
async def suggest_transaction_category(
    request_data: Dict,
    ai_service: AIService = Depends(get_ai_service)
):
    """Get AI suggestion for transaction category based on description and amount."""
    try:
        description = request_data.get("description", "")
        amount = float(request_data.get("amount", 0))
        
        suggestion = await ai_service.suggest_category(description, amount)
        
        if suggestion:
            return {
                "category_id": suggestion.category_id,
                "category_name": suggestion.category_name,
                "confidence": suggestion.confidence,
                "reason": suggestion.reason
            }
        else:
            return {
                "category_id": None,
                "category_name": None,
                "confidence": 0,
                "reason": "No suitable category found"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights", response_model=List[Dict])
async def get_financial_insights(
    ai_service: AIService = Depends(get_ai_service)
):
    """Get AI-powered financial insights and recommendations."""
    try:
        insights = await ai_service.generate_financial_insights()
        return [
            {
                "type": insight.type,
                "title": insight.title,
                "message": insight.message,
                "action_items": insight.action_items,
                "priority": insight.priority
            }
            for insight in insights
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/anomalies", response_model=List[Dict])
async def detect_spending_anomalies(
    ai_service: AIService = Depends(get_ai_service)
):
    """Detect unusual spending patterns and anomalies."""
    try:
        anomalies = await ai_service.detect_spending_anomalies()
        return anomalies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/budget-recommendations", response_model=List[Dict])
async def get_ai_budget_recommendations(
    year: int = Query(..., description="Year for budget recommendations"),
    month: int = Query(..., description="Month for budget recommendations (1-12)"),
    ai_service: AIService = Depends(get_ai_service)
):
    """Get AI-powered budget recommendations based on spending patterns."""
    try:
        recommendations = await ai_service.generate_budget_recommendations(year, month)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/spending-analysis", response_model=Dict)
async def analyze_spending_habits(
    ai_service: AIService = Depends(get_ai_service)
):
    """Get detailed analysis of spending habits and patterns."""
    try:
        analysis = await ai_service.analyze_spending_habits()
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/smart-transaction", response_model=Dict)
async def create_smart_transaction(
    request_data: Dict,
    ai_service: AIService = Depends(get_ai_service)
):
    """Create a transaction with AI-powered category suggestion and insights."""
    try:
        description = request_data.get("description", "")
        amount = float(request_data.get("amount", 0))
        
        # Get category suggestion
        suggestion = await ai_service.suggest_category(description, amount)
        
        # Check for spending anomalies
        anomalies = await ai_service.detect_spending_anomalies()
        
        # Generate insights about this transaction
        insights = []
        if amount > 10000:  # Large transaction
            insights.append("This is a large transaction. Consider if it aligns with your budget.")
        
        # Check if this category is over budget (simplified check)
        if suggestion and amount > 5000:
            insights.append(f"Consider reviewing your {suggestion.category_name} budget after this transaction.")
        
        return {
            "suggested_category": {
                "category_id": suggestion.category_id if suggestion else None,
                "category_name": suggestion.category_name if suggestion else None,
                "confidence": suggestion.confidence if suggestion else 0,
                "reason": suggestion.reason if suggestion else "No suggestion available"
            },
            "insights": insights,
            "anomaly_detected": any(a.get('unusual_amount', 0) <= amount * 1.1 for a in anomalies),
            "recommendations": [
                "Track this expense in your budget",
                "Consider if this purchase was planned",
                "Review similar expenses this month"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))