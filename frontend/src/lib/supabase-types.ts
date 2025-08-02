export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      banks: {
        Row: {
          id: string
          name: string
          balance: number
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          balance: number
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          balance?: number
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}