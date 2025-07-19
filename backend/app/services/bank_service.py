"""
Bank service module.

This module contains all business logic related to bank account operations.
"""

from typing import List, Optional
from decimal import Decimal
from supabase import Client

from app.models import Bank, BankCreate, BankUpdate

class BankService:
    """Service class for bank account operations."""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def get_all_banks(self) -> List[Bank]:
        """Get all bank accounts."""
        try:
            response = self.supabase.table("banks").select("*").order("created_at", desc=True).execute()
            return [Bank(**bank) for bank in response.data]
        except Exception as e:
            print(f"Error getting banks: {e}")
            raise
    
    async def get_bank_by_id(self, bank_id: str) -> Optional[Bank]:
        """Get a bank account by ID."""
        try:
            response = self.supabase.table("banks").select("*").eq("id", bank_id).execute()
            if response.data:
                return Bank(**response.data[0])
            return None
        except Exception as e:
            print(f"Error getting bank {bank_id}: {e}")
            raise
    
    async def create_bank(self, bank_data: BankCreate) -> Bank:
        """Create a new bank account."""
        try:
            data = {
                "name": bank_data.name,
                "balance": float(bank_data.balance)
            }
            response = self.supabase.table("banks").insert(data).execute()
            return Bank(**response.data[0])
        except Exception as e:
            print(f"Error creating bank: {e}")
            raise
    
    async def update_bank(self, bank_id: str, bank_data: BankUpdate) -> Optional[Bank]:
        """Update a bank account."""
        try:
            # Build update data from non-None fields
            update_data = {}
            if bank_data.name is not None:
                update_data["name"] = bank_data.name
            if bank_data.balance is not None:
                update_data["balance"] = float(bank_data.balance)
            
            if not update_data:
                # No fields to update, return current bank
                return await self.get_bank_by_id(bank_id)
            
            response = self.supabase.table("banks").update(update_data).eq("id", bank_id).execute()
            if response.data:
                return Bank(**response.data[0])
            return None
        except Exception as e:
            print(f"Error updating bank {bank_id}: {e}")
            raise
    
    async def delete_bank(self, bank_id: str) -> bool:
        """Delete a bank account."""
        try:
            # First, delete all transactions associated with this bank
            self.supabase.table("transactions").delete().eq("bank_id", bank_id).execute()
            self.supabase.table("transactions").delete().eq("to_bank_id", bank_id).execute()
            
            # Then delete the bank
            response = self.supabase.table("banks").delete().eq("id", bank_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error deleting bank {bank_id}: {e}")
            raise
    
    async def update_balance(self, bank_id: str, amount_change: Decimal) -> bool:
        """Update bank balance by a specific amount."""
        try:
            # Use the RPC function for atomic balance updates
            response = self.supabase.rpc("update_bank_balance", {
                "bank_id": bank_id,
                "amount_change": float(amount_change)
            }).execute()
            return True
        except Exception as e:
            print(f"Error updating bank balance {bank_id}: {e}")
            # Fallback to regular update if RPC fails
            try:
                bank = await self.get_bank_by_id(bank_id)
                if bank:
                    new_balance = bank.balance + amount_change
                    await self.update_bank(bank_id, BankUpdate(balance=new_balance))
                    return True
                return False
            except Exception as fallback_error:
                print(f"Fallback balance update also failed: {fallback_error}")
                raise