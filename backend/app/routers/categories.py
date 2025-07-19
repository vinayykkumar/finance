"""
Category API routes.

This module handles all category related operations including
CRUD operations and spending analysis.
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import date

from app.models import Category, CategoryCreate, CategoryUpdate, APIResponse
from app.database import get_supabase
from app.services.category_service import CategoryService

router = APIRouter()

def get_category_service():
    """Dependency to get category service instance."""
    return CategoryService(get_supabase())

@router.get("/", response_model=List[Category])
async def get_categories(category_service: CategoryService = Depends(get_category_service)):
    """Get all categories."""
    try:
        categories = await category_service.get_all_categories()
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{category_id}", response_model=Category)
async def get_category(category_id: str, category_service: CategoryService = Depends(get_category_service)):
    """Get a specific category by ID."""
    try:
        category = await category_service.get_category_by_id(category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Category)
async def create_category(category_data: CategoryCreate, category_service: CategoryService = Depends(get_category_service)):
    """Create a new category."""
    try:
        category = await category_service.create_category(category_data)
        return category
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{category_id}", response_model=Category)
async def update_category(
    category_id: str, 
    category_data: CategoryUpdate, 
    category_service: CategoryService = Depends(get_category_service)
):
    """Update a category."""
    try:
        category = await category_service.update_category(category_id, category_data)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{category_id}", response_model=APIResponse)
async def delete_category(category_id: str, category_service: CategoryService = Depends(get_category_service)):
    """Delete a category."""
    try:
        success = await category_service.delete_category(category_id)
        if not success:
            raise HTTPException(status_code=404, detail="Category not found")
        return APIResponse(message="Category deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{category_id}/expenses", response_model=dict)
async def get_category_expenses(
    category_id: str,
    year: int = Query(..., description="Year to get expenses for"),
    month: int = Query(..., description="Month to get expenses for (1-12)"),
    category_service: CategoryService = Depends(get_category_service)
):
    """Get total expenses for a category in a specific month."""
    try:
        total_expenses = await category_service.get_category_expenses(category_id, year, month)
        return {"total_expenses": total_expenses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{category_id}/check-limit", response_model=dict)
async def check_category_limit(
    category_id: str,
    amount: float,
    category_service: CategoryService = Depends(get_category_service)
):
    """Check if adding an amount would exceed the category's monthly limit."""
    try:
        result = await category_service.check_category_limit(category_id, amount)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))