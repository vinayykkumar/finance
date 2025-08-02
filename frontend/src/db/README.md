# Database Structure

This directory contains the database structure and models for the finance application.

## Overview

The database layer is organized as follows:

- `/schemas`: TypeScript type definitions that mirror the database schema
- `/models`: Data access models for each entity in the database
- `/migrations`: SQL migration files defining the database schema

## Architecture

The database layer follows a Model-based architecture:

1. **BaseModel**: A generic model that provides CRUD operations for all entities
2. **Entity Models**: Specific models for each entity (Bank, Transaction, etc.) that extend BaseModel
3. **Database Service**: A service layer that brings all models together and provides higher-level operations

## Usage

Throughout the application, database operations should be performed through the DatabaseService:

```typescript
import { db } from '../services/DatabaseService';

// Example: Get all banks
const banks = await db.banks.findAll();

// Example: Create a new transaction and update bank balance
const newTransaction = await db.transactions.createWithBalanceUpdate({
  description: 'Salary',
  amount: 5000,
  date: '2023-05-01',
  type: 'income',
  bank_id: '123e4567-e89b-12d3-a456-426614174000'
});

// Example: Get monthly financial summary
const summary = await db.getMonthlyFinancialSummary(2023, 5);
```

## Database Schema

The database schema includes the following tables:

1. **banks**: Banking accounts with balances
2. **categories**: Transaction categories with colors and icons
3. **transactions**: Financial transactions (income, expenses, transfers)
4. **credit_cards**: Credit card accounts
5. **budgets**: Monthly budgets for categories
6. **goals**: Financial goals with target amounts and dates
7. **investment_accounts**: Investment accounts (e.g., brokerage, retirement)
8. **investments**: Individual investments within accounts
9. **transaction_templates**: Templates for recurring transactions

See the `schema.sql` file in the migrations directory for complete table definitions. 