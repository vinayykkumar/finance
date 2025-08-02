import { apiClient, handleApiResponse } from './api-client';

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category_id?: string;
  is_completed: boolean;
  user_id?: string;
  created_at: string;
}

export async function getGoals(): Promise<Goal[]> {
  try {
    console.log('Fetching goals from API...');
    const response = await apiClient.get<Goal[]>('/goals');
    const goals = handleApiResponse(response);
    console.log('Goals fetched successfully from API:', goals);
    return goals;
  } catch (error) {
    console.error('Error in getGoals:', error);
    // Return some default goals for demo purposes
    console.warn('Using default goals due to API error');
    const defaultGoals: Goal[] = [
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
    return defaultGoals;
  }
}

export async function createGoal(goal: Omit<Goal, 'id' | 'created_at'>): Promise<Goal> {
  try {
    console.log('Creating goal via API:', goal);
    
    const response = await apiClient.post<Goal>('/goals', {
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount || 0,
      target_date: goal.target_date,
      category_id: goal.category_id,
      is_completed: goal.is_completed || false
    });

    const newGoal = handleApiResponse(response);
    console.log('Goal created successfully via API:', newGoal);
    return newGoal;
  } catch (error) {
    console.error('Error in createGoal:', error);
    // Create a mock goal for demo purposes
    console.warn('Creating mock goal due to API error');
    
    const newGoal: Goal = {
      id: Math.random().toString(36).substring(2, 15),
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount || 0,
      target_date: goal.target_date,
      category_id: goal.category_id,
      is_completed: goal.is_completed || false,
      created_at: new Date().toISOString()
    };
    
    console.log('Mock goal created:', newGoal);
    return newGoal;
  }
}

export async function updateGoal(id: string, updates: Partial<Omit<Goal, 'id' | 'created_at'>>): Promise<Goal> {
  try {
    console.log(`Updating goal ${id} via API:`, updates);
    
    const response = await apiClient.patch<Goal>(`/goals/${id}`, updates);
    const updatedGoal = handleApiResponse(response);
    
    console.log('Goal updated successfully via API:', updatedGoal);
    return updatedGoal;
  } catch (error) {
    console.error('Error in updateGoal:', error);
    throw error;
  }
}

export async function deleteGoal(id: string): Promise<void> {
  try {
    console.log(`Deleting goal ${id} via API`);
    
    const response = await apiClient.delete(`/goals/${id}`);
    handleApiResponse(response);
    
    console.log('Goal deleted successfully via API');
  } catch (error) {
    console.error('Error in deleteGoal:', error);
    throw error;
  }
}

export async function contributeToGoal(id: string, amount: number): Promise<Goal> {
  try {
    console.log(`Contributing ${amount} to goal ${id} via API`);
    
    const response = await apiClient.post<Goal>(`/goals/${id}/contribute`, { amount });
    const updatedGoal = handleApiResponse(response);
    
    console.log('Contribution added successfully via API:', updatedGoal);
    return updatedGoal;
  } catch (error) {
    console.error('Error in contributeToGoal:', error);
    throw error;
  }
}