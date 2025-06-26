-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (for future auth integration)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create tasks table (central entity)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('brain', 'admin')),
  period TEXT NOT NULL CHECK (period IN ('morning', 'afternoon')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'completed')) DEFAULT 'todo',
  tags TEXT[] DEFAULT '{}',
  time_estimate INTEGER, -- in minutes
  time_spent INTEGER DEFAULT 0, -- in minutes
  pomodoro_count INTEGER DEFAULT 0,
  scheduled_for DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_period ON tasks(period);
CREATE INDEX idx_tasks_scheduled_for ON tasks(scheduled_for);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Create pomodoro_sessions table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  duration INTEGER NOT NULL, -- in minutes
  session_type TEXT NOT NULL CHECK (session_type IN ('focus', 'short_break', 'long_break')) DEFAULT 'focus',
  flow_score INTEGER DEFAULT 0 CHECK (flow_score >= 0 AND flow_score <= 100),
  distractions INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on pomodoro_sessions
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Create indexes for pomodoro sessions
CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_task_id ON pomodoro_sessions(task_id);
CREATE INDEX idx_pomodoro_sessions_started_at ON pomodoro_sessions(started_at);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  color_theme TEXT DEFAULT 'vibrant' CHECK (color_theme IN ('vibrant', 'accessible')),
  focus_duration INTEGER DEFAULT 25, -- in minutes
  short_break_duration INTEGER DEFAULT 5, -- in minutes
  long_break_duration INTEGER DEFAULT 15, -- in minutes
  sessions_before_long_break INTEGER DEFAULT 4,
  auto_start_breaks BOOLEAN DEFAULT false,
  auto_start_pomodoros BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  daily_goal INTEGER DEFAULT 5, -- tasks per day
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create indexes for achievements
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_earned_at ON achievements(earned_at);

-- Create user_streaks table for tracking productivity streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_type TEXT DEFAULT 'daily' CHECK (streak_type IN ('daily', 'weekly')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_streaks
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies (for future auth, allowing access for now)
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (true);

-- Pomodoro sessions policies
CREATE POLICY "Users can view own sessions" ON pomodoro_sessions FOR SELECT USING (true);
CREATE POLICY "Users can insert own sessions" ON pomodoro_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own sessions" ON pomodoro_sessions FOR UPDATE USING (true);
CREATE POLICY "Users can delete own sessions" ON pomodoro_sessions FOR DELETE USING (true);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (true);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (true);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (true);

-- User streaks policies
CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (true);
CREATE POLICY "Users can insert own streaks" ON user_streaks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own streaks" ON user_streaks FOR UPDATE USING (true);

-- Create a function to initialize user data
CREATE OR REPLACE FUNCTION initialize_user_data(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert default settings
  INSERT INTO user_settings (user_id) VALUES (user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert default streak data
  INSERT INTO user_streaks (user_id) VALUES (user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
