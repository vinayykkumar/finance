/**
 * Base Model
 * 
 * This abstract class provides common database operations for all models.
 * It uses Supabase client to interact with the database.
 */

import { supabase } from '../../lib/supabase';

export abstract class BaseModel<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Find all records
   */
  async findAll(orderBy?: { column: string; ascending?: boolean }): Promise<T[]> {
    let query = supabase.from(this.tableName).select('*');

    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
    }

    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      throw error;
    }

    return data as T[];
  }

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return null;
      }
      console.error(`Error fetching ${this.tableName} by ID:`, error);
      throw error;
    }

    return data as T;
  }

  /**
   * Create a new record
   */
  async create(record: Omit<T, 'id' | 'created_at'>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(record)
      .select()
      .single();
    
    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }

    return data as T;
  }

  /**
   * Update a record
   */
  async update(id: string, updates: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }

    return data as T;
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find records by a field value
   */
  async findBy(field: string, value: any): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq(field, value);
    
    if (error) {
      console.error(`Error fetching ${this.tableName} by ${field}:`, error);
      throw error;
    }

    return data as T[];
  }
} 