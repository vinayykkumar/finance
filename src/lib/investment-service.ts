import { apiClient, handleApiResponse } from './api-client';

export interface InvestmentAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  created_at: string;
}

export interface Investment {
  id: string;
  account_id: string;
  name: string;
  symbol?: string;
  purchase_price: number;
  current_price: number;
  quantity: number;
  purchase_date: string;
  created_at: string;
}

export async function getInvestmentAccounts(): Promise<InvestmentAccount[]> {
  try {
    const response = await apiClient.get<InvestmentAccount[]>('/investment-accounts');
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in getInvestmentAccounts:', error);
    throw error;
  }
}

export async function createInvestmentAccount(account: Omit<InvestmentAccount, 'id' | 'created_at'>): Promise<InvestmentAccount> {
  try {
    const response = await apiClient.post<InvestmentAccount>('/investment-accounts', {
      name: account.name,
      type: account.type,
      balance: account.balance || 0
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in createInvestmentAccount:', error);
    throw error;
  }
}

export async function updateInvestmentAccount(id: string, updates: Partial<Omit<InvestmentAccount, 'id' | 'created_at'>>): Promise<InvestmentAccount> {
  try {
    const response = await apiClient.patch<InvestmentAccount>(`/investment-accounts/${id}`, updates);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in updateInvestmentAccount:', error);
    throw error;
  }
}

export async function deleteInvestmentAccount(id: string): Promise<void> {
  try {
    const response = await apiClient.delete(`/investment-accounts/${id}`);
    handleApiResponse(response);
  } catch (error) {
    console.error('Error in deleteInvestmentAccount:', error);
    throw error;
  }
}

export async function getInvestments(accountId?: string): Promise<Investment[]> {
  try {
    let endpoint = '/investments';
    if (accountId) {
      endpoint += `?account_id=${accountId}`;
    }

    const response = await apiClient.get<Investment[]>(endpoint);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in getInvestments:', error);
    throw error;
  }
}

export async function createInvestment(investment: Omit<Investment, 'id' | 'created_at'>): Promise<Investment> {
  try {
    const response = await apiClient.post<Investment>('/investments', {
      account_id: investment.account_id,
      name: investment.name,
      symbol: investment.symbol,
      purchase_price: investment.purchase_price,
      current_price: investment.current_price,
      quantity: investment.quantity,
      purchase_date: investment.purchase_date
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in createInvestment:', error);
    throw error;
  }
}

export async function updateInvestment(id: string, updates: Partial<Omit<Investment, 'id' | 'created_at'>>): Promise<Investment> {
  try {
    const response = await apiClient.patch<Investment>(`/investments/${id}`, updates);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error in updateInvestment:', error);
    throw error;
  }
}

export async function deleteInvestment(id: string): Promise<void> {
  try {
    const response = await apiClient.delete(`/investments/${id}`);
    handleApiResponse(response);
  } catch (error) {
    console.error('Error in deleteInvestment:', error);
    throw error;
  }
}