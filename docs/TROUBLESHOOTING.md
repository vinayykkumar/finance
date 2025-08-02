# FinTrack - Troubleshooting Guide

Common issues and their solutions when setting up FinTrack locally.

## 🚨 Common Setup Issues

### 1. Backend Won't Start

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
cd backend
pip install -r requirements.txt
```

**Alternative** (if you have permission issues):
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### 2. Port Already in Use

**Error**: `OSError: [Errno 48] Address already in use`

**Solution**: Change the port in `backend/.env`:
```env
API_PORT=3002  # or any other available port
```

Then update frontend `.env`:
```env
VITE_API_URL=http://localhost:3002/api
```

### 3. Supabase Connection Failed

**Error**: `supabase.exceptions.APIError: Invalid API key`

**Solutions**:
1. **Check your keys**: Go to Supabase Dashboard → Settings → API
2. **Verify URL format**: Should be `https://xxx.supabase.co` (no trailing slash)
3. **Check environment file**: Ensure no extra spaces or quotes around keys
4. **Restart backend**: After changing `.env`, restart the Python server

### 4. Database Tables Don't Exist

**Error**: `relation "banks" does not exist`

**Solution**: Run the database migrations:
1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file in order:
   - `20250415183702_humble_brook.sql`
   - `20250416001000_public_access.sql`
   - `20250416010406_bank_balance_function.sql`
   - `20250416010822_add_to_bank_id.sql`
   - `20250416010823_create_transactions.sql`
   - `20250418001700_add_monthly_limit_to_categories.sql`
   - `20250501_add_feature_tables.sql`

### 5. CORS Errors in Browser

**Error**: `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution**: Check `backend/.env`:
```env
FRONTEND_URL=http://localhost:5173
```

Restart the backend server after making changes.

### 6. Frontend Shows Mock Data

**Issue**: App works but data doesn't persist

**Causes & Solutions**:
1. **Backend not running**: Start with `npm run backend`
2. **Wrong API URL**: Check `.env` has `VITE_API_URL=http://localhost:3001/api`
3. **Backend errors**: Check backend console for error messages

### 7. Python Version Issues

**Error**: `SyntaxError: invalid syntax` or version-related errors

**Solution**: Ensure Python 3.8+:
```bash
python --version  # Should be 3.8 or higher
```

If you have multiple Python versions:
```bash
python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
```

### 8. Node.js Version Issues

**Error**: Package installation fails or build errors

**Solution**: Ensure Node.js 16+:
```bash
node --version  # Should be 16 or higher
```

Update Node.js if needed: https://nodejs.org/

## 🔍 Debugging Steps

### Check Backend Health

1. **API Health Check**:
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status": "healthy", "message": "FinTrack API is operational"}`

2. **Test Database Connection**:
   ```bash
   curl http://localhost:3001/api/banks
   ```
   Should return: `[]` (empty array) or your banks data

3. **Check Backend Logs**: Look at the terminal where you ran `npm run backend`

### Check Frontend Connection

1. **Open Browser Console**: F12 → Console tab
2. **Look for API errors**: Should see successful API calls, not 404s
3. **Check Network Tab**: Verify API calls are going to correct URL

### Check Database

1. **Supabase Dashboard**: Go to Table Editor
2. **Verify Tables**: Should see banks, categories, transactions, etc.
3. **Check Data**: Any data you create should appear here

## 🛠 Advanced Troubleshooting

### Reset Everything

If nothing works, try a complete reset:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Clean install
rm -rf node_modules backend/venv
npm install
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# 3. Reset database (in Supabase Dashboard)
# Go to Settings → Database → Reset Database

# 4. Re-run migrations
# Copy/paste each migration file in SQL Editor

# 5. Restart everything
npm start
```

### Environment Variables Debug

Create a test file to verify your environment:

```bash
# backend/test_env.py
import os
from dotenv import load_dotenv

load_dotenv()

print("SUPABASE_URL:", os.getenv("SUPABASE_URL"))
print("SUPABASE_KEY:", os.getenv("SUPABASE_KEY")[:20] + "..." if os.getenv("SUPABASE_KEY") else "None")
print("API_PORT:", os.getenv("API_PORT"))
```

Run: `cd backend && python test_env.py`

### Check Firewall/Antivirus

Some security software blocks local servers:
1. **Windows**: Check Windows Defender Firewall
2. **Mac**: Check System Preferences → Security & Privacy
3. **Antivirus**: Temporarily disable to test

## 📞 Getting More Help

### Before Asking for Help

1. **Check all logs**: Frontend console, backend terminal, Supabase logs
2. **Verify versions**: Node.js 16+, Python 3.8+
3. **Test step by step**: Follow the quick start guide exactly
4. **Check environment**: Verify all `.env` files are correct

### Useful Information to Provide

When seeking help, include:
- Operating system (Windows/Mac/Linux)
- Node.js version (`node --version`)
- Python version (`python --version`)
- Error messages (full text)
- What step you're stuck on
- Screenshots of errors

### Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev/

## ✅ Success Indicators

You know everything is working when:
- ✅ Frontend loads without errors at localhost:5173
- ✅ Backend API docs accessible at localhost:3001/docs
- ✅ Can create banks, categories, and transactions
- ✅ Data persists after page refresh
- ✅ Dashboard shows real data, not placeholder text
- ✅ No console errors in browser
- ✅ Backend terminal shows successful API calls

Remember: Most issues are environment-related. Double-check your `.env` files and ensure all services are running!