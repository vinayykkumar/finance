import { apiClient, handleApiResponse } from './api-client';

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
    const response = await apiClient.get<TransactionTemplate[]>('/templates');
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in getTransactionTemplates:', error);
    throw error;
  }
}

export async function createTransactionTemplate(template: Omit<TransactionTemplate, 'id' | 'created_at'>): Promise<TransactionTemplate> {
  try {
    const response = await apiClient.post<TransactionTemplate>('/templates', {
      name: template.name,
      description: template.description,
      amount: template.amount,
      type: template.type,
      category_id: template.category_id,
      bank_id: template.bank_id,
      to_bank_id: template.to_bank_id
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in createTransactionTemplate:', error);
    throw error;
  }
}

export async function updateTransactionTemplate(id: string, updates: Partial<Omit<TransactionTemplate, 'id' | 'created_at'>>): Promise<TransactionTemplate> {
  try {
    const response = await apiClient.patch<TransactionTemplate>(`/templates/${id}`, updates);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in updateTransactionTemplate:', error);
    throw error;
  }
}

export async function deleteTransactionTemplate(id: string): Promise<void> {
  try {
    const response = await apiClient.delete(`/templates/${id}`);
    handleApiResponse(response);
  } catch (error) {
    console.error('Error in deleteTransactionTemplate:', error);
    throw error;
  }
}