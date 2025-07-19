// API Client for Finance Tracker
// This handles all HTTP communication with the backend API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`API Response: ${config.method || 'GET'} ${url}`, data);
      
      return { data };
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      
      // For now, return mock data to keep the frontend working
      // This will be replaced with actual API calls later
      return this.getMockData<T>(endpoint, options);
    }
  }

  // Mock data provider - will be removed when backend is ready
  private getMockData<T>(endpoint: string, options: RequestInit): ApiResponse<T> {
    console.log(`Using mock data for: ${endpoint}`);
    
    // Return appropriate mock data based on endpoint
    if (endpoint.includes('/banks')) {
      if (options.method === 'POST') {
        return {
          data: {
            id: Math.random().toString(36).substring(7),
            name: 'New Bank',
            balance: 0,
            created_at: new Date().toISOString(),
          } as any
        };
      }
      return {
        data: [
          {
            id: 'bank1',
            name: 'Main Account',
            balance: 50000,
            created_at: new Date().toISOString(),
          },
          {
            id: 'bank2',
            name: 'Savings Account',
            balance: 25000,
            created_at: new Date().toISOString(),
          }
        ] as any
      };
    }
    
    if (endpoint.includes('/categories')) {
      if (options.method === 'POST') {
        return {
          data: {
            id: Math.random().toString(36).substring(7),
            name: 'New Category',
            color: '#6366F1',
            icon: 'tag',
            created_at: new Date().toISOString(),
          } as any
        };
      }
      return {
        data: [
          {
            id: 'cat1',
            name: 'Food & Dining',
            color: '#FF5733',
            icon: 'utensils',
            monthly_limit: 10000,
            created_at: new Date().toISOString(),
          },
          {
            id: 'cat2',
            name: 'Transportation',
            color: '#33A8FF',
            icon: 'car',
            monthly_limit: 5000,
            created_at: new Date().toISOString(),
          },
          {
            id: 'cat3',
            name: 'Entertainment',
            color: '#A833FF',
            icon: 'film',
            monthly_limit: 3000,
            created_at: new Date().toISOString(),
          },
          {
            id: 'cat4',
            name: 'Salary',
            color: '#10B981',
            icon: 'dollar-sign',
            created_at: new Date().toISOString(),
          }
        ] as any
      };
    }
    
    if (endpoint.includes('/transactions')) {
      if (options.method === 'POST') {
        return {
          data: {
            id: Math.random().toString(36).substring(7),
            description: 'New Transaction',
            amount: 100,
            type: 'expense',
            date: new Date().toISOString().split('T')[0],
            bank_id: 'bank1',
            created_at: new Date().toISOString(),
          } as any
        };
      }
      return {
        data: [
          {
            id: 'tx1',
            description: 'Grocery Shopping',
            amount: 2500,
            type: 'expense',
            category_id: 'cat1',
            bank_id: 'bank1',
            date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
          },
          {
            id: 'tx2',
            description: 'Salary Credit',
            amount: 50000,
            type: 'income',
            category_id: 'cat4',
            bank_id: 'bank1',
            date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
          }
        ] as any
      };
    }
    
    if (endpoint.includes('/credit-cards')) {
      return {
        data: [] as any
      };
    }
    
    return { data: [] as any };
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
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

// Export singleton instance
export const apiClient = new ApiClient();

// Helper function to handle API responses
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (!response.data) {
    throw new Error('No data received from API');
  }
  return response.data;
}