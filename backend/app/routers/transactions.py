"""
Transaction API routes.

This module handles all transaction related operations including
CRUD operations and transaction analysis.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import date

from app.models import Transaction, TransactionCreate, TransactionUpdate, APIResponse
from app.database import get_supabase
from app.services.transaction_service import TransactionService

router = APIRouter()

def get_transaction_service():
    """Dependency to get transaction service instance."""
    return TransactionService(get_supabase())

@router.get("/", response_model=List[Transaction])
async def get_transactions(
    year: Optional[int] = Query(None, description="Filter by year"),
    month: Optional[int] = Query(None, description="Filter by month (1-12)"),
    transaction_service: TransactionService = Depends(get_transaction_service)
):
    """Get all transactions, optionally filtered by year and month."""
    try:
        if year and month:
            transactions = await transaction_service.get_transactions_by_month(year, month)
        else:
            transactions = await transaction_service.get_all_transactions()
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{transaction_id}", response_model=Transaction)
async def get_transaction(
    transaction_id: str, 
    transaction_service: TransactionService = Depends(get_transaction_service)
):
    """Get a specific transaction by ID."""
    try:
        transaction = await transaction_service.get_transaction_by_id(transaction_id)
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return transaction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Transaction)
async def create_transaction(
    transaction_data: TransactionCreate, 
    transaction_service: TransactionService = Depends(get_transaction_service)
):
    """Create a new transaction."""
    try:
        transaction = await transaction_service.create_transaction(transaction_data)
        return transaction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{transaction_id}", response_model=Transaction)
async def update_transaction(
    transaction_id: str, 
    transaction_data: TransactionUpdate, 
    transaction_service: TransactionService = Depends(get_transaction_service)
):
    """Update a transaction."""
    try:
        transaction = await transaction_service.update_transaction(transaction_id, transaction_data)
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return transaction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{transaction_id}", response_model=APIResponse)
async def delete_transaction(
    transaction_id: str, 
    transaction_service: TransactionService = Depends(get_transaction_service)
):
    """Delete a transaction."""
    try:
        success = await transaction_service.delete_transaction(transaction_id)
        if not success:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return APIResponse(message="Transaction deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))