// Simple ID generator function
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  monthly_limit?: number;
  created_at: string;
}

// In-memory storage for categories
let mockCategories: Category[] = [
  {
    id: 'cat1',
    name: 'Food',
    type: 'expense',
    icon: '🍔',
    color: '#FF5733',
    monthly_limit: 10000,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat2',
    name: 'Transportation',
    type: 'expense',
    icon: '🚗',
    color: '#33A8FF',
    monthly_limit: 5000,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat3',
    name: 'Entertainment',
    type: 'expense',
    icon: '🎬',
    color: '#9C33FF',
    monthly_limit: 3000,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat4',
    name: 'Salary',
    type: 'income',
    icon: '💰',
    color: '#33FF57',
    created_at: new Date().toISOString()
  }
];

export async function getCategories(): Promise<Category[]> {
  return [...mockCategories];
}

export async function createCategory(name: string, type: 'income' | 'expense', icon?: string, monthlyLimit?: number): Promise<Category> {
  const newCategory: Category = {
    id: generateId(),
    name,
    type,
    icon,
    monthly_limit: monthlyLimit,
    created_at: new Date().toISOString()
  };
  
  mockCategories.push(newCategory);
  return newCategory;
}

export async function updateCategory(id: string, name: string, type: 'income' | 'expense', icon?: string, monthlyLimit?: number): Promise<Category> {
  const categoryIndex = mockCategories.findIndex(c => c.id === id);
  
  if (categoryIndex === -1) {
    throw new Error('Category not found');
  }
  
  mockCategories[categoryIndex] = {
    ...mockCategories[categoryIndex],
    name,
    type,
    icon,
    monthly_limit: monthlyLimit
  };
  
  return mockCategories[categoryIndex];
}

export async function deleteCategory(id: string): Promise<void> {
  const categoryIndex = mockCategories.findIndex(c => c.id === id);
  
  if (categoryIndex === -1) {
    throw new Error('Category not found');
  }
  
  mockCategories.splice(categoryIndex, 1);
}
