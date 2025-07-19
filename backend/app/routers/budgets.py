"""
Budget API routes.

This module handles all budget related operations including
CRUD operations and budget analysis.
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends, Query

from app.models import Budget, BudgetCreate, BudgetUpdate, BudgetSummaryItem, APIResponse
from app.database import get_supabase
from app.services.budget_service import BudgetService

router = APIRouter()

def get_budget_service():
    """Dependency to get budget service instance."""
    return BudgetService(get_supabase())

@router.get("/", response_model=List[Budget])
async def get_budgets(
    year: int = Query(..., description="Year to get budgets for"),
    month: int = Query(..., description="Month to get budgets for (1-12)"),
    budget_service: BudgetService = Depends(get_budget_service)
):
    """Get all budgets for a specific month."""
    try:
        budgets = await budget_service.get_budgets_by_month(year, month)
        return budgets
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary", response_model=List[BudgetSummaryItem])
async def get_budget_summary(
    year: int = Query(..., description="Year to get budget summary for"),
    month: int = Query(..., description="Month to get budget summary for (1-12)"),
    budget_service: BudgetService = Depends(get_budget_service)
):
    """Get budget summary with spending analysis for a specific month."""
    try:
        summary = await budget_service.get_budget_summary(year, month)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Budget)
async def create_budget(
    budget_data: BudgetCreate, 
    budget_service: BudgetService = Depends(get_budget_service)
):
    """Create a new budget."""
    try:
        budget = await budget_service.create_budget(budget_data)
        return budget
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{budget_id}", response_model=Budget)
async def update_budget(
    budget_id: str, 
    budget_data: BudgetUpdate, 
    budget_service: BudgetService = Depends(get_budget_service)
):
    """Update a budget."""
    try:
        budget = await budget_service.update_budget(budget_id, budget_data)
        if not budget:
            raise HTTPException(status_code=404, detail="Budget not found")
        return budget
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{budget_id}", response_model=APIResponse)
async def delete_budget(
    budget_id: str, 
    budget_service: BudgetService = Depends(get_budget_service)
):
    """Delete a budget."""
    try:
        success = await budget_service.delete_budget(budget_id)
        if not success:
            raise HTTPException(status_code=404, detail="Budget not found")
        return APIResponse(message="Budget deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics", response_model=dict)
async def get_budget_analytics(
    year: int = Query(..., description="Year to get analytics for"),
    month: int = Query(..., description="Month to get analytics for (1-12)"),
    months: int = Query(3, description="Number of months to include in trend analysis"),
    budget_service: BudgetService = Depends(get_budget_service)
):
    """Get budget analytics including trends and top categories."""
    try:
        analytics = await budget_service.get_budget_analytics(year, month, months)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations", response_model=List[dict])
async def get_budget_recommendations(
    year: int = Query(..., description="Year to get recommendations for"),
    month: int = Query(..., description="Month to get recommendations for (1-12)"),
    budget_service: BudgetService = Depends(get_budget_service)
):
    """Get budget recommendations based on spending patterns."""
    try:
        recommendations = await budget_service.get_budget_recommendations(year, month)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))