import { apiClient, handleApiResponse } from './api-client';

export interface Bank {
  id: string;
  name: string;
  balance: number;
  user_id?: string;
  created_at: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  balance: number;
  created_at: string;
}

// Bank operations
export async function getBanks(userId?: string): Promise<Bank[]> {
  try {
    const response = await apiClient.get<Bank[]>('/banks');
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to load banks:', error);
    throw error;
  }
}

export async function addBank(name: string, initialBalance: number, userId?: string): Promise<Bank> {
  try {
    console.log('Adding bank with:', { name, initialBalance, userId });

    const response = await apiClient.post<Bank>('/banks', {
      name,
      balance: initialBalance,
      user_id: userId,
    });

    const newBank = handleApiResponse(response);
    console.log('Bank added successfully:', newBank);
    return newBank;
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      throw error;
    } else if (typeof error === 'object' && error !== null) {
      throw new Error(JSON.stringify(error));
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}

export async function updateBankBalance(bankId: string, amount: number): Promise<void> {
  try {
    const response = await apiClient.patch<Bank>(`/banks/${bankId}/balance`, {
      amount_change: amount,
    });

    handleApiResponse(response);
  } catch (error) {
    console.error('Error in updateBankBalance:', error);
    throw error;
  }
}

export async function deleteBank(id: string): Promise<void> {
  try {
    console.log('Deleting bank with ID:', id);

    const response = await apiClient.delete(`/banks/${id}`);
    handleApiResponse(response);

    console.log('Bank deleted successfully');
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      throw error;
    } else if (typeof error === 'object' && error !== null) {
      throw new Error(JSON.stringify(error));
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}

// Credit Card operations
export async function getCreditCards(userId?: string): Promise<CreditCard[]> {
  try {
    const response = await apiClient.get<CreditCard[]>('/credit-cards');
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to load credit cards:', error);
    throw error;
  }
}

export async function addCreditCard(name: string, limit: number, userId?: string): Promise<CreditCard> {
  try {
    const response = await apiClient.post<CreditCard>('/credit-cards', {
      name,
      limit,
      balance: 0,
      user_id: userId,
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to add credit card:', error);
    throw error;
  }
}

export async function deleteCreditCard(id: string): Promise<void> {
  try {
    const response = await apiClient.delete(`/credit-cards/${id}`);
    handleApiResponse(response);
  } catch (error) {
    console.error('Failed to delete credit card:', error);
    throw error;
  }
}