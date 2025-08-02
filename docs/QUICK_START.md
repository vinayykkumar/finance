# FinTrack - Quick Start Guide

Get your personal finance app running in 5 minutes!

## 🚀 Super Quick Setup

### 1. Install Dependencies
```bash
npm install
npm run backend:install
```

### 2. Set Up Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor and run all migration files from `supabase/migrations/`

### 3. Configure Environment
1. Get your Supabase keys from **Settings** → **API**
2. Update `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   ```
3. Update `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 4. Start the App
```bash
npm start
```

### 5. Open and Enjoy!
- **App**: http://localhost:5173
- **API Docs**: http://localhost:3001/docs

## ✅ Verification Checklist

- [ ] Frontend loads at localhost:5173
- [ ] Backend API docs at localhost:3001/docs
- [ ] Can add a bank account
- [ ] Can create a transaction
- [ ] Data persists after refresh

## 🆘 Need Help?

- **Detailed Setup**: See `SETUP_GUIDE.md`
- **Troubleshooting**: Check the console logs
- **API Testing**: Use the interactive docs at `/docs`

That's it! You now have a complete personal finance application with AI-ready backend architecture.