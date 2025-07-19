"""
Budget service module.

This module contains all business logic related to budget operations.
"""

from typing import List, Optional
from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from supabase import Client

from app.models import Budget, BudgetCreate, BudgetUpdate, BudgetSummaryItem

class BudgetService:
    """Service class for budget operations."""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def get_budgets_by_month(self, year: int, month: int) -> List[Budget]:
        """Get all budgets for a specific month."""
        try:
            month_date = date(year, month, 1)
            response = self.supabase.table("budgets").select("*").eq("month", month_date.isoformat()).execute()
            return [Budget(**budget) for budget in response.data]
        except Exception as e:
            print(f"Error getting budgets for {year}-{month}: {e}")
            raise
    
    async def get_budget_summary(self, year: int, month: int) -> List[BudgetSummaryItem]:
        """Get budget summary with spending analysis for a specific month."""
        try:
            # Get budgets for the month
            budgets = await self.get_budgets_by_month(year, month)
            
            # Get spending for each category
            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month + 1, 1)
            
            summary_items = []
            for budget in budgets:
                # Get total spending for this category in the month
                response = self.supabase.table("transactions").select("amount").eq("category_id", budget.category_id).eq("type", "expense").gte("date", start_date.isoformat()).lt("date", end_date.isoformat()).execute()
                
                spent_amount = sum(float(transaction["amount"]) for transaction in response.data)
                remaining = float(budget.amount) - spent_amount
                percentage = (spent_amount / float(budget.amount)) * 100 if budget.amount > 0 else 0
                
                summary_items.append(BudgetSummaryItem(
                    category_id=budget.category_id,
                    budget_amount=budget.amount,
                    spent_amount=spent_amount,
                    remaining=remaining,
                    percentage=percentage
                ))
            
            return summary_items
        except Exception as e:
            print(f"Error getting budget summary for {year}-{month}: {e}")
            raise
    
    async def create_budget(self, budget_data: BudgetCreate) -> Budget:
        """Create a new budget."""
        try:
            data = {
                "category_id": budget_data.category_id,
                "amount": float(budget_data.amount),
                "month": budget_data.month.isoformat()
            }
            response = self.supabase.table("budgets").insert(data).execute()
            return Budget(**response.data[0])
        except Exception as e:
            print(f"Error creating budget: {e}")
            raise
    
    async def update_budget(self, budget_id: str, budget_data: BudgetUpdate) -> Optional[Budget]:
        """Update a budget."""
        try:
            update_data = {}
            if budget_data.amount is not None:
                update_data["amount"] = float(budget_data.amount)
            
            if not update_data:
                # No fields to update, return current budget
                response = self.supabase.table("budgets").select("*").eq("id", budget_id).execute()
                if response.data:
                    return Budget(**response.data[0])
                return None
            
            response = self.supabase.table("budgets").update(update_data).eq("id", budget_id).execute()
            if response.data:
                return Budget(**response.data[0])
            return None
        except Exception as e:
            print(f"Error updating budget {budget_id}: {e}")
            raise
    
    async def delete_budget(self, budget_id: str) -> bool:
        """Delete a budget."""
        try:
            response = self.supabase.table("budgets").delete().eq("id", budget_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error deleting budget {budget_id}: {e}")
            raise
    
    async def get_budget_analytics(self, year: int, month: int, months_back: int = 3) -> dict:
        """Get budget analytics including trends and top categories."""
        try:
            current_date = date(year, month, 1)
            
            # Calculate total budget and spent for current month
            summary = await self.get_budget_summary(year, month)
            total_budget = sum(item.budget_amount for item in summary)
            total_spent = sum(item.spent_amount for item in summary)
            
            # Get top categories by spending percentage
            top_categories = [
                {
                    "category_id": item.category_id,
                    "percentage": item.percentage
                }
                for item in sorted(summary, key=lambda x: x.percentage, reverse=True)[:5]
            ]
            
            # Get monthly trend data
            monthly_trend = []
            for i in range(months_back):
                trend_date = current_date - relativedelta(months=i)
                trend_summary = await self.get_budget_summary(trend_date.year, trend_date.month)
                
                monthly_trend.append({
                    "month": trend_date.strftime("%b"),
                    "budget": sum(item.budget_amount for item in trend_summary),
                    "spent": sum(item.spent_amount for item in trend_summary)
                })
            
            monthly_trend.reverse()  # Show oldest to newest
            
            return {
                "totalBudget": total_budget,
                "totalSpent": total_spent,
                "topCategories": top_categories,
                "monthlyTrend": monthly_trend
            }
        except Exception as e:
            print(f"Error getting budget analytics: {e}")
            raise
    
    async def get_budget_recommendations(self, year: int, month: int) -> List[dict]:
        """Get budget recommendations based on spending patterns."""
        try:
            summary = await self.get_budget_summary(year, month)
            recommendations = []
            
            for item in summary:
                if item.percentage > 100:
                    # Over budget - recommend increase
                    recommended_amount = item.spent_amount * 1.1  # 10% buffer
                    recommendations.append({
                        "category_id": item.category_id,
                        "current_budget": float(item.budget_amount),
                        "recommended_budget": recommended_amount,
                        "reason": f"You've exceeded your budget by {item.percentage - 100:.1f}%. Consider increasing it."
                    })
                elif item.percentage < 50:
                    # Under budget significantly - recommend decrease
                    recommended_amount = item.spent_amount * 1.2  # 20% buffer
                    recommendations.append({
                        "category_id": item.category_id,
                        "current_budget": float(item.budget_amount),
                        "recommended_budget": recommended_amount,
                        "reason": f"You've only used {item.percentage:.1f}% of your budget. Consider reducing it."
                    })
            
            return recommendations
        except Exception as e:
            print(f"Error getting budget recommendations: {e}")
            raise