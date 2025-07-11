-- FlowTracker Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    flow_archetype TEXT,
    flow_start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tasks table
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('brain', 'admin')),
    period TEXT NOT NULL CHECK (period IN ('morning', 'afternoon')),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    completed BOOLEAN DEFAULT FALSE,
    time_block INTEGER,
    time_estimate INTEGER,
    time_spent INTEGER,
    pomodoro_count INTEGER DEFAULT 0,
    tags TEXT[],
    context_tags TEXT[],
    scheduled_for DATE,
    due_date TIMESTAMP WITH TIME ZONE,
    due_time TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    subtask_ids TEXT[],
    depth INTEGER DEFAULT 0,
    is_subtask BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    project_id TEXT,
    energy TEXT CHECK (energy IN ('low', 'medium', 'high')),
    focus TEXT CHECK (focus IN ('shallow', 'deep')),
    delegated_to TEXT,
    waiting_for TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create flow_sessions table
CREATE TABLE flow_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    rituals JSONB NOT NULL,
    flow_state JSONB NOT NULL,
    intention TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    phase TEXT NOT NULL CHECK (phase IN ('foundation', 'building', 'mastery')),
    day_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Create flow_actions table
CREATE TABLE flow_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_id TEXT NOT NULL,
    date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_settings table
CREATE TABLE user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
    color_theme TEXT DEFAULT 'vibrant' CHECK (color_theme IN ('vibrant', 'accessible')),
    focus_duration INTEGER DEFAULT 25,
    short_break_duration INTEGER DEFAULT 5,
    long_break_duration INTEGER DEFAULT 15,
    sessions_before_long_break INTEGER DEFAULT 4,
    auto_start_breaks BOOLEAN DEFAULT FALSE,
    auto_start_pomodoros BOOLEAN DEFAULT FALSE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    daily_goal INTEGER DEFAULT 4,
    vision_board_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Flow sessions policies
CREATE POLICY "Users can view own flow sessions" ON flow_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flow sessions" ON flow_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flow sessions" ON flow_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flow sessions" ON flow_sessions FOR DELETE USING (auth.uid() = user_id);

-- Flow actions policies
CREATE POLICY "Users can view own flow actions" ON flow_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flow actions" ON flow_actions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_scheduled_for ON tasks(scheduled_for);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_flow_sessions_user_id ON flow_sessions(user_id);
CREATE INDEX idx_flow_sessions_date ON flow_sessions(date);
CREATE INDEX idx_flow_actions_user_id ON flow_actions(user_id);
CREATE INDEX idx_flow_actions_date ON flow_actions(date);

-- Create functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_flow_sessions_updated_at BEFORE UPDATE ON flow_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
