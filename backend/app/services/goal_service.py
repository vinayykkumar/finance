"""
Goal service module.

This module contains all business logic related to financial goal operations.
"""

from typing import List, Optional
from decimal import Decimal
from supabase import Client

from app.models import Goal, GoalCreate, GoalUpdate

class GoalService:
    """Service class for financial goal operations."""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def get_all_goals(self) -> List[Goal]:
        """Get all financial goals."""
        try:
            response = self.supabase.table("goals").select("*").order("created_at", desc=True).execute()
            return [Goal(**goal) for goal in response.data]
        except Exception as e:
            print(f"Error getting goals: {e}")
            raise
    
    async def get_goal_by_id(self, goal_id: str) -> Optional[Goal]:
        """Get a goal by ID."""
        try:
            response = self.supabase.table("goals").select("*").eq("id", goal_id).execute()
            if response.data:
                return Goal(**response.data[0])
            return None
        except Exception as e:
            print(f"Error getting goal {goal_id}: {e}")
            raise
    
    async def create_goal(self, goal_data: GoalCreate) -> Goal:
        """Create a new financial goal."""
        try:
            data = {
                "name": goal_data.name,
                "target_amount": float(goal_data.target_amount),
                "current_amount": float(goal_data.current_amount),
                "target_date": goal_data.target_date.isoformat() if goal_data.target_date else None,
                "category_id": goal_data.category_id,
                "is_completed": goal_data.is_completed
            }
            response = self.supabase.table("goals").insert(data).execute()
            return Goal(**response.data[0])
        except Exception as e:
            print(f"Error creating goal: {e}")
            raise
    
    async def update_goal(self, goal_id: str, goal_data: GoalUpdate) -> Optional[Goal]:
        """Update a financial goal."""
        try:
            # Build update data from non-None fields
            update_data = {}
            if goal_data.name is not None:
                update_data["name"] = goal_data.name
            if goal_data.target_amount is not None:
                update_data["target_amount"] = float(goal_data.target_amount)
            if goal_data.current_amount is not None:
                update_data["current_amount"] = float(goal_data.current_amount)
            if goal_data.target_date is not None:
                update_data["target_date"] = goal_data.target_date.isoformat()
            if goal_data.category_id is not None:
                update_data["category_id"] = goal_data.category_id
            if goal_data.is_completed is not None:
                update_data["is_completed"] = goal_data.is_completed
            
            if not update_data:
                # No fields to update, return current goal
                return await self.get_goal_by_id(goal_id)
            
            response = self.supabase.table("goals").update(update_data).eq("id", goal_id).execute()
            if response.data:
                return Goal(**response.data[0])
            return None
        except Exception as e:
            print(f"Error updating goal {goal_id}: {e}")
            raise
    
    async def delete_goal(self, goal_id: str) -> bool:
        """Delete a financial goal."""
        try:
            response = self.supabase.table("goals").delete().eq("id", goal_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error deleting goal {goal_id}: {e}")
            raise
    
    async def contribute_to_goal(self, goal_id: str, amount: Decimal) -> Optional[Goal]:
        """Add a contribution to a financial goal."""
        try:
            goal = await self.get_goal_by_id(goal_id)
            if not goal:
                return None
            
            new_amount = goal.current_amount + amount
            is_completed = new_amount >= goal.target_amount
            
            update_data = {
                "current_amount": float(new_amount),
                "is_completed": is_completed
            }
            
            response = self.supabase.table("goals").update(update_data).eq("id", goal_id).execute()
            if response.data:
                return Goal(**response.data[0])
            return None
        except Exception as e:
            print(f"Error contributing to goal {goal_id}: {e}")
            raise