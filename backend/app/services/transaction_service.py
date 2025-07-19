"""
Transaction service module.

This module contains all business logic related to transaction operations.
"""

from typing import List, Optional
from datetime import date
from supabase import Client

from app.models import Transaction, TransactionCreate, TransactionUpdate
from app.services.bank_service import BankService

class TransactionService:
    """Service class for transaction operations."""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.bank_service = BankService(supabase)
    
    async def get_all_transactions(self) -> List[Transaction]:
        """Get all transactions."""
        try:
            response = self.supabase.table("transactions").select("*").order("date", desc=True).execute()
            return [Transaction(**transaction) for transaction in response.data]
        except Exception as e:
            print(f"Error getting transactions: {e}")
            raise
    
    async def get_transaction_by_id(self, transaction_id: str) -> Optional[Transaction]:
        """Get a transaction by ID."""
        try:
            response = self.supabase.table("transactions").select("*").eq("id", transaction_id).execute()
            if response.data:
                return Transaction(**response.data[0])
            return None
        except Exception as e:
            print(f"Error getting transaction {transaction_id}: {e}")
            raise
    
    async def get_transactions_by_month(self, year: int, month: int) -> List[Transaction]:
        """Get transactions for a specific month."""
        try:
            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month + 1, 1)
            
            response = self.supabase.table("transactions").select("*").gte("date", start_date.isoformat()).lt("date", end_date.isoformat()).order("date", desc=True).execute()
            return [Transaction(**transaction) for transaction in response.data]
        except Exception as e:
            print(f"Error getting transactions for {year}-{month}: {e}")
            raise
    
    async def create_transaction(self, transaction_data: TransactionCreate) -> Transaction:
        """Create a new transaction and update bank balances."""
        try:
            # Validate transfer transaction
            if transaction_data.type == "transfer" and not transaction_data.to_bank_id:
                raise ValueError("Transfer transactions require a destination bank")
            
            # Create the transaction
            data = {
                "description": transaction_data.description,
                "amount": float(transaction_data.amount),
                "type": transaction_data.type,
                "date": transaction_data.date.isoformat(),
                "bank_id": transaction_data.bank_id,
                "category_id": transaction_data.category_id,
                "to_bank_id": transaction_data.to_bank_id
            }
            
            response = self.supabase.table("transactions").insert(data).execute()
            transaction = Transaction(**response.data[0])
            
            # Update bank balances based on transaction type
            await self._update_balances_for_transaction(transaction)
            
            return transaction
        except Exception as e:
            print(f"Error creating transaction: {e}")
            raise
    
    async def update_transaction(self, transaction_id: str, transaction_data: TransactionUpdate) -> Optional[Transaction]:
        """Update a transaction."""
        try:
            # Get the original transaction to reverse balance changes
            original_transaction = await self.get_transaction_by_id(transaction_id)
            if not original_transaction:
                return None
            
            # Reverse the original balance changes
            await self._reverse_balances_for_transaction(original_transaction)
            
            # Build update data from non-None fields
            update_data = {}
            if transaction_data.description is not None:
                update_data["description"] = transaction_data.description
            if transaction_data.amount is not None:
                update_data["amount"] = float(transaction_data.amount)
            if transaction_data.type is not None:
                update_data["type"] = transaction_data.type
            if transaction_data.date is not None:
                update_data["date"] = transaction_data.date.isoformat()
            if transaction_data.bank_id is not None:
                update_data["bank_id"] = transaction_data.bank_id
            if transaction_data.category_id is not None:
                update_data["category_id"] = transaction_data.category_id
            if transaction_data.to_bank_id is not None:
                update_data["to_bank_id"] = transaction_data.to_bank_id
            
            if not update_data:
                # No fields to update, apply original balance changes back
                await self._update_balances_for_transaction(original_transaction)
                return original_transaction
            
            # Update the transaction
            response = self.supabase.table("transactions").update(update_data).eq("id", transaction_id).execute()
            if response.data:
                updated_transaction = Transaction(**response.data[0])
                # Apply new balance changes
                await self._update_balances_for_transaction(updated_transaction)
                return updated_transaction
            return None
        except Exception as e:
            print(f"Error updating transaction {transaction_id}: {e}")
            raise
    
    async def delete_transaction(self, transaction_id: str) -> bool:
        """Delete a transaction and reverse its balance effects."""
        try:
            # Get the transaction to reverse balance changes
            transaction = await self.get_transaction_by_id(transaction_id)
            if not transaction:
                return False
            
            # Reverse the balance changes
            await self._reverse_balances_for_transaction(transaction)
            
            # Delete the transaction
            response = self.supabase.table("transactions").delete().eq("id", transaction_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error deleting transaction {transaction_id}: {e}")
            raise
    
    async def _update_balances_for_transaction(self, transaction: Transaction):
        """Update bank balances based on transaction type."""
        try:
            if transaction.type == "expense":
                # Decrease source bank balance
                await self.bank_service.update_balance(transaction.bank_id, -transaction.amount)
            elif transaction.type == "income":
                # Increase source bank balance
                await self.bank_service.update_balance(transaction.bank_id, transaction.amount)
            elif transaction.type == "transfer" and transaction.to_bank_id:
                # Decrease source bank, increase destination bank
                await self.bank_service.update_balance(transaction.bank_id, -transaction.amount)
                await self.bank_service.update_balance(transaction.to_bank_id, transaction.amount)
        except Exception as e:
            print(f"Error updating balances for transaction: {e}")
            raise
    
    async def _reverse_balances_for_transaction(self, transaction: Transaction):
        """Reverse bank balance changes for a transaction."""
        try:
            if transaction.type == "expense":
                # Increase source bank balance (reverse decrease)
                await self.bank_service.update_balance(transaction.bank_id, transaction.amount)
            elif transaction.type == "income":
                # Decrease source bank balance (reverse increase)
                await self.bank_service.update_balance(transaction.bank_id, -transaction.amount)
            elif transaction.type == "transfer" and transaction.to_bank_id:
                # Increase source bank, decrease destination bank (reverse transfer)
                await self.bank_service.update_balance(transaction.bank_id, transaction.amount)
                await self.bank_service.update_balance(transaction.to_bank_id, -transaction.amount)
        except Exception as e:
            print(f"Error reversing balances for transaction: {e}")
            raise