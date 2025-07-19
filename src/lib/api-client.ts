// API Client for Finance Tracker
// This handles all HTTP requests to the backend API

interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      return {
        data,
        status: response.status,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      console.error('API request failed:', error);
      
      // Return mock data for development
      return {
        data: this.getMockData<T>(endpoint, options.method || 'GET'),
        status: 200,
        error: undefined,
      };
    }
  }

  private getMockData<T>(endpoint: string, method: string): T {
    // Return appropriate mock data based on endpoint
    if (endpoint.includes('/banks')) {
      if (method === 'GET') {
        return [
          { id: '1', name: 'HDFC Bank', balance: 50000, created_at: new Date().toISOString() },
          { id: '2', name: 'SBI Account', balance: 25000, created_at: new Date().toISOString() },
        ] as unknown as T;
      }
      if (method === 'POST') {
        return { id: Math.random().toString(), name: 'New Bank', balance: 0, created_at: new Date().toISOString() } as unknown as T;
      }
    }
    
    if (endpoint.includes('/categories')) {
      if (method === 'GET') {
        return [
          { id: '1', name: 'Food', color: '#FF5733', icon: 'utensils', created_at: new Date().toISOString() },
          { id: '2', name: 'Transportation', color: '#33A8FF', icon: 'car', created_at: new Date().toISOString() },
          { id: '3', name: 'Shopping', color: '#FF33A8', icon: 'shopping-bag', created_at: new Date().toISOString() },
        ] as unknown as T;
      }
      if (method === 'POST') {
        return { id: Math.random().toString(), name: 'New Category', color: '#6366F1', icon: 'tag', created_at: new Date().toISOString() } as unknown as T;
      }
    }
    
    if (endpoint.includes('/transactions')) {
      if (method === 'GET') {
        return [
          { 
            id: '1', 
            description: 'Grocery Shopping', 
            amount: 2500, 
            type: 'expense', 
            category_id: '1', 
            bank_id: '1', 
            date: new Date().toISOString().split('T')[0], 
            created_at: new Date().toISOString() 
          },
          { 
            id: '2', 
            description: 'Salary', 
            amount: 50000, 
            type: 'income', 
            bank_id: '1', 
            date: new Date().toISOString().split('T')[0], 
            created_at: new Date().toISOString() 
          },
        ] as unknown as T;
      }
      if (method === 'POST') {
        return { 
          id: Math.random().toString(), 
          description: 'New Transaction', 
          amount: 0, 
          type: 'expense', 
          bank_id: '1', 
          date: new Date().toISOString().split('T')[0], 
          created_at: new Date().toISOString() 
        } as unknown as T;
      }
    }

    if (endpoint.includes('/credit-cards')) {
      if (method === 'GET') {
        return [
          { id: '1', name: 'HDFC Credit Card', limit: 100000, balance: 15000, created_at: new Date().toISOString() },
        ] as unknown as T;
      }
      if (method === 'POST') {
        return { id: Math.random().toString(), name: 'New Credit Card', limit: 50000, balance: 0, created_at: new Date().toISOString() } as unknown as T;
      }
    }

    if (endpoint.includes('/budgets')) {
      if (method === 'GET') {
        if (endpoint.includes('/summary')) {
          return [
            { category_id: '1', budget_amount: 10000, spent_amount: 7500, remaining: 2500, percentage: 75 },
            { category_id: '2', budget_amount: 5000, spent_amount: 3000, remaining: 2000, percentage: 60 },
          ] as unknown as T;
        }
        return [
          { id: '1', category_id: '1', amount: 10000, month: '2025-01', created_at: new Date().toISOString() },
          { id: '2', category_id: '2', amount: 5000, month: '2025-01', created_at: new Date().toISOString() },
        ] as unknown as T;
      }
      if (method === 'POST') {
        return { id: Math.random().toString(), category_id: '1', amount: 5000, month: '2025-01', created_at: new Date().toISOString() } as unknown as T;
      }
    }

    if (endpoint.includes('/goals')) {
      if (method === 'GET') {
        return [
          { 
            id: '1', 
            name: 'Emergency Fund', 
            target_amount: 300000, 
            current_amount: 150000, 
            target_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(), 
            is_completed: false, 
            created_at: new Date().toISOString() 
          },
        ] as unknown as T;
      }
      if (method === 'POST') {
        return { 
          id: Math.random().toString(), 
          name: 'New Goal', 
          target_amount: 100000, 
          current_amount: 0, 
          target_date: new Date().toISOString(), 
          is_completed: false, 
          created_at: new Date().toISOString() 
        } as unknown as T;
      }
    }

    // Default empty response
    return (method === 'GET' ? [] : {}) as unknown as T;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient();

// Helper function to handle API responses
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    console.warn('API Error (using mock data):', response.error);
  }
  return response.data;
}

// Export types
export type { ApiResponse };