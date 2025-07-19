"""
Pydantic models for request/response validation.

This module defines all the data models used by the API
for request validation and response serialization.
"""

from datetime import date, datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from decimal import Decimal

# Bank Models
class BankBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    balance: Decimal = Field(default=0, ge=0)

class BankCreate(BankBase):
    pass

class BankUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    balance: Optional[Decimal] = Field(None, ge=0)

class Bank(BankBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Category Models
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., regex=r'^#[0-9A-Fa-f]{6}$')
    icon: str = Field(..., min_length=1, max_length=50)
    monthly_limit: Optional[Decimal] = Field(None, gt=0)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    icon: Optional[str] = Field(None, min_length=1, max_length=50)
    monthly_limit: Optional[Decimal] = Field(None, gt=0)

class Category(CategoryBase):
    id: str
    user_id: Optional[str] = None
    preferred_bank_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Transaction Models
class TransactionBase(BaseModel):
    description: str = Field(..., min_length=1, max_length=200)
    amount: Decimal = Field(..., gt=0)
    type: Literal["expense", "income", "transfer"]
    date: date
    bank_id: str
    category_id: Optional[str] = None
    to_bank_id: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    amount: Optional[Decimal] = Field(None, gt=0)
    type: Optional[Literal["expense", "income", "transfer"]] = None
    date: Optional[date] = None
    bank_id: Optional[str] = None
    category_id: Optional[str] = None
    to_bank_id: Optional[str] = None

class Transaction(TransactionBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Budget Models
class BudgetBase(BaseModel):
    category_id: str
    amount: Decimal = Field(..., gt=0)
    month: date

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0)

class Budget(BudgetBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BudgetSummaryItem(BaseModel):
    category_id: str
    budget_amount: Decimal
    spent_amount: Decimal
    remaining: Decimal
    percentage: float

# Goal Models
class GoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    target_amount: Decimal = Field(..., gt=0)
    current_amount: Decimal = Field(default=0, ge=0)
    target_date: Optional[date] = None
    category_id: Optional[str] = None
    is_completed: bool = Field(default=False)

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    target_amount: Optional[Decimal] = Field(None, gt=0)
    current_amount: Optional[Decimal] = Field(None, ge=0)
    target_date: Optional[date] = None
    category_id: Optional[str] = None
    is_completed: Optional[bool] = None

class Goal(GoalBase):
    id: str
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Credit Card Models
class CreditCardBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    limit: Decimal = Field(..., gt=0)
    balance: Decimal = Field(default=0, ge=0)

class CreditCardCreate(CreditCardBase):
    pass

class CreditCardUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    limit: Optional[Decimal] = Field(None, gt=0)
    balance: Optional[Decimal] = Field(None, ge=0)

class CreditCard(CreditCardBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Response Models
class APIResponse(BaseModel):
    """Generic API response model."""
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    """Error response model."""
    success: bool = False
    error: str
    message: str
    details: Optional[dict] = None