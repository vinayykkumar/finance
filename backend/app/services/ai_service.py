"""
AI Service Module for FinTrack

This module provides AI-powered features for financial analysis and insights.
Includes spending prediction, smart categorization, and financial recommendations.
"""

import re
import asyncio
from typing import List, Dict, Optional, Tuple
from datetime import date, datetime, timedelta
from decimal import Decimal
import json
from dataclasses import dataclass

from supabase import Client
from app.models import Transaction, Category

@dataclass
class SpendingPrediction:
    """Prediction for future spending."""
    category_id: str
    predicted_amount: float
    confidence: float
    trend: str  # 'increasing', 'decreasing', 'stable'
    recommendation: str

@dataclass
class FinancialInsight:
    """Financial insight or recommendation."""
    type: str  # 'warning', 'tip', 'achievement'
    title: str
    message: str
    action_items: List[str]
    priority: int  # 1-5, 5 being highest

@dataclass
class CategorySuggestion:
    """Smart category suggestion for a transaction."""
    category_id: str
    category_name: str
    confidence: float
    reason: str

class AIService:
    """AI service for financial analysis and predictions."""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
        
        # Keywords for smart categorization
        self.category_keywords = {
            'food': ['restaurant', 'cafe', 'pizza', 'burger', 'food', 'grocery', 'supermarket', 'swiggy', 'zomato', 'dominos', 'mcdonalds', 'kfc'],
            'transportation': ['uber', 'ola', 'taxi', 'bus', 'metro', 'petrol', 'fuel', 'gas', 'parking', 'toll'],
            'shopping': ['amazon', 'flipkart', 'mall', 'store', 'shop', 'clothing', 'electronics', 'myntra', 'ajio'],
            'entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'theater', 'youtube'],
            'healthcare': ['hospital', 'doctor', 'pharmacy', 'medicine', 'clinic', 'medical', 'health'],
            'utilities': ['electricity', 'water', 'internet', 'phone', 'mobile', 'wifi', 'broadband'],
            'education': ['school', 'college', 'course', 'book', 'tuition', 'fees', 'education'],
            'travel': ['flight', 'hotel', 'booking', 'vacation', 'trip', 'travel', 'makemytrip', 'goibibo']
        }
    
    async def predict_monthly_spending(self, user_id: Optional[str] = None) -> List[SpendingPrediction]:
        """Predict spending for each category for the next month."""
        try:
            # Get last 6 months of transaction data
            six_months_ago = date.today() - timedelta(days=180)
            
            response = self.supabase.table("transactions").select("*").eq("type", "expense").gte("date", six_months_ago.isoformat()).execute()
            transactions = response.data
            
            # Get categories
            categories_response = self.supabase.table("categories").select("*").execute()
            categories = {cat['id']: cat['name'] for cat in categories_response.data}
            
            # Group by category and month
            monthly_spending = {}
            for transaction in transactions:
                category_id = transaction.get('category_id', 'uncategorized')
                amount = float(transaction['amount'])
                trans_date = datetime.fromisoformat(transaction['date'])
                month_key = f"{trans_date.year}-{trans_date.month:02d}"
                
                if category_id not in monthly_spending:
                    monthly_spending[category_id] = {}
                
                if month_key not in monthly_spending[category_id]:
                    monthly_spending[category_id][month_key] = 0
                
                monthly_spending[category_id][month_key] += amount
            
            predictions = []
            for category_id, monthly_data in monthly_spending.items():
                if len(monthly_data) < 2:  # Need at least 2 months of data
                    continue
                
                amounts = list(monthly_data.values())
                avg_amount = sum(amounts) / len(amounts)
                
                # Simple trend analysis
                recent_avg = sum(amounts[-3:]) / min(3, len(amounts))
                older_avg = sum(amounts[:-3]) / max(1, len(amounts) - 3) if len(amounts) > 3 else avg_amount
                
                if recent_avg > older_avg * 1.1:
                    trend = 'increasing'
                    predicted_amount = recent_avg * 1.05
                    recommendation = f"Your {categories.get(category_id, 'spending')} is trending upward. Consider setting a budget limit."
                elif recent_avg < older_avg * 0.9:
                    trend = 'decreasing'
                    predicted_amount = recent_avg * 0.95
                    recommendation = f"Great job reducing {categories.get(category_id, 'spending')}! Keep up the good work."
                else:
                    trend = 'stable'
                    predicted_amount = avg_amount
                    recommendation = f"Your {categories.get(category_id, 'spending')} is consistent. Consider optimizing for better savings."
                
                # Calculate confidence based on data consistency
                variance = sum((x - avg_amount) ** 2 for x in amounts) / len(amounts)
                confidence = max(0.3, min(0.95, 1 - (variance / (avg_amount ** 2))))
                
                predictions.append(SpendingPrediction(
                    category_id=category_id,
                    predicted_amount=predicted_amount,
                    confidence=confidence,
                    trend=trend,
                    recommendation=recommendation
                ))
            
            return sorted(predictions, key=lambda x: x.predicted_amount, reverse=True)
        
        except Exception as e:
            print(f"Error predicting spending: {e}")
            return []
    
    async def suggest_category(self, description: str, amount: float) -> Optional[CategorySuggestion]:
        """Suggest a category for a transaction based on description and amount."""
        try:
            description_lower = description.lower()
            
            # Get existing categories
            response = self.supabase.table("categories").select("*").execute()
            categories = {cat['id']: cat['name'] for cat in response.data}
            
            best_match = None
            best_confidence = 0
            best_reason = ""
            
            # Check keyword matches
            for category_type, keywords in self.category_keywords.items():
                for keyword in keywords:
                    if keyword in description_lower:
                        # Find matching category in database
                        for cat_id, cat_name in categories.items():
                            if category_type.lower() in cat_name.lower() or cat_name.lower() in category_type:
                                confidence = 0.8 + (len(keyword) / len(description)) * 0.2
                                if confidence > best_confidence:
                                    best_match = cat_id
                                    best_confidence = confidence
                                    best_reason = f"Matched keyword '{keyword}' in description"
                                break
            
            # Amount-based suggestions
            if amount > 50000:  # Large amount
                for cat_id, cat_name in categories.items():
                    if 'investment' in cat_name.lower() or 'savings' in cat_name.lower():
                        if best_confidence < 0.6:
                            best_match = cat_id
                            best_confidence = 0.6
                            best_reason = "Large amount suggests investment or savings"
            
            if best_match:
                return CategorySuggestion(
                    category_id=best_match,
                    category_name=categories[best_match],
                    confidence=best_confidence,
                    reason=best_reason
                )
            
            return None
        
        except Exception as e:
            print(f"Error suggesting category: {e}")
            return None
    
    async def generate_financial_insights(self, user_id: Optional[str] = None) -> List[FinancialInsight]:
        """Generate AI-powered financial insights and recommendations."""
        try:
            insights = []
            
            # Get recent transaction data
            thirty_days_ago = date.today() - timedelta(days=30)
            response = self.supabase.table("transactions").select("*").gte("date", thirty_days_ago.isoformat()).execute()
            transactions = response.data
            
            # Calculate basic metrics
            total_income = sum(float(t['amount']) for t in transactions if t['type'] == 'income')
            total_expenses = sum(float(t['amount']) for t in transactions if t['type'] == 'expense')
            savings_rate = (total_income - total_expenses) / total_income * 100 if total_income > 0 else 0
            
            # Savings rate insights
            if savings_rate < 10:
                insights.append(FinancialInsight(
                    type='warning',
                    title='Low Savings Rate',
                    message=f'Your savings rate is {savings_rate:.1f}%. Financial experts recommend saving at least 20% of income.',
                    action_items=[
                        'Review your largest expense categories',
                        'Set up automatic savings transfers',
                        'Consider the 50/30/20 budgeting rule'
                    ],
                    priority=5
                ))
            elif savings_rate > 30:
                insights.append(FinancialInsight(
                    type='achievement',
                    title='Excellent Savings Rate!',
                    message=f'Your savings rate of {savings_rate:.1f}% is outstanding! You\'re building wealth effectively.',
                    action_items=[
                        'Consider investing excess savings',
                        'Explore high-yield savings accounts',
                        'Set new financial goals'
                    ],
                    priority=2
                ))
            
            # Spending pattern analysis
            expense_by_category = {}
            for transaction in transactions:
                if transaction['type'] == 'expense':
                    cat_id = transaction.get('category_id', 'uncategorized')
                    expense_by_category[cat_id] = expense_by_category.get(cat_id, 0) + float(transaction['amount'])
            
            if expense_by_category:
                top_category = max(expense_by_category, key=expense_by_category.get)
                top_amount = expense_by_category[top_category]
                
                if top_amount > total_expenses * 0.4:  # More than 40% in one category
                    # Get category name
                    cat_response = self.supabase.table("categories").select("name").eq("id", top_category).execute()
                    cat_name = cat_response.data[0]['name'] if cat_response.data else 'Unknown'
                    
                    insights.append(FinancialInsight(
                        type='tip',
                        title='Spending Concentration Alert',
                        message=f'You\'re spending {top_amount/total_expenses*100:.1f}% of your budget on {cat_name}.',
                        action_items=[
                            f'Review {cat_name} expenses for optimization opportunities',
                            'Set a monthly budget limit for this category',
                            'Look for alternatives or discounts'
                        ],
                        priority=3
                    ))
            
            # Weekend vs weekday spending
            weekend_expenses = []
            weekday_expenses = []
            
            for transaction in transactions:
                if transaction['type'] == 'expense':
                    trans_date = datetime.fromisoformat(transaction['date'])
                    if trans_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
                        weekend_expenses.append(float(transaction['amount']))
                    else:
                        weekday_expenses.append(float(transaction['amount']))
            
            if weekend_expenses and weekday_expenses:
                avg_weekend = sum(weekend_expenses) / len(weekend_expenses)
                avg_weekday = sum(weekday_expenses) / len(weekday_expenses)
                
                if avg_weekend > avg_weekday * 1.5:
                    insights.append(FinancialInsight(
                        type='tip',
                        title='Weekend Spending Pattern',
                        message=f'You spend {avg_weekend/avg_weekday:.1f}x more on weekends than weekdays.',
                        action_items=[
                            'Plan weekend activities with a budget',
                            'Look for free weekend entertainment options',
                            'Consider meal prepping to reduce weekend food costs'
                        ],
                        priority=2
                    ))
            
            # Unusual transaction detection
            if transactions:
                amounts = [float(t['amount']) for t in transactions if t['type'] == 'expense']
                avg_amount = sum(amounts) / len(amounts)
                
                unusual_transactions = [t for t in transactions 
                                      if t['type'] == 'expense' and float(t['amount']) > avg_amount * 3]
                
                if unusual_transactions:
                    insights.append(FinancialInsight(
                        type='warning',
                        title='Unusual Large Expenses Detected',
                        message=f'Found {len(unusual_transactions)} transactions significantly above your average.',
                        action_items=[
                            'Review large transactions for accuracy',
                            'Consider if these were planned expenses',
                            'Set up alerts for large transactions'
                        ],
                        priority=3
                    ))
            
            return sorted(insights, key=lambda x: x.priority, reverse=True)
        
        except Exception as e:
            print(f"Error generating insights: {e}")
            return []
    
    async def detect_spending_anomalies(self, user_id: Optional[str] = None) -> List[Dict]:
        """Detect unusual spending patterns using simple statistical analysis."""
        try:
            # Get last 3 months of data
            three_months_ago = date.today() - timedelta(days=90)
            response = self.supabase.table("transactions").select("*").eq("type", "expense").gte("date", three_months_ago.isoformat()).execute()
            transactions = response.data
            
            if len(transactions) < 10:  # Need sufficient data
                return []
            
            # Calculate statistics by category
            category_stats = {}
            for transaction in transactions:
                cat_id = transaction.get('category_id', 'uncategorized')
                amount = float(transaction['amount'])
                
                if cat_id not in category_stats:
                    category_stats[cat_id] = []
                category_stats[cat_id].append(amount)
            
            anomalies = []
            for cat_id, amounts in category_stats.items():
                if len(amounts) < 5:  # Need enough data points
                    continue
                
                # Calculate mean and standard deviation
                mean_amount = sum(amounts) / len(amounts)
                variance = sum((x - mean_amount) ** 2 for x in amounts) / len(amounts)
                std_dev = variance ** 0.5
                
                # Find outliers (more than 2 standard deviations from mean)
                threshold = mean_amount + (2 * std_dev)
                outliers = [amount for amount in amounts if amount > threshold]
                
                if outliers:
                    # Get category name
                    cat_response = self.supabase.table("categories").select("name").eq("id", cat_id).execute()
                    cat_name = cat_response.data[0]['name'] if cat_response.data else 'Unknown'
                    
                    anomalies.append({
                        'category_id': cat_id,
                        'category_name': cat_name,
                        'unusual_amount': max(outliers),
                        'average_amount': mean_amount,
                        'deviation_percentage': ((max(outliers) - mean_amount) / mean_amount) * 100,
                        'message': f'Unusual {cat_name} expense detected: ₹{max(outliers):,.0f} (avg: ₹{mean_amount:,.0f})'
                    })
            
            return sorted(anomalies, key=lambda x: x['deviation_percentage'], reverse=True)
        
        except Exception as e:
            print(f"Error detecting anomalies: {e}")
            return []
    
    async def generate_budget_recommendations(self, year: int, month: int) -> List[Dict]:
        """Generate AI-powered budget recommendations based on spending patterns."""
        try:
            # Get spending data for the last 6 months
            current_date = date(year, month, 1)
            six_months_ago = current_date - timedelta(days=180)
            
            response = self.supabase.table("transactions").select("*").eq("type", "expense").gte("date", six_months_ago.isoformat()).execute()
            transactions = response.data
            
            # Group by category and month
            monthly_spending = {}
            for transaction in transactions:
                cat_id = transaction.get('category_id', 'uncategorized')
                amount = float(transaction['amount'])
                trans_date = datetime.fromisoformat(transaction['date'])
                month_key = f"{trans_date.year}-{trans_date.month:02d}"
                
                if cat_id not in monthly_spending:
                    monthly_spending[cat_id] = {}
                
                if month_key not in monthly_spending[cat_id]:
                    monthly_spending[cat_id][month_key] = 0
                
                monthly_spending[cat_id][month_key] += amount
            
            recommendations = []
            for cat_id, monthly_data in monthly_spending.items():
                if len(monthly_data) < 3:  # Need at least 3 months
                    continue
                
                amounts = list(monthly_data.values())
                avg_spending = sum(amounts) / len(amounts)
                
                # Calculate trend
                recent_months = amounts[-3:]
                older_months = amounts[:-3] if len(amounts) > 3 else amounts
                
                recent_avg = sum(recent_months) / len(recent_months)
                older_avg = sum(older_months) / len(older_months)
                
                # Get category name
                cat_response = self.supabase.table("categories").select("name").eq("id", cat_id).execute()
                cat_name = cat_response.data[0]['name'] if cat_response.data else 'Unknown'
                
                # Generate recommendation based on trend
                if recent_avg > older_avg * 1.2:  # Increasing trend
                    recommended_budget = recent_avg * 1.1  # 10% buffer
                    reason = f"Spending on {cat_name} has increased by {((recent_avg/older_avg-1)*100):.0f}% recently"
                elif recent_avg < older_avg * 0.8:  # Decreasing trend
                    recommended_budget = recent_avg * 1.15  # 15% buffer for decreased spending
                    reason = f"You've successfully reduced {cat_name} spending. Budget reflects this improvement"
                else:  # Stable
                    recommended_budget = avg_spending * 1.05  # 5% buffer
                    reason = f"Consistent {cat_name} spending pattern detected"
                
                recommendations.append({
                    'category_id': cat_id,
                    'category_name': cat_name,
                    'recommended_budget': recommended_budget,
                    'average_spending': avg_spending,
                    'recent_trend': 'increasing' if recent_avg > older_avg * 1.1 else 'decreasing' if recent_avg < older_avg * 0.9 else 'stable',
                    'reason': reason,
                    'confidence': min(0.95, len(amounts) / 6)  # Higher confidence with more data
                })
            
            return sorted(recommendations, key=lambda x: x['recommended_budget'], reverse=True)
        
        except Exception as e:
            print(f"Error generating budget recommendations: {e}")
            return []
    
    async def analyze_spending_habits(self, user_id: Optional[str] = None) -> Dict:
        """Analyze user's spending habits and provide insights."""
        try:
            # Get last 3 months of data
            three_months_ago = date.today() - timedelta(days=90)
            response = self.supabase.table("transactions").select("*").gte("date", three_months_ago.isoformat()).execute()
            transactions = response.data
            
            analysis = {
                'spending_by_day_of_week': {},
                'spending_by_time_of_month': {},
                'average_transaction_size': {},
                'spending_velocity': {},
                'recommendations': []
            }
            
            # Analyze by day of week
            day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            day_spending = [0] * 7
            day_counts = [0] * 7
            
            for transaction in transactions:
                if transaction['type'] == 'expense':
                    trans_date = datetime.fromisoformat(transaction['date'])
                    day_of_week = trans_date.weekday()
                    amount = float(transaction['amount'])
                    
                    day_spending[day_of_week] += amount
                    day_counts[day_of_week] += 1
            
            for i, day_name in enumerate(day_names):
                avg_spending = day_spending[i] / max(1, day_counts[i])
                analysis['spending_by_day_of_week'][day_name] = {
                    'total': day_spending[i],
                    'average': avg_spending,
                    'transaction_count': day_counts[i]
                }
            
            # Find highest spending day
            max_day = max(analysis['spending_by_day_of_week'].items(), key=lambda x: x[1]['average'])
            if max_day[1]['average'] > 0:
                analysis['recommendations'].append(f"You spend most on {max_day[0]}s (₹{max_day[1]['average']:.0f} avg). Consider planning these days more carefully.")
            
            # Analyze spending velocity (frequency of transactions)
            expense_transactions = [t for t in transactions if t['type'] == 'expense']
            if len(expense_transactions) > 1:
                # Sort by date
                expense_transactions.sort(key=lambda x: x['date'])
                
                # Calculate average days between transactions
                dates = [datetime.fromisoformat(t['date']) for t in expense_transactions]
                intervals = [(dates[i+1] - dates[i]).days for i in range(len(dates)-1)]
                avg_interval = sum(intervals) / len(intervals) if intervals else 0
                
                analysis['spending_velocity'] = {
                    'average_days_between_transactions': avg_interval,
                    'transactions_per_week': 7 / max(1, avg_interval),
                    'spending_frequency': 'high' if avg_interval < 2 else 'medium' if avg_interval < 5 else 'low'
                }
                
                if avg_interval < 1:
                    analysis['recommendations'].append("You make multiple transactions daily. Consider consolidating purchases to reduce impulse spending.")
            
            return analysis
        
        except Exception as e:
            print(f"Error analyzing spending habits: {e}")
            return {}