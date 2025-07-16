-- FlowTracker Database Schema
-- Complete schema for production deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
    plan_cost DECIMAL(10,2) DEFAULT 0.00,
    flow_archetype TEXT DEFAULT 'Deep Worker',
    flow_start_date DATE DEFAULT CURRENT_DATE,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Appearance & Theme
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    color_theme TEXT DEFAULT 'vibrant' CHECK (color_theme IN ('vibrant', 'accessible')),
    reduced_motion BOOLEAN DEFAULT false,
    high_contrast BOOLEAN DEFAULT false,
    animations BOOLEAN DEFAULT true,
    
    -- Pomodoro & Focus Settings
    focus_duration INTEGER DEFAULT 25,
    short_break_duration INTEGER DEFAULT 5,
    long_break_duration INTEGER DEFAULT 15,
    sessions_before_long_break INTEGER DEFAULT 4,
    auto_start_breaks BOOLEAN DEFAULT false,
    auto_start_pomodoros BOOLEAN DEFAULT false,
    
    -- Notifications & Alerts
    notifications_enabled BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    task_reminders BOOLEAN DEFAULT true,
    break_notifications BOOLEAN DEFAULT true,
    daily_summary BOOLEAN DEFAULT true,
    achievement_alerts BOOLEAN DEFAULT true,
    
    -- Productivity & Goals
    daily_goal INTEGER DEFAULT 5,
    working_hours_start TIME DEFAULT '09:00',
    working_hours_end TIME DEFAULT '17:00',
    
    -- Music & Media
    youtube_url TEXT,
    auto_play_music BOOLEAN DEFAULT false,
    loop_music BOOLEAN DEFAULT true,
    music_volume INTEGER DEFAULT 50,
    
    -- Profile & Personal
    display_name TEXT,
    timezone TEXT DEFAULT 'UTC',
    motivational_messages BOOLEAN DEFAULT true,
    
    -- Advanced Features
    vision_board_url TEXT,
    flow_tracking_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('brain', 'admin')),
    period TEXT NOT NULL CHECK (period IN ('morning', 'afternoon')),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    tags TEXT[] DEFAULT '{}',
    time_estimate INTEGER, -- in minutes
    time_spent INTEGER DEFAULT 0, -- in minutes
    time_block INTEGER, -- in minutes
    pomodoro_count INTEGER DEFAULT 0,
    scheduled_for DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flow sessions table
CREATE TABLE flow_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('focus', 'break', 'deep-work')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    flow_rating INTEGER CHECK (flow_rating >= 1 AND flow_rating <= 5),
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    location TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pomodoro sessions table
CREATE TABLE pomodoro_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('focus', 'short_break', 'long_break')),
    duration INTEGER NOT NULL, -- in seconds
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT false,
    flow_score INTEGER CHECK (flow_score >= 1 AND flow_score <= 5),
    distractions INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flow actions table (for tracking user interactions)
CREATE TABLE flow_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL,
    action_data JSONB,
    session_id UUID REFERENCES flow_sessions(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('streak', 'completion', 'focus', 'milestone')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT '🏆',
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User streaks table
CREATE TABLE user_streaks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_type TEXT DEFAULT 'daily' CHECK (streak_type IN ('daily', 'weekly', 'custom')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, streak_type)
);

-- Flow tracking entries table
CREATE TABLE flow_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activity TEXT NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('brain', 'admin', 'break', 'other')),
    flow_rating INTEGER NOT NULL CHECK (flow_rating >= 1 AND flow_rating <= 5),
    mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
    energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
    location TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    duration INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flow tracking settings table
CREATE TABLE flow_tracking_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    interval_minutes INTEGER DEFAULT 60,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    tracking_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- 0-6, days of week
    auto_detect_activity BOOLEAN DEFAULT false,
    show_flow_insights BOOLEAN DEFAULT true,
    minimum_entries_for_insights INTEGER DEFAULT 10,
    prompt_style TEXT DEFAULT 'gentle' CHECK (prompt_style IN ('gentle', 'persistent', 'minimal')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_scheduled_for ON tasks(scheduled_for);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type_period ON tasks(type, period);

CREATE INDEX idx_flow_sessions_user_id ON flow_sessions(user_id);
CREATE INDEX idx_flow_sessions_started_at ON flow_sessions(started_at);
CREATE INDEX idx_flow_sessions_task_id ON flow_sessions(task_id);

CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_started_at ON pomodoro_sessions(started_at);
CREATE INDEX idx_pomodoro_sessions_task_id ON pomodoro_sessions(task_id);

CREATE INDEX idx_flow_actions_user_id ON flow_actions(user_id);
CREATE INDEX idx_flow_actions_timestamp ON flow_actions(timestamp);

CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_earned_at ON achievements(earned_at);

CREATE INDEX idx_flow_entries_user_id ON flow_entries(user_id);
CREATE INDEX idx_flow_entries_timestamp ON flow_entries(timestamp);
CREATE INDEX idx_flow_entries_activity_type ON flow_entries(activity_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flow_tracking_settings_updated_at BEFORE UPDATE ON flow_tracking_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
