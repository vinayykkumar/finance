/**
 * Bank Model
 * 
 * Handles operations related to the banks table in the database.
 */

import { Tables } from '../schemas/schema';
import { BaseModel } from './BaseModel';
import { supabase } from '../../lib/supabase';

type Bank = Tables['banks'];

export class BankModel extends BaseModel<Bank> {
  constructor() {
    super('banks');
  }

  /**
   * Update bank balance atomically using the database function
   */
  async updateBalance(bankId: string, amountChange: number): Promise<void> {
    try {
      // First try to use the RPC function for atomic updates
      const { error: rpcError } = await supabase.rpc('update_bank_balance', {
        bank_id: bankId,
        amount_change: amountChange,
      });

      // If RPC fails, fall back to regular update
      if (rpcError) {
        console.warn('RPC update_bank_balance failed, falling back to regular update:', rpcError);
        
        const { data: bank } = await supabase
          .from('banks')
          .select('balance')
          .eq('id', bankId)
          .single();

        if (!bank) {
          throw new Error('Bank not found');
        }

        await this.update(bankId, { balance: bank.balance + amountChange });
      }
    } catch (error) {
      console.error('Error updating bank balance:', error);
      throw error;
    }
  }

  /**
   * Gets the total balance of all bank accounts
   */
  async getTotalBalance(): Promise<number> {
    try {
      const banks = await this.findAll();
      return banks.reduce((total, bank) => total + bank.balance, 0);
    } catch (error) {
      console.error('Error calculating total balance:', error);
      throw error;
    }
  }
} 