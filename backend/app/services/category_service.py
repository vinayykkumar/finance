"""
Category service module.

This module contains all business logic related to category operations.
"""

from typing import List, Optional
from datetime import date
from supabase import Client

from app.models import Category, CategoryCreate, CategoryUpdate

class CategoryService:
    """Service class for category operations."""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def get_all_categories(self) -> List[Category]:
        """Get all categories."""
        try:
            response = self.supabase.table("categories").select("*").order("name").execute()
            return [Category(**category) for category in response.data]
        except Exception as e:
            print(f"Error getting categories: {e}")
            raise
    
    async def get_category_by_id(self, category_id: str) -> Optional[Category]:
        """Get a category by ID."""
        try:
            response = self.supabase.table("categories").select("*").eq("id", category_id).execute()
            if response.data:
                return Category(**response.data[0])
            return None
        except Exception as e:
            print(f"Error getting category {category_id}: {e}")
            raise
    
    async def create_category(self, category_data: CategoryCreate) -> Category:
        """Create a new category."""
        try:
            data = {
                "name": category_data.name,
                "color": category_data.color,
                "icon": category_data.icon,
                "monthly_limit": float(category_data.monthly_limit) if category_data.monthly_limit else None
            }
            response = self.supabase.table("categories").insert(data).execute()
            return Category(**response.data[0])
        except Exception as e:
            print(f"Error creating category: {e}")
            raise
    
    async def update_category(self, category_id: str, category_data: CategoryUpdate) -> Optional[Category]:
        """Update a category."""
        try:
            # Build update data from non-None fields
            update_data = {}
            if category_data.name is not None:
                update_data["name"] = category_data.name
            if category_data.color is not None:
                update_data["color"] = category_data.color
            if category_data.icon is not None:
                update_data["icon"] = category_data.icon
            if category_data.monthly_limit is not None:
                update_data["monthly_limit"] = float(category_data.monthly_limit)
            
            if not update_data:
                # No fields to update, return current category
                return await self.get_category_by_id(category_id)
            
            response = self.supabase.table("categories").update(update_data).eq("id", category_id).execute()
            if response.data:
                return Category(**response.data[0])
            return None
        except Exception as e:
            print(f"Error updating category {category_id}: {e}")
            raise
    
    async def delete_category(self, category_id: str) -> bool:
        """Delete a category."""
        try:
            # Set category_id to null in related transactions
            self.supabase.table("transactions").update({"category_id": None}).eq("category_id", category_id).execute()
            
            # Delete related budgets
            self.supabase.table("budgets").delete().eq("category_id", category_id).execute()
            
            # Delete the category
            response = self.supabase.table("categories").delete().eq("id", category_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error deleting category {category_id}: {e}")
            raise
    
    async def get_category_expenses(self, category_id: str, year: int, month: int) -> float:
        """Get total expenses for a category in a specific month."""
        try:
            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month + 1, 1)
            
            response = self.supabase.table("transactions").select("amount").eq("category_id", category_id).eq("type", "expense").gte("date", start_date.isoformat()).lt("date", end_date.isoformat()).execute()
            
            total = sum(float(transaction["amount"]) for transaction in response.data)
            return total
        except Exception as e:
            print(f"Error getting category expenses: {e}")
            raise
    
    async def check_category_limit(self, category_id: str, amount: float) -> dict:
        """Check if adding an amount would exceed the category's monthly limit."""
        try:
            category = await self.get_category_by_id(category_id)
            if not category or not category.monthly_limit:
                return {"isOverLimit": False, "currentTotal": 0}
            
            # Get current month's expenses
            current_date = date.today()
            current_total = await self.get_category_expenses(category_id, current_date.year, current_date.month)
            
            new_total = current_total + amount
            is_over_limit = new_total > float(category.monthly_limit)
            
            return {
                "isOverLimit": is_over_limit,
                "currentTotal": current_total,
                "limit": float(category.monthly_limit)
            }
        except Exception as e:
            print(f"Error checking category limit: {e}")
            raise