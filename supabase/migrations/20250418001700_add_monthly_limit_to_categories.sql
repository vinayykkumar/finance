-- Migration: Add monthly_limit to categories table if not present
ALTER TABLE categories ADD COLUMN IF NOT EXISTS monthly_limit numeric;
