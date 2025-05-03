import { supabase } from './supabase';

export interface TransactionTemplate {
  id: string;
  name: string;
  description?: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  category_id?: string;
  bank_id?: string;
  to_bank_id?: string;
  created_at: string;
}

export async function getTransactionTemplates(): Promise<TransactionTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('transaction_templates')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching transaction templates:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTransactionTemplates:', error);
    throw error;
  }
}

export async function createTransactionTemplate(template: Omit<TransactionTemplate, 'id' | 'created_at'>): Promise<TransactionTemplate> {
  try {
    const { data, error } = await supabase
      .from('transaction_templates')
      .insert({
        name: template.name,
        description: template.description,
        amount: template.amount,
        type: template.type,
        category_id: template.category_id,
        bank_id: template.bank_id,
        to_bank_id: template.to_bank_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction template:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert');
    }

    return data;
  } catch (error) {
    console.error('Error in createTransactionTemplate:', error);
    throw error;
  }
}

export async function updateTransactionTemplate(id: string, updates: Partial<Omit<TransactionTemplate, 'id' | 'created_at'>>): Promise<TransactionTemplate> {
  try {
    const { data, error } = await supabase
      .from('transaction_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction template:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from update');
    }

    return data;
  } catch (error) {
    console.error('Error in updateTransactionTemplate:', error);
    throw error;
  }
}

export async function deleteTransactionTemplate(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('transaction_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction template:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteTransactionTemplate:', error);
    throw error;
  }
}
