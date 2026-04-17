# NutriTracker Supabase Integration - TODO

## Plan Steps (Approved)

### 1. Create requirements.txt & Install Dependencies ✅
### 2. Create Supabase Schema ✅ [Execute supabase-schema.sql in dashboard]
### 3. Update supabase-config.js ✅ [Real creds]
### 4. Update logic.js - Data Sync Functions 
   - [ ] Add Supabase CRUD for profiles/daily_logs
   - [ ] Replace localStorage with Supabase queries
   - [ ] Add realtime subscriptions
### 5. Update backend.py - Supabase Integration ✅ [Supabase client + async query in scanner]
### 6. Test Full Integration
   - [ ] User: Run supabase-schema.sql in dashboard, add SERVICE_ROLE_KEY to backend.py
   - [ ] Run `python3 backend.py`, test app
### 7. Finalize logic.js & complete ✅

**Next: logic.js data sync**
b
