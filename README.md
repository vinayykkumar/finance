# FinTrack - Personal Finance Tracker

FinTrack is a comprehensive personal finance tracking application built with React, TypeScript, and Supabase. It enables users to manage their finances effectively with features like expense tracking, budgeting, goal setting, and reporting.

## Features

- **Dashboard**: Get an overview of your financial health with key metrics and visualizations
- **Accounts Management**: Track multiple bank accounts and credit cards
- **Transaction Tracking**: Record and categorize income, expenses, and transfers
- **Budget Planning**: Set and monitor monthly budgets by category
- **Category Management**: Organize transactions with customizable categories
- **Goal Tracking**: Set and track financial goals with progress visualization
- **Dark/Light Mode**: Comfortable viewing experience in any lighting condition

## Tech Stack

- **React 18**: Modern UI library for building interactive interfaces
- **TypeScript**: Type-safe JavaScript for better code quality
- **Vite**: Next-generation frontend tooling for fast development
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Framer Motion**: Animation library for smooth transitions
- **Supabase**: Backend as a Service (BaaS) for database and authentication
- **Chart.js/Recharts**: Data visualization libraries

## Project Structure

The project follows a modular architecture with the following organization:

```
src/
├── assets/           # Static assets like images, fonts
├── components/       # Reusable UI components
│   ├── ui/           # Basic UI elements (buttons, cards, inputs)
│   ├── layout/       # Layout components (sidebar, header)
│   └── features/     # Feature-specific components
├── db/               # Database structure and models
│   ├── models/       # Data access models for each entity
│   ├── schemas/      # TypeScript type definitions for database schema
│   └── migrations/   # SQL migration files
├── hooks/            # Custom React hooks
├── lib/              # External libraries and services
├── providers/        # Context providers
├── routes/           # Route components
├── services/         # Service layer for business logic
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main App component
└── main.tsx          # Entry point
```

## Database Architecture

The application uses a structured database layer for data management:

- **Models**: Each entity has a dedicated model class for CRUD operations
- **Schema**: TypeScript types that mirror the database tables
- **Services**: Business logic layer that orchestrates model operations

Main database entities include:
- Banks
- Transactions
- Categories
- Budgets
- Goals
- Investments

For detailed database documentation, see `src/db/README.md`.

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account (or local Supabase instance)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your environment variables (copy `.env.example` to `.env`)
4. Run migrations (if using Supabase):
   ```
   npx supabase db push
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## Next Steps & Future Improvements

- Advanced investment portfolio tracking
- Financial goals progress visualization 
- Detailed reports and analytics
- Mobile app with offline sync
- Reminder notifications for bills
- Import/export functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details