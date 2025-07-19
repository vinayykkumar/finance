"""
Goal API routes.

This module handles all financial goal related operations including
CRUD operations and goal tracking.
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from decimal import Decimal

from app.models import Goal, GoalCreate, GoalUpdate, APIResponse
from app.database import get_supabase
from app.services.goal_service import GoalService

router = APIRouter()

def get_goal_service():
    """Dependency to get goal service instance."""
    return GoalService(get_supabase())

@router.get("/", response_model=List[Goal])
async def get_goals(goal_service: GoalService = Depends(get_goal_service)):
    """Get all financial goals."""
    try:
        goals = await goal_service.get_all_goals()
        return goals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{goal_id}", response_model=Goal)
async def get_goal(goal_id: str, goal_service: GoalService = Depends(get_goal_service)):
    """Get a specific goal by ID."""
    try:
        goal = await goal_service.get_goal_by_id(goal_id)
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        return goal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Goal)
async def create_goal(goal_data: GoalCreate, goal_service: GoalService = Depends(get_goal_service)):
    """Create a new financial goal."""
    try:
        goal = await goal_service.create_goal(goal_data)
        return goal
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{goal_id}", response_model=Goal)
async def update_goal(
    goal_id: str, 
    goal_data: GoalUpdate, 
    goal_service: GoalService = Depends(get_goal_service)
):
    """Update a financial goal."""
    try:
        goal = await goal_service.update_goal(goal_id, goal_data)
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        return goal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{goal_id}", response_model=APIResponse)
async def delete_goal(goal_id: str, goal_service: GoalService = Depends(get_goal_service)):
    """Delete a financial goal."""
    try:
        success = await goal_service.delete_goal(goal_id)
        if not success:
            raise HTTPException(status_code=404, detail="Goal not found")
        return APIResponse(message="Goal deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{goal_id}/contribute", response_model=Goal)
async def contribute_to_goal(
    goal_id: str, 
    request_data: dict,
    goal_service: GoalService = Depends(get_goal_service)
):
    """Add a contribution to a financial goal."""
    try:
        amount = Decimal(str(request_data.get("amount", 0)))
        goal = await goal_service.contribute_to_goal(goal_id, amount)
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        return goal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))