-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/[ref]/sql)
// Enable RLS after running

-- Foods table (existing/static data)
CREATE TABLE IF NOT EXISTS public.foods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  cal INTEGER NOT NULL,
  protein DECIMAL NOT NULL,
  carbs DECIMAL NOT NULL,
  fat DECIMAL NOT NULL,
  category TEXT NOT NULL
);

-- Insert sample foods
INSERT INTO public.foods (name, emoji, cal, protein, carbs, fat, category) VALUES
('Grilled Chicken', '🍗', 165, 31, 0, 3.6, 'Protein'),
('Avocado Toast', '🥑', 295, 8, 35, 15, 'Grains'),
('Greek Salad', '🥗', 180, 6, 14, 12, 'Vegetables'),
('Brown Rice', '🍚', 215, 5, 45, 1.8, 'Grains'),
('Salmon Fillet', '🐟', 208, 28, 0, 10, 'Protein')
ON CONFLICT (id) DO NOTHING;

-- Profiles table (user goals/weight)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL,
  calories INTEGER DEFAULT 2000,
  protein INTEGER DEFAULT 150,
  carbs INTEGER DEFAULT 250,
  fat INTEGER DEFAULT 65,
  water INTEGER DEFAULT 8,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily logs (consumed/burned/water per user/day)
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  consumed_cal INTEGER DEFAULT 0,
  consumed_protein DECIMAL DEFAULT 0,
  consumed_carbs DECIMAL DEFAULT 0,
  consumed_fat DECIMAL DEFAULT 0,
  burned INTEGER DEFAULT 0,
  water INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Grocery items (per user)
CREATE TABLE IF NOT EXISTS public.grocery_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount TEXT NOT NULL,
  category TEXT,
  checked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies (enable after testing)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY user_profiles ON profiles FOR ALL USING (auth.uid() = id);
-- Similar for other tables...

