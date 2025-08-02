"""
Reports API routes.

This module handles all reporting and analytics operations
for financial data visualization.
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends, Query

from app.database import get_supabase
from app.services.report_service import ReportService

router = APIRouter()

def get_report_service():
    """Dependency to get report service instance."""
    return ReportService(get_supabase())

@router.get("/monthly-spending", response_model=List[dict])
async def get_monthly_spending(
    months: int = Query(6, description="Number of months to include"),
    report_service: ReportService = Depends(get_report_service)
):
    """Get monthly spending data for the specified number of months."""
    try:
        data = await report_service.get_monthly_spending(months)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/monthly-income", response_model=List[dict])
async def get_monthly_income(
    months: int = Query(6, description="Number of months to include"),
    report_service: ReportService = Depends(get_report_service)
):
    """Get monthly income data for the specified number of months."""
    try:
        data = await report_service.get_monthly_income(months)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/category-spending", response_model=List[dict])
async def get_category_spending(
    year: int = Query(..., description="Year to get spending for"),
    month: int = Query(..., description="Month to get spending for (1-12)"),
    report_service: ReportService = Depends(get_report_service)
):
    """Get spending breakdown by category for a specific month."""
    try:
        data = await report_service.get_category_spending(year, month)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/net-worth", response_model=List[dict])
async def get_net_worth_data(
    months: int = Query(12, description="Number of months to include"),
    report_service: ReportService = Depends(get_report_service)
):
    """Get net worth data over time."""
    try:
        data = await report_service.get_net_worth_data(months)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))