"""
Report service module.

This module contains all business logic related to financial reporting and analytics.
"""

from typing import List
from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from supabase import Client

class ReportService:
    """Service class for financial reporting operations."""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def get_monthly_spending(self, months: int = 6) -> List[dict]:
        """Get monthly spending data for the specified number of months."""
        try:
            current_date = date.today()
            data = []
            
            for i in range(months):
                month_date = current_date - relativedelta(months=i)
                start_date = month_date.replace(day=1)
                if month_date.month == 12:
                    end_date = date(month_date.year + 1, 1, 1)
                else:
                    end_date = month_date.replace(month=month_date.month + 1, day=1)
                
                # Get spending by category for this month
                response = self.supabase.table("transactions").select("category_id, amount").eq("type", "expense").gte("date", start_date.isoformat()).lt("date", end_date.isoformat()).execute()
                
                # Group by category
                category_spending = {}
                for transaction in response.data:
                    category_id = transaction["category_id"] or "uncategorized"
                    if category_id not in category_spending:
                        category_spending[category_id] = 0
                    category_spending[category_id] += float(transaction["amount"])
                
                # Add to data
                for category_id, total_amount in category_spending.items():
                    data.append({
                        "month": month_date.strftime("%Y-%m"),
                        "category_id": category_id,
                        "total_amount": total_amount
                    })
            
            return data
        except Exception as e:
            print(f"Error getting monthly spending: {e}")
            raise
    
    async def get_monthly_income(self, months: int = 6) -> List[dict]:
        """Get monthly income data for the specified number of months."""
        try:
            current_date = date.today()
            data = []
            
            for i in range(months):
                month_date = current_date - relativedelta(months=i)
                start_date = month_date.replace(day=1)
                if month_date.month == 12:
                    end_date = date(month_date.year + 1, 1, 1)
                else:
                    end_date = month_date.replace(month=month_date.month + 1, day=1)
                
                # Get total income for this month
                response = self.supabase.table("transactions").select("amount").eq("type", "income").gte("date", start_date.isoformat()).lt("date", end_date.isoformat()).execute()
                
                total_amount = sum(float(transaction["amount"]) for transaction in response.data)
                
                data.append({
                    "month": month_date.strftime("%Y-%m"),
                    "total_amount": total_amount
                })
            
            return data
        except Exception as e:
            print(f"Error getting monthly income: {e}")
            raise
    
    async def get_category_spending(self, year: int, month: int) -> List[dict]:
        """Get spending breakdown by category for a specific month."""
        try:
            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month + 1, 1)
            
            # Get spending by category
            response = self.supabase.table("transactions").select("category_id, amount, categories(name)").eq("type", "expense").gte("date", start_date.isoformat()).lt("date", end_date.isoformat()).execute()
            
            # Group by category
            category_spending = {}
            total_spending = 0
            
            for transaction in response.data:
                category_id = transaction["category_id"] or "uncategorized"
                category_name = transaction.get("categories", {}).get("name") if transaction["category_id"] else "Uncategorized"
                amount = float(transaction["amount"])
                
                if category_id not in category_spending:
                    category_spending[category_id] = {
                        "category_id": category_id,
                        "category_name": category_name,
                        "total_amount": 0
                    }
                
                category_spending[category_id]["total_amount"] += amount
                total_spending += amount
            
            # Calculate percentages
            data = []
            for category_data in category_spending.values():
                percentage = (category_data["total_amount"] / total_spending * 100) if total_spending > 0 else 0
                data.append({
                    **category_data,
                    "percentage": percentage
                })
            
            return sorted(data, key=lambda x: x["total_amount"], reverse=True)
        except Exception as e:
            print(f"Error getting category spending: {e}")
            raise
    
    async def get_net_worth_data(self, months: int = 12) -> List[dict]:
        """Get net worth data over time."""
        try:
            current_date = date.today()
            data = []
            
            for i in range(months):
                month_date = current_date - relativedelta(months=i)
                
                # Get bank balances (simplified - using current balances)
                # In a real implementation, you'd track historical balances
                banks_response = self.supabase.table("banks").select("balance").execute()
                bank_assets = sum(float(bank["balance"]) for bank in banks_response.data)
                
                # Get credit card balances (debt)
                # Note: This table might not exist yet, so we'll handle the error
                try:
                    cards_response = self.supabase.table("credit_cards").select("balance").execute()
                    credit_card_debt = sum(float(card["balance"]) for card in cards_response.data)
                except:
                    credit_card_debt = 0
                
                # Investment assets (placeholder - would need investment tracking)
                investment_assets = 0
                
                net_worth = bank_assets + investment_assets - credit_card_debt
                
                data.append({
                    "date": month_date.strftime("%Y-%m"),
                    "bank_assets": bank_assets,
                    "investment_assets": investment_assets,
                    "credit_card_debt": credit_card_debt,
                    "net_worth": net_worth
                })
            
            return list(reversed(data))  # Return oldest to newest
        except Exception as e:
            print(f"Error getting net worth data: {e}")
            raise