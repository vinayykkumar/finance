// Simple ID generator function
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  category_id?: string;
  is_completed: boolean;
  created_at: string;
}

// In-memory storage for goals
let mockGoals: Goal[] = [
  {
    id: 'goal1',
    name: 'Emergency Fund',
    target_amount: 300000,
    current_amount: 150000,
    target_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
    is_completed: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'goal2',
    name: 'New Car',
    target_amount: 1200000,
    current_amount: 400000,
    target_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
    category_id: 'cat5',
    is_completed: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'goal3',
    name: 'Vacation Fund',
    target_amount: 150000,
    current_amount: 150000,
    target_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    category_id: 'cat6',
    is_completed: true,
    created_at: new Date().toISOString()
  }
];

export async function getGoals(): Promise<Goal[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockGoals]);
    }, 300);
  });
}

export async function createGoal(goal: Omit<Goal, 'id' | 'created_at'>): Promise<Goal> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newGoal: Goal = {
        id: generateId(),
        ...goal,
        created_at: new Date().toISOString()
      };
      mockGoals.push(newGoal);
      resolve(newGoal);
    }, 300);
  });
}

export async function updateGoal(id: string, updates: Partial<Omit<Goal, 'id' | 'created_at'>>): Promise<Goal> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockGoals.findIndex(g => g.id === id);
      if (index === -1) {
        reject(new Error('Goal not found'));
        return;
      }
      
      mockGoals[index] = {
        ...mockGoals[index],
        ...updates
      };
      
      resolve(mockGoals[index]);
    }, 300);
  });
}

export async function deleteGoal(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockGoals.findIndex(g => g.id === id);
      if (index === -1) {
        reject(new Error('Goal not found'));
        return;
      }
      
      mockGoals.splice(index, 1);
      resolve();
    }, 300);
  });
}

export async function contributeToGoal(id: string, amount: number): Promise<Goal> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockGoals.findIndex(g => g.id === id);
      if (index === -1) {
        reject(new Error('Goal not found'));
        return;
      }
      
      const goal = mockGoals[index];
      const newAmount = goal.current_amount + amount;
      
      // Check if goal is completed with this contribution
      const isCompleted = newAmount >= goal.target_amount;
      
      mockGoals[index] = {
        ...goal,
        current_amount: newAmount,
        is_completed: isCompleted
      };
      
      resolve(mockGoals[index]);
    }, 300);
  });
}
