# FinTrack - Complete Local Setup Guide

Welcome to FinTrack! This guide will walk you through setting up the complete personal finance application locally, including both the React frontend and Python FastAPI backend.

## 📋 Prerequisites

Before starting, make sure you have the following installed:

- **Node.js 16+** and **npm** - [Download here](https://nodejs.org/)
- **Python 3.8+** and **pip** - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd fintrack

# Install frontend dependencies
npm install

# Install backend dependencies
npm run backend:install
```

### Step 2: Set Up Supabase Database

1. **Create a Supabase Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: `FinTrack`
   - Set a strong database password
   - Choose a region close to you
   - Click "Create new project"

2. **Run Database Migrations**:
   - In your Supabase dashboard, go to **SQL Editor**
   - Copy and paste the contents from each migration file in order:
     - `supabase/migrations/20250415183702_humble_brook.sql`
     - `supabase/migrations/20250416001000_public_access.sql`
     - `supabase/migrations/20250416010406_bank_balance_function.sql`
     - `supabase/migrations/20250416010822_add_to_bank_id.sql`
     - `supabase/migrations/20250416010823_create_transactions.sql`
     - `supabase/migrations/20250418001700_add_monthly_limit_to_categories.sql`
     - `supabase/migrations/20250501_add_feature_tables.sql`
   - Run each migration by clicking "Run"

### Step 3: Configure Environment Variables

1. **Get Your Supabase Keys**:
   - In Supabase dashboard, go to **Settings** → **API**
   - Copy the following:
     - **Project URL** (looks like: `https://xxx.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)
     - **service_role key** (starts with `eyJ...`)

2. **Update Backend Environment**:
   ```bash
   # Edit backend/.env
   nano backend/.env  # or use your preferred editor
   ```
   
   Update these values:
   ```env
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_KEY=your_anon_key_here
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   ```

3. **Update Frontend Environment**:
   ```bash
   # Edit .env
   nano .env  # or use your preferred editor
   ```
   
   Update these values:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Step 4: Start the Application

```bash
# Start both frontend and backend together
npm start

# Or start them separately:
# npm run dev        # Frontend only (port 5173)
# npm run backend    # Backend only (port 3001)
```

### Step 5: Verify Everything Works

1. **Frontend**: Open http://localhost:5173
2. **Backend API**: Open http://localhost:3001/docs
3. **Health Check**: Open http://localhost:3001/api/health

You should see:
- ✅ Beautiful finance dashboard at localhost:5173
- ✅ Interactive API documentation at localhost:3001/docs
- ✅ Ability to add banks, transactions, categories, etc.

## 📁 Project Structure

```
fintrack/
├── src/                     # React Frontend
│   ├── components/          # UI Components
│   ├── providers/           # Context Providers
│   ├── routes/              # Page Components
│   ├── lib/                 # Services & Utilities
│   └── types/               # TypeScript Types
├── backend/                 # Python FastAPI Backend
│   ├── app/
│   │   ├── routers/         # API Endpoints
│   │   ├── services/        # Business Logic
│   │   ├── models.py        # Data Models
│   │   └── main.py          # FastAPI App
│   ├── requirements.txt     # Python Dependencies
│   └── .env                 # Backend Configuration
├── supabase/
│   └── migrations/          # Database Schema
├── package.json             # Frontend Dependencies
└── .env                     # Frontend Configuration
```

## 🛠 Detailed Setup Instructions

### Frontend Setup

The frontend is a React application built with:
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Vite** for fast development

**Key Features**:
- Dashboard with financial overview
- Account management (banks & credit cards)
- Transaction tracking with categories
- Budget planning and monitoring
- Goal setting and tracking
- Dark/light mode toggle

### Backend Setup

The backend is a Python FastAPI application with:
- **FastAPI** for the web framework
- **Supabase** for database operations
- **Pydantic** for data validation
- **Async/await** support

**API Endpoints**:
- `/api/banks` - Bank account management
- `/api/categories` - Transaction categories
- `/api/transactions` - Financial transactions
- `/api/budgets` - Budget planning
- `/api/goals` - Financial goals
- `/api/reports` - Analytics and reports

### Database Schema

The application uses Supabase (PostgreSQL) with the following tables:
- **banks** - Bank accounts with balances
- **categories** - Transaction categories with colors/icons
- **transactions** - Financial transactions (income/expense/transfer)
- **budgets** - Monthly budgets by category
- **goals** - Financial goals with progress tracking
- **credit_cards** - Credit card accounts
- **investment_accounts** - Investment tracking
- **transaction_templates** - Recurring transaction templates

## 🔧 Development Commands

```bash
# Frontend Development
npm run dev              # Start frontend dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Backend Development
npm run backend          # Start backend server
cd backend && python run.py  # Alternative way to start backend

# Full Stack Development
npm start                # Start both frontend and backend
npm install              # Install frontend dependencies
npm run backend:install  # Install backend dependencies
```

## 🧪 Testing Your Setup

### 1. Test Backend API

```bash
# Health check
curl http://localhost:3001/api/health

# Get banks (should return empty array initially)
curl http://localhost:3001/api/banks

# Create a test bank
curl -X POST http://localhost:3001/api/banks \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Bank", "balance": 1000}'
```

### 2. Test Frontend

1. Open http://localhost:5173
2. Navigate to "Accounts" page
3. Click "Add Bank" and create a test account
4. Go to "Transactions" and add a test transaction
5. Check the Dashboard for updated data

### 3. Test Database

1. Go to your Supabase dashboard
2. Navigate to **Table Editor**
3. Check that data appears in the `banks` and `transactions` tables

## 🚨 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# If port 3001 is busy, change it in backend/.env
API_PORT=3002
```

**2. Python Dependencies Error**
```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

**3. Supabase Connection Error**
- Verify your Supabase URL and keys in `backend/.env`
- Check that your Supabase project is active
- Ensure migrations have been run

**4. CORS Errors**
- Check that `FRONTEND_URL` in `backend/.env` matches your frontend URL
- Restart the backend server after changing environment variables

**5. Frontend Not Connecting to Backend**
- Verify `VITE_API_URL` in `.env` points to your backend
- Check that both servers are running
- Look for errors in browser console

### Getting Help

1. **Check the logs**: Both frontend and backend show detailed error messages
2. **API Documentation**: Visit http://localhost:3001/docs for interactive API testing
3. **Database Issues**: Check Supabase dashboard logs and table editor
4. **Network Issues**: Verify ports and firewall settings

## 🎯 What You Get

After completing this setup, you'll have:

✅ **Complete Personal Finance App**
- Beautiful, responsive UI with dark/light mode
- Real-time data persistence with Supabase
- Full CRUD operations for all financial data

✅ **Production-Ready Architecture**
- Type-safe frontend and backend
- Proper error handling and validation
- Clean separation of concerns

✅ **AI-Ready Backend**
- Clean service layer for ML integration
- Rich financial data for analysis
- Async support for AI API calls

✅ **Developer Experience**
- Hot reload for both frontend and backend
- Interactive API documentation
- Comprehensive error messages

## 🚀 Next Steps

### Immediate Next Steps
1. **Add Sample Data**: Create some banks, categories, and transactions to explore the app
2. **Explore Features**: Try the budgeting, goals, and reporting features
3. **Customize**: Modify colors, add new categories, or adjust the UI

### Future Enhancements
1. **AI Integration**: Add spending predictions, smart categorization
2. **Mobile App**: React Native version
3. **Advanced Analytics**: More detailed reports and insights
4. **Integrations**: Bank API connections, receipt scanning
5. **Notifications**: Bill reminders, budget alerts

## 📚 Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **React Documentation**: https://react.dev/
- **Supabase Documentation**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/

## 🤝 Contributing

This project is set up for easy contribution:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Congratulations!** 🎉 You now have a fully functional personal finance application running locally. Start by adding your first bank account and transaction to see everything in action!