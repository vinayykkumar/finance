"""
Bank account API routes.

This module handles all bank account related operations including
CRUD operations and balance management.
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from decimal import Decimal

from app.models import Bank, BankCreate, BankUpdate, APIResponse
from app.database import get_supabase
from app.services.bank_service import BankService

router = APIRouter()

def get_bank_service():
    """Dependency to get bank service instance."""
    return BankService(get_supabase())

@router.get("/", response_model=List[Bank])
async def get_banks(bank_service: BankService = Depends(get_bank_service)):
    """Get all bank accounts."""
    try:
        banks = await bank_service.get_all_banks()
        return banks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{bank_id}", response_model=Bank)
async def get_bank(bank_id: str, bank_service: BankService = Depends(get_bank_service)):
    """Get a specific bank account by ID."""
    try:
        bank = await bank_service.get_bank_by_id(bank_id)
        if not bank:
            raise HTTPException(status_code=404, detail="Bank not found")
        return bank
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Bank)
async def create_bank(bank_data: BankCreate, bank_service: BankService = Depends(get_bank_service)):
    """Create a new bank account."""
    try:
        bank = await bank_service.create_bank(bank_data)
        return bank
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{bank_id}", response_model=Bank)
async def update_bank(
    bank_id: str, 
    bank_data: BankUpdate, 
    bank_service: BankService = Depends(get_bank_service)
):
    """Update a bank account."""
    try:
        bank = await bank_service.update_bank(bank_id, bank_data)
        if not bank:
            raise HTTPException(status_code=404, detail="Bank not found")
        return bank
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{bank_id}", response_model=APIResponse)
async def delete_bank(bank_id: str, bank_service: BankService = Depends(get_bank_service)):
    """Delete a bank account."""
    try:
        success = await bank_service.delete_bank(bank_id)
        if not success:
            raise HTTPException(status_code=404, detail="Bank not found")
        return APIResponse(message="Bank deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{bank_id}/balance", response_model=APIResponse)
async def update_bank_balance(
    bank_id: str, 
    amount_change: Decimal, 
    bank_service: BankService = Depends(get_bank_service)
):
    """Update bank balance by a specific amount (can be positive or negative)."""
    try:
        success = await bank_service.update_balance(bank_id, amount_change)
        if not success:
            raise HTTPException(status_code=404, detail="Bank not found")
        return APIResponse(message="Bank balance updated successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))