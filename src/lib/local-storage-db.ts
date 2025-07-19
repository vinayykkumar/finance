// Local Storage Database Service
// This provides a simple database-like interface using localStorage

export interface StorageItem {
  id: string;
  created_at: string;
  updated_at?: string;
}

class LocalStorageDB {
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private getStorageKey(table: string): string {
    return `fintrack_${table}`;
  }

  // Generic CRUD operations
  findAll<T extends StorageItem>(table: string): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(table));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${table} from localStorage:`, error);
      return [];
    }
  }

  findById<T extends StorageItem>(table: string, id: string): T | null {
    const items = this.findAll<T>(table);
    return items.find(item => item.id === id) || null;
  }

  create<T extends StorageItem>(table: string, data: Omit<T, 'id' | 'created_at'>): T {
    const items = this.findAll<T>(table);
    const newItem = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString(),
    } as T;
    
    items.push(newItem);
    this.saveToStorage(table, items);
    return newItem;
  }

  update<T extends StorageItem>(table: string, id: string, updates: Partial<Omit<T, 'id' | 'created_at'>>): T | null {
    const items = this.findAll<T>(table);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    this.saveToStorage(table, items);
    return items[index];
  }

  delete(table: string, id: string): boolean {
    const items = this.findAll(table);
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) return false;
    
    this.saveToStorage(table, filteredItems);
    return true;
  }

  private saveToStorage<T>(table: string, data: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${table} to localStorage:`, error);
      throw new Error(`Failed to save data to localStorage: ${error}`);
    }
  }

  // Utility methods
  clear(table: string): void {
    localStorage.removeItem(this.getStorageKey(table));
  }

  clearAll(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('fintrack_'));
    keys.forEach(key => localStorage.removeItem(key));
  }

  // Query helpers
  findWhere<T extends StorageItem>(table: string, predicate: (item: T) => boolean): T[] {
    const items = this.findAll<T>(table);
    return items.filter(predicate);
  }

  count(table: string): number {
    return this.findAll(table).length;
  }
}

// Export singleton instance
export const localDB = new LocalStorageDB();

// Initialize with some default data if tables are empty
export function initializeDefaultData() {
  // Add default categories if none exist
  if (localDB.count('categories') === 0) {
    const defaultCategories = [
      { name: 'Food & Dining', color: '#FF5733', icon: 'utensils' },
      { name: 'Transportation', color: '#33A8FF', icon: 'car' },
      { name: 'Shopping', color: '#FF33A8', icon: 'shopping-bag' },
      { name: 'Entertainment', color: '#A833FF', icon: 'film' },
      { name: 'Bills & Utilities', color: '#33FF57', icon: 'receipt' },
      { name: 'Healthcare', color: '#FF8C33', icon: 'heart' },
      { name: 'Education', color: '#3357FF', icon: 'book' },
      { name: 'Travel', color: '#FFD700', icon: 'plane' },
      { name: 'Salary', color: '#10B981', icon: 'dollar-sign' },
      { name: 'Freelance', color: '#059669', icon: 'briefcase' },
    ];

    defaultCategories.forEach(category => {
      localDB.create('categories', category);
    });
  }

  // Add default bank if none exist
  if (localDB.count('banks') === 0) {
    localDB.create('banks', {
      name: 'Main Account',
      balance: 50000,
    });
  }
}