# Backend Setup Guide

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

The `.env` file has been created with your Supabase project details. You need to update the following:

#### Required Updates:

1. **SUPABASE_KEY**: Replace with your actual Supabase anon key
2. **SUPABASE_SERVICE_KEY**: Add your Supabase service role key (for admin operations)

#### Where to find these keys:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `gnafgdbpkhhgusgtdzmb`
3. Go to **Settings** → **API**
4. Copy the keys:
   - **anon/public key** → `SUPABASE_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY`

### 3. Update Backend .env File

Edit `backend/.env`:

```env
# Replace these with your actual keys
SUPABASE_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_KEY=your_actual_service_role_key_here
```

### 4. Start the Backend Server

```bash
cd backend
python run.py
```

The server will start at: http://localhost:3001

### 5. Verify Setup

1. **API Health Check**: http://localhost:3001/api/health
2. **Interactive Docs**: http://localhost:3001/docs
3. **Alternative Docs**: http://localhost:3001/redoc

### 6. Test with Frontend

Your React frontend is already configured to use the backend API. Just make sure both are running:

1. **Backend**: `cd backend && python run.py` (Port 3001)
2. **Frontend**: `npm run dev` (Port 5173)

## 🔧 Configuration Details

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Pre-configured |
| `SUPABASE_KEY` | Supabase anon key | **NEEDS UPDATE** |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | **NEEDS UPDATE** |
| `API_HOST` | Server host | 0.0.0.0 |
| `API_PORT` | Server port | 3001 |
| `DEBUG` | Debug mode | True |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:3001/api |
| `VITE_SUPABASE_URL` | Supabase URL (if needed) | Pre-configured |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (if needed) | **NEEDS UPDATE** |

## 🚨 Important Notes

1. **Never commit real API keys** to version control
2. **Service role key** has admin privileges - keep it secure
3. **Anon key** is safe for frontend use
4. The backend will automatically create tables if they don't exist

## 🧪 Testing the Setup

### Test Backend Endpoints

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

### Test Frontend Integration

1. Open your React app: http://localhost:5173
2. Try adding a bank account
3. Check if data persists in Supabase dashboard

## 🤖 Ready for AI Integration

Your backend is now ready for AI features:

- **Clean service layer** for adding ML models
- **Rich financial data** for analysis
- **Async support** for AI API calls
- **Type safety** with Pydantic models

## 🆘 Troubleshooting

### Common Issues:

1. **Port 3001 already in use**: Change `API_PORT` in backend/.env
2. **Supabase connection error**: Verify your keys in .env
3. **CORS errors**: Check `FRONTEND_URL` in backend/.env
4. **Module not found**: Run `pip install -r requirements.txt`

### Getting Help:

1. Check the logs when running `python run.py`
2. Visit http://localhost:3001/docs for API documentation
3. Check Supabase dashboard for database issues