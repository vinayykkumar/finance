import { supabase } from './supabase';

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

// Local storage key for goals
const LOCAL_STORAGE_KEY = 'finance_app_goals';

// Helper function to get goals from local storage
function getLocalGoals(): Goal[] {
  try {
    const storedGoals = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedGoals ? JSON.parse(storedGoals) : [];
  } catch (error) {
    console.error('Error reading goals from local storage:', error);
    return [];
  }
}

// Helper function to save goals to local storage
function saveLocalGoals(goals: Goal[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving goals to local storage:', error);
  }
}

export async function getGoals(): Promise<Goal[]> {
  try {
    console.log('Fetching goals from database...');
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals from database:', error);
      throw new Error(`Failed to fetch goals: ${error.message}`);
    }

    console.log('Goals fetched successfully from database:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getGoals:', error);
    // If Supabase is not configured or fails, use local storage
    console.warn('Using local storage for goals due to database error');
    const localGoals = getLocalGoals();
    console.log('Goals loaded from local storage:', localGoals);
    return localGoals;
  }
}

export async function createGoal(goal: Omit<Goal, 'id' | 'created_at'>): Promise<Goal> {
  try {
    console.log('Creating goal in database:', goal);
    
    const { data, error } = await supabase
      .from('goals')
      .insert({
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount || 0,
        target_date: goal.target_date,
        category_id: goal.category_id,
        is_completed: goal.is_completed || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating goal in database:', error);
      throw new Error(`Failed to create goal: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from goal creation');
    }

    console.log('Goal created successfully in database:', data);
    return data;
  } catch (error) {
    console.error('Error in createGoal:', error);
    // If database fails, create a local goal
    console.warn('Creating goal in local storage due to database error');
    
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
    
    // Add to local storage
    const localGoals = getLocalGoals();
    saveLocalGoals([newGoal, ...localGoals]);
    
    console.log('Goal created successfully in local storage:', newGoal);
    return newGoal;
  }
}

export async function updateGoal(id: string, updates: Partial<Omit<Goal, 'id' | 'created_at'>>): Promise<Goal> {
  try {
    console.log(`Updating goal ${id} in database:`, updates);
    
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal in database:', error);
      throw new Error(`Failed to update goal: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from goal update');
    }
    
    console.log('Goal updated successfully in database:', data);
    return data;
  } catch (error) {
    console.error('Error in updateGoal:', error);
    // If database fails, update local goal
    console.warn('Updating goal in local storage due to database error');
    
    const localGoals = getLocalGoals();
    const goalIndex = localGoals.findIndex(g => g.id === id);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found in local storage');
    }
    
    const updatedGoal = {
      ...localGoals[goalIndex],
      ...updates
    };
    
    localGoals[goalIndex] = updatedGoal;
    saveLocalGoals(localGoals);
    
    console.log('Goal updated successfully in local storage:', updatedGoal);
    return updatedGoal;
  }
}

export async function deleteGoal(id: string): Promise<void> {
  try {
    console.log(`Deleting goal ${id} from database`);
    
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting goal from database:', error);
      throw new Error(`Failed to delete goal: ${error.message}`);
    }
    
    console.log('Goal deleted successfully from database');
  } catch (error) {
    console.error('Error in deleteGoal:', error);
    // If database fails, delete from local storage
    console.warn('Deleting goal from local storage due to database error');
  } finally {
    // Always remove from local storage as well
    const localGoals = getLocalGoals();
    const filteredGoals = localGoals.filter(g => g.id !== id);
    saveLocalGoals(filteredGoals);
    console.log('Goal removed from local storage');
  }
}

export async function contributeToGoal(id: string, amount: number): Promise<Goal> {
  try {
    console.log(`Contributing ${amount} to goal ${id}`);
    
    // First get the current goal
    const { data: goal, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching goal from database:', fetchError);
      throw new Error(`Failed to fetch goal: ${fetchError.message}`);
    }

    if (!goal) {
      throw new Error('Goal not found');
    }

    // Calculate new amount and check if goal is completed
    const newAmount = goal.current_amount + amount;
    const isCompleted = newAmount >= goal.target_amount;

    // Update the goal
    const { data, error } = await supabase
      .from('goals')
      .update({
        current_amount: newAmount,
        is_completed: isCompleted
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal amount in database:', error);
      throw new Error(`Failed to update goal amount: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from goal update');
    }
    
    console.log('Contribution added successfully in database:', data);
    return data;
  } catch (error) {
    console.error('Error in contributeToGoal:', error);
    // If database fails, update local goal
    console.warn('Adding contribution in local storage due to database error');
    
    const localGoals = getLocalGoals();
    const goalIndex = localGoals.findIndex(g => g.id === id);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found in local storage');
    }
    
    const goal = localGoals[goalIndex];
    const newAmount = goal.current_amount + amount;
    const isCompleted = newAmount >= goal.target_amount;
    
    const updatedGoal = {
      ...goal,
      current_amount: newAmount,
      is_completed: isCompleted
    };
    
    localGoals[goalIndex] = updatedGoal;
    saveLocalGoals(localGoals);
    
    console.log('Contribution added successfully in local storage:', updatedGoal);
    return updatedGoal;
  }
}
